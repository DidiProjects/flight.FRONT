import type { Routine } from '@app-types/routines'
import type { AnalysisRun, AnalysisRunStatus } from '@app-types/analysisRuns'
import type { JobView } from '@app-types/jobs'

const toRunStatus = (status: JobView['status']): AnalysisRunStatus =>
  status === 'pending' ? 'running' : status

export function matchesRoutine(job: JobView, routine: Routine): boolean {
  const date = job.flightDate?.slice(0, 10)
  return (
    !!job.requestId &&
    routine.airlines.includes(job.airline) &&
    job.origin === routine.origin &&
    job.destination === routine.destination &&
    !!date &&
    date >= routine.outboundStart &&
    date <= routine.outboundEnd
  )
}

function jobToRun(job: JobView): AnalysisRun {
  return {
    id: job.requestId ?? job.jobId,
    requestId: job.requestId,
    airline: job.airline,
    origin: job.origin,
    destination: job.destination,
    flightDate: job.flightDate?.slice(0, 10) ?? '',
    status: toRunStatus(job.status),
    errorMessage: job.lastError,
    faresFound: null,
    startedAt: job.runningSince ?? new Date().toISOString(),
    finishedAt: null,
  }
}

const overlay = (run: AnalysisRun, job: JobView): AnalysisRun => ({
  ...run,
  status: toRunStatus(job.status),
  errorMessage: job.lastError ?? run.errorMessage,
})

export function mergeRuns(history: AnalysisRun[], live: JobView[]): AnalysisRun[] {
  const byRequest = new Map<string, AnalysisRun>()
  for (const run of history) byRequest.set(run.requestId ?? run.id, run)
  for (const job of live) {
    if (!job.requestId) continue
    const existing = byRequest.get(job.requestId)
    byRequest.set(job.requestId, existing ? overlay(existing, job) : jobToRun(job))
  }
  return [...byRequest.values()].sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''))
}
