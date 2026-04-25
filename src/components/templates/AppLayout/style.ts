import type { SxProps } from '@mui/material'

export const layoutStyles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'background.default',
  } as SxProps,

  main: {
    flex: 1,
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 3, sm: 4 },
    maxWidth: 1200,
    width: '100%',
    mx: 'auto',
    animation: 'fadeIn 0.3s ease',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  } as SxProps,
}
