import { useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { RoutinesService } from '@services/RoutinesService'
import { toastEmitter } from '@utils/toast'
import type { Routine } from '@app-types/routines'
import type { AnalysisRun } from '@app-types/analysisRuns'
import type { JobView } from '@app-types/jobs'
import { matchesRoutine, mergeRuns } from './runMerge'
import { AnalysisRunsTable } from './AnalysisRunsTable'

interface Props {
  routine: Routine
  live: JobView[]
}

export function RoutineHistoryPanel({ routine, live }: Props) {
  const [history, setHistory] = useState<AnalysisRun[] | null>(null)

  useEffect(() => {
    let active = true
    setHistory(null)
    RoutinesService.listAnalysisRuns(routine.id)
      .then((runs) => active && setHistory(runs))
      .catch(() => {
        if (!active) return
        setHistory([])
        toastEmitter.error('Falha ao carregar histórico de análises.')
      })
    return () => { active = false }
  }, [routine.id])

  const runs = useMemo(
    () => (history === null ? null : mergeRuns(history, live.filter((job) => matchesRoutine(job, routine)))),
    [history, live, routine],
  )

  return (
    <Box sx={{ py: 2, px: { xs: 0, sm: 2 } }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Histórico de análises</Typography>
      {runs === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={22} />
        </Box>
      ) : runs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhuma análise registrada ainda.</Typography>
      ) : (
        <AnalysisRunsTable runs={runs} />
      )}
    </Box>
  )
}
