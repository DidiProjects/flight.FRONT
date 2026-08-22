export interface Airline {
  code: string
  name: string
  /** Fixed airline currency (optional). When set, it prevails over the routine currency. */
  currency: string | null
  active: boolean
  has_cash: boolean
  has_pts: boolean
  has_hyb: boolean
}

export interface CreateAirlineRequest {
  code: string
  name: string
}

export interface UpdateFareTypesRequest {
  hasCash: boolean
  hasPts: boolean
  hasHyb: boolean
}
