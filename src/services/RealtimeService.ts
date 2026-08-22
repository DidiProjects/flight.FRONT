import { tokenStore } from '@utils/tokenStore'
import type { JobView, JobEventLine } from '@app-types/jobs'

const API_URL = import.meta.env.VITE_API_URL as string

export interface RealtimeHandlers {
  onSnapshot?: (jobs: JobView[]) => void
  onUpsert?: (job: JobView) => void
  onEvent?: (event: JobEventLine) => void
  onRemoved?: (requestId: string) => void
  onError?: () => void
  onOpen?: () => void
}

/**
 * EventSource wrapper for the Admin SSE stream. EventSource reconnects on its
 * own (with Last-Event-ID); here we only wire the typed handlers. The access
 * token goes as a query param because EventSource sends no Authorization header.
 */
export class RealtimeService {
  private es: EventSource | null = null

  connect(handlers: RealtimeHandlers): void {
    this.disconnect()
    const token = tokenStore.get()
    const url = `${API_URL}/admin/stream?token=${encodeURIComponent(token ?? '')}`
    const es = new EventSource(url)
    this.es = es

    es.addEventListener('open', () => handlers.onOpen?.())
    es.addEventListener('error', () => handlers.onError?.())

    es.addEventListener('job.snapshot', (e) => {
      const { jobs } = JSON.parse((e as MessageEvent).data) as { jobs: JobView[] }
      handlers.onSnapshot?.(jobs)
    })
    es.addEventListener('job.upsert', (e) => {
      handlers.onUpsert?.(JSON.parse((e as MessageEvent).data) as JobView)
    })
    es.addEventListener('job.event', (e) => {
      handlers.onEvent?.(JSON.parse((e as MessageEvent).data) as JobEventLine)
    })
    es.addEventListener('job.removed', (e) => {
      const { requestId } = JSON.parse((e as MessageEvent).data) as { requestId: string }
      handlers.onRemoved?.(requestId)
    })
  }

  disconnect(): void {
    this.es?.close()
    this.es = null
  }
}
