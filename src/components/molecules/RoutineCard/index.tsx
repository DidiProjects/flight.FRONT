import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Switch,
  Chip,
  Skeleton,
  Button,
  Menu,
  MenuItem,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FlightIcon from '@mui/icons-material/Flight'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useState, useEffect } from 'react'
import { StatusChip } from '@atomic-components/atoms/StatusChip'
import { PriceHistoryPanel } from '@atomic-components/molecules/PriceHistoryPanel'
import { FareCalendar } from '@atomic-components/molecules/FareCalendar'
import { FlightFaresService } from '@services/FlightFaresService'
import { timeAgo } from '@utils/timeAgo'
import { buildBookingLink } from '@utils/bookingLink'
import { cardStyles } from './style'
import type { Routine } from '@app-types/routines'
import type { CurrentPrice } from '@app-types/flightFares'

type Verdict = 'low' | 'typical' | 'high'

const verdictMeta: Record<Verdict, { label: string; color: 'success' | 'default' | 'warning' }> = {
  low: { label: 'Preço baixo', color: 'success' },
  typical: { label: 'Preço típico', color: 'default' },
  high: { label: 'Preço alto', color: 'warning' },
}

function fmtCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
}

function computeVerdict(value: number | null, avg: number | null, threshold: number | null): Verdict | null {
  if (value == null || avg == null) return null
  if (threshold != null && value <= threshold) return 'low'
  if (value <= avg) return 'typical'
  return 'high'
}

function currentForPriority(c: CurrentPrice, routine: Routine): { display: string | null; verdict: Verdict | null } {
  const currency = c.currency ?? routine.currency
  if (routine.priority === 'pts') {
    const v = c.bestPts
    return { display: v != null ? `${v.toLocaleString('pt-BR')} pts` : null, verdict: computeVerdict(v, c.avgPts30d, c.minPts30d) }
  }
  if (routine.priority === 'hyb') {
    const pts = c.bestHybPts
    const cash = c.bestHybCash
    const display = pts != null
      ? `${pts.toLocaleString('pt-BR')} pts${cash != null ? ` + ${fmtCurrency(cash, currency)}` : ''}`
      : null
    return { display, verdict: null }
  }
  const v = c.bestCash
  return { display: v != null ? fmtCurrency(v, currency) : null, verdict: computeVerdict(v, c.avgCash30d, c.p20Cash30d) }
}

interface RoutineCardProps {
  routine: Routine
  airportNames?: Map<string, string>
  onEdit: (routine: Routine) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

const priorityLabels: Record<string, string> = {
  cash: 'Menor preço em dinheiro',
  pts: 'Menor em pontos',
  hyb: 'Híbrido (pts + dinheiro)',
}

const modeLabels: Record<string, string> = {
  target: 'Preço alvo',
  scheduled: 'Horário agendado',
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={cardStyles.metaItem}>
      <Typography sx={cardStyles.metaLabel}>{label}</Typography>
      <Typography sx={cardStyles.metaValue}>{value}</Typography>
    </Box>
  )
}

