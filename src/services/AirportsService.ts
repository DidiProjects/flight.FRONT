import { ApiService } from './ApiService'
import type { Airport } from '@app-types/airports'

type RawAirport = Record<string, unknown>

function fromApi(raw: RawAirport): Airport {
  return {
    code: ((raw.airport_code ?? raw.code) as string | undefined)?.toUpperCase() ?? '',
    name: (raw.name ?? null) as string | null,
    city: (raw.city ?? null) as string | null,
    region: (raw.region ?? null) as string | null,
    countryName: ((raw.country_name ?? raw.countryName) ?? null) as string | null,
    timezone: (raw.timezone ?? null) as string | null,
    currency: (raw.currency ?? null) as string | null,
  }
}

class AirportsServiceClass extends ApiService {
  async listByAirline(airline: string): Promise<Airport[]> {
    const params = new URLSearchParams({ airline })
    const raw = await this.get<RawAirport[]>(`/airports?${params.toString()}`)
    return raw.map(fromApi)
  }
}

export const AirportsService = new AirportsServiceClass()
