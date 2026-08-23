import type { SxProps } from '@mui/material'

export const pageStyles = {
  header: {
    display: 'flex',
    alignItems: { xs: 'flex-start', sm: 'center' },
    justifyContent: 'space-between',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2,
    mb: 3,
  } as SxProps,

  // Two cards per row from `md` up; a single column below it, where half a
  // viewport is not enough for the 30-day chart inside the card.
  list: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
    // `start`, not the default `stretch`: with stretch, opening the fare
    // calendar on one card grew the whole grid row and dragged the card beside
    // it to the same height, which read as both having expanded.
    alignItems: 'start',
    gap: { xs: 2, sm: 2.5 },
  } as SxProps,

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    mt: 4,
  } as SxProps,
}
