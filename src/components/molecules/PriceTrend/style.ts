import type { SxProps } from '@mui/material'

export const trendStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
  } as SxProps,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 1,
  } as SxProps,

  title: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'text.disabled',
  } as SxProps,

  // The group is the only control inside the chart area, so it stays compact
  // enough to sit beside the title on a 360px screen instead of wrapping.
  ranges: {
    '& .MuiToggleButton-root': {
      py: 0.25,
      px: 1,
      fontSize: '0.6875rem',
      lineHeight: 1.4,
      textTransform: 'none',
      border: '1px solid',
      borderColor: 'divider',
    },
  } as SxProps,

  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 20px',
  } as SxProps,

  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.125,
    minWidth: 0,
  } as SxProps,

  statLabel: {
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'text.disabled',
  } as SxProps,

  statValue: (tone?: 'good' | 'bad'): SxProps => ({
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: tone === 'good' ? 'success.dark' : tone === 'bad' ? 'warning.dark' : 'text.primary',
    lineHeight: 1.3,
  }),

  deltaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.25,
  } as SxProps,

  deltaIcon: (delta: number): SxProps => ({
    fontSize: 16,
    color: delta < 0 ? 'success.main' : delta > 0 ? 'warning.main' : 'text.disabled',
  }),
}
