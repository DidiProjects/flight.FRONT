import type { SxProps } from '@mui/material'

export const formStyles = {
  drawer: {
    '& .MuiDrawer-paper': {
      width: { xs: '100vw', sm: 580 },
      maxWidth: '100vw',
    },
  } as SxProps,

  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'background.paper',
  } as SxProps,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 3,
    py: 2.5,
    flexShrink: 0,
  } as SxProps,

  body: {
    flex: 1,
    overflowY: 'auto',
    px: 3,
    py: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  } as SxProps,

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
  } as SxProps,

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 0.5,
  } as SxProps,

  sectionIcon: {
    fontSize: 15,
    color: 'primary.main',
    opacity: 0.8,
  } as SxProps,

  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'text.secondary',
  } as SxProps,

  row: {
    display: 'flex',
    gap: 2,
  } as SxProps,

  routeRow: {
    display: 'flex',
    gap: 2,
    alignItems: 'flex-start',
  } as SxProps,

  routeArrow: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    height: 56,
    color: 'text.disabled',
  } as SxProps,

  dateGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 1,
  } as SxProps,

  dateGroupLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'text.secondary',
    pl: 0.25,
  } as SxProps,

  optionalTag: {
    fontSize: '0.7rem',
    color: 'text.disabled',
    fontWeight: 400,
    ml: 0.75,
  } as SxProps,

  ccRow: {
    display: 'flex',
    gap: 1.5,
    alignItems: 'flex-start',
  } as SxProps,

  chips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 0.75,
    mt: 1,
  } as SxProps,

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1.5,
    px: 3,
    py: 2.5,
    flexShrink: 0,
  } as SxProps,
}
