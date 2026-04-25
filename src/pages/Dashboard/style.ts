import type { SxProps } from '@mui/material'

export const pageStyles = {
  header: {
    display: 'flex',
    alignItems: { xs: 'flex-start', sm: 'center' },
    justifyContent: 'space-between',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2,
    mb: 3,
  } as SxProps,

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    mt: 4,
  } as SxProps,
}
