import { ApiService } from './ApiService'
import type {
  User,
  UsersListResponse,
  CreateUserRequest,
  ApproveUserRequest,
  UpdateUserRequest,
  UsersQueryParams,
  UserRole,
  UserStatus,
} from '@app-types/users'
import type { MessageResponse } from '@app-types/auth'

interface RawUser {
  id: string
  name?: string | null
  email: string
  role: UserRole
  status: UserStatus
  must_change_password: boolean
  provisional_expires_at: string | null
  created_at: string
  updated_at: string
}

function fromApi(raw: RawUser): User {
  return {
    id: raw.id,
    name: raw.name ?? null,
    email: raw.email,
    role: raw.role,
    status: raw.status,
    mustChangePassword: raw.must_change_password,
    provisionalExpiresAt: raw.provisional_expires_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

class UsersServiceClass extends ApiService {
  async list(params: UsersQueryParams = {}): Promise<UsersListResponse> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const raw = await this.get<{ users: RawUser[]; total: number }>(`/users${qs ? `?${qs}` : ''}`)
    return { users: raw.users.map(fromApi), total: raw.total }
  }

  getById(id: string): Promise<User> {
    return this.get<RawUser>(`/users/${id}`).then(fromApi)
  }

  create(data: CreateUserRequest): Promise<MessageResponse> {
    return this.post<MessageResponse>('/users', data)
  }

  approve(id: string, data: ApproveUserRequest): Promise<MessageResponse> {
    return this.patch<MessageResponse>(`/users/${id}/approve`, data)
  }

  update(id: string, data: UpdateUserRequest): Promise<MessageResponse> {
    return this.patch<MessageResponse>(`/users/${id}`, data)
  }

  remove(id: string): Promise<void> {
    return this.delete<void>(`/users/${id}`)
  }
}

export const UsersService = new UsersServiceClass()
