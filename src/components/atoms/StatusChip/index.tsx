import { Box, Typography } from '@mui/material'
import { chipStyles, type ChipStatus } from './style'

interface StatusChipProps {
  status: ChipStatus
  label?: string
}

const defaultLabels: Record<ChipStatus, string> = {
  active:    'Ativo',
  pending:   'Pendente',
  suspended: 'Suspenso',
  paused:    'Pausada',
}

export function StatusChip({ status, label }: StatusChipProps) {
  return (
    <Box sx={chipStyles.root(status)}>
      <Box sx={chipStyles.bullet(status)} />
      <Typography component="span" sx={chipStyles.label}>
        {label ?? defaultLabels[status]}
      </Typography>
    </Box>
  )
}
