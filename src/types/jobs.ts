export type JobStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'dead'
  | 'blocked'
  | 'cancelled'

/** Consolidated view of a job for the Admin table (camelCase). */
export interface JobView {
  requestId: string | null
  jobId: string
  airline: string
  origin: string
  destination: string
  flightDate: string
  status: JobStatus
  runningSince: string | null
  startedAt: string | null
  finishedAt: string | null
  lastStep?: string
  lastError: string | null
  /** Fares found (arrives on job.finished). undefined while it has not finished. */
  faresFound?: number | null
  /** Owners derived by route (active routines covering route+date). Empty = ownerless. */
  userEmails: string[]
  /** Set when the route lost its active routine (retired). null = active. */
  orphanedAt: string | null
}

/** Timeline/log row of a run. */
export interface JobEventLine {
  requestId: string
  seq: number
  ts: string
  type: 'queued' | 'started' | 'progress' | 'log' | 'finished'
  level?: 'info' | 'warn' | 'error'
  detail?: string
}

export interface CancelJobResponse {
  accepted: boolean
  delivery: 'dispatched' | 'recovered'
}
