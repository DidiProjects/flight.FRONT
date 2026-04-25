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
    width: 72,
    height: 72,
    borderRadius: '50%',
    backgroundColor: 'grey.100',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 2.5,
    border: '1px solid',
    borderColor: 'divider',
  } as SxProps,

  icon: {
    fontSize: 32,
    color: 'text.disabled',
  } as SxProps,

  title: {
    fontWeight: 600,
    color: 'text.primary',
    mb: 1,
  } as SxProps,

  description: {
    color: 'text.secondary',
    maxWidth: 360,
  } as SxProps,
}
