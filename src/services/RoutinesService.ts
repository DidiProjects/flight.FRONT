import { ApiService } from './ApiService'
import type { Routine, CreateRoutineRequest, UpdateRoutineRequest } from '@app-types/routines'

class RoutinesServiceClass extends ApiService {
  list(): Promise<Routine[]> {
    return this.get<Routine[]>('/routines')
  }

  getById(id: string): Promise<Routine> {
    return this.get<Routine>(`/routines/${id}`)
  }

  create(data: CreateRoutineRequest): Promise<Routine> {
    return this.post<Routine>('/routines', data)
  }

  update(id: string, data: UpdateRoutineRequest): Promise<Routine> {
    return this.patch<Routine>(`/routines/${id}`, data)
  }

  remove(id: string): Promise<void> {
    return this.delete<void>(`/routines/${id}`)
  }

  activate(id: string): Promise<Routine> {
    return this.patch<Routine>(`/routines/${id}/activate`)
  }

  deactivate(id: string): Promise<Routine> {
    return this.patch<Routine>(`/routines/${id}/deactivate`)
  }
}

export const RoutinesService = new RoutinesServiceClass()
