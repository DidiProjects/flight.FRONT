import { useEffect, useState } from 'react'
import { Box, Typography, Collapse, ButtonBase, CircularProgress, Tooltip } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StarIcon from '@mui/icons-material/Star'
import { FlightFaresService } from '@services/FlightFaresService'
import { formatMoney } from '@utils/money'
import type { PriceByDateEntry } from '@app-types/flightFares'

interface FareCalendarProps {
  airlines: string[]
  origin: string
  destination: string
  dateFrom: string
  dateTo: string
  currencyFallback: string | null
}

type FareTrack = 'cash' | 'pts' | 'hyb'

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

// t = 0 (mais barata) → verde; t = 1 (mais cara) → âmbar
function tintBg(t: number): string {
  return `hsl(${140 - t * 100}, 70%, 93%)`
}
function tintFg(t: number): string {
  return `hsl(${140 - t * 100}, 60%, 26%)`
}

function FareSection({
  entries,
  track,
  currency,
}: {
  entries: PriceByDateEntry[]
  track: FareTrack
  currency: string | null
}) {
  const withValue = entries
    .map((e) => ({ e, v: valueFor(e, track) }))
    .filter((x): x is { e: PriceByDateEntry; v: number } => x.v != null)

  if (withValue.length === 0) return null

  const min = Math.min(...withValue.map((x) => x.v))
  const max = Math.max(...withValue.map((x) => x.v))
  const span = max - min || 1

  return (
    <Box>
      <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.5 }}>
        {TRACK_LABEL[track]}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 0.75 }}>
        {withValue.map(({ e, v }) => {
          const t = (v - min) / span
          const isCheapest = v === min
          const [, m, d] = e.flightDate.slice(0, 10).split('-')
          return (
            <Tooltip key={e.flightDate} title={isCheapest ? 'Data mais barata' : ''}>
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
                  backgroundColor: tintBg(t),
                  border: isCheapest ? '1.5px solid' : '1.5px solid transparent',
                  borderColor: isCheapest ? 'success.main' : 'transparent',
                }}
              >
                <Typography sx={{ fontSize: '0.625rem', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  {isCheapest && <StarIcon sx={{ fontSize: 10, color: 'success.main' }} />}
                  {d}/{m}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tintFg(t), lineHeight: 1.2 }}>
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

export function FareCalendar({ airlines, origin, destination, dateFrom, dateTo, currencyFallback }: FareCalendarProps) {
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
    FlightFaresService.getPriceByDate({ airlines, origin, destination, dateFrom, dateTo })
      .then((d) => { setEntries(d); setFetched(true) })
      .catch(() => { setError(true); setFetched(true) })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fetched, airlinesKey, origin, destination, dateFrom, dateTo])

  const list = entries ?? []
  // Mostra uma lista por tipo de tarifa com dados: dinheiro e pontos (e híbrido, quando houver),
  // empilhadas. Rotina só com pontos → só a lista de pontos.
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
                <FareSection key={track} entries={list} track={track} currency={currencyFallback} />
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}