export function RoutineCard({ routine, airportNames, onEdit, onDelete, onToggleActive }: RoutineCardProps) {
  const hasReturn = routine.returnStart && routine.returnEnd
  const originCity = airportNames?.get(routine.origin)
  const destinationCity = airportNames?.get(routine.destination)

  const [current, setCurrent] = useState<CurrentPrice | null>(null)
  const [currentLoading, setCurrentLoading] = useState(true)

  const airlinesKey = routine.airlines.join(',')
  useEffect(() => {
    let cancelled = false
    setCurrentLoading(true)
    FlightFaresService.getCurrent({
      airlines: routine.airlines,
      origin: routine.origin,
      destination: routine.destination,
      dateFrom: routine.outboundStart,
      dateTo: routine.outboundEnd,
    })
      .then((d) => { if (!cancelled) setCurrent(d) })
      .catch(() => { if (!cancelled) setCurrent(null) })
      .finally(() => { if (!cancelled) setCurrentLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airlinesKey, routine.origin, routine.destination, routine.outboundStart, routine.outboundEnd])

  const currentInfo = current ? currentForPriority(current, routine) : null
  const freshness = timeAgo(current?.scrapedAt ?? null)

  const [buyAnchor, setBuyAnchor] = useState<null | HTMLElement>(null)
  const bookingOptions = routine.airlines
    .map((a) => ({
      airline: a,
      url: buildBookingLink(a, {
        origin: routine.origin,
        destination: routine.destination,
        date: routine.outboundStart,
        passengers: routine.passengers,
        fareType: routine.priority,
      }),
    }))
    .filter((o): o is { airline: string; url: string } => o.url != null)

  const formatDateRange = (start: string | null | undefined, end: string | null | undefined) => {
    const fmt = (d: string | null | undefined) => {
      if (!d) return '—'
      const [y, m, day] = d.split('-')
      return `${day}/${m}/${y?.slice(2)}`
    }
    return `${fmt(start)} – ${fmt(end)}`
  }

  return (
    <Card sx={cardStyles.root(routine.isActive)}>
      <CardContent sx={cardStyles.content(routine.isActive)}>

        {/* Airline + status */}
        <Box sx={cardStyles.topRow}>
          <Box sx={{ ...cardStyles.airlineBadge, filter: routine.isActive ? 'none' : 'grayscale(1)' }}>
            {routine.airlines.map(a => a.toUpperCase()).join(' · ')}
          </Box>
          <StatusChip
            status={routine.isActive ? 'active' : 'paused'}
            label={routine.isActive ? 'Ativa' : 'Pausada'}
          />
        </Box>

        {/* Route hero */}
        <Box>
          <Box sx={cardStyles.routeHero}>
            <Typography sx={cardStyles.iata}>{routine.origin}</Typography>
            <Box sx={cardStyles.flightArrow}>
              <FlightIcon sx={{ fontSize: 16 }} />
              <Box sx={cardStyles.arrowLine} />
            </Box>
            <Typography sx={cardStyles.iata}>{routine.destination}</Typography>
            {hasReturn && (
              <>
                <Box sx={cardStyles.flightArrow}>
                  <FlightIcon sx={{ fontSize: 16, transform: 'rotate(180deg)' }} />
                  <Box sx={cardStyles.arrowLine} />
                </Box>
                <Typography sx={cardStyles.iata}>{routine.origin}</Typography>
              </>
            )}
          </Box>
          {(originCity || destinationCity) && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {originCity ?? routine.origin} → {destinationCity ?? routine.destination}
            </Typography>
          )}
          <Typography sx={cardStyles.routineName}>{routine.name}</Typography>
        </Box>

        {/* Preço atual + veredito + frescor */}
        {currentLoading ? (
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1.5 }} />
        ) : currentInfo?.display ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              py: 1,
              px: 1.5,
              borderRadius: 1.5,
              backgroundColor: 'action.hover',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.15 }}>
                {currentInfo.display}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                preço atual{freshness ? ` · verificado ${freshness}` : ''}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                gap: 0.5, flexShrink: 0,
              }}
            >
              {currentInfo.verdict && (
                <Chip
                  size="small"
                  style={{ width: '100%' }}
                  color={verdictMeta[currentInfo.verdict].color}
                  label={verdictMeta[currentInfo.verdict].label}
                  sx={{ fontWeight: 600 }}
                />
              )}
              {bookingOptions.length === 1 ? (
                <Button
                  size="small"
                  variant="text"
                  href={bookingOptions[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{ py: 0.25, px: 1.25, fontSize: '0.75rem' }}
                >
                  Comprar
                </Button>
              ) : bookingOptions.length > 1 ? (
                <Button
                  size="small"
                  variant="text"
                  onClick={(e) => setBuyAnchor(e.currentTarget)}
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{ py: 0.25, px: 1.25, fontSize: '0.75rem' }}
                >
                  Comprar
                </Button>
              ) : null}
            </Box>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Sem preço coletado ainda
          </Typography>
        )}

        <Menu anchorEl={buyAnchor} open={Boolean(buyAnchor)} onClose={() => setBuyAnchor(null)}>
          {bookingOptions.map((o) => (
            <MenuItem
              key={o.airline}
              component="a"
              href={o.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setBuyAnchor(null)}
            >
              <OpenInNewIcon sx={{ fontSize: 16, mr: 1 }} />
              Comprar na {o.airline.charAt(0).toUpperCase() + o.airline.slice(1)}
            </MenuItem>
          ))}
        </Menu>

        {/* Meta grid */}
        <Box sx={cardStyles.meta}>
          <MetaItem label="Ida" value={formatDateRange(routine.outboundStart, routine.outboundEnd)} />

          {hasReturn ? (
            <MetaItem
              label="Volta"
              value={formatDateRange(routine.returnStart!, routine.returnEnd!)}
            />
          ) : (
            <MetaItem label="Volta" value="Somente ida" />
          )}

          <MetaItem label="Passageiros" value={`${routine.passengers} pax`} />
          <MetaItem label="Notificações" value={routine.notificationModes.map((m) => modeLabels[m] ?? m).join(', ')} />

          {routine.targetCash != null && (
            <Box sx={{ ...cardStyles.metaItem, gridColumn: '1 / -1' }}>
              <Typography sx={cardStyles.metaLabel}>Target</Typography>
              <Typography sx={cardStyles.targetValue}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: routine.currency }).format(routine.targetCash)}
              </Typography>
            </Box>
          )}
          {routine.targetPts != null && (
            <Box sx={{ ...cardStyles.metaItem, gridColumn: '1 / -1' }}>
              <Typography sx={cardStyles.metaLabel}>Target</Typography>
              <Typography sx={cardStyles.targetValue}>
                {routine.targetPts.toLocaleString('pt-BR')} pts
              </Typography>
            </Box>
          )}
          {routine.targetHybPts != null && routine.targetHybCash != null && (
            <Box sx={{ ...cardStyles.metaItem, gridColumn: '1 / -1' }}>
              <Typography sx={cardStyles.metaLabel}>Target híbrido</Typography>
              <Typography sx={cardStyles.targetValue}>
                {routine.targetHybPts.toLocaleString('pt-BR')} pts
                {' + '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: routine.currency }).format(routine.targetHybCash)}
              </Typography>
            </Box>
          )}

          <Box sx={{ ...cardStyles.metaItem, gridColumn: '1 / -1' }}>
            <Typography sx={cardStyles.metaLabel}>Prioridade</Typography>
            <Typography sx={cardStyles.metaValue}>{priorityLabels[routine.priority] ?? routine.priority}</Typography>
          </Box>
        </Box>

        <PriceHistoryPanel
          airlines={routine.airlines}
          origin={routine.origin}
          destination={routine.destination}
          dateFrom={routine.outboundStart}
          dateTo={routine.outboundEnd}
          currencyFallback={routine.currency}
        />

        <FareCalendar
          airlines={routine.airlines}
          origin={routine.origin}
          destination={routine.destination}
          dateFrom={routine.outboundStart}
          dateTo={routine.outboundEnd}
          priority={routine.priority}
          currencyFallback={routine.currency}
        />

      </CardContent>

      {/* Footer */}
      <Box sx={cardStyles.footer}>
        <Box sx={cardStyles.toggle}>
          <Switch
            checked={routine.isActive}
            onChange={() => onToggleActive(routine.id, !routine.isActive)}
            size="small"
            aria-label={routine.isActive ? 'Desativar rotina' : 'Ativar rotina'}
          />
          <Typography variant="caption" color="text.secondary">
            {routine.isActive ? 'Ativa' : 'Pausada'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(routine)} aria-label="Editar rotina">
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(routine.id)}
              aria-label="Excluir rotina"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  )
}
