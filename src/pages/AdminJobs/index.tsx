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
  TableSortLabel,
  TablePagination,
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
import type { JobView, JobEventLine } from '@app-types/jobs'
import { STATUS_COLOR, STATUS_LABEL } from './jobsStatus'
import { JobsFilters } from './JobsFilters'
import {
  DEFAULT_FILTER,
  DEFAULT_SORT,
  distinctAirlines,
  distinctUsers,
  filterJobs,
  nextSort,
  sortJobs,
  type JobsFilter,
  type JobsSort,
  type SortKey,
} from './jobsView'

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

function formatFlightDate(d: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })
}

function formatElapsed(ms: number): string {
  const s = Math.floor(Math.max(0, ms) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function jobDuration(job: JobView, now: number): string {
  if (!job.startedAt) return '—'
  const start = new Date(job.startedAt).getTime()
  const end = job.finishedAt ? new Date(job.finishedAt).getTime() : job.status === 'running' ? now : NaN
  return Number.isNaN(end) ? '—' : formatElapsed(end - start)
}

interface SortableHeaderProps {
  label: string
  column: SortKey
  sort: JobsSort
  onSort: (key: SortKey) => void
  align?: 'right'
}

function SortableHeader({ label, column, sort, onSort, align }: SortableHeaderProps) {
  return (
    <TableCell align={align} sortDirection={sort.key === column ? sort.dir : false}>
      <TableSortLabel
        active={sort.key === column}
        direction={sort.key === column ? sort.dir : 'asc'}
        onClick={() => onSort(column)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  )
}

export function AdminJobsPage() {
  const { jobs, events, connected } = useRealtimeJobs()
  const [now, setNow] = useState(Date.now())
  const [target, setTarget] = useState<JobView | null>(null)
  const [cancelling, setCancelling] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [historyEvents, setHistoryEvents] = useState<Map<string, JobEventLine[]>>(new Map())
  const [loadingEvents, setLoadingEvents] = useState<Set<string>>(new Set())

  const [filter, setFilter] = useState<JobsFilter>(DEFAULT_FILTER)
  const [sort, setSort] = useState<JobsSort>(DEFAULT_SORT)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0])

  const airlines = useMemo(() => distinctAirlines(jobs), [jobs])
  const users = useMemo(() => distinctUsers(jobs), [jobs])
  const filtered = useMemo(() => sortJobs(filterJobs(jobs, filter), sort), [jobs, filter, sort])
  const paged = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  )

  useEffect(() => setPage(0), [filter])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

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

  async function confirmCancel(): Promise<void> {
    if (!target?.requestId) return
    const requestId = target.requestId
    setCancelling((prev) => new Set(prev).add(requestId))
    setTarget(null)
    try {
      const res = await AdminJobsService.cancelJob(requestId)
      toastEmitter.info(
        res.delivery === 'dispatched'
          ? 'Interrupção enviada ao worker.'
          : 'Sem execução ativa — job recuperado e reagendado.',
      )
    } finally {
      setCancelling((prev) => { const next = new Set(prev); next.delete(requestId); return next })
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

      {jobs.length === 0 ? (
        <EmptyState Icon={WorkOutlineIcon} title="Nenhum job no momento" description="Jobs ativos aparecerão aqui em tempo real." />
      ) : (
        <>
          <JobsFilters filter={filter} airlines={airlines} users={users} onChange={setFilter} />
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 40 }} />
                  <SortableHeader label="Companhia" column="airline" sort={sort} onSort={(k) => setSort((s) => nextSort(s, k))} />
                  <SortableHeader label="Rota" column="route" sort={sort} onSort={(k) => setSort((s) => nextSort(s, k))} />
                  <SortableHeader label="Data do voo" column="flightDate" sort={sort} onSort={(k) => setSort((s) => nextSort(s, k))} />
                  <SortableHeader label="Status" column="status" sort={sort} onSort={(k) => setSort((s) => nextSort(s, k))} />
                  <SortableHeader label="Início" column="startedAt" sort={sort} onSort={(k) => setSort((s) => nextSort(s, k))} />
                  <TableCell>Tempo</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        Nenhum job com os filtros aplicados.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paged.map((job) => {
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
                        <IconButton size="small" onClick={() => void toggleRow(job)}>
                          {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{job.airline}</TableCell>
                      <TableCell>{job.origin} → {job.destination}</TableCell>
                      <TableCell>{formatFlightDate(job.flightDate)}</TableCell>
                      <TableCell>
                        <Chip size="small" color={STATUS_COLOR[job.status]} label={STATUS_LABEL[job.status]} />
                        {job.orphanedAt && (
                          <Chip size="small" variant="outlined" color="warning" label="Sem rotina" sx={{ ml: 0.5 }} />
                        )}
                        {job.lastStep && job.status === 'running' && (
                          <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                            {job.lastStep}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(job.startedAt)}</TableCell>
                      <TableCell>{jobDuration(job, now)}</TableCell>
                      <TableCell sx={{ color: job.userEmail ? 'text.primary' : 'text.disabled' }}>
                        {job.userEmail ?? '—'}
                      </TableCell>
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
                      <TableCell sx={{ py: 0, border: 0 }} colSpan={9}>
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
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="Linhas:"
            />
          </Paper>
        </>
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
