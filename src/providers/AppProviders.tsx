import { type ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter } from 'react-router-dom'
import { theme } from '@theme/index'
import { AuthProvider } from '@contexts/AuthContext'
import { useToastListener } from '@hooks/useToast'

function ToastBridge() {
  useToastListener()
  return null
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={4}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        preventDuplicate
      >
        <ToastBridge />
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  )
}
