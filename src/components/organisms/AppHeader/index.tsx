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
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import LockResetIcon from '@mui/icons-material/LockReset'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Logo } from '@atomic-components/atoms/Logo'
import { useAuth } from '@hooks/useAuth'
import { headerStyles } from './style'

export function AppHeader() {
  const { logout, isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const onAdminPage = location.pathname.startsWith('/admin')

  return (
    <AppBar position="sticky" sx={headerStyles.appBar} elevation={0}>
      <Toolbar sx={headerStyles.toolbar} >
        <Box
          component="button"
          onClick={() => navigate('/dashboard')}
          sx={headerStyles.logoButton}
          aria-label="Ir para o dashboard"
        >
          <Logo size="sm" variant="white" />
        </Box>

        <Box sx={headerStyles.nav}>
          <Box
            component="button"
            onClick={() => navigate('/dashboard')}
            sx={headerStyles.navItem(!onAdminPage)}
          >
            Rotinas
          </Box>
          {isAdmin && (
            <Box
              component="button"
              onClick={() => navigate('/admin')}
              sx={headerStyles.navItem(onAdminPage)}
            >
              Admin
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginLeft: 'auto' }}>
          <Tooltip title="Conta">
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={headerStyles.iconBtn(false)}
              aria-label="Conta"
              aria-haspopup="true"
            >
              <AccountCircleOutlinedIcon fontSize="small" />
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
          {user?.email && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Conectado como
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                {user.email}
              </Typography>
            </Box>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              navigate('/change-password')
            }}
          >
            <LockResetIcon fontSize="small" sx={{ mr: 1 }} />
            Trocar senha
          </MenuItem>
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
