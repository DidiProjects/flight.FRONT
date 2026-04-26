import { Box, Typography, Button, CircularProgress, Link as MuiLink } from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthLayout } from '@atomic-components/templates/AuthLayout'
import { FormField } from '@atomic-components/molecules/FormField'
import { useAuth } from '@hooks/useAuth'
import { useZodForm } from '@hooks/useZodForm'
import { loginSchema } from '@utils/schemas'
import { toastEmitter } from '@utils/toast'
import { pageStyles } from './style'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { errors, validate, revalidate } = useZodForm<{ email: string; password: string }>(loginSchema)

  const formData = { email, password }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!validate(formData)) return
    setLoading(true)
    try {
      const { mustChangePassword } = await login({ email, password })
      if (mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch {
      toastEmitter.error('Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={pageStyles.form}>
        <Typography variant="h2" sx={pageStyles.title}>
          Entrar
        </Typography>
        <Typography variant="body2" sx={pageStyles.subtitle}>
          Acesse seu painel de monitoramento
        </Typography>

        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); revalidate({ ...formData, email: e.target.value }) }}
          error={!!errors.email}
          helperText={errors.email}
          required
          autoComplete="email"
          autoFocus
        />

        <FormField
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); revalidate({ ...formData, password: e.target.value }) }}
          error={!!errors.password}
          helperText={errors.password}
          required
          autoComplete="current-password"
        />

        <MuiLink
          component={Link}
          to="/forgot-password"
          state={{ email }}
          variant="body2"
          sx={pageStyles.forgotLink}
        >
          Esqueci minha senha
        </MuiLink>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={pageStyles.submitBtn}
        >
          Entrar
        </Button>

        <MuiLink
          component={Link}
          to="/register"
          variant="body2"
          sx={{ alignSelf: 'center', color: 'text.secondary' }}
        >
          Não tem conta? Solicitar acesso
        </MuiLink>
      </Box>
    </AuthLayout>
  )
}
