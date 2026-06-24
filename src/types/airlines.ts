export interface Airline {
  code: string
  name: string
  /** Moeda fixa da companhia (opcional). Quando definida, prevalece na moeda da rotina. */
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
