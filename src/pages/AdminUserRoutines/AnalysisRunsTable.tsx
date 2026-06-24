import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import type { AnalysisRun, AnalysisRunStatus } from '@app-types/analysisRuns'

type ResultMeta = { label: string; color: 'default' | 'success' | 'error' | 'warning' }

const RESULT_META: Record<AnalysisRunStatus, ResultMeta> = {
  running:   { label: 'Em andamento', color: 'default' },
  success:   { label: 'Sucesso',      color: 'success' },
  failed:    { label: 'Falha',        color: 'error' },
  dead:      { label: 'Esgotado',     color: 'error' },
  blocked:   { label: 'Bloqueado',    color: 'warning' },
  cancelled: { label: 'Cancelado',    color: 'default' },
}

const resultMeta = (status: string): ResultMeta =>
  RESULT_META[status as AnalysisRunStatus] ?? { label: status, color: 'default' }

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })
}

const formatFlightDate = (date: string): string => date.split('-').reverse().join('/')

export function AnalysisRunsTable({ runs }: { runs: AnalysisRun[] }) {
  return (
    <TableContainer sx={{ maxHeight: 360 }}>
      <Table size="small" stickyHeader aria-label="Histórico de análises">
        <TableHead>
          <TableRow>
            <TableCell>Voo</TableCell>
            <TableCell>Início</TableCell>
            <TableCell>Fim</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Resultado</TableCell>
            <TableCell align="right">Passagens</TableCell>
            <TableCell>Erro</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {runs.map((run) => (
            <AnalysisRunRow key={run.id} run={run} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function AnalysisRunRow({ run }: { run: AnalysisRun }) {
  const isRunning = run.status === 'running'
  const result = resultMeta(run.status)

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {run.airline.toUpperCase()} · {run.origin}→{run.destination}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          {formatFlightDate(run.flightDate)}
        </Typography>
      </TableCell>
      <TableCell><Typography variant="caption">{formatDateTime(run.startedAt)}</Typography></TableCell>
      <TableCell><Typography variant="caption">{formatDateTime(run.finishedAt)}</Typography></TableCell>
      <TableCell>
        <Chip
          size="small"
          variant="outlined"
          color={isRunning ? 'warning' : 'default'}
          label={isRunning ? 'Em processamento' : 'Finalizado'}
        />
      </TableCell>
      <TableCell>
        <Chip size="small" color={result.color} label={result.label} />
      </TableCell>
      <TableCell align="right">
        <Typography variant="caption">{run.faresFound ?? '—'}</Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 240 }}>
        {run.errorMessage ? (
          <Tooltip title={run.errorMessage}>
            <Typography
              variant="caption"
              color="error"
              sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {run.errorMessage}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.secondary">—</Typography>
        )}
      </TableCell>
    </TableRow>
  )
}
