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
  console.log('Decoded JWT payload:', payload)
  return payload?.role === 'admin' ? 'admin' : 'user'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const rt = storage.getRefreshToken()
    if (!rt) {
      setIsLoading(false)
      return
    }

    fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid session')
        return res.json() as Promise<{ accessToken: string; refreshToken: string }>
      })
      .then((data) => {
        tokenStore.set(data.accessToken)
        storage.setRefreshToken(data.refreshToken)
        setUser({
          accessToken: data.accessToken,
          mustChangePassword: false,
          role: extractRole(data.accessToken),
        })
      })
      .catch(() => {
        tokenStore.clear()
        storage.clearRefreshToken()
      })
      .finally(() => setIsLoading(false))
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
        ? { ...prev, mustChangePassword: false, role: extractRole(res.accessToken) }
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
