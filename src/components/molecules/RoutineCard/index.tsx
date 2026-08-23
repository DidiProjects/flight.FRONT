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
import { PriceTrend } from '@atomic-components/molecules/PriceTrend'
import { FareCalendar } from '@atomic-components/molecules/FareCalendar'
import type { ChartMetric } from '@atomic-components/atoms/PriceChart'
import { FlightFaresService } from '@services/FlightFaresService'
import { timeAgo } from '@utils/timeAgo'
import { buildBookingLink } from '@utils/bookingLink'
import { formatMoney } from '@utils/money'
import { computeVerdict, verdictMeta, type Verdict } from '@utils/priceVerdict'
import { cardStyles } from './style'
import type { Routine } from '@app-types/routines'
import type { CurrentPrice, Journey } from '@app-types/flightFares'

function fmtCurrency(value: number, currency: string | null): string {
  return formatMoney(value, currency)
}

function fmtPts(value: number): string {
  return `${value.toLocaleString('pt-BR')} pts`
}

/**
 * Total split into outbound and return, each journey formatted in ITS OWN currency.
 *
 * It only exists when BOTH parts arrived: half the split is worse than none —
 * the reader would complete the other half from memory and get it wrong. Absent
 * on one-way routines and when the total is an airline bundle (single price,
 * no split).
 * The currency comes from inside the journey, never from the pair level:
 * inheriting it from above is what made outbound and return show the same label
 * even when the airline charged in different currencies.
 */
function breakdownByJourney(
  journeys: Journey[] | undefined,
  pick: (j: Journey) => number | null,
  fmt: (v: number, currency: string | null) => string,
): string | null {
  const out = journeys?.find((j) => j.direction === 'outbound')
  const inb = journeys?.find((j) => j.direction === 'inbound')
  if (!out || !inb) return null
  const a = pick(out)
  const b = pick(inb)
  if (a == null || b == null) return null
  return `ida ${fmt(a, out.currency)} · volta ${fmt(b, inb.currency)}`
}

function currentForPriority(
  c: CurrentPrice,
  routine: Routine,
): { display: string | null; verdict: Verdict | null; legs: string | null } {
  const currency = c.currency ?? routine.currency
  if (routine.priority === 'pts') {
    const v = c.bestPts
    return {
      display: v != null ? fmtPts(v) : null,
      verdict: computeVerdict(v, c.avgPts30d, c.minPts30d),
      legs: breakdownByJourney(c.journeys, (j) => j.pts, (v) => fmtPts(v)),
    }
  }
  if (routine.priority === 'hyb') {
    const pts = c.bestHybPts
    const cash = c.bestHybCash
    const display = pts != null
      ? `${fmtPts(pts)}${cash != null ? ` + ${fmtCurrency(cash, currency)}` : ''}`
      : null
    // On hybrid each leg carries both components; joining them into one string
    // keeps the "outbound X · return Y" reading identical to other priorities.
    const legs = breakdownByJourney(c.journeys, (j) => j.hybPts, (v) => fmtPts(v))
    const legsCash = breakdownByJourney(c.journeys, (j) => j.hybCash, fmtCurrency)
    return {
      display,
      verdict: null,
      legs: legs && legsCash ? `${legs} (+ ${legsCash})` : legs,
    }
  }
  const v = c.bestCash
  return {
    display: v != null ? fmtCurrency(v, currency) : null,
    verdict: computeVerdict(v, c.avgCash30d, c.p20Cash30d),
    legs: breakdownByJourney(c.journeys, (j) => j.cash, fmtCurrency),
  }
}

