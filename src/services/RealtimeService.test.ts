import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@utils/tokenStore', () => ({ tokenStore: { get: vi.fn(() => 'tok-123'), set: vi.fn(), clear: vi.fn() } }))

class FakeEventSource {
  static last: FakeEventSource
  url: string
  listeners: Record<string, Array<(e: { data: string }) => void>> = {}
  closed = false
  constructor(url: string) { this.url = url; FakeEventSource.last = this }
  addEventListener(type: string, cb: (e: { data: string }) => void) { (this.listeners[type] ||= []).push(cb) }
  emit(type: string, data?: unknown) { (this.listeners[type] || []).forEach((cb) => cb({ data: JSON.stringify(data) })) }
  close() { this.closed = true }
}
vi.stubGlobal('EventSource', FakeEventSource as unknown as typeof EventSource)

describe('RealtimeService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passa o access token na URL do stream', async () => {
    const { RealtimeService } = await import('./RealtimeService')
    new RealtimeService().connect({})
    expect(FakeEventSource.last.url).toContain('token=tok-123')
    expect(FakeEventSource.last.url).toContain('/admin/stream')
  })

  it('roteia os eventos SSE para os handlers tipados', async () => {
    const { RealtimeService } = await import('./RealtimeService')
    const onSnapshot = vi.fn()
    const onUpsert = vi.fn()
    const onRemoved = vi.fn()
    const onEvent = vi.fn()

    new RealtimeService().connect({ onSnapshot, onUpsert, onRemoved, onEvent })
    const es = FakeEventSource.last

    es.emit('job.snapshot', { jobs: [{ jobId: 'j1' }] })
    es.emit('job.upsert', { requestId: 'r1', jobId: 'j1' })
    es.emit('job.event', { requestId: 'r1', seq: 1, type: 'started' })
    es.emit('job.removed', { requestId: 'r1' })

    expect(onSnapshot).toHaveBeenCalledWith([{ jobId: 'j1' }])
    expect(onUpsert).toHaveBeenCalledWith({ requestId: 'r1', jobId: 'j1' })
    expect(onEvent).toHaveBeenCalledWith({ requestId: 'r1', seq: 1, type: 'started' })
    expect(onRemoved).toHaveBeenCalledWith('r1')
  })

  it('disconnect fecha o EventSource', async () => {
    const { RealtimeService } = await import('./RealtimeService')
    const svc = new RealtimeService()
    svc.connect({})
    const es = FakeEventSource.last
    svc.disconnect()
    expect(es.closed).toBe(true)
  })
})
