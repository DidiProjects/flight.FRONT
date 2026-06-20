import { ApiService } from './ApiService'
import type { JobView, JobEventLine, CancelJobResponse, JobStatus } from '@app-types/jobs'

interface RawJob {
  id: string
  request_id: string | null
  airline: string
  origin: string
  destination: string
  flight_date: string
  status: JobStatus
  running_since: string | null
  run_started_at: string | null
  run_finished_at: string | null
  last_error: string | null
}

interface RawEvent {
  request_id: string
  seq: number
  ts: string
  type: JobEventLine['type']
  level: JobEventLine['level'] | null
  payload: Record<string, unknown>
}

function jobFromApi(raw: RawJob): JobView {
  return {
    requestId: raw.request_id,
    jobId: raw.id,
    airline: raw.airline,
    origin: raw.origin,
    destination: raw.destination,
    flightDate: raw.flight_date,
    status: raw.status,
    runningSince: raw.running_since,
    startedAt: raw.run_started_at,
    finishedAt: raw.run_finished_at,
    lastError: raw.last_error,
  }
}

function eventFromApi(raw: RawEvent): JobEventLine {
  const detail = (raw.payload.detail ?? raw.payload.step ?? raw.payload.msg) as string | undefined
  return {
    requestId: raw.request_id,
    seq: raw.seq,
    ts: typeof raw.ts === 'string' ? raw.ts : new Date(raw.ts).toISOString(),
    type: raw.type,
    level: raw.level ?? undefined,
    detail,
  }
}

class AdminJobsServiceClass extends ApiService {
  async listJobs(): Promise<JobView[]> {
    const { jobs } = await this.get<{ jobs: RawJob[] }>('/admin/jobs')
    return jobs.map(jobFromApi)
  }

  async listEvents(requestId: string): Promise<JobEventLine[]> {
    const { events } = await this.get<{ events: RawEvent[] }>(`/admin/jobs/${requestId}/events`)
    return events.map(eventFromApi)
  }

  async listTimelineByJob(jobId: string): Promise<JobEventLine[]> {
    const { events } = await this.get<{ events: RawEvent[] }>(`/admin/jobs/${jobId}/timeline`)
    return events.map(eventFromApi)
  }

  cancelJob(requestId: string): Promise<CancelJobResponse> {
    return this.post<CancelJobResponse>(`/admin/jobs/${requestId}/cancel`)
  }
}

export const AdminJobsService = new AdminJobsServiceClass()
