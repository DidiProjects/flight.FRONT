export type AnalysisRunStatus = 'running' | 'success' | 'failed' | 'dead' | 'blocked'

export interface AnalysisRun {
  id: string
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
