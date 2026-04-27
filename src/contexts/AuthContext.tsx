import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { AuthService } from '@services/AuthService'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const rt = storage.getRefreshToken()
    if (!rt) {
      setIsLoading(false)
      return
    }

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        tokenStore.clear()
        storage.clearRefreshToken()
        setIsLoading(false)
        controller.abort()
      }
    }, 10_000)

    fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid session')
        return res.json() as Promise<{ accessToken: string; refreshToken: string }>
      })
      .then((data) => {
        if (cancelled) return
        tokenStore.set(data.accessToken)
        storage.setRefreshToken(data.refreshToken)
        setUser({
          accessToken: data.accessToken,
          mustChangePassword: false,
          role: extractRole(data.accessToken),
          email: extractEmail(data.accessToken),
        })
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof Error && err.name === 'AbortError')) return
        tokenStore.clear()
        storage.clearRefreshToken()
      })
      .finally(() => {
        clearTimeout(timeoutId)
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      controller.abort()
    }
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
    return { mustChangePassword: res.mustChangePassword }
  }, [])

  const logout = useCallback(async () => {
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
