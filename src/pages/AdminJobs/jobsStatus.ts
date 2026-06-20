import type { JobStatus } from '@app-types/jobs'

export type StatusColor = 'default' | 'info' | 'success' | 'error' | 'warning'

export const STATUS_COLOR: Record<JobStatus, StatusColor> = {
  pending: 'default',
  running: 'info',
  success: 'success',
  failed: 'error',
  dead: 'error',
  blocked: 'warning',
  cancelled: 'default',
}

export const STATUS_LABEL: Record<JobStatus, string> = {
  pending: 'Pendente',
  running: 'Executando',
  success: 'Sucesso',
  failed: 'Falhou',
  dead: 'Morto',
  blocked: 'Bloqueado',
  cancelled: 'Cancelado',
}

export const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as JobStatus[]
