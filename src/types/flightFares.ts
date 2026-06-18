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
}
