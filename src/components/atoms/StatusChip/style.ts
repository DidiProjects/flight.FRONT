import type { SxProps } from '@mui/material'
import type { UserStatus } from '@app-types/users'

const colorMap: Record<UserStatus, SxProps> = {
  active: {
    backgroundColor: 'success.light',
    color: 'success.dark',
    border: '1px solid',
    borderColor: 'success.main',
    borderOpacity: 0.3,
  },
  pending: {
    backgroundColor: 'warning.light',
    color: 'warning.dark',
    border: '1px solid',
    borderColor: 'warning.main',
    borderOpacity: 0.3,
  },
  suspended: {
    backgroundColor: 'error.light',
    color: 'error.dark',
    border: '1px solid',
    borderColor: 'error.main',
    borderOpacity: 0.3,
  },
}

export const chipStyles = {
  root: (status: UserStatus): SxProps => ({
    ...colorMap[status],
    fontWeight: 500,
    borderRadius: '6px',
  }),
}
