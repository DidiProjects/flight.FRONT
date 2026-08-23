import type { SxProps } from '@mui/material'

export const cardStyles = {
  root: (isActive: boolean): SxProps => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderLeft: '3px solid',
    borderLeftColor: isActive ? 'primary.main' : 'divider',
    transition: 'border-color 0.2s ease',
  }),

  content: (isActive: boolean): SxProps => ({
    flex: 1,
    // Tighter on a phone: horizontal padding is width taken from the chart.
    pt: { xs: 2, sm: 2.5 },
    px: { xs: 1.75, sm: 2.5 },
    pb: '12px !important',
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 1.75, sm: 2 },
    opacity: isActive ? 1 : 0.85,
    transition: 'opacity 0.2s ease',
  }),

  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
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

  routeHero: {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 1, sm: 1.5 },
    flexWrap: 'wrap',
  } as SxProps,

  iata: {
    fontWeight: 600,
    fontSize: { xs: '1.0625rem', sm: '1.125rem' },
    letterSpacing: '0.5px',
    lineHeight: 1,
    textTransform: 'uppercase' as const,
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
    width: { xs: 22, sm: 36 },
    height: 1,
    backgroundColor: 'divider',
  } as SxProps,

  routineName: {
    fontWeight: 400,
    color: 'text.secondary',
    fontSize: '0.875rem',
  } as SxProps,

  /**
   * The full-width row's payload. One column on a phone (price first, then the
   * chart); two from `md`, where the extra width goes to the chart instead of
   * stretching a line of text across 1200px.
   */
  body: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 300px) 1fr' },
    gap: { xs: 1.75, md: 3 },
    alignItems: 'start',
  } as SxProps,

  priceBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
  } as SxProps,

  priceBox: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    py: 1.25,
    px: 1.5,
    borderRadius: 1.5,
    backgroundColor: 'action.hover',
  } as SxProps,

  price: {
    fontSize: { xs: '1.375rem', sm: '1.25rem' },
    fontWeight: 700,
    lineHeight: 1.15,
  } as SxProps,

  priceLegs: {
    display: 'block',
    lineHeight: 1.3,
  } as SxProps,

  priceSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 0.5,
    flexShrink: 0,
  } as SxProps,

  /**
   * Meta as a wrapping row, not a two-column grid: on a 360px screen the grid
   * left half the labels truncated, and full width made its second column a
   * stretch of empty space.
   */
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px 20px',
  } as SxProps,

  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.125,
    minWidth: 0,
  } as SxProps,

  metaLabel: {
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'text.disabled',
  } as SxProps,

  metaValue: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'text.primary',
    whiteSpace: 'nowrap' as const,
  } as SxProps,

  targetValue: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'primary.main',
    whiteSpace: 'nowrap' as const,
  } as SxProps,

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: { xs: 1.25, sm: 2 },
    py: 0.75,
    borderTop: '1px solid',
    borderColor: 'divider',
  } as SxProps,

  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  } as SxProps,
}
