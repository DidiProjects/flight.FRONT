import { useMemo, useState } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { useElementWidth } from '@hooks/useElementWidth'
import { areaPath, buildGeometry, linePath } from './geometry'
import { formatMoney } from '@utils/money'
import type { FareHistoryBucket, FareHistoryRange } from '@app-types/fareHistory'

export type ChartMetric = 'cash' | 'pts' | 'hyb'

/**
 * Value of a bucket for the displayed dimension. Hybrid plots the POINTS side —
 * the same choice the calendar makes, because a hybrid fare has no single number.
 */
function valueOf(b: FareHistoryBucket, metric: ChartMetric): number | null {
  if (metric === 'pts') return b.minPts
  if (metric === 'hyb') return b.minHybPts
  return b.minCash
}

/** Points and hybrid are counted in points; only cash carries a currency. */
function isPointsMetric(metric: ChartMetric): boolean {
  return metric !== 'cash'
}

interface PriceChartProps {
  buckets: FareHistoryBucket[]
  range: FareHistoryRange
  metric: ChartMetric
  currency: string | null
  height?: number
}

/** Label of the horizontal axis, at the resolution the range actually has. */
function formatTick(iso: string, range: FareHistoryRange): string {
  const d = new Date(iso)
  if (range === 'day') return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (range === 'month') return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

/** Full moment, for the tooltip — the axis is too tight to carry it. */
function formatMoment(iso: string, range: FareHistoryRange): string {
  const d = new Date(iso)
  if (range === 'day') {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function PriceChart({ buckets, range, metric, currency, height = 150 }: PriceChartProps) {
  const theme = useTheme()
  const [wrapRef, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const fmt = (v: number) =>
    isPointsMetric(metric)
      ? `${Math.round(v).toLocaleString('pt-BR')} pts`
      : formatMoney(v, currency, { maximumFractionDigits: 0 })

  const series = useMemo(() => buckets.map((b) => valueOf(b, metric)), [buckets, metric])

  const hasData = series.filter((v) => v != null).length >= 2

  const g = useMemo(() => buildGeometry(series, width, height), [series, width, height])

  if (!hasData) {
    return (
      <Box
        ref={wrapRef}
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1.5,
          backgroundColor: 'action.hover',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
          Histórico ainda sendo coletado
        </Typography>
      </Box>
    )
  }

  const stroke = theme.palette.primary.main
  const hovered = hover != null ? g?.points[hover] : null

  // Three ticks is what fits a phone without the labels colliding.
  const tickIndexes = [0, Math.floor((buckets.length - 1) / 2), buckets.length - 1]

  return (
    <Box ref={wrapRef} sx={{ position: 'relative', width: '100%' }}>
      {g && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Histórico de preços: menor ${fmt(g.min)}, maior ${fmt(g.max)}`}
          style={{ display: 'block', touchAction: 'pan-y' }}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left - g.padX) / g.innerW
            const i = Math.round(ratio * (series.length - 1))
            setHover(i >= 0 && i < series.length && series[i] != null ? i : null)
          }}
          onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.touches[0].clientX - rect.left - g.padX) / g.innerW
            const i = Math.round(ratio * (series.length - 1))
            setHover(i >= 0 && i < series.length && series[i] != null ? i : null)
          }}
          onTouchEnd={() => setHover(null)}
        >
          <defs>
            <linearGradient id="priceChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>

          {g.runs.map((r, i) => (
            <path key={`a${i}`} d={areaPath(r, g.baseline)} fill="url(#priceChartFill)" stroke="none" />
          ))}
          {g.runs.map((r, i) => (
            <path
              key={`l${i}`}
              d={linePath(r)}
              fill="none"
              stroke={stroke}
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          <circle
            cx={g.minPoint.x}
            cy={g.minPoint.y}
            r={3.5}
            fill={theme.palette.success.main}
            stroke={theme.palette.background.paper}
            strokeWidth={1.5}
          />
          <circle
            cx={g.lastPoint.x}
            cy={g.lastPoint.y}
            r={3.5}
            fill={stroke}
            stroke={theme.palette.background.paper}
            strokeWidth={1.5}
          />

          {hovered && (
            <>
              <line
                x1={hovered.x}
                y1={0}
                x2={hovered.x}
                y2={g.baseline}
                stroke={theme.palette.divider}
                strokeWidth={1}
              />
              <circle cx={hovered.x} cy={hovered.y} r={4} fill={stroke} stroke={theme.palette.background.paper} strokeWidth={1.5} />
            </>
          )}

          {tickIndexes.map((i) => (
            <text
              key={i}
              x={Math.min(Math.max(g.points[i]?.x ?? (i / (series.length - 1)) * g.innerW + g.padX, 14), width - 14)}
              y={height - 4}
              textAnchor={i === 0 ? 'start' : i === buckets.length - 1 ? 'end' : 'middle'}
              fill={theme.palette.text.disabled}
              fontSize={10}
            >
              {formatTick(buckets[i].bucketStart, range)}
            </text>
          ))}
        </svg>
      )}

      {hovered && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: `${Math.min(Math.max(hovered.x, 40), Math.max(width - 40, 40))}px`,
            transform: 'translateX(-50%)',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: 'text.primary',
            color: 'background.paper',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.3 }}>
            {fmt(hovered.v)}
          </Typography>
          <Typography sx={{ fontSize: '0.625rem', opacity: 0.75, lineHeight: 1.2 }}>
            {formatMoment(buckets[hovered.i].bucketStart, range)}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
