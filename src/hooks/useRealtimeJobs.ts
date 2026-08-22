import { useEffect, useRef, useState } from 'react'
import { RealtimeService } from '@services/RealtimeService'
import type { JobView, JobEventLine } from '@app-types/jobs'

const key = (j: JobView): string => j.requestId ?? j.jobId

/**
 * Connects to the Admin SSE stream and keeps the job map live (no refresh).
 * The first event (job.snapshot) populates the table; job.upsert/removed then
 * apply deltas. Also keeps the latest timeline rows per requestId.
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
