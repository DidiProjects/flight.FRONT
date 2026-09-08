import { useMemo, type ComponentProps } from 'react'
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

/** Matches whatever generic instantiation `Tooltip`'s own `content` prop expects. */
type TooltipContentFn = Extract<NonNullable<ComponentProps<typeof Tooltip>['content']>, (...args: never[]) => unknown>
import { colorForAirline } from './geometry'
import { formatMoney } from '@utils/money'
import type { FareHistoryBucket, FareHistoryRange } from '@app-types/fareHistory'

export type ChartMetric = 'cash' | 'pts' | 'hyb'

/** Field the "destaque" (cross-airline best) line reads from each row. */
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
   * Uma curva por companhia, desenhada atrás do destaque.
   *
   * O destaque continua sendo o melhor entre todas — é o número pelo qual a
   * rotina é julgada. As curvas atrás mostram a disputa: sem elas, o card diz
   * "R$ 900" e esconde que uma companhia cobrava o dobro.
   */
  airlineSeries?: { airline: string; buckets: FareHistoryBucket[] }[]
  /**
   * Companhia dona do preço atual — a curva dela ganha a cor de destaque e as
   * demais recuam em opacidade, em vez de todas disputarem atenção igual.
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

  const fmt = (v: number) =>
    isPointsMetric(metric)
      ? `${Math.round(v).toLocaleString('pt-BR')} pts`
      : formatMoney(v, currency, { maximumFractionDigits: 0 })

  const mainSeries = useMemo(() => buckets.map((b) => valueOf(b, metric)), [buckets, metric])
  const hasData = mainSeries.filter((v) => v != null).length >= 2

  // Só vale desenhar a disputa quando há disputa: com uma companhia, a curva
  // dela é idêntica ao destaque e o gráfico ficaria com duas linhas sobrepostas.
  // A própria companhia em destaque também sai daqui — ela já é a linha de
  // cima, redesenhá-la por baixo só duplicaria o traço.
  const background = useMemo(
    () => (airlineSeries.length > 1 ? airlineSeries.filter((s) => s.airline !== highlightAirline) : []),
    [airlineSeries, highlightAirline],
  )

  const rows = useMemo<ChartRow[]>(
    () => buckets.map((b, i) => {
      const row: ChartRow = { bucketStart: b.bucketStart, [MAIN_KEY]: mainSeries[i] ?? null }
      for (const s of background) row[s.airline] = valueOf(s.buckets[i], metric) ?? null
      return row
    }),
    [buckets, mainSeries, background, metric],
  )

  // O destaque marca dois pontos: o mais barato da janela (referência de "bom
  // preço") e o mais recente (o número que o card mostra agora).
  const { minIndex, lastIndex } = useMemo(() => {
    const measured = mainSeries
      .map((v, i) => (v != null ? i : null))
      .filter((i): i is number => i != null)
    if (measured.length === 0) return { minIndex: -1, lastIndex: -1 }
    const min = measured.reduce((best, i) => (mainSeries[i]! < mainSeries[best]! ? i : best), measured[0])
    return { minIndex: min, lastIndex: measured[measured.length - 1] }
  }, [mainSeries])

  const highlightIndex = airlineSeries.findIndex((s) => s.airline === highlightAirline)
  const stroke = highlightAirline
    ? colorForAirline(highlightAirline, Math.max(highlightIndex, 0))
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
      return <circle cx={cx} cy={cy} r={3.5} fill={stroke} stroke={theme.palette.background.paper} strokeWidth={1.5} />
    }
    return <g />
  }

  const renderTooltip: TooltipContentFn = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const main = payload.find((p) => p.dataKey === MAIN_KEY)
    if (main?.value == null || typeof label !== 'string') return null
    return (
      <Box
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 1,
          backgroundColor: 'text.primary',
          color: 'background.paper',
          pointerEvents: 'none',
        }}
      >
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.3 }}>
          {fmt(main.value as number)}
        </Typography>
        <Typography sx={{ fontSize: '0.625rem', opacity: 0.75, lineHeight: 1.2 }}>
          {formatMoment(label, range)}
        </Typography>
      </Box>
    )
  }

  const tickIndexes = [0, Math.floor((buckets.length - 1) / 2), buckets.length - 1]
  const ticks = [...new Set(tickIndexes.map((i) => buckets[i]?.bucketStart).filter((v): v is string => v != null))]

  return (
    <Box role="img" aria-label={`Histórico de preços do período: ${fmt(Math.min(...mainSeries.filter((v): v is number => v != null)))} a ${fmt(Math.max(...mainSeries.filter((v): v is number => v != null)))}`}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="priceChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
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

          {background.map((s) => (
            <Line
              key={s.airline}
              dataKey={s.airline}
              // Índice na lista COMPLETA (não na filtrada): a legenda em
              // PriceTrend colore pela mesma lista, e o destaque some dela sem
              // deslocar a cor das demais.
              stroke={colorForAirline(s.airline, airlineSeries.findIndex((a) => a.airline === s.airline))}
              strokeWidth={1.25}
              strokeOpacity={0.3}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}

          <Area
            dataKey={MAIN_KEY}
            stroke="none"
            fill="url(#priceChartFill)"
            isAnimationActive={false}
            connectNulls={false}
            activeDot={false}
          />
          <Line
            dataKey={MAIN_KEY}
            stroke={stroke}
            strokeWidth={1.75}
            dot={renderMainDot}
            activeDot={{ r: 4, fill: stroke, stroke: theme.palette.background.paper, strokeWidth: 1.5 }}
            isAnimationActive={false}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  )
}
