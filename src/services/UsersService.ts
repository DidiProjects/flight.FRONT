import { ApiService } from './ApiService'
import type {
  User,
  UsersListResponse,
  CreateUserRequest,
  ApproveUserRequest,
  UpdateUserRequest,
  UsersQueryParams,
} from '@app-types/users'
import type { MessageResponse } from '@app-types/auth'

class UsersServiceClass extends ApiService {
  list(params: UsersQueryParams = {}): Promise<UsersListResponse> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return this.get<UsersListResponse>(`/users${qs ? `?${qs}` : ''}`)
  }

  getById(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`)
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
