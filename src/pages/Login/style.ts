import type { SxProps } from '@mui/material'

export const pageStyles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } as SxProps,

  title: {
    mb: 0.5,
  } as SxProps,

  subtitle: {
    color: 'text.secondary',
    mb: 1,
  } as SxProps,

  forgotLink: {
    alignSelf: 'flex-end',
    mt: -1,
    color: 'text.secondary',
    '&:hover': { color: 'primary.main' },
  } as SxProps,

  submitBtn: {
    mt: 1,
  } as SxProps,
}
