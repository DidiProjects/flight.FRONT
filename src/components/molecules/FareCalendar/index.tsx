import { useEffect, useState } from 'react'
import { Box, Typography, Collapse, ButtonBase, CircularProgress, Tooltip } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StarIcon from '@mui/icons-material/Star'
import { FlightFaresService } from '@services/FlightFaresService'
import { formatMoney } from '@utils/money'
import { computeVerdict, referenceFor, type Verdict } from '@utils/priceVerdict'
import type { PriceByDateEntry, CurrentPrice } from '@app-types/flightFares'

interface FareCalendarProps {
  airlines: string[]
  origin: string
  destination: string
  dateFrom: string
  dateTo: string
  currencyFallback: string | null
  /** Return window: when present, each cell is the pair TOTAL for that outbound date. */
  inboundFrom?: string | null
  inboundTo?: string | null
  /**
   * Historical baseline of the routine, so the colour means what it means on the card.
   * Absent (or without data) = neutral cells: no reference, no verdict.
   */
  summary?: CurrentPrice | null
}

type FareTrack = 'cash' | 'pts' | 'hyb'

const VERDICT_LABEL: Record<Verdict, string> = {
  low: 'Preço baixo para a rota',
  typical: 'Preço típico',
  high: 'Preço alto para a rota',
}

const TRACK_LABEL: Record<FareTrack, string> = {
  cash: 'Dinheiro',
  pts: 'Pontos',
  hyb: 'Híbrido',
}

function valueFor(e: PriceByDateEntry, track: FareTrack): number | null {
  if (track === 'pts') return e.bestPts
  if (track === 'hyb') return e.bestHybPts
  return e.bestCash
}

function fmtCompact(value: number, track: FareTrack, currency: string | null): string {
  if (track === 'cash') {
    return formatMoney(value, currency, { maximumFractionDigits: 0 })
  }
  return value >= 1000 ? `${Math.round(value / 1000)}k pts` : `${Math.round(value)} pts`
}

/**
 * Colour by historical VERDICT, not by position in the window.
 *
 * The old relative scale (`t = (v-min)/span`) always painted something green,
 * even across a window of bad prices — and contradicted the card just above,
 * which uses history. Here green means the same thing in both places.
 *
 * Without a baseline the cell stays neutral: inventing a colour asserts nothing measured.
 */
const VERDICT_TINT: Record<Verdict, { bg: string; fg: string }> = {
  low:     { bg: 'hsl(140, 70%, 93%)', fg: 'hsl(140, 60%, 26%)' },
  typical: { bg: 'hsl(210, 16%, 95%)', fg: 'hsl(210, 12%, 32%)' },
  high:    { bg: 'hsl(40, 85%, 93%)',  fg: 'hsl(30, 70%, 30%)' },
}
const NEUTRAL_TINT = { bg: 'hsl(210, 16%, 95%)', fg: 'hsl(210, 12%, 32%)' }

function FareSection({
  entries,
  track,
  currency,
  summary,
}: {
  entries: PriceByDateEntry[]
  track: FareTrack
  currency: string | null
  summary?: CurrentPrice | null
}) {
  const withValue = entries
    .map((e) => ({ e, v: valueFor(e, track) }))
    .filter((x): x is { e: PriceByDateEntry; v: number } => x.v != null)

  if (withValue.length === 0) return null

  // The star still marks the cheapest OF THE WINDOW — positional information,
  // which is useful and does not clash with the colour (which speaks of history).
  const min = Math.min(...withValue.map((x) => x.v))
  const reference = summary ? referenceFor(track, summary) : { avg: null, threshold: null }

  return (
    <Box>
      <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.5 }}>
        {TRACK_LABEL[track]}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 0.75 }}>
        {withValue.map(({ e, v }) => {
          const verdict = computeVerdict(v, reference.avg, reference.threshold)
          const tint = verdict ? VERDICT_TINT[verdict] : NEUTRAL_TINT
          const isCheapest = v === min
          const [, m, d] = e.flightDate.slice(0, 10).split('-')
          return (
            <Tooltip
              key={e.flightDate}
              title={[isCheapest ? 'Data mais barata da janela' : '', verdict ? VERDICT_LABEL[verdict] : '']
                .filter(Boolean)
                .join(' · ')}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                  px: 0.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: tint.bg,
                  border: isCheapest ? '1.5px solid' : '1.5px solid transparent',
                  borderColor: isCheapest ? 'success.main' : 'transparent',
                }}
              >
                <Typography sx={{ fontSize: '0.625rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  {isCheapest && <StarIcon sx={{ fontSize: 10, color: 'success.main' }} />}
                  {d}/{m}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tint.fg, lineHeight: 1.2 }}>
                  {fmtCompact(v, track, currency)}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}

export function FareCalendar({ airlines, origin, destination, dateFrom, dateTo, currencyFallback, inboundFrom, inboundTo, summary }: FareCalendarProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<PriceByDateEntry[] | null>(null)
  const [fetched, setFetched] = useState(false)
  const [error, setError] = useState(false)

  const airlinesKey = airlines.join(',')
  useEffect(() => {
    if (!open || fetched) return
    setLoading(true)
    setError(false)
    FlightFaresService.getPriceByDate({ airlines, origin, destination, dateFrom, dateTo, inboundFrom, inboundTo })
      .then((d) => { setEntries(d); setFetched(true) })
      .catch(() => { setError(true); setFetched(true) })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fetched, airlinesKey, origin, destination, dateFrom, dateTo, inboundFrom, inboundTo])

  const list = entries ?? []
  // Shows one list per fare type with data: cash and points (and hybrid, when present),
  // stacked. A points-only routine gets only the points list.
  const tracks: FareTrack[] = (['cash', 'pts', 'hyb'] as FareTrack[]).filter((track) =>
    list.some((e) => valueFor(e, track) != null),
  )

  return (
    <Box sx={{ mt: 1 }}>
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
        aria-label="Ver preços por data"
      >
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Calendário de preços
        </Typography>
        <ExpandMoreIcon sx={{ fontSize: 14, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </ButtonBase>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pt: 1, pb: 0.5 }}>
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              <CircularProgress size={12} thickness={5} />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Carregando...</Typography>
            </Box>
          )}

          {!loading && error && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Não foi possível carregar os preços por data.
            </Typography>
          )}

          {!loading && !error && fetched && tracks.length === 0 && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Preços por data ainda sendo coletados.
            </Typography>
          )}

          {!loading && !error && tracks.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tracks.map((track) => (
                <FareSection
                  key={track}
                  entries={list}
                  track={track}
                  // The currency comes from what the API measured, not from the
                  // routine. `routine.currency` is the TARGET unit — fixed in Real —
                  // so using it here labelled £ 25.99 as "R$ 26". The card already
                  // resolves it as `c.currency ?? routine.currency`, and so does
                  // PriceHistoryPanel; the calendar ignored the summary it receives.
                  currency={summary?.currency ?? currencyFallback}
                  summary={summary}
                />
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}
