import { ApiService } from './ApiService'
import type { PriceHistorySummary } from '@app-types/flightFares'

interface PriceHistoryParams {
  airline: string
  origin: string
  destination: string
  flightDate: string
}

type RawPriceHistory = {
  avg_cash_30d: number | null
  min_cash_30d: number | null
  p20_cash_30d: number | null
  avg_pts_30d: number | null
  min_pts_30d: number | null
}

function fromApi(raw: RawPriceHistory): PriceHistorySummary {
  return {
    avgCash30d: raw.avg_cash_30d,
    minCash30d: raw.min_cash_30d,
    p20Cash30d: raw.p20_cash_30d,
    avgPts30d: raw.avg_pts_30d,
    minPts30d: raw.min_pts_30d,
  }
}

class FlightFaresServiceClass extends ApiService {
  async getPriceHistory(params: PriceHistoryParams): Promise<PriceHistorySummary> {
    const qs = new URLSearchParams({
      airline: params.airline,
      origin: params.origin,
      destination: params.destination,
      flight_date: params.flightDate,
    }).toString()

    const raw = await this.get<RawPriceHistory>(`/flight/fares/history?${qs}`)
    return fromApi(raw)
  }
}

export const FlightFaresService = new FlightFaresServiceClass()
