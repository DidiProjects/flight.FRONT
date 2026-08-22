/** Resultado do reenvio do último e-mail de uma rotina (ação de admin). */
export interface ResendResult {
  /** Tipo do último e-mail enviado — é o que foi reenviado. */
  type: 'alert' | 'scheduled'
  sent: boolean
  /** Preenchido quando `sent` é false: por que nada saiu. */
  reason?: string
  lastSentAt: string
}

/**
 * Saldo do reset de análises. Execuções e jobs são chaveados por ROTA, então
 * `keptShared` conta o que outra rotina também enxerga — e por isso ficou.
 */
export interface ResetAnalysesResult {
  analysisRuns: { deleted: number; events: number; keptRunning: number; keptShared: number }
  scrapingJobs: { reset: number; keptRunning: number; keptShared: number }
  alertWatermarks: { deleted: number }
}
