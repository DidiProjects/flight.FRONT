export interface Airport {
  code: string
  name?: string | null
  city?: string | null
  region?: string | null
  countryName?: string | null
  timezone?: string | null
  currency?: string | null
}

export interface UnifiedAirport extends Airport {
  airlines: string[]
}
