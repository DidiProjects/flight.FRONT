import { Chip } from '@mui/material'
import { chipStyles } from './style'
import type { UserStatus } from '@app-types/users'

interface StatusChipProps {
  status: UserStatus
}

const labels: Record<UserStatus, string> = {
  active: 'Ativo',
  pending: 'Pendente',
  suspended: 'Suspenso',
}

export function StatusChip({ status }: StatusChipProps) {
  return (
    <Chip
      label={labels[status]}
      size="small"
      sx={chipStyles.root(status)}
    />
  )
}
