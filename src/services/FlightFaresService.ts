import { ApiService } from './ApiService'
import type { PriceHistorySummary, CurrentPrice, PriceByDateEntry } from '@app-types/flightFares'

type RawByDate = {
  flight_date:   string
  best_cash:     number | string | null
  best_pts:      number | string | null
  best_hyb_pts:  number | string | null
  best_hyb_cash: number | string | null
}

function byDateFromApi(raw: RawByDate): PriceByDateEntry {
  return {
    flightDate:  String(raw.flight_date).slice(0, 10),
    bestCash:    toNum(raw.best_cash),
    bestPts:     toNum(raw.best_pts),
    bestHybPts:  toNum(raw.best_hyb_pts),
    bestHybCash: toNum(raw.best_hyb_cash),
  }
}

type RawCurrent = RawPriceHistory & {
  best_cash:     number | string | null
  best_pts:      number | string | null
  best_hyb_pts:  number | string | null
  best_hyb_cash: number | string | null
  scraped_at:    string | null
}

function currentFromApi(raw: RawCurrent): CurrentPrice {
  return {
    currency:    raw.currency ?? null,
    bestCash:    toNum(raw.best_cash),
    bestPts:     toNum(raw.best_pts),
    bestHybPts:  toNum(raw.best_hyb_pts),
    bestHybCash: toNum(raw.best_hyb_cash),
    scrapedAt:   raw.scraped_at ?? null,
    avgCash30d:  toNum(raw.avg_cash_30d),
    minCash30d:  toNum(raw.min_cash_30d),
    p20Cash30d:  toNum(raw.p20_cash_30d),
    avgPts30d:   toNum(raw.avg_pts_30d),
    minPts30d:   toNum(raw.min_pts_30d),
  }
}

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

  async getCurrent(params: RoutineSummaryParams): Promise<CurrentPrice> {
    const qs = new URLSearchParams({
      airlines:    params.airlines.join(','),
      origin:      params.origin,
      destination: params.destination,
      date_from:   params.dateFrom,
      date_to:     params.dateTo,
    }).toString()

    const raw = await this.get<RawCurrent>(`/fares/current?${qs}`)
    return currentFromApi(raw)
  }

  async getPriceByDate(params: RoutineSummaryParams): Promise<PriceByDateEntry[]> {
    const qs = new URLSearchParams({
      airlines:    params.airlines.join(','),
      origin:      params.origin,
      destination: params.destination,
      date_from:   params.dateFrom,
      date_to:     params.dateTo,
    }).toString()

    const raw = await this.get<{ dates: RawByDate[] }>(`/fares/by-date?${qs}`)
    return raw.dates.map(byDateFromApi)
  }
}

export const FlightFaresService = new FlightFaresServiceClass()