/** The 30-day baseline of the displayed dimension, for the chart's stats. */
function baselineFor(c: CurrentPrice | null, priority: string): { min: number | null; avg: number | null } | null {
  if (!c) return null
  if (priority === 'pts') return { min: c.minPts30d, avg: c.avgPts30d }
  // Hybrid has no 30-day baseline collected — showing one would invent it.
  if (priority === 'hyb') return null
  return { min: c.minCash30d, avg: c.avgCash30d }
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

function DetailItem({ label, value, target }: { label: string; value: string; target?: boolean }) {
  return (
    <Box sx={cardStyles.detailItem}>
      <Typography sx={cardStyles.detailLabel}>{label}</Typography>
      <Typography sx={target ? cardStyles.targetValue : cardStyles.detailValue}>{value}</Typography>
    </Box>
  )
}

export function RoutineCard({ routine, airportNames, onEdit, onDelete, onToggleActive }: RoutineCardProps) {
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
      // RT routine: the card price is the TRIP total, not the outbound.
      inboundFrom: routine.inboundStart,
      inboundTo: routine.inboundEnd,
    })
      .then((d) => { if (!cancelled) setCurrent(d) })
      .catch(() => { if (!cancelled) setCurrent(null) })
      .finally(() => { if (!cancelled) setCurrentLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airlinesKey, routine.origin, routine.destination, routine.outboundStart, routine.outboundEnd, routine.inboundStart, routine.inboundEnd])

  const currentInfo = current ? currentForPriority(current, routine) : null
  const freshness = timeAgo(current?.scrapedAt ?? null)

  const isRoundTrip = routine.tripType === 'round_trip'

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
        // Without this, the buy button of a pair routine opens a one-way search.
        ...(isRoundTrip && routine.inboundStart ? { returnDate: routine.inboundStart } : {}),
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

        {/* Identidade */}
        <Box sx={cardStyles.section(true)}>
          <Box sx={cardStyles.topRow}>
            <Box sx={{ ...cardStyles.airlineBadge, filter: routine.isActive ? 'none' : 'grayscale(1)' }}>
              {routine.airlines.map(a => a.toUpperCase()).join(' · ')}
            </Box>
            <StatusChip
              status={routine.isActive ? 'active' : 'paused'}
              label={routine.isActive ? 'Ativa' : 'Pausada'}
            />
          </Box>

          <Box sx={cardStyles.routeHero}>
            <Typography sx={cardStyles.iata}>{routine.origin}</Typography>
            <Box sx={cardStyles.flightArrow}>
              <FlightIcon sx={{ fontSize: 16 }} />
              <Box sx={cardStyles.arrowLine} />
            </Box>
            <Typography sx={cardStyles.iata}>{routine.destination}</Typography>
            {isRoundTrip && (
              <>
                <Box sx={{ ...cardStyles.flightArrow, transform: 'scaleX(-1)' }}>
                  <FlightIcon sx={{ fontSize: 16 }} />
                  <Box sx={cardStyles.arrowLine} />
                </Box>
                <Typography sx={cardStyles.iata}>{routine.origin}</Typography>
              </>
            )}
          </Box>

          {(originCity || destinationCity) && (
            <Typography variant="caption" color="text.secondary" sx={cardStyles.cities}>
              {originCity ?? routine.origin} → {destinationCity ?? routine.destination}
            </Typography>
          )}
          <Typography sx={cardStyles.routineName}>{routine.name}</Typography>
        </Box>

        {/* Preço */}
        <Box sx={cardStyles.section()}>
          <Typography sx={cardStyles.sectionLabel}>
            {currentInfo?.legs ? 'Total ida e volta' : 'Preço atual'}
          </Typography>

          {currentLoading ? (
            <Skeleton variant="rounded" height={64} sx={{ borderRadius: 1.5 }} />
          ) : currentInfo?.display ? (
            <>
              <Box sx={cardStyles.priceRow}>
                <Typography sx={cardStyles.price}>{currentInfo.display}</Typography>
                {currentInfo.verdict && (
                  <Chip
                    size="small"
                    color={verdictMeta[currentInfo.verdict].color}
                    label={verdictMeta[currentInfo.verdict].label}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
              {currentInfo.legs && (
                <Typography variant="caption" color="text.secondary" sx={cardStyles.priceCaption}>
                  {currentInfo.legs}
                </Typography>
              )}
              {freshness && (
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                  verificado {freshness}
                </Typography>
              )}
              {bookingOptions.length === 1 ? (
                <Button
                  size="small"
                  variant="outlined"
                  href={bookingOptions[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={cardStyles.buyButton}
                >
                  Comprar
                </Button>
              ) : bookingOptions.length > 1 ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => setBuyAnchor(e.currentTarget)}
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={cardStyles.buyButton}
                >
                  Comprar
                </Button>
              ) : null}
            </>
          ) : current?.inboundUnavailable ? (
            // The outbound was collected; it is the airline that hides the return.
            // Saying "no price collected" would conceal that, and showing the
            // outbound price would be worse: it is not the price of the trip.
            <>
              <Typography sx={cardStyles.price}>—</Typography>
              <Typography variant="caption" color="text.secondary" sx={cardStyles.priceCaption}>
                volta não disponível{freshness ? ` · verificado ${freshness}` : ''}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Sem preço coletado ainda
            </Typography>
          )}
        </Box>

        {/* Comportamento do preço */}
        <Box sx={cardStyles.section()}>
          <PriceTrend
            airlines={routine.airlines}
            origin={routine.origin}
            destination={routine.destination}
            dateFrom={routine.outboundStart}
            dateTo={routine.outboundEnd}
            currencyFallback={current?.currency ?? routine.currency}
            inboundFrom={routine.inboundStart}
            inboundTo={routine.inboundEnd}
            metric={routine.priority as ChartMetric}
            baseline={baselineFor(current, routine.priority)}
          />
        </Box>

        {/* Configuração da rotina */}
        <Box sx={cardStyles.section()}>
          <Typography sx={cardStyles.sectionLabel}>Configuração</Typography>
          <Box sx={cardStyles.details}>
            <DetailItem
              label={isRoundTrip ? 'Ida' : 'Datas'}
              value={formatDateRange(routine.outboundStart, routine.outboundEnd)}
            />
            {isRoundTrip && (
              <DetailItem label="Volta" value={formatDateRange(routine.inboundStart, routine.inboundEnd)} />
            )}
            <DetailItem label="Passageiros" value={`${routine.passengers} pax`} />
            {routine.targetCash != null && (
              <DetailItem label="Alvo" value={formatMoney(routine.targetCash, routine.currency)} target />
            )}
            {routine.targetPts != null && (
              <DetailItem label="Alvo" value={`${routine.targetPts.toLocaleString('pt-BR')} pts`} target />
            )}
            {routine.targetHybPts != null && routine.targetHybCash != null && (
              <DetailItem
                label="Alvo híbrido"
                value={`${routine.targetHybPts.toLocaleString('pt-BR')} pts + ${formatMoney(routine.targetHybCash, routine.currency)}`}
                target
              />
            )}
            <DetailItem label="Prioridade" value={priorityLabels[routine.priority] ?? routine.priority} />
            <DetailItem
              label="Notificações"
              value={routine.notificationModes.map((m) => modeLabels[m] ?? m).join(', ')}
            />
          </Box>
        </Box>

        {/* Preços por data */}
        <Box sx={cardStyles.section()}>
          <FareCalendar
            airlines={routine.airlines}
            origin={routine.origin}
            destination={routine.destination}
            dateFrom={routine.outboundStart}
            dateTo={routine.outboundEnd}
            currencyFallback={routine.currency}
            // On RT each cell is the trip total for that outbound date.
            inboundFrom={routine.inboundStart}
            inboundTo={routine.inboundEnd}
            // Baseline already loaded by the card: the cell colour means the same
            // as the verdict chip, with no second request.
            summary={current}
          />
        </Box>

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

      </CardContent>

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
