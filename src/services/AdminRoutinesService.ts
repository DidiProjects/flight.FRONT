import { ApiService } from './ApiService'
import type { ResendResult, ResetAnalysesResult } from '@app-types/adminRoutines'

class AdminRoutinesServiceClass extends ApiService {
  /** Resends the routine's last email — target alert or daily summary. */
  resendLastNotification(routineId: string): Promise<ResendResult> {
    return this.post<ResendResult>(`/admin/routines/${routineId}/resend-last-notification`)
  }

  /** Clears runs, jobs and watermark of the routine. Price history is preserved. */
  resetAnalyses(routineId: string): Promise<ResetAnalysesResult> {
    return this.post<ResetAnalysesResult>(`/admin/routines/${routineId}/reset-analyses`)
  }
}

export const AdminRoutinesService = new AdminRoutinesServiceClass()
