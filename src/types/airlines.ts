export interface Airline {
  code: string
  name: string
  active: boolean
  currency: string
  has_cash: boolean
  has_pts: boolean
  has_hyb: boolean
}

export interface CreateAirlineRequest {
  code: string
  name: string
  currency?: string
}

export interface UpdateFareTypesRequest {
  hasCash: boolean
  hasPts: boolean
  hasHyb: boolean
}
