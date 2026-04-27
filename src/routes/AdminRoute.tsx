import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { AdminUserProvider } from '@contexts/AdminUserContext'

export function AdminRoute() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return (
    <AdminUserProvider>
      <Outlet />
    </AdminUserProvider>
  )
}
