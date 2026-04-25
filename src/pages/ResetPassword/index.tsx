import { Box, Typography, Button, CircularProgress, Link as MuiLink, Alert } from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@atomic-components/templates/AuthLayout'
import { FormField } from '@atomic-components/molecules/FormField'
import { AuthService } from '@services/AuthService'
import { toastEmitter } from '@utils/toast'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (password !== confirm) {
      toastEmitter.error('As senhas não coincidem.')
      return
    }
    if (!token) return
    setLoading(true)
    try {
      await AuthService.resetPassword(token, { password })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h2">Nova senha</Typography>
        <Typography variant="body2" color="text.secondary">
          Defina sua nova senha de acesso.
        </Typography>

        {done ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success" sx={{ borderRadius: '10px' }}>
              Senha redefinida com sucesso!
            </Alert>
            <Button variant="contained" fullWidth size="large" onClick={() => navigate('/login')}>
              Ir para o login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormField
              label="Nova senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="new-password"
            />
            <FormField
              label="Confirmar senha"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Redefinir senha
            </Button>
          </Box>
        )}

        <MuiLink component={Link} to="/login" variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
          ← Voltar ao login
        </MuiLink>
      </Box>
    </AuthLayout>
  )
}
