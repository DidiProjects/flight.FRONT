import { Box, Container } from '@mui/material'
import type { ReactNode } from 'react'
import { Logo } from '@atomic-components/atoms/Logo'
import { layoutStyles } from './style'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box sx={layoutStyles.root}>
      <Box sx={layoutStyles.background} aria-hidden="true" />
      <Container maxWidth="sm" sx={layoutStyles.container}>
        <Box sx={layoutStyles.logoWrapper}>
          <Logo size="lg" />
        </Box>
        <Box sx={layoutStyles.card}>{children}</Box>
      </Container>
    </Box>
  )
}
