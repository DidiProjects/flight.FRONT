import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('@utils/tokenStore', () => ({ tokenStore: { get: vi.fn(() => 'tok'), set: vi.fn(), clear: vi.fn() } }))
vi.mock('@utils/storage', () => ({ storage: { getRefreshToken: vi.fn(), setRefreshToken: vi.fn(), clearRefreshToken: vi.fn() } }))
vi.mock('@utils/toast', () => ({ toastEmitter: { error: vi.fn() } }))

function jsonOk(body: unknown) {
  return { ok: true, status: 200, json: async () => body }
}

describe('AdminJobsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listJobs converte snake_case → camelCase', async () => {
    mockFetch.mockResolvedValue(jsonOk({
      jobs: [{
        id: 'j1', request_id: 'r1', airline: 'azul', origin: 'VCP', destination: 'GRU',
        flight_date: '2026-07-01', status: 'running', running_since: '2026-07-01T10:00:00Z', last_error: null,
        user_emails: ['ana@example.com'], orphaned_at: null,
      }],
    }))
    const { AdminJobsService } = await import('./AdminJobsService')
    const jobs = await AdminJobsService.listJobs()

    expect(jobs[0]).toEqual({
      requestId: 'r1', jobId: 'j1', airline: 'azul', origin: 'VCP', destination: 'GRU',
      flightDate: '2026-07-01', status: 'running', runningSince: '2026-07-01T10:00:00Z', lastError: null,
      userEmails: ['ana@example.com'], orphanedAt: null,
    })
  })

  it('listEvents extrai detail do payload', async () => {
    mockFetch.mockResolvedValue(jsonOk({
      events: [{ request_id: 'r1', seq: 3, ts: '2026-07-01T10:00:01Z', type: 'progress', level: null, payload: { step: 'parse' } }],
    }))
    const { AdminJobsService } = await import('./AdminJobsService')
    const events = await AdminJobsService.listEvents('r1')

    expect(events[0]).toMatchObject({ requestId: 'r1', seq: 3, type: 'progress', detail: 'parse' })
  })

  it('cancelJob faz POST no endpoint correto', async () => {
    mockFetch.mockResolvedValue(jsonOk({ accepted: true, delivery: 'dispatched' }))
    const { AdminJobsService } = await import('./AdminJobsService')
    const res = await AdminJobsService.cancelJob('r1')

    expect(res).toEqual({ accepted: true, delivery: 'dispatched' })
    const [url, opts] = mockFetch.mock.calls[0]
    expect(String(url)).toContain('/admin/jobs/r1/cancel')
    expect(opts.method).toBe('POST')
  })
})
