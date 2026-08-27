import { useEffect, useRef, useState } from 'react'
import { Box, Typography, ToggleButton, ToggleButtonGroup, Skeleton } from '@mui/material'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import { PriceChart, type ChartMetric } from '@atomic-components/atoms/PriceChart'
import { AIRLINE_COLORS } from '@atomic-components/atoms/PriceChart/geometry'
import { FareHistoryService } from '@services/FareHistoryService'
import { formatMoney } from '@utils/money'
import type { FareHistoryBucket, FareHistoryRange, FareHistorySeries } from '@app-types/fareHistory'
import { trendStyles } from './style'

const RANGES: { value: FareHistoryRange; label: string }[] = [
  { value: 'day',   label: '24h' },
  { value: 'month', label: '30 dias' },
  { value: '6m',    label: '6 meses' },
]

interface PriceTrendProps {
  airlines: string[]
  origin: string
  destination: string
  dateFrom: string
  dateTo: string
  currencyFallback: string | null
  inboundFrom?: string | null
  inboundTo?: string | null
  metric: ChartMetric
  /** 30-day baseline the card already loaded — no second request for the stats. */
  baseline: { min: number | null; avg: number | null } | null
}

/** Movement across the visible window: first measured point against the last. */
function valueOf(b: FareHistoryBucket, metric: ChartMetric): number | null {
  if (metric === 'pts') return b.minPts
  if (metric === 'hyb') return b.minHybPts
  return b.minCash
}

function variation(series: FareHistorySeries | null, metric: ChartMetric): number | null {
  if (!series) return null
  const values = series.buckets
    .map((b) => valueOf(b, metric))
    .filter((v): v is number => v != null)
  if (values.length < 2) return null
  return values[values.length - 1] - values[0]
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <Box sx={trendStyles.stat}>
      <Typography sx={trendStyles.statLabel}>{label}</Typography>
      <Typography sx={trendStyles.statValue(tone)}>{value}</Typography>
    </Box>
  )
}

export function PriceTrend({
  airlines, origin, destination, dateFrom, dateTo,
  currencyFallback, inboundFrom, inboundTo, metric, baseline,
}: PriceTrendProps) {
  const [range, setRange] = useState<FareHistoryRange>('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // Cache per range: switching back and forth is a tab click, not a reason to
  // hit the API again.
  const cache = useRef<Partial<Record<FareHistoryRange, FareHistorySeries>>>({})
  const [series, setSeries] = useState<FareHistorySeries | null>(null)

  const airlinesKey = airlines.join(',')
  useEffect(() => {
    const cached = cache.current[range]
    if (cached) {
      setSeries(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)
    FareHistoryService.getSeries({
      airlines, origin, destination, dateFrom, dateTo, inboundFrom, inboundTo, range,
    })
      .then((d) => {
        if (cancelled) return
        cache.current[range] = d
        setSeries(d)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, airlinesKey, origin, destination, dateFrom, dateTo, inboundFrom, inboundTo])

  const currency = series?.currency ?? currencyFallback
  const fmt = (v: number) =>
    metric === 'cash'
      ? formatMoney(v, currency, { maximumFractionDigits: 0 })
      : `${Math.round(v).toLocaleString('pt-BR')} pts`

  const delta = variation(series, metric)
  const TrendIcon = delta == null || delta === 0 ? TrendingFlatIcon : delta < 0 ? TrendingDownIcon : TrendingUpIcon

  return (
    <Box sx={trendStyles.root}>
      <Box sx={trendStyles.header}>
        <Typography sx={trendStyles.title}>Comportamento do preço</Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={range}
          onChange={(_, v: FareHistoryRange | null) => { if (v) setRange(v) }}
          sx={trendStyles.ranges}
          aria-label="Período do histórico"
        >
          {RANGES.map((r) => (
            <ToggleButton key={r.value} value={r.value} aria-label={r.label}>
              {r.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {loading && <Skeleton variant="rounded" height={150} sx={{ borderRadius: 1.5 }} />}

      {!loading && error && (
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', py: 2 }}>
          Não foi possível carregar o histórico.
        </Typography>
      )}

      {!loading && !error && series && (
        <>
          <PriceChart
            buckets={series.buckets}
            range={series.range}
            metric={metric}
            currency={currency}
            airlineSeries={series.byAirline}
          />

          {series.byAirline.length > 1 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.75 }}>
              {series.byAirline.map((s, i) => (
                <Box key={s.airline} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 2, borderRadius: 1, backgroundColor: AIRLINE_COLORS[i % AIRLINE_COLORS.length] }} />
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {s.airline}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Box sx={trendStyles.stats}>
            {delta != null && (
              <Box sx={trendStyles.stat}>
                <Typography sx={trendStyles.statLabel}>No período</Typography>
                <Box sx={trendStyles.deltaRow}>
                  <TrendIcon sx={trendStyles.deltaIcon(delta)} />
                  <Typography sx={trendStyles.statValue(delta < 0 ? 'good' : delta > 0 ? 'bad' : undefined)}>
                    {delta === 0 ? 'estável' : `${delta < 0 ? '−' : '+'}${fmt(Math.abs(delta))}`}
                  </Typography>
                </Box>
              </Box>
            )}
            {baseline?.min != null && <Stat label="Mín. 30 dias" value={fmt(baseline.min)} tone="good" />}
            {baseline?.avg != null && <Stat label="Média 30 dias" value={fmt(baseline.avg)} />}
          </Box>
        </>
      )}
    </Box>
  )
}
