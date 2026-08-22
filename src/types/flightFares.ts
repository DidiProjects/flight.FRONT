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

/** Um TRAJETO voado. Hoje um por jornada; a conexão modelada dará N. */
export interface Segment {
  origin: string
  destination: string
}

/**
 * O que a companhia VENDE e precifica: a ida, ou a volta.
 *
 * A moeda mora AQUI, não no card: herdar do nível de cima é o que fazia ida e
 * volta aparecerem rotuladas iguais quando a coleta foi em moedas diferentes.
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
  /** Uma em só-ida, duas em ida-e-volta. */
  journeys?: Journey[]
  currency: string | null
  bestCash: number | null
  bestPts: number | null
  bestHybPts: number | null
  bestHybCash: number | null
  scrapedAt: string | null
  avgCash30d: number | null
  minCash30d: number | null
  p20Cash30d: number | null
  avgPts30d: number | null
  minPts30d: number | null
  /**
   * Rotina ida-e-volta cuja volta é indefinida (a companhia não deixa vê-la).
   * A ida FOI coletada — só não é o preço da viagem. Serve para o card não dizer
   * "sem preço coletado" quando o motivo é outro.
   */
  inboundUnavailable?: boolean
}
