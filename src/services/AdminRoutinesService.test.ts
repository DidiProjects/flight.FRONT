import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('@utils/tokenStore', () => ({ tokenStore: { get: vi.fn(() => 'tok'), set: vi.fn(), clear: vi.fn() } }))
vi.mock('@utils/storage', () => ({ storage: { getRefreshToken: vi.fn(), setRefreshToken: vi.fn(), clearRefreshToken: vi.fn() } }))
vi.mock('@utils/toast', () => ({ toastEmitter: { error: vi.fn() } }))

function jsonOk(body: unknown) {
  return { ok: true, status: 200, json: async () => body }
}

describe('AdminRoutinesService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reenvia o último e-mail por POST na rota da rotina', async () => {
    mockFetch.mockResolvedValue(jsonOk({
      type: 'alert', sent: true, lastSentAt: '2026-08-21T23:00:00Z',
    }))
    const { AdminRoutinesService } = await import('./AdminRoutinesService')

    const res = await AdminRoutinesService.resendLastNotification('r1')

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/admin/routines/r1/resend-last-notification')
    expect(init.method).toBe('POST')
    expect(res).toMatchObject({ type: 'alert', sent: true })
  })

  it('preserva o motivo quando nada foi reenviado', async () => {
    mockFetch.mockResolvedValue(jsonOk({
      type: 'scheduled', sent: false, reason: 'Nenhuma tarifa disponível para a rotina',
      lastSentAt: '2026-08-21T23:00:00Z',
    }))
    const { AdminRoutinesService } = await import('./AdminRoutinesService')

    const res = await AdminRoutinesService.resendLastNotification('r1')

    expect(res.sent).toBe(false)
    expect(res.reason).toMatch(/Nenhuma tarifa/)
  })

  it('reset devolve o saldo do que zerou e do que ficou', async () => {
    mockFetch.mockResolvedValue(jsonOk({
      analysisRuns:    { deleted: 12, events: 40, keptRunning: 1, keptShared: 2 },
      scrapingJobs:    { reset: 5, keptRunning: 0, keptShared: 3 },
      alertWatermarks: { deleted: 4 },
    }))
    const { AdminRoutinesService } = await import('./AdminRoutinesService')

    const res = await AdminRoutinesService.resetAnalyses('r1')

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/admin/routines/r1/reset-analyses')
    expect(init.method).toBe('POST')
    expect(res.analysisRuns.deleted).toBe(12)
    expect(res.scrapingJobs.keptShared).toBe(3)
  })
})
