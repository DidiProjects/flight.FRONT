import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Typography,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@atomic-components/atoms/Logo'
import { useAuth } from '@hooks/useAuth'
import { headerStyles } from './style'

export function AppHeader() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <AppBar position="sticky" sx={headerStyles.appBar} elevation={0}>
      <Toolbar sx={headerStyles.toolbar}>
        <Box
          component="button"
          onClick={() => navigate('/dashboard')}
          sx={headerStyles.logoButton}
          aria-label="Ir para o dashboard"
        >
          <Logo size="sm" />
        </Box>

        <Box sx={headerStyles.nav}>
          <Box
            component="button"
            onClick={() => navigate('/dashboard')}
            sx={headerStyles.navItem(true)}
          >
            Rotinas
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Sair">
            <IconButton
              size="small"
              onClick={() => setAnchorEl(document.getElementById('logout-anchor'))}
              sx={headerStyles.iconBtn(false)}
              id="logout-anchor"
              aria-label="Sair"
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Confirmar saída?
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              void handleLogout()
            }}
            sx={{ color: 'error.main', fontWeight: 500 }}
          >
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
