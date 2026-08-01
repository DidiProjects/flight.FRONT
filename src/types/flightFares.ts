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

export interface CurrentPrice {
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
  /**
   * Parcelas do melhor par, para exibir o total segregado em ida e volta.
   *
   * São as parcelas da combinação vencedora de CADA dimensão — o par mais barato
   * em dinheiro não é necessariamente o mais barato em pontos.
   *
   * Nulas em rotina one-way (não há par) e quando o total veio do bundle da
   * companhia, que é um preço único sem divisão publicada.
   */
  bestCashOutbound: number | null
  bestCashInbound: number | null
  bestPtsOutbound: number | null
  bestPtsInbound: number | null
  bestHybPtsOutbound: number | null
  bestHybPtsInbound: number | null
  bestHybCashOutbound: number | null
  bestHybCashInbound: number | null
}
