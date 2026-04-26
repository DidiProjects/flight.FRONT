import type { SxProps } from '@mui/material'

export const headerStyles = {
  appBar: {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
  } as SxProps,

  toolbar: {
    minHeight: '56px !important',
    px: { xs: 2, sm: 3 },
    gap: 2,
  } as SxProps,

  logoButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  } as SxProps,

  nav: {
    display: { xs: 'none', sm: 'flex' },
    alignItems: 'center',
    gap: 0.5,
    flex: 1,
    ml: 2,
  } as SxProps,

  navItem: (active: boolean): SxProps => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    px: 1.5,
    py: 0.75,
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: active ? 500 : 400,
    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
    backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.9)',
    },
  }),

  iconBtn: (active: boolean): SxProps => ({
    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
    '&:hover': { color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.06)' },
  }),
}
