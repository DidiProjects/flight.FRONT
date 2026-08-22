import { ApiService } from './ApiService'
import type { ResendResult, ResetAnalysesResult } from '@app-types/adminRoutines'

class AdminRoutinesServiceClass extends ApiService {
  /** Reenvia o último e-mail da rotina — alerta de target ou resumo do dia. */
  resendLastNotification(routineId: string): Promise<ResendResult> {
    return this.post<ResendResult>(`/admin/routines/${routineId}/resend-last-notification`)
  }

  /** Zera execuções, jobs e watermark da rotina. Preserva o histórico de preços. */
  resetAnalyses(routineId: string): Promise<ResetAnalysesResult> {
    return this.post<ResetAnalysesResult>(`/admin/routines/${routineId}/reset-analyses`)
  }
}

export const AdminRoutinesService = new AdminRoutinesServiceClass()
