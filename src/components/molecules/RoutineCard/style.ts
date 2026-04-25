import type { SxProps } from '@mui/material'

export const cardStyles = {
  root: (isActive: boolean): SxProps => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    opacity: isActive ? 1 : 0.6,
    borderLeft: '3px solid',
    borderLeftColor: isActive ? 'primary.main' : 'divider',
    transition: 'opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    '&:hover': {
      boxShadow: 3,
    },
  }),

  content: {
    flex: 1,
    pt: 2.5,
    px: 2.5,
    pb: '12px !important',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } as SxProps,

  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  } as SxProps,

  airlineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    px: 1,
    py: 0.25,
    borderRadius: 1,
    backgroundColor: 'action.hover',
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'text.secondary',
  } as SxProps,

  statusChip: (isActive: boolean): SxProps => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    px: 1,
    py: 0.25,
    borderRadius: 1,
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: isActive ? 'success.dark' : 'text.disabled',
    backgroundColor: isActive ? 'rgba(45, 155, 107, 0.08)' : 'action.hover',
  }),

  routeHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  } as SxProps,

  iata: {
    fontWeight: 700,
    fontSize: '2rem',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  } as SxProps,

  flightArrow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.25,
    color: 'text.disabled',
    flexShrink: 0,
  } as SxProps,

  arrowLine: {
    width: 36,
    height: 1,
    backgroundColor: 'divider',
  } as SxProps,

  routineName: {
    fontWeight: 400,
    color: 'text.secondary',
    fontSize: '0.875rem',
    mt: -0.5,
  } as SxProps,

  meta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px 16px',
  } as SxProps,

  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
    minWidth: 0,
  } as SxProps,

  metaLabel: {
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'text.disabled',
  } as SxProps,

  metaValue: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'text.primary',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as SxProps,

  targetValue: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'primary.main',
  } as SxProps,

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 2,
    py: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
  } as SxProps,

  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  } as SxProps,
}
