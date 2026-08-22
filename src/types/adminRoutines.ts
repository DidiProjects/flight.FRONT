/** Result of resending a routine's last email (an admin action). */
export interface ResendResult {
  /** Type of the last email sent — that is what got resent. */
  type: 'alert' | 'scheduled'
  sent: boolean
  /** Filled when `sent` is false: why nothing went out. */
  reason?: string
  lastSentAt: string
}

/**
 * Balance of an analysis reset. Runs and jobs are keyed by ROUTE, so
 * `keptShared` counts what another routine also sees — which is why it stayed.
 */
export interface ResetAnalysesResult {
  analysisRuns: { deleted: number; events: number; keptRunning: number; keptShared: number }
  scrapingJobs: { reset: number; keptRunning: number; keptShared: number }
  alertWatermarks: { deleted: number }
}
