import type { SxProps } from '@mui/material'

export const formStyles = {
  drawer: {
    '& .MuiDrawer-paper': {
      width: { xs: '100vw', sm: 560 },
      maxWidth: '100vw',
    },
  } as SxProps,

  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as SxProps,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 3,
    py: 2,
  } as SxProps,

  body: {
    flex: 1,
    overflowY: 'auto',
    px: 3,
    py: 3,
  } as SxProps,

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1.5,
    px: 3,
    py: 2,
  } as SxProps,
}
