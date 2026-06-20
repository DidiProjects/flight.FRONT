import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import { AppLayout } from '@atomic-components/templates/AppLayout'
import { AdminNav } from '@atomic-components/molecules/AdminNav'
import { EmptyState } from '@atomic-components/molecules/EmptyState'
import { ConfirmDialog } from '@atomic-components/molecules/ConfirmDialog'
import { useRealtimeJobs } from '@hooks/useRealtimeJobs'
import { AdminJobsService } from '@services/AdminJobsService'
import { toastEmitter } from '@utils/toast'
import type { JobView, JobStatus, JobEventLine } from '@app-types/jobs'

const STATUS_COLOR: Record<JobStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  pending: 'default',
  running: 'info',
  success: 'success',
  failed: 'error',
  dead: 'error',
  blocked: 'warning',
  cancelled: 'default',
}

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: 'Pendente',
  running: 'Executando',
  success: 'Sucesso',
  failed: 'Falhou',
  dead: 'Morto',
  blocked: 'Bloqueado',
  cancelled: 'Cancelado',
}

function formatFlightDate(d: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d
}

function formatDuration(fromIso: string | null, now: number): string {
  if (!fromIso) return '—'
  const ms = now - new Date(fromIso).getTime()
  if (ms < 0) return '0s'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

export function AdminJobsPage() {
  const { jobs, events, connected } = useRealtimeJobs()
  const [now, setNow] = useState(Date.now())
  const [target, setTarget] = useState<JobView | null>(null)
  const [cancelling, setCancelling] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [historyEvents, setHistoryEvents] = useState<Map<string, JobEventLine[]>>(new Map())
  const [loadingEvents, setLoadingEvents] = useState<Set<string>>(new Set())

  async function toggleRow(job: JobView): Promise<void> {
    const rowKey = job.requestId ?? job.jobId
    const willOpen = expanded !== rowKey
    setExpanded(willOpen ? rowKey : null)
    if (!willOpen) return

    const jobId = job.jobId
    const hasLive = job.requestId ? (events.get(job.requestId)?.length ?? 0) > 0 : false
    if (hasLive || historyEvents.has(jobId) || loadingEvents.has(jobId)) return

    setLoadingEvents((prev) => new Set(prev).add(jobId))
    try {
      const evs = await AdminJobsService.listTimelineByJob(jobId)
      setHistoryEvents((prev) => new Map(prev).set(jobId, evs))
    } catch {
      setHistoryEvents((prev) => new Map(prev).set(jobId, []))
      toastEmitter.error('Falha ao carregar a timeline do job.')
    } finally {
      setLoadingEvents((prev) => { const n = new Set(prev); n.delete(jobId); return n })
    }
  }

  // Tick de 1s para a duração ao vivo (calculada do runningSince autoritativo).
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const rows = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        if (a.status === 'running' && b.status !== 'running') return -1
        if (b.status === 'running' && a.status !== 'running') return 1
        return (b.runningSince ?? '').localeCompare(a.runningSince ?? '')
      }),
    [jobs],
  )

  async function confirmCancel(): Promise<void> {
    if (!target?.requestId) return
    const requestId = target.requestId
    setCancelling((prev) => new Set(prev).add(requestId))
    setTarget(null)
    try {
      const res = await AdminJobsService.cancelJob(requestId)
      toastEmitter.error(
        res.delivery === 'dispatched'
          ? 'Interrupção enviada ao worker.'
          : 'Worker offline — interrupção será aplicada na reconexão.',
      )
    } finally {
      setCancelling((prev) => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h5">Jobs de scraping</Typography>
        <Chip
          size="small"
          color={connected ? 'success' : 'default'}
          label={connected ? 'Ao vivo' : 'Conectando…'}
        />
      </Box>
      <AdminNav />

      {rows.length === 0 ? (
        <EmptyState Icon={WorkOutlineIcon} title="Nenhum job no momento" description="Jobs ativos aparecerão aqui em tempo real." />
      ) : (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <TableCell>Companhia</TableCell>
                <TableCell>Rota</TableCell>
                <TableCell>Data do voo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tempo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((job) => {
                const isCancelling = job.requestId ? cancelling.has(job.requestId) : false
                const canCancel = job.status === 'running' || job.status === 'pending'
                const rowKey = job.requestId ?? job.jobId
                const liveTl = job.requestId ? (events.get(job.requestId) ?? []) : []
                const timeline = liveTl.length > 0 ? liveTl : (historyEvents.get(job.jobId) ?? [])
                const isLoadingTl = loadingEvents.has(job.jobId)
                const isOpen = expanded === rowKey
                return (
                  <Fragment key={rowKey}>
                  <TableRow hover>
                    <TableCell sx={{ width: 40 }}>
                      <IconButton
                        size="small"
                        onClick={() => void toggleRow(job)}
                      >
                        {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{job.airline}</TableCell>
                    <TableCell>{job.origin} → {job.destination}</TableCell>
                    <TableCell>{formatFlightDate(job.flightDate)}</TableCell>
                    <TableCell>
                      <Chip size="small" color={STATUS_COLOR[job.status]} label={STATUS_LABEL[job.status]} />
                      {job.lastStep && job.status === 'running' && (
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          {job.lastStep}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{job.status === 'running' ? formatDuration(job.runningSince, now) : '—'}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        startIcon={isCancelling ? <CircularProgress size={14} /> : <StopCircleOutlinedIcon />}
                        disabled={!canCancel || isCancelling || !job.requestId}
                        onClick={() => setTarget(job)}
                      >
                        {isCancelling ? 'Interrompendo…' : 'Interromper'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ py: 0, border: 0 }} colSpan={7}>
                      <Collapse in={isOpen} unmountOnExit>
                        <Stack spacing={0.5} sx={{ py: 1, pl: 6 }}>
                          {isLoadingTl ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={14} />
                              <Typography variant="caption" color="text.secondary">Carregando timeline…</Typography>
                            </Box>
                          ) : timeline.length > 0 ? (
                            timeline.map((ev) => (
                              <Typography key={ev.seq} variant="caption" sx={{ color: ev.level === 'error' ? 'error.main' : 'text.secondary' }}>
                                {new Date(ev.ts).toLocaleTimeString()} · {ev.type}{ev.detail ? ` — ${ev.detail}` : ''}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">Sem timeline registrada para este job.</Typography>
                          )}
                        </Stack>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      <ConfirmDialog
        open={target !== null}
        title="Interromper job?"
        message={target ? `Isto aborta a análise de ${target.airline} ${target.origin}→${target.destination} (${target.flightDate}) imediatamente.` : ''}
        warningMessage="O job volta para a fila e será reagendado normalmente."
        confirmLabel="Interromper"
        onConfirm={confirmCancel}
        onCancel={() => setTarget(null)}
      />
    </AppLayout>
  )
}
