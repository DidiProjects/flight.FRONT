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

/**
 * Por que a companhia é (ou não é) recomendada para o trajeto.
 *
 * `outside_market` é o motivo que a API passou a distinguir: a companhia atende
 * as duas pontas, mas não tem direito de tráfego em nenhuma delas — cabotagem.
 * É o que impede oferecer LATAM para um Madri–Barcelona.
 */
export type RecommendationReason = 'serves_route' | 'outside_market' | 'no_route'

export interface AirlineRecommendation extends Airline {
  recommended: boolean
  reason: RecommendationReason
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
