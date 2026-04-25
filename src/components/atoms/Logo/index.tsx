import { Box, Typography } from '@mui/material'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import { logoStyles } from './style'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'white'
}

export function Logo({ size = 'md', variant = 'default' }: LogoProps) {
  return (
    <Box sx={logoStyles.root}>
      <FlightTakeoffIcon sx={logoStyles.icon(size, variant)} />
      <Typography sx={logoStyles.text(size, variant)}>flight</Typography>
    </Box>
  )
}
