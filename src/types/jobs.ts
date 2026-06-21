export type JobStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'dead'
  | 'blocked'
  | 'cancelled'

/** Visão consolidada de um job para a tabela do Admin (camelCase). */
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
  /** Dono do job (email). Jobs legados sem dono vêm null. */
  userEmail: string | null
  /** Setado quando a rota perdeu a rotina ativa (aposentado). null = ativo. */
  orphanedAt: string | null
}

/** Linha de timeline/log de uma execução. */
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
