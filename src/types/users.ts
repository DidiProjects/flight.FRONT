export type UserRole = 'user' | 'admin'

export type UserStatus = 'pending' | 'active' | 'suspended'

export interface User {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  mustChangePassword: boolean
  provisionalExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UsersListResponse {
  users: User[]
  total: number
}

export interface CreateUserRequest {
  email: string
}

export interface ApproveUserRequest {
  role: UserRole
}

export interface UpdateUserRequest {
  role?: UserRole
  status?: UserStatus
}

export interface UsersQueryParams {
  page?: number
  limit?: number
}
