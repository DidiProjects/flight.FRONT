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
    p: 0,
    pb: '0 !important',
    opacity: isActive ? 1 : 0.85,
    transition: 'opacity 0.2s ease',
  }),

  /**
   * Every block is a section of the same vertical stack, separated by a rule.
   * The two-column split that came before put price and chart side by side and
   * left the details wrapping into ragged gaps under them; stacking makes the
   * reading order the same on a phone and on a desktop.
   */
  section: (first = false): SxProps => ({
    px: { xs: 2, sm: 2.5 },
    py: { xs: 1.75, sm: 2 },
    ...(first ? {} : { borderTop: '1px solid', borderColor: 'divider' }),
  }),

  sectionLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'text.disabled',
    mb: 1,
  } as SxProps,

  // ── header ──────────────────────────────────────────────────────────────

  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1.25,
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
    fontSize: { xs: '1.125rem', sm: '1.25rem' },
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
    width: { xs: 24, sm: 36 },
    height: 1,
    backgroundColor: 'divider',
  } as SxProps,

  cities: {
    display: 'block',
    mt: 0.5,
  } as SxProps,

  routineName: {
    fontWeight: 500,
    color: 'text.primary',
    fontSize: '0.875rem',
    mt: 0.25,
  } as SxProps,

  // ── price ───────────────────────────────────────────────────────────────

  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 1,
  } as SxProps,

  price: {
    fontSize: { xs: '1.75rem', sm: '2rem' },
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  } as SxProps,

  priceCaption: {
    display: 'block',
    mt: 0.5,
    lineHeight: 1.4,
  } as SxProps,

  // Full width on a phone, where a small right-aligned link is a poor target;
  // shrinks to its content once there is room beside the price.
  buyButton: {
    mt: 1.5,
    width: { xs: '100%', sm: 'auto' },
    alignSelf: 'flex-start',
  } as SxProps,

  // ── details ─────────────────────────────────────────────────────────────

  /**
   * `auto-fit` instead of a fixed column count: the items spread to fill the
   * row on a wide card and fall to two per row on a phone, with no ragged gap
   * left by a wrapping flex.
   */
  details: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
    gap: { xs: '14px 12px', sm: '16px 20px' },
  } as SxProps,

  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
    minWidth: 0,
  } as SxProps,

  detailLabel: {
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'text.disabled',
  } as SxProps,

  detailValue: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'text.primary',
    lineHeight: 1.4,
  } as SxProps,

  targetValue: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'primary.main',
    lineHeight: 1.4,
  } as SxProps,

  // ── footer ──────────────────────────────────────────────────────────────

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: { xs: 1.5, sm: 2 },
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
