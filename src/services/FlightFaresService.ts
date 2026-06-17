import { ApiService } from './ApiService'
import type { PriceHistorySummary } from '@app-types/flightFares'

interface PriceHistoryParams {
  airline: string
  origin: string
  destination: string
  flightDate: string
}

interface RoutineSummaryParams {
  airlines: string[]
  origin: string
  destination: string
  dateFrom: string
  dateTo: string
}

type RawPriceHistory = {
  currency:    string | null
  avg_cash_30d: number | string | null
  min_cash_30d: number | string | null
  p20_cash_30d: number | string | null
  avg_pts_30d:  number | string | null
  min_pts_30d:  number | string | null
}

function toNum(v: number | string | null): number | null {
  if (v == null) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function fromApi(raw: RawPriceHistory): PriceHistorySummary {
  return {
    currency:   raw.currency ?? null,
    avgCash30d: toNum(raw.avg_cash_30d),
    minCash30d: toNum(raw.min_cash_30d),
    p20Cash30d: toNum(raw.p20_cash_30d),
    avgPts30d:  toNum(raw.avg_pts_30d),
    minPts30d:  toNum(raw.min_pts_30d),
  }
}

class FlightFaresServiceClass extends ApiService {
  async getPriceHistory(params: PriceHistoryParams): Promise<PriceHistorySummary> {
    const qs = new URLSearchParams({
      airline:     params.airline,
      origin:      params.origin,
      destination: params.destination,
      flight_date: params.flightDate,
    }).toString()

    const raw = await this.get<RawPriceHistory>(`/fares/history?${qs}`)
    return fromApi(raw)
  }

  async getRoutineSummary(params: RoutineSummaryParams): Promise<PriceHistorySummary> {
    const qs = new URLSearchParams({
      airlines:    params.airlines.join(','),
      origin:      params.origin,
      destination: params.destination,
      date_from:   params.dateFrom,
      date_to:     params.dateTo,
    }).toString()

    const raw = await this.get<RawPriceHistory>(`/fares/summary?${qs}`)
    return fromApi(raw)
  }
}

export const FlightFaresService = new FlightFaresServiceClass()
