import type { SxProps } from '@mui/material'

const sizes = {
  sm: { icon: 18, text: '1rem', gap: 0.5 },
  md: { icon: 24, text: '1.25rem', gap: 0.75 },
  lg: { icon: 32, text: '1.75rem', gap: 1 },
}

export const logoStyles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    userSelect: 'none',
  } as SxProps,

  icon: (size: 'sm' | 'md' | 'lg', variant: 'default' | 'white'): SxProps => ({
    fontSize: sizes[size].icon,
    color: variant === 'white' ? 'white' : 'primary.main',
    transform: 'rotate(-10deg)',
  }),

  text: (size: 'sm' | 'md' | 'lg', variant: 'default' | 'white'): SxProps => ({
    fontSize: sizes[size].text,
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: variant === 'white' ? 'white' : 'primary.main',
    lineHeight: 1,
  }),
}
