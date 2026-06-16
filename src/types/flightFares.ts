export interface PriceHistoryEntry {
  bucketDate: string
  fareType: 'cash' | 'pts' | 'hyb_pts' | 'hyb_cash'
  priceMin: number | null
  priceMax: number | null
  priceAvg: number | null
  sampleCount: number
}

export interface PriceHistorySummary {
  avgCash30d: number | null
  minCash30d: number | null
  p20Cash30d: number | null
  avgPts30d: number | null
  minPts30d: number | null
}
