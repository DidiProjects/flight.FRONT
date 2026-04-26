import type { SxProps } from '@mui/material'

export const layoutStyles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'background.default',
  } as SxProps,

  background: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 20%, rgba(30, 58, 95, 0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(74, 144, 217, 0.04) 0%, transparent 50%)
    `,
    backgroundSize: '100% 100%',
    pointerEvents: 'none',
  } as SxProps,

  container: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    py: 4,
  } as SxProps,

  logoWrapper: {
    mb: 4,
    animation: 'fadeInDown 0.4s ease',
    '@keyframes fadeInDown': {
      from: { opacity: 0, transform: 'translateY(-12px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  } as SxProps,

  card: {
    width: '100%',
    backgroundColor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '16px',
    p: { xs: 3, sm: 4 },
    animation: 'fadeInUp 0.4s ease 0.1s both',
    '@keyframes fadeInUp': {
      from: { opacity: 0, transform: 'translateY(12px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  } as SxProps,
}
