import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AuthService } from '@services/AuthService'
import { proactiveRefresh } from '@services/ApiService'
import { tokenStore } from '@utils/tokenStore'
import { storage } from '@utils/storage'
import { decodeJwtPayload } from '@utils/jwt'
import type { LoginRequest, ChangePasswordRequest } from '@app-types/auth'

export type UserRole = 'user' | 'admin'

export interface AuthUser {
  accessToken: string
  mustChangePassword: boolean
  role: UserRole
  email: string | null
}

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (data: LoginRequest) => Promise<{ mustChangePassword: boolean }>
  logout: () => Promise<void>
  changePassword: (data: ChangePasswordRequest) => Promise<void>
  clearMustChangePassword: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function extractRole(token: string): UserRole {
  const payload = decodeJwtPayload(token)
  return payload?.role === 'admin' ? 'admin' : 'user'
}

function extractEmail(token: string): string | null {
  return decodeJwtPayload(token)?.email ?? null
}

const REFRESH_BUFFER_MS = 60_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  function scheduleProactiveRefresh(token: string) {
    clearTimeout(refreshTimerRef.current)
    const exp = decodeJwtPayload(token)?.exp
    if (!exp) return
    const delay = exp * 1000 - Date.now() - REFRESH_BUFFER_MS
    if (delay <= 0) return
    refreshTimerRef.current = setTimeout(async () => {
      const newToken = await proactiveRefresh()
      if (!newToken) return
      setUser((prev) =>
        prev
          ? { ...prev, accessToken: newToken, role: extractRole(newToken), email: extractEmail(newToken) }
          : null,
      )
      scheduleProactiveRefresh(newToken)
    }, delay)
  }

  useEffect(() => {
    return () => clearTimeout(refreshTimerRef.current)
  }, [])

  useEffect(() => {
    let cancelled = false

    const rt = storage.getRefreshToken()
    if (!rt) {
      setIsLoading(false)
      return
    }

    // `proactiveRefresh` is the SAME single-flight call the 401 handler and the
    // scheduled renewal use. Without sharing it, StrictMode's double-invoke of
    // this effect fired two independent `/auth/refresh` requests: the refresh
    // token rotates on use (one-shot), so the second request always arrived
    // with an already-spent token and 401'd — logging out a session that had
    // just been restored, on every mount, dev or not.
    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10_000)
    })

    Promise.race([proactiveRefresh(), timeout])
      .then((token) => {
        if (cancelled || !token) return
        setUser({
          accessToken: token,
          mustChangePassword: false,
          role: extractRole(token),
          email: extractEmail(token),
        })
        scheduleProactiveRefresh(token)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const handleLogout = () => setUser(null)
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await AuthService.login(data)
    setUser({
      accessToken: res.accessToken,
      mustChangePassword: res.mustChangePassword,
      role: extractRole(res.accessToken),
      email: extractEmail(res.accessToken),
    })
    scheduleProactiveRefresh(res.accessToken)
    return { mustChangePassword: res.mustChangePassword }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = useCallback(async () => {
    clearTimeout(refreshTimerRef.current)
    const rt = storage.getRefreshToken()
    if (rt) {
      await AuthService.logout(rt).catch(() => null)
    }
    tokenStore.clear()
    storage.clearRefreshToken()
    setUser(null)
  }, [])

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    const res = await AuthService.changePassword(data)
    setUser((prev) =>
      prev
        ? { ...prev, mustChangePassword: false, role: extractRole(res.accessToken), email: extractEmail(res.accessToken) }
        : null,
    )
    scheduleProactiveRefresh(res.accessToken)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearMustChangePassword = useCallback(() => {
    setUser((prev) => (prev ? { ...prev, mustChangePassword: false } : null))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        changePassword,
        clearMustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
