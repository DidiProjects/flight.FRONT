import { ApiService } from './ApiService'
import type { PriceHistorySummary, CurrentPrice, PriceByDateEntry, PriceByDateAirline, Journey } from '@app-types/flightFares'

type RawByDate = {
  flight_date:   string
  best_cash:     number | string | null
  best_pts:      number | string | null
  best_hyb_pts:  number | string | null
  best_hyb_cash: number | string | null
}

type RawByDateResult = {
  dates: RawByDate[]
  byAirline: { airline: string; dates: RawByDate[] }[]
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
  best_cash_at:     string | null
  best_pts_at:      string | null
  best_hyb_pts_at:  string | null
  best_hyb_cash_at: string | null
  best_cash_airline:     string | null
  best_pts_airline:      string | null
  best_hyb_pts_airline:  string | null
  best_hyb_cash_airline: string | null
  /** RT with no total because the return is undefined (outbound collected, pair open). */
  inbound_unavailable?: boolean | null
  /**
   * One journey on one-way, two on round-trip. Already camelCase and coerced by
   * the API — the only part of the response that does not go through `toNum` here.
   */
  journeys?: Journey[]
}

function currentFromApi(raw: RawCurrent): CurrentPrice {
  return {
    currency:    raw.currency ?? null,
    bestCash:    toNum(raw.best_cash),
    bestPts:     toNum(raw.best_pts),
    bestHybPts:  toNum(raw.best_hyb_pts),
    bestHybCash: toNum(raw.best_hyb_cash),
    scrapedAt:   raw.scraped_at ?? null,
    bestCashAt:    raw.best_cash_at ?? null,
    bestPtsAt:     raw.best_pts_at ?? null,
    bestHybPtsAt:  raw.best_hyb_pts_at ?? null,
    bestHybCashAt: raw.best_hyb_cash_at ?? null,
    bestCashAirline:    raw.best_cash_airline ?? null,
    bestPtsAirline:     raw.best_pts_airline ?? null,
    bestHybPtsAirline:  raw.best_hyb_pts_airline ?? null,
    bestHybCashAirline: raw.best_hyb_cash_airline ?? null,
    avgCash30d:  toNum(raw.avg_cash_30d),
    minCash30d:  toNum(raw.min_cash_30d),
    p20Cash30d:  toNum(raw.p20_cash_30d),
    avgPts30d:   toNum(raw.avg_pts_30d),
    minPts30d:   toNum(raw.min_pts_30d),
    inboundUnavailable: raw.inbound_unavailable === true,
    journeys: raw.journeys,
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
  /** Return window. Present = round_trip routine, and /current returns the pair TOTAL. */
  inboundFrom?: string | null
  inboundTo?: string | null
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

/**
 * Return window in the query. Present = pair routine, and the API switches to
 * TOTAL: current price, verdict baseline and calendar, all in the same quantity.
 */
function inboundParams(p: RoutineSummaryParams): Record<string, string> {
  return p.inboundFrom && p.inboundTo
    ? { inbound_from: p.inboundFrom, inbound_to: p.inboundTo }
    : {}
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
      // Without this the baseline would come from ONE leg and the pair total
      // would look expensive forever — the card would call the best offer high.
      ...inboundParams(params),
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
      // Without this an RT routine card would show the outbound leg price as if
      // it were the trip price.
      ...inboundParams(params),
    }).toString()

    const raw = await this.get<RawCurrent>(`/fares/current?${qs}`)
    return currentFromApi(raw)
  }

  async getPriceByDate(params: RoutineSummaryParams): Promise<{ dates: PriceByDateEntry[]; byAirline: PriceByDateAirline[] }> {
    const qs = new URLSearchParams({
      airlines:    params.airlines.join(','),
      origin:      params.origin,
      destination: params.destination,
      date_from:   params.dateFrom,
      date_to:     params.dateTo,
      // Without this the calendar comes back EMPTY on a pair routine: collection
      // writes both legs with return_date, and the loose branch filters IS NULL.
      ...inboundParams(params),
    }).toString()

    const raw = await this.get<RawByDateResult>(`/fares/by-date?${qs}`)
    return {
      dates: raw.dates.map(byDateFromApi),
      // `?? []` de propósito: contra uma API que ainda não devolve o campo o
      // calendário perde a quebra por companhia, não o calendário combinado.
      byAirline: (raw.byAirline ?? []).map((s) => ({
        airline: s.airline,
        dates: s.dates.map(byDateFromApi),
      })),
    }
  }
}

export const FlightFaresService = new FlightFaresServiceClass()
