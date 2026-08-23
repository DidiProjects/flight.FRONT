import { ApiService } from './ApiService'
import type { FareHistoryBucket, FareHistoryRange, FareHistorySeries } from '@app-types/fareHistory'

interface SeriesParams {
  airlines: string[]
  origin: string
  destination: string
  dateFrom: string
  dateTo: string
  /** Return window. Present = pair routine, and the series is of trip TOTALS. */
  inboundFrom?: string | null
  inboundTo?: string | null
  range: FareHistoryRange
}

type RawBucket = {
  bucket_start: string
  min_cash: number | string | null
  min_pts: number | string | null
  min_hyb_pts: number | string | null
  min_hyb_cash: number | string | null
  samples: number
}

type RawSeries = {
  range: FareHistoryRange
  currency: string | null
  buckets: RawBucket[]
}

/** NUMERIC arrives from the API as a string; comparing it raw sorts lexicographically. */
function toNum(v: number | string | null): number | null {
  if (v == null) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function bucketFromApi(raw: RawBucket): FareHistoryBucket {
  return {
    bucketStart: raw.bucket_start,
    minCash: toNum(raw.min_cash),
    minPts: toNum(raw.min_pts),
    minHybPts: toNum(raw.min_hyb_pts),
    minHybCash: toNum(raw.min_hyb_cash),
    samples: raw.samples,
  }
}

class FareHistoryServiceClass extends ApiService {
  async getSeries(params: SeriesParams): Promise<FareHistorySeries> {
    const qs = new URLSearchParams({
      airlines:    params.airlines.join(','),
      origin:      params.origin,
      destination: params.destination,
      date_from:   params.dateFrom,
      date_to:     params.dateTo,
      range:       params.range,
      // Without this a pair routine would chart one_way itineraries — the price
      // of a leg against a card showing the trip total.
      ...(params.inboundFrom && params.inboundTo
        ? { inbound_from: params.inboundFrom, inbound_to: params.inboundTo }
        : {}),
    }).toString()

    const raw = await this.get<RawSeries>(`/fares/series?${qs}`)
    return {
      range: raw.range,
      currency: raw.currency ?? null,
      buckets: raw.buckets.map(bucketFromApi),
    }
  }
}

export const FareHistoryService = new FareHistoryServiceClass()
