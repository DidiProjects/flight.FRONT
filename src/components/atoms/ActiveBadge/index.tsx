import { Chip } from '@mui/material'
import { badgeStyles } from './style'

interface ActiveBadgeProps {
  isActive: boolean
}

export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  return (
    <Chip
      label={isActive ? 'Ativa' : 'Inativa'}
      size="small"
      sx={badgeStyles.root(isActive)}
    />
  )
}
