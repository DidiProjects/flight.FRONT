import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@pages/Login'
import { ForgotPasswordPage } from '@pages/ForgotPassword'
import { ResetPasswordPage } from '@pages/ResetPassword'
import { UnsubscribePage } from '@pages/Unsubscribe'
import { RegisterPage } from '@pages/Register'
import { ChangePasswordPage } from '@pages/ChangePassword'
import { DashboardPage } from '@pages/Dashboard'

export function AppRoutes() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
