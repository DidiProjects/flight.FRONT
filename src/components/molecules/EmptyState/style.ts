import type { SxProps } from '@mui/material'

export const emptyStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    py: 8,
    px: 3,
  } as SxProps,

  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: 'info.light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 2.5,
    border: '1px solid',
    borderColor: 'rgba(74,144,217,0.2)',
  } as SxProps,

  icon: {
    fontSize: 28,
    color: 'info.dark',
  } as SxProps,

  title: {
    fontSize: '1rem',
    fontWeight: 500,
    color: 'text.primary',
    mb: 1,
  } as SxProps,

  description: {
    color: 'text.secondary',
    maxWidth: 360,
  } as SxProps,
}
