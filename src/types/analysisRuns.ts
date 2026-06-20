export type AnalysisRunStatus = 'running' | 'success' | 'failed' | 'dead' | 'blocked' | 'cancelled'

export interface AnalysisRun {
  id: string
  requestId: string | null
  airline: string
  origin: string
  destination: string
  flightDate: string
  status: AnalysisRunStatus
  errorMessage: string | null
  faresFound: number | null
  startedAt: string
  finishedAt: string | null
}
