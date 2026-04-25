import type { SxProps } from '@mui/material'

export const cardStyles = {
  root: (isActive: boolean): SxProps => ({
    position: 'relative',
    opacity: isActive ? 1 : 0.65,
    transition: 'opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  }),

  content: {
    pb: '8px !important',
    pt: 2,
    px: 2.5,
  } as SxProps,

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    mb: 0.5,
  } as SxProps,

  routeRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  } as SxProps,

  airlineLabel: {
    color: 'text.disabled',
    fontWeight: 600,
    letterSpacing: '0.08em',
  } as SxProps,

  routeIata: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  } as SxProps,

  iata: {
    fontWeight: 700,
    letterSpacing: '-0.01em',
  } as SxProps,

  flightIcon: {
    fontSize: 14,
    color: 'text.secondary',
    mx: 0.25,
  } as SxProps,

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    mt: -0.5,
  } as SxProps,

  name: {
    color: 'text.secondary',
    fontWeight: 400,
    mt: 0.25,
  } as SxProps,

  meta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 1.5,
  } as SxProps,

  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  } as SxProps,

  metaLabel: {
    color: 'text.disabled',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  } as SxProps,

  metaValue: {
    color: 'text.primary',
    fontWeight: 500,
  } as SxProps,

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 0.5,
    px: 1.5,
    py: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
  } as SxProps,
}
