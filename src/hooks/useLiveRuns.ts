import { useEffect, useMemo, useState } from 'react'
import { RealtimeService } from '@services/RealtimeService'
import type { JobView } from '@app-types/jobs'

const keyOf = (job: JobView): string => job.requestId ?? job.jobId

export function useLiveRuns(): JobView[] {
  const [byKey, setByKey] = useState<Map<string, JobView>>(new Map())

  useEffect(() => {
    const service = new RealtimeService()
    service.connect({
      onSnapshot: (list) =>
        setByKey((prev) => {
          const next = new Map(prev)
          for (const job of list) next.set(keyOf(job), job)
          return next
        }),
      onUpsert: (job) => setByKey((prev) => new Map(prev).set(keyOf(job), job)),
    })
    return () => service.disconnect()
  }, [])

  return useMemo(() => [...byKey.values()], [byKey])
}
