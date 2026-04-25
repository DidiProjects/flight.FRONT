import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Switch,
  Divider,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FlightIcon from '@mui/icons-material/Flight'
import { cardStyles } from './style'
import type { Routine } from '@app-types/routines'

interface RoutineCardProps {
  routine: Routine
  onEdit: (routine: Routine) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

const priorityLabels = { brl: 'R$', pts: 'Pontos', hyb: 'Híbrido' }

export function RoutineCard({ routine, onEdit, onDelete, onToggleActive }: RoutineCardProps) {
  const hasReturn = routine.returnStart && routine.returnEnd

  return (
    <Card sx={cardStyles.root(routine.isActive)}>
      <CardContent sx={cardStyles.content}>
        <Box sx={cardStyles.header}>
          <Box sx={cardStyles.routeRow}>
            <Typography variant="caption" sx={cardStyles.airlineLabel}>
              {routine.airline.toUpperCase()}
            </Typography>
            <Box sx={cardStyles.routeIata}>
              <Typography variant="h5" sx={cardStyles.iata}>
                {routine.origin}
              </Typography>
              <FlightIcon sx={cardStyles.flightIcon} />
              <Typography variant="h5" sx={cardStyles.iata}>
                {routine.destination}
              </Typography>
              {hasReturn && (
                <>
                  <FlightIcon sx={{ ...cardStyles.flightIcon, transform: 'rotate(180deg)' }} />
                  <Typography variant="h5" sx={cardStyles.iata}>
                    {routine.origin}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
          <Box sx={cardStyles.actions}>
            <Switch
              checked={routine.isActive}
              onChange={() => onToggleActive(routine.id, !routine.isActive)}
              size="small"
              aria-label={routine.isActive ? 'Desativar rotina' : 'Ativar rotina'}
            />
          </Box>
        </Box>

        <Typography variant="h6" sx={cardStyles.name}>
          {routine.name}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={cardStyles.meta}>
          <Box sx={cardStyles.metaItem}>
            <Typography variant="caption" sx={cardStyles.metaLabel}>
              Ida
            </Typography>
            <Typography variant="body2" sx={cardStyles.metaValue}>
              {routine.outboundStart} — {routine.outboundEnd}
            </Typography>
          </Box>
          {hasReturn && (
            <Box sx={cardStyles.metaItem}>
              <Typography variant="caption" sx={cardStyles.metaLabel}>
                Volta
              </Typography>
              <Typography variant="body2" sx={cardStyles.metaValue}>
                {routine.returnStart} — {routine.returnEnd}
              </Typography>
            </Box>
          )}
          <Box sx={cardStyles.metaItem}>
            <Typography variant="caption" sx={cardStyles.metaLabel}>
              Passageiros
            </Typography>
            <Typography variant="body2" sx={cardStyles.metaValue}>
              {routine.passengers}
            </Typography>
          </Box>
          <Box sx={cardStyles.metaItem}>
            <Typography variant="caption" sx={cardStyles.metaLabel}>
              Prioridade
            </Typography>
            <Typography variant="body2" sx={cardStyles.metaValue}>
              {priorityLabels[routine.priority]}
            </Typography>
          </Box>
          {routine.targetBrl !== null && (
            <Box sx={cardStyles.metaItem}>
              <Typography variant="caption" sx={cardStyles.metaLabel}>
                Target R$
              </Typography>
              <Typography variant="body2" sx={{ ...cardStyles.metaValue, color: 'primary.main', fontWeight: 600 }}>
                {routine.targetBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Typography>
            </Box>
          )}
          {routine.targetPts !== null && (
            <Box sx={cardStyles.metaItem}>
              <Typography variant="caption" sx={cardStyles.metaLabel}>
                Target pts
              </Typography>
              <Typography variant="body2" sx={{ ...cardStyles.metaValue, color: 'primary.main', fontWeight: 600 }}>
                {routine.targetPts.toLocaleString('pt-BR')}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <Box sx={cardStyles.footer}>
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
    </Card>
  )
}
