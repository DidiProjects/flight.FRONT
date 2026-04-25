import type { SxProps } from '@mui/material'

export const badgeStyles = {
  root: (isActive: boolean): SxProps => ({
    fontWeight: 500,
    borderRadius: '6px',
    ...(isActive
      ? {
          backgroundColor: 'success.light',
          color: 'success.dark',
          border: '1px solid rgba(45, 155, 107, 0.3)',
        }
      : {
          backgroundColor: 'grey.100',
          color: 'text.secondary',
          border: '1px solid',
          borderColor: 'divider',
        }),
  }),
}
