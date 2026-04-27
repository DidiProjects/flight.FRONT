import { createContext, useState, useContext, type ReactNode } from 'react'
import type { User } from '@app-types/users'

interface AdminUserContextValue {
  selectedUser: User | null
  setSelectedUser: (user: User | null) => void
}

const AdminUserContext = createContext<AdminUserContextValue | null>(null)

export function AdminUserProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  return (
    <AdminUserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </AdminUserContext.Provider>
  )
}

export function useAdminUser(): AdminUserContextValue {
  const ctx = useContext(AdminUserContext)
  if (!ctx) throw new Error('useAdminUser must be used inside AdminUserProvider')
  return ctx
}
