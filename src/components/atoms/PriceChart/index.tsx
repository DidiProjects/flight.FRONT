import { useId, useMemo, type ComponentProps } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { colorForAirline, labelForAirline } from './geometry'
import { formatMoney } from '@utils/money'
import type { FareHistoryBucket, FareHistoryRange } from '@app-types/fareHistory'

/** Matches whatever generic instantiation `Tooltip`'s own `content` prop expects. */
type TooltipContentFn = Extract<NonNullable<ComponentProps<typeof Tooltip>['content']>, (...args: never[]) => unknown>

export type ChartMetric = 'cash' | 'pts' | 'hyb'

/** Field the merged (cross-airline best) line reads from each row — used only without competition. */
const MAIN_KEY = 'main'

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
  /**
   * Uma curva por companhia, todas no mesmo pé — cada uma na sua própria cor de
   * marca, sombra (área) incluída. Sem isso o card diz "R$ 900" e esconde que
   * uma companhia cobrava o dobro.
   */
  airlineSeries?: { airline: string; buckets: FareHistoryBucket[] }[]
  /**
   * Companhia dona do preço atual — usada só quando NÃO há disputa (uma
   * companhia só, ou a API ainda não separa por companhia): aí a curva
   * combinada assume a cor dela em vez da cor genérica do tema.
   */
  highlightAirline?: string | null
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

interface ChartRow {
  bucketStart: string
  [seriesKey: string]: number | string | null
}

