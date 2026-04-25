export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  mustChangePassword: boolean
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface RegisterRequest {
  name: string
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  password: string
}

export interface MessageResponse {
  message: string
}

export interface ApiError {
  error: string
  issues?: ValidationIssue[]
}

export interface ValidationIssue {
  path: string
  message: string
}
