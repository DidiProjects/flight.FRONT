import { ApiService } from './ApiService'
import type { Airline, AirlineRecommendation, CreateAirlineRequest, UpdateFareTypesRequest } from '@app-types/airlines'

class AirlinesServiceClass extends ApiService {
  list(): Promise<Airline[]> {
    return this.get<Airline[]>('/airlines')
  }

  /**
   * Companhias ativas para um trajeto, recomendadas primeiro.
   *
   * Vem TODAS, não só as recomendadas: o mapa de mercado decide o padrão do
   * formulário, nunca o teto do que o usuário pode escolher.
   */
  recommended(origin: string, destination: string): Promise<AirlineRecommendation[]> {
    return this.get<AirlineRecommendation[]>(
      `/airlines/recommended?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
    )
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
