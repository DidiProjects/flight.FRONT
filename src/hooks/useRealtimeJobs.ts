import { useEffect, useRef, useState } from 'react'
import { RealtimeService } from '@services/RealtimeService'
import type { JobView, JobEventLine } from '@app-types/jobs'

const key = (j: JobView): string => j.requestId ?? j.jobId

/**
 * Conecta ao stream SSE do Admin e mantém o mapa de jobs ao vivo (sem refresh).
 * O 1º evento (job.snapshot) popula a tabela; depois job.upsert/removed aplicam
 * deltas. Mantém também as últimas linhas de timeline por requestId.
 */
export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<Map<string, JobView>>(new Map())
  const [events, setEvents] = useState<Map<string, JobEventLine[]>>(new Map())
  const [connected, setConnected] = useState(false)
  const serviceRef = useRef<RealtimeService | null>(null)

  useEffect(() => {
    const service = new RealtimeService()
    serviceRef.current = service

    service.connect({
      onOpen: () => setConnected(true),
      onError: () => setConnected(false),
      onSnapshot: (list) => setJobs(new Map(list.map((j) => [key(j), j]))),
      onUpsert: (job) =>
        setJobs((prev) => {
          const next = new Map(prev)
          next.set(key(job), job)
          return next
        }),
      onRemoved: (requestId) =>
        setJobs((prev) => {
          const next = new Map(prev)
          next.delete(requestId)
          return next
        }),
      onEvent: (ev) =>
        setEvents((prev) => {
          const next = new Map(prev)
          const list = [...(next.get(ev.requestId) ?? []), ev].slice(-50)
          next.set(ev.requestId, list)
          return next
        }),
    })

    return () => service.disconnect()
  }, [])

  return { jobs: [...jobs.values()], events, connected }
}
