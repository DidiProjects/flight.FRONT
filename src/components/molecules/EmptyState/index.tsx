import { Box, Typography, Button } from '@mui/material'
import type { SvgIconComponent } from '@mui/icons-material'
import { emptyStyles } from './style'

interface EmptyStateProps {
  Icon: SvgIconComponent
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box sx={emptyStyles.root}>
      <Box sx={emptyStyles.iconWrapper}>
        <Icon sx={emptyStyles.icon} />
      </Box>
      <Typography variant="h5" sx={emptyStyles.title}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={emptyStyles.description}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 3 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
