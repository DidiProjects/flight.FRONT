/**
 * Price verdict — the single baseline of the system.
 *
 * It lives here because the card and the calendar MUST agree. Each used to
 * decide the colour its own way: the card compared against history (p20 and a
 * 30-day average) and the calendar normalised between the lowest and the
 * highest of the displayed window. The calendar then always painted something
 * green — even in a window of bad prices — while the card above said "high".
 *
 * Now green means the same thing in both places: cheap against the route's
 * history. "Cheapest in the window" is still flagged, but by star and border,
 * which is positional information — not price.
 */
export type Verdict = 'low' | 'typical' | 'high'

export const verdictMeta: Record<Verdict, { label: string; color: 'success' | 'default' | 'warning' }> = {
  low: { label: 'Preço baixo', color: 'success' },
  typical: { label: 'Preço típico', color: 'default' },
  high: { label: 'Preço alto', color: 'warning' },
}

/**
 * `threshold` is the p20 (or the minimum, in points): below it the price is
 * historically low. Without a baseline there is no verdict — `null` means "I
 * do not know", and guessing "typical" would assert something never measured.
 */
export function computeVerdict(
  value: number | null,
  avg: number | null,
  threshold: number | null,
): Verdict | null {
  if (value == null || avg == null) return null
  if (threshold != null && value <= threshold) return 'low'
  if (value <= avg) return 'typical'
  return 'high'
}

/** Baseline of the displayed dimension. Hybrid has no history to compare against. */
export function referenceFor(
  track: 'cash' | 'pts' | 'hyb',
  summary: {
    avgCash30d: number | null
    p20Cash30d: number | null
    avgPts30d: number | null
    minPts30d: number | null
  },
): { avg: number | null; threshold: number | null } {
  if (track === 'pts') return { avg: summary.avgPts30d, threshold: summary.minPts30d }
  if (track === 'hyb') return { avg: null, threshold: null }
  return { avg: summary.avgCash30d, threshold: summary.p20Cash30d }
}
