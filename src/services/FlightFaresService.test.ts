import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('@utils/tokenStore', () => ({
  tokenStore: { get: vi.fn(() => 'mock-token'), set: vi.fn(), clear: vi.fn() },
}))
vi.mock('@utils/storage', () => ({
  storage: { getRefreshToken: vi.fn(), setRefreshToken: vi.fn(), clearRefreshToken: vi.fn() },
}))
vi.mock('@utils/toast', () => ({
  toastEmitter: { error: vi.fn(), success: vi.fn() },
}))

const rawResponse = {
  avg_cash_30d: 450,
  min_cash_30d: 300,
  p20_cash_30d: 360,
  avg_pts_30d: null,
  min_pts_30d: null,
}

const params = {
  airline: 'azul',
  origin: 'VCP',
  destination: 'GRU',
  flightDate: '2026-08-15',
}

describe('FlightFaresService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => rawResponse,
    })
  })

  it('calls fetch with the correct URL containing all query params', async () => {
    const { FlightFaresService } = await import('./FlightFaresService')
    await FlightFaresService.getPriceHistory(params)

    expect(mockFetch).toHaveBeenCalledOnce()
    const calledUrl: string = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/fares/history')
    expect(calledUrl).toContain('airline=azul')
    expect(calledUrl).toContain('origin=VCP')
    expect(calledUrl).toContain('destination=GRU')
    expect(calledUrl).toContain('flight_date=2026-08-15')
  })

  it('transforms snake_case API response to camelCase PriceHistorySummary', async () => {
    const { FlightFaresService } = await import('./FlightFaresService')
    const result = await FlightFaresService.getPriceHistory(params)

    expect(result).toEqual({
      avgCash30d: 450,
      minCash30d: 300,
      p20Cash30d: 360,
      avgPts30d: null,
      minPts30d: null,
    })
  })

  it('throws an error when the API responds with a non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    })

    const { FlightFaresService } = await import('./FlightFaresService')
    await expect(FlightFaresService.getPriceHistory(params)).rejects.toThrow()
  })
})