export function PriceChart({ buckets, range, metric, currency, height = 150, airlineSeries = [], highlightAirline = null }: PriceChartProps) {
  const theme = useTheme()

  // Um `<PriceChart>` por card, vários cards na página: sem isto, o id do
  // gradiente ("priceChartFill-main") repetia em todo card sem disputa, e o
  // navegador resolve `url(#id)` duplicado pegando UMA definição pra todos os
  // SVGs da página — a sombra de um card saía com a cor de outro.
  const gradientId = useId()

  const fmt = (v: number) =>
    isPointsMetric(metric)
      ? `${Math.round(v).toLocaleString('pt-BR')} pts`
      : formatMoney(v, currency, { maximumFractionDigits: 0 })

  const mainSeries = useMemo(() => buckets.map((b) => valueOf(b, metric)), [buckets, metric])
  const hasData = mainSeries.filter((v) => v != null).length >= 2

  // Só há disputa de verdade com 2+ companhias. Com uma só, a curva por
  // companhia seria idêntica à combinada — duas linhas exatamente sobrepostas.
  const competing = airlineSeries.length > 1

  const rows = useMemo<ChartRow[]>(
    () => buckets.map((b, i) => {
      const row: ChartRow = { bucketStart: b.bucketStart, [MAIN_KEY]: mainSeries[i] ?? null }
      for (const s of airlineSeries) row[s.airline] = valueOf(s.buckets[i], metric) ?? null
      return row
    }),
    [buckets, mainSeries, airlineSeries, metric],
  )

  // Sem disputa, a curva combinada marca dois pontos: o mais barato da janela
  // (referência de "bom preço") e o mais recente (o número que o card mostra).
  const { minIndex, lastIndex } = useMemo(() => {
    const measured = mainSeries
      .map((v, i) => (v != null ? i : null))
      .filter((i): i is number => i != null)
    if (measured.length === 0) return { minIndex: -1, lastIndex: -1 }
    const min = measured.reduce((best, i) => (mainSeries[i]! < mainSeries[best]! ? i : best), measured[0])
    return { minIndex: min, lastIndex: measured[measured.length - 1] }
  }, [mainSeries])

  const mainColor = highlightAirline
    ? colorForAirline(highlightAirline, 0)
    : theme.palette.primary.main

  if (!hasData) {
    return (
      <Box
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

  function renderMainDot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props
    if (cx == null || cy == null || index == null) return <g />
    if (index === minIndex) {
      return <circle cx={cx} cy={cy} r={3.5} fill={theme.palette.success.main} stroke={theme.palette.background.paper} strokeWidth={1.5} />
    }
    if (index === lastIndex) {
      return <circle cx={cx} cy={cy} r={3.5} fill={mainColor} stroke={theme.palette.background.paper} strokeWidth={1.5} />
    }
    return <g />
  }

  const renderTooltip: TooltipContentFn = ({ active, payload, label }) => {
    if (!active || !payload?.length || typeof label !== 'string') return null

    // Sem disputa: só a combinada. Com disputa: uma linha por companhia, na
    // cor da própria curva — o ponto é comparar todas de uma vez no hover.
    const entries = competing
      ? airlineSeries
        .map((s, i) => ({
          label: labelForAirline(s.airline),
          color: colorForAirline(s.airline, i),
          value: payload.find((p) => p.dataKey === s.airline)?.value,
        }))
        .filter((e): e is typeof e & { value: number } => e.value != null)
      : (() => {
        const v = payload.find((p) => p.dataKey === MAIN_KEY)?.value
        return v == null ? [] : [{ label: null, color: mainColor, value: v as number }]
      })()

    if (entries.length === 0) return null

    return (
      <Box
        sx={{
          px: 1,
          py: 0.5,
          borderRadius: 1,
          backgroundColor: 'text.primary',
          color: 'background.paper',
          pointerEvents: 'none',
        }}
      >
        {entries.map((e, i) => (
          <Box key={e.label ?? i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {e.label && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: e.color,
                  flexShrink: 0,
                  // Sem o anel, uma marca escura (ex: o azul-marinho da Azul)
                  // some no fundo escuro do tooltip — mesmo truque dos pontos
                  // do gráfico (stroke em background.paper).
                  boxShadow: (t) => `0 0 0 1px ${t.palette.background.paper}`,
                }}
              />
            )}
            {e.label && (
              <Typography sx={{ fontSize: '0.625rem', opacity: 0.85, lineHeight: 1.3 }}>{e.label}</Typography>
            )}
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.3, ml: e.label ? 'auto' : 0 }}>
              {fmt(e.value)}
            </Typography>
          </Box>
        ))}
        <Typography sx={{ fontSize: '0.625rem', opacity: 0.75, lineHeight: 1.2, mt: 0.25 }}>
          {formatMoment(label, range)}
        </Typography>
      </Box>
    )
  }

  const tickIndexes = [0, Math.floor((buckets.length - 1) / 2), buckets.length - 1]
  const ticks = [...new Set(tickIndexes.map((i) => buckets[i]?.bucketStart).filter((v): v is string => v != null))]
  const measuredValues = mainSeries.filter((v): v is number => v != null)

  return (
    <Box role="img" aria-label={`Histórico de preços do período: ${fmt(Math.min(...measuredValues))} a ${fmt(Math.max(...measuredValues))}`}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            {competing
              ? airlineSeries.map((s, i) => {
                const color = colorForAirline(s.airline, i)
                return (
                  <linearGradient key={s.airline} id={`${gradientId}-${s.airline}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                )
              })
              : (
                <linearGradient id={`${gradientId}-main`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={mainColor} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={mainColor} stopOpacity={0} />
                </linearGradient>
              )}
          </defs>

          <XAxis
            dataKey="bucketStart"
            ticks={ticks}
            tickFormatter={(v: string) => formatTick(v, range)}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            tick={{ fontSize: 10, fill: theme.palette.text.disabled }}
            height={18}
          />
          <YAxis hide domain={['dataMin', 'dataMax']} />

          <Tooltip
            content={renderTooltip}
            cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
            isAnimationActive={false}
          />

          {competing
            ? airlineSeries.map((s, i) => {
              const color = colorForAirline(s.airline, i)
              return (
                <Area
                  key={s.airline}
                  dataKey={s.airline}
                  stroke={color}
                  strokeWidth={1.75}
                  fill={`url(#${gradientId}-${s.airline})`}
                  dot={false}
                  activeDot={{ r: 4, fill: color, stroke: theme.palette.background.paper, strokeWidth: 1.5 }}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              )
            })
            : (
              <>
                <Area
                  dataKey={MAIN_KEY}
                  stroke="none"
                  fill={`url(#${gradientId}-main)`}
                  isAnimationActive={false}
                  connectNulls={false}
                  activeDot={false}
                />
                <Line
                  dataKey={MAIN_KEY}
                  stroke={mainColor}
                  strokeWidth={1.75}
                  dot={renderMainDot}
                  activeDot={{ r: 4, fill: mainColor, stroke: theme.palette.background.paper, strokeWidth: 1.5 }}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              </>
            )}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  )
}
