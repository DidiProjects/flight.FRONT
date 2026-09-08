export interface PriceHistoryEntry {
  bucketDate: string
  fareType: 'cash' | 'pts' | 'hyb_pts' | 'hyb_cash'
  priceMin: number | null
  priceMax: number | null
  priceAvg: number | null
  sampleCount: number
}

export interface PriceHistorySummary {
  currency: string | null
  avgCash30d: number | null
  minCash30d: number | null
  p20Cash30d: number | null
  avgPts30d: number | null
  minPts30d: number | null
}

export interface PriceByDateEntry {
  flightDate: string
  bestCash: number | null
  bestPts: number | null
  bestHybPts: number | null
  bestHybCash: number | null
}

/** One airline's own calendar — the same entries `byDate` merges into one. */
export interface PriceByDateAirline {
  airline: string
  dates: PriceByDateEntry[]
}

/** One flown SEGMENT. One per journey today; modelling connections will give N. */
export interface Segment {
  origin: string
  destination: string
}

/**
 * What the airline SELLS and prices: the outbound, or the return.
 *
 * The currency lives HERE, not on the card: inheriting it from above is what made
 * outbound and return show the same label on collections in different currencies.
 */
export interface Journey {
  direction: 'outbound' | 'inbound'
  currency: string | null
  cash: number | null
  pts: number | null
  hybPts: number | null
  hybCash: number | null
  segments: Segment[]
}

export interface CurrentPrice {
  /** One on one-way, two on round-trip. */
  journeys?: Journey[]
  currency: string | null
  bestCash: number | null
  bestPts: number | null
  bestHybPts: number | null
  bestHybCash: number | null
  /** Newest collection of the grid — when we last looked, not how old the price is. */
  scrapedAt: string | null
  /**
   * When the fare behind each price was collected. The card stamps "verificado
   * há x" with the one matching the routine priority: a single grid timestamp
   * dated the winning fare by the hour of another date's collection.
   */
  bestCashAt: string | null
  bestPtsAt: string | null
  bestHybPtsAt: string | null
  bestHybCashAt: string | null
  /**
   * Companhia dona do preço vencedor de CADA dimensão — não é sempre a mesma:
   * comparando mais de uma companhia, a mais barata em dinheiro não é
   * necessariamente a mais barata em pontos.
   */
  bestCashAirline: string | null
  bestPtsAirline: string | null
  bestHybPtsAirline: string | null
  bestHybCashAirline: string | null
  avgCash30d: number | null
  minCash30d: number | null
  p20Cash30d: number | null
  avgPts30d: number | null
  minPts30d: number | null
  /**
   * Round-trip routine whose return is undefined (the airline will not show it).
   * The outbound WAS collected — it is just not the trip price. It keeps the card
   * from saying "no price collected" when the reason is another.
   */
  inboundUnavailable?: boolean
}
