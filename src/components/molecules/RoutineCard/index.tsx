import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Switch,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FlightIcon from '@mui/icons-material/Flight'
import { StatusChip } from '@atomic-components/atoms/StatusChip'
import { PriceHistoryPanel } from '@atomic-components/molecules/PriceHistoryPanel'
import { cardStyles } from './style'
import type { Routine } from '@app-types/routines'

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
