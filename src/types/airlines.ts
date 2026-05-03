export interface Airline {
  code: string
  name: string
  active: boolean
  currency: string
  has_brl: boolean
  has_pts: boolean
  has_hyb: boolean
}

export interface CreateAirlineRequest {
  code: string
  name: string
  currency: string
}

export interface UpdateFareTypesRequest {
  hasBrl: boolean
  hasPts: boolean
  hasHyb: boolean
}
