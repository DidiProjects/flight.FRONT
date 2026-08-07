import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Routine } from '@app-types/routines'

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

const mockRoutine: Routine = {
  id: 'r-1',
  userId: 'u-1',
  name: 'Test',
  airlines: ['azul'],
  origin: 'GRU',
  destination: 'LIS',
  outboundStart: '2026-06-01',
  outboundEnd: '2026-06-07',
  tripType: 'one_way',
  inboundStart: null,
  inboundEnd: null,
  passengers: 1,
  targetCash: 3000,
  targetPts: null,
  targetHybPts: null,
  targetHybCash: null,
  currency: 'BRL',
  margin: 0.1,
  priority: 'cash',
  notificationModes: ['target'],
  notificationFrequency: 'hourly',
  scheduledTime: null,
  ccEmails: [],
  isActive: true,
  createdAt: '2026-04-25T00:00:00.000Z',
  updatedAt: '2026-04-25T00:00:00.000Z',
}

describe('RoutinesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists routines', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [mockRoutine],
    })

    const { RoutinesService } = await import('./RoutinesService')
    const result = await RoutinesService.list()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('r-1')
  })

  it('deactivates a routine', async () => {
    const inactive = { ...mockRoutine, isActive: false }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => inactive,
    })

    const { RoutinesService } = await import('./RoutinesService')
    const result = await RoutinesService.deactivate('r-1')

    expect(result.isActive).toBe(false)
  })

  describe('createTrip', () => {
    const tripInput = {
      name: 'Viagem',
      airlines: ['azul'],
      origin: 'GRU',
      destination: 'LIS',
      outboundStart: '2026-06-01',
      outboundEnd: '2026-06-07',
      returnStart: null as string | null,
      returnEnd: null as string | null,
      passengers: 1,
      targetCash: 3000,
      targetPts: null,
      targetHybPts: null,
      targetHybCash: null,
      margin: 0.1,
      priority: 'cash' as const,
      notificationModes: ['target' as const],
      notificationFrequency: 'hourly' as const,
      scheduledTime: null,
      ccEmails: [],
      isActive: true,
    }

    const bodyOf = (call: number) => JSON.parse(mockFetch.mock.calls[call][1].body as string)

    it('sem volta — envia UMA rotina one_way sem janela de volta', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => mockRoutine })

      const { RoutinesService } = await import('./RoutinesService')
      await RoutinesService.createTrip(tripInput)

      expect(mockFetch).toHaveBeenCalledOnce()
      expect(bodyOf(0)).toMatchObject({
        tripType: 'one_way', inboundStart: null, inboundEnd: null,
      })
    })

    it('com volta — envia UMA rotina round_trip, não duas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 201,
        json: async () => ({ ...mockRoutine, trip_type: 'round_trip', inbound_start: '2026-07-01', inbound_end: '2026-07-05' }),
      })

      const { RoutinesService } = await import('./RoutinesService')
      const created = await RoutinesService.createTrip({
        ...tripInput, returnStart: '2026-07-01', returnEnd: '2026-07-05',
      })

      // O comportamento antigo fazia 2 POSTs com sufixos (IDA)/(VOLTA).
      expect(mockFetch).toHaveBeenCalledOnce()
      expect(bodyOf(0)).toMatchObject({
        name: 'Viagem',
        origin: 'GRU',
        destination: 'LIS',
        tripType: 'round_trip',
        inboundStart: '2026-07-01',
        inboundEnd: '2026-07-05',
      })
      expect(created.tripType).toBe('round_trip')
      expect(created.inboundStart).toBe('2026-07-01')
    })

    it('fromApi — rotina sem trip_type é tratada como one_way', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => [mockRoutine] })

      const { RoutinesService } = await import('./RoutinesService')
      const [r] = await RoutinesService.list()

      expect(r.tripType).toBe('one_way')
      expect(r.inboundStart).toBeNull()
    })
  })
})
