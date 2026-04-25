import type { SxProps } from '@mui/material'

export const headerStyles = {
  appBar: {
    backgroundColor: 'background.paper',
    borderBottom: '1px solid',
    borderColor: 'divider',
    color: 'text.primary',
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
    fontWeight: active ? 600 : 400,
    color: active ? 'primary.main' : 'text.secondary',
    backgroundColor: active ? 'rgba(30, 58, 95, 0.06)' : 'transparent',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: 'rgba(30, 58, 95, 0.06)',
      color: 'primary.main',
    },
  }),

  iconBtn: (active: boolean): SxProps => ({
    color: active ? 'primary.main' : 'text.secondary',
    '&:hover': { color: 'primary.main' },
  }),
}
