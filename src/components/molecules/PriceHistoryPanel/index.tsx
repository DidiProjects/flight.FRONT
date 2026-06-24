import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Collapse,
  ButtonBase,
  CircularProgress,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { FlightFaresService } from '@services/FlightFaresService'
import { PriceSparkline } from '@atomic-components/atoms/PriceSparkline'
import type { PriceSparklinePoint } from '@atomic-components/atoms/PriceSparkline'
import { formatMoney } from '@utils/money'
import type { PriceHistorySummary } from '@app-types/flightFares'

interface PriceHistoryPanelProps {
  airlines: string[]
  origin: string
  destination: string
  dateFrom: string
  dateTo: string
  currencyFallback: string | null
}

function buildCashSparkline(summary: PriceHistorySummary): PriceSparklinePoint[] {
  const points: PriceSparklinePoint[] = []
  if (summary.minCash30d != null) points.push({ label: 'Mínimo', value: summary.minCash30d })
  if (summary.p20Cash30d != null) points.push({ label: 'P20', value: summary.p20Cash30d })
  if (summary.avgCash30d != null) points.push({ label: 'Média', value: summary.avgCash30d })
  return points
}

function buildPtsSparkline(summary: PriceHistorySummary): PriceSparklinePoint[] {
  const points: PriceSparklinePoint[] = []
  if (summary.minPts30d != null) points.push({ label: 'Mínimo', value: summary.minPts30d })
  if (summary.avgPts30d != null) points.push({ label: 'Média', value: summary.avgPts30d })
  return points
}

function Track({
  title,
  points,
  avg,
  min,
  formatValue,
}: {
  title: string
  points: PriceSparklinePoint[]
  avg: number | null
  min: number | null
  formatValue: (v: number) => string
}) {
  return (
    <Box sx={{ flex: '1 1 140px', minWidth: 140 }}>
      <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <PriceSparkline data={points} width={110} height={38} />
        <Box>
          {avg != null && (
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
              {formatValue(avg)}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled' }}>
            média · últimos 30 dias
          </Typography>
          {min != null && (
            <Typography sx={{ fontSize: '0.6875rem', color: 'success.dark', mt: 0.25 }}>
              mín. {formatValue(min)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function PriceHistoryPanel({ airlines, origin, destination, dateFrom, dateTo, currencyFallback }: PriceHistoryPanelProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<PriceHistorySummary | null>(null)
  const [fetched, setFetched] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open || fetched) return

    setLoading(true)
    setError(false)

    FlightFaresService.getRoutineSummary({ airlines, origin, destination, dateFrom, dateTo })
      .then((data) => {
        setSummary(data)
        setFetched(true)
      })
      .catch(() => {
        setError(true)
        setFetched(true)
      })
      .finally(() => setLoading(false))
  }, [open, fetched, airlines, origin, destination, dateFrom, dateTo])

  const hasCash = summary != null && (summary.avgCash30d != null || summary.minCash30d != null)
  const hasPts  = summary != null && (summary.avgPts30d != null || summary.minPts30d != null)
  const hasData = hasCash || hasPts

  const currency = summary?.currency ?? currencyFallback
  const fmtCash = (v: number) => formatMoney(v, currency)
  const fmtPts  = (v: number) => `${Math.round(v).toLocaleString('pt-BR')} pts`

  return (
    <Box sx={{ mt: 1.5 }}>
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          py: 0.25,
          borderRadius: 1,
          color: 'text.secondary',
          '&:hover': { color: 'text.primary' },
          transition: 'color 0.15s ease',
        }}
        aria-expanded={open}
        aria-label="Ver histórico de preços"
      >
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Histórico de preços
        </Typography>
        <ExpandMoreIcon
          sx={{
            fontSize: 14,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </ButtonBase>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pt: 1, pb: 0.5 }}>
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              <CircularProgress size={12} thickness={5} />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                Carregando...
              </Typography>
            </Box>
          )}

          {!loading && error && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Não foi possível carregar o histórico.
            </Typography>
          )}

          {!loading && !error && !hasData && fetched && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Histórico ainda sendo coletado.
            </Typography>
          )}

          {!loading && !error && hasData && summary && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
              {hasCash && (
                <Track
                  title="Dinheiro"
                  points={buildCashSparkline(summary)}
                  avg={summary.avgCash30d}
                  min={summary.minCash30d}
                  formatValue={fmtCash}
                />
              )}
              {hasPts && (
                <Track
                  title="Pontos"
                  points={buildPtsSparkline(summary)}
                  avg={summary.avgPts30d}
                  min={summary.minPts30d}
                  formatValue={fmtPts}
                />
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}
