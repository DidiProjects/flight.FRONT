export interface ChartPoint {
  x: number
  y: number
  /** Value of the bucket, already resolved for the displayed dimension. */
  v: number
  /** Index in the original bucket list — the tooltip reads the date from it. */
  i: number
}

export interface ChartGeometry {
  /** One polyline per uninterrupted stretch. A gap ends a run and starts another. */
  runs: ChartPoint[][]
  /** Positions aligned with the input, `null` where nothing was measured. */
  points: (ChartPoint | null)[]
  minPoint: ChartPoint
  lastPoint: ChartPoint
  min: number
  max: number
  baseline: number
  padX: number
  innerW: number
}

export const CHART_PAD = { x: 4, top: 14, bottom: 18 }

/**
 * Turns a series into drawable geometry, or `null` when there is nothing to draw.
 *
 * Lives apart from the component because this is the part with decisions in it —
 * where a gap breaks the line, where a flat series sits — and because the
 * component cannot be measured under jsdom: `getBoundingClientRect` returns 0
 * there, so a DOM test of the chart would assert on an empty box.
 */
export function buildGeometry(
  series: (number | null)[],
  width: number,
  height: number,
): ChartGeometry | null {
  const measured = series.filter((v): v is number => v != null)
  // One point is a dot, not a history: nothing to read from it.
  if (measured.length < 2 || width <= 0) return null

  const innerW = Math.max(width - CHART_PAD.x * 2, 1)
  const innerH = Math.max(height - CHART_PAD.top - CHART_PAD.bottom, 1)

  const min = Math.min(...measured)
  const max = Math.max(...measured)
  const span = max - min

  const toX = (i: number) => CHART_PAD.x + (i / (series.length - 1)) * innerW
  // A price that did not move has zero span. Normalising it puts every point at
  // the bottom of the box, which reads as "it crashed"; the middle reads as what
  // it is — a flat stretch.
  const toY = (v: number) =>
    span === 0
      ? CHART_PAD.top + innerH / 2
      : CHART_PAD.top + innerH - ((v - min) / span) * innerH

  const points = series.map((v, i) => (v == null ? null : { x: toX(i), y: toY(v), v, i }))

  // Joining across a gap would draw a trend through buckets nobody measured,
  // which is exactly the lie the segment model exists to avoid.
  const runs: ChartPoint[][] = []
  let run: ChartPoint[] = []
  for (const p of points) {
    if (p == null) {
      if (run.length) runs.push(run)
      run = []
    } else {
      run.push(p)
    }
  }
  if (run.length) runs.push(run)

  const filled = points.filter((p): p is ChartPoint => p != null)

  return {
    runs,
    points,
    minPoint: filled.reduce((a, b) => (b.v < a.v ? b : a), filled[0]),
    lastPoint: filled[filled.length - 1],
    min,
    max,
    baseline: CHART_PAD.top + innerH,
    padX: CHART_PAD.x,
    innerW,
  }
}

/** SVG path of one run. */
export function linePath(run: ChartPoint[]): string {
  return run.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
}

/** Closed path of one run, for the fill under the line. A single point has no area. */
export function areaPath(run: ChartPoint[], baseline: number): string {
  if (run.length < 2) return ''
  const last = run[run.length - 1]
  return `${linePath(run)} L ${last.x.toFixed(1)} ${baseline} L ${run[0].x.toFixed(1)} ${baseline} Z`
}
