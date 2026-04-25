import { ApiService } from './ApiService'
import { tokenStore } from '@utils/tokenStore'
import { storage } from '@utils/storage'
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
} from '@app-types/auth'

class AuthServiceClass extends ApiService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.post<LoginResponse>('/auth/login', data)
    tokenStore.set(res.accessToken)
    storage.setRefreshToken(res.refreshToken)
    return res
  }

  async logout(refreshToken: string): Promise<void> {
    await this.post<void>('/auth/logout', { refreshToken })
    tokenStore.clear()
    storage.clearRefreshToken()
  }

  async changePassword(data: ChangePasswordRequest): Promise<RefreshResponse> {
    const res = await this.post<RefreshResponse>('/auth/change-password', data)
    tokenStore.set(res.accessToken)
    storage.setRefreshToken(res.refreshToken)
    return res
  }

  async register(data: RegisterRequest): Promise<MessageResponse> {
    return this.post<MessageResponse>('/register', data)
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    return this.post<MessageResponse>('/auth/forgot-password', data)
  }

  async resetPassword(token: string, data: ResetPasswordRequest): Promise<MessageResponse> {
    return this.post<MessageResponse>(`/auth/reset-password/${token}`, data)
  }
}

export const AuthService = new AuthServiceClass()
