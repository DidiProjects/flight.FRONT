import { ApiService } from './ApiService'
import type { Airline } from '@app-types/airlines'

class AirlinesServiceClass extends ApiService {
  list(): Promise<Airline[]> {
    return this.get<Airline[]>('/airlines')
  }
}

export const AirlinesService = new AirlinesServiceClass()
