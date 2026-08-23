/** Window and resolution of the chart. Mirrors the API's closed set. */
export type FareHistoryRange = 'day' | 'month' | '6m'

/**
 * One point of the chart: the best price offered during the bucket.
 *
 * `samples` is how many price segments overlapped it. Zero means nothing was on
 * sale, or nothing was collected — the line must BREAK there instead of joining
 * the neighbours, which would draw a trend that was never measured.
 */
export interface FareHistoryBucket {
  bucketStart: string
  minCash: number | null
  minPts: number | null
  /** Hybrid keeps its two components; the chart plots the points side, like the calendar. */
  minHybPts: number | null
  minHybCash: number | null
  samples: number
}

export interface FareHistorySeries {
  range: FareHistoryRange
  /** Currency of the series, as the API measured it. Never the routine's target unit. */
  currency: string | null
  buckets: FareHistoryBucket[]
}
