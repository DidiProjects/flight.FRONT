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

/** A curva de UMA companhia, para o gráfico mostrar a disputa. */
export interface FareHistoryAirlineSeries {
  airline: string
  buckets: FareHistoryBucket[]
}

export interface FareHistorySeries {
  range: FareHistoryRange
  /** Currency of the series, as the API measured it. Never the routine's target unit. */
  currency: string | null
  /** O melhor entre todas, bucket a bucket. Continua sendo a curva em destaque. */
  buckets: FareHistoryBucket[]
  /**
   * Uma curva por companhia que teve preço na janela.
   *
   * Vazio quando a API é antiga: o gráfico continua desenhando só o destaque em
   * vez de sumir. Vem da mesma varredura do total na API, então as curvas não
   * podem discordar do destaque.
   */
  byAirline: FareHistoryAirlineSeries[]
}
