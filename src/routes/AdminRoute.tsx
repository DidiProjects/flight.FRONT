import { Navigate, Outlet } from 'react-router-dom'

interface AdminRouteProps {
  role?: string
}

export function AdminRoute({ role }: AdminRouteProps) {
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
