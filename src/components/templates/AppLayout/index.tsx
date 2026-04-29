import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { AppHeader } from '@atomic-components/organisms/AppHeader'
import { AppFooter } from '@atomic-components/organisms/AppFooter'
import { layoutStyles } from './style'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box sx={layoutStyles.root}>
      <AppHeader />
      <Box component="main" sx={layoutStyles.main}>
        {children}
      </Box>
      <AppFooter />
    </Box>
  )
}
