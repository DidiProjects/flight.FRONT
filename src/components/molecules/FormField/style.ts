import type { SxProps } from '@mui/material'

export const fieldStyles = {
  wrapper: (sx?: SxProps): SxProps => ({
    position: 'relative',
    width: '100%',
    ...(sx as object),
  }),

  errorText: {
    position: 'absolute',
    top: '100%',
    left: 0,
    mt: '2px',
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: 'error.main',
    lineHeight: 1.2,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  } as SxProps,
}
