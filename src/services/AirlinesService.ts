import { ApiService } from './ApiService'
import type { Airline, CreateAirlineRequest, UpdateFareTypesRequest } from '@app-types/airlines'

class AirlinesServiceClass extends ApiService {
  list(): Promise<Airline[]> {
    return this.get<Airline[]>('/airlines')
  }

  listAdmin(): Promise<Airline[]> {
    return this.get<Airline[]>('/airlines/admin')
  }

  create(data: CreateAirlineRequest): Promise<Airline> {
    return this.post<Airline>('/airlines', data)
  }

  activate(code: string): Promise<Airline> {
    return this.patch<Airline>(`/airlines/${code}/activate`)
  }

  deactivate(code: string): Promise<Airline> {
    return this.patch<Airline>(`/airlines/${code}/deactivate`)
  }

  updateFareTypes(code: string, data: UpdateFareTypesRequest): Promise<Airline> {
    return this.patch<Airline>(`/airlines/${code}/fare-types`, data)
  }

  remove(code: string): Promise<void> {
    return this.delete<void>(`/airlines/${code}`)
  }
}

export const AirlinesService = new AirlinesServiceClass()
