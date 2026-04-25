import { Box, CircularProgress } from '@mui/material'
import type { SxProps } from '@mui/material'

interface SpinnerProps {
  size?: number
  fullPage?: boolean
  sx?: SxProps
}

export function Spinner({ size = 28, fullPage = false, sx }: SpinnerProps) {
  if (fullPage) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
      >
        <CircularProgress size={size} thickness={2} />
      </Box>
    )
  }

  return <CircularProgress size={size} thickness={2} sx={sx} />
}
