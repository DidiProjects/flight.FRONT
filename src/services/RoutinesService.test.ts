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
  returnStart: null,
  returnEnd: null,
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
})
