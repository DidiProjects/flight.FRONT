import { Box, Typography, Button, CircularProgress, Link as MuiLink, Alert } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@atomic-components/templates/AuthLayout'
import { FormField } from '@atomic-components/molecules/FormField'
import { AuthService } from '@services/AuthService'
import { useZodForm } from '@hooks/useZodForm'
import { registerSchema } from '@utils/schemas'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { errors, validate, touchField } = useZodForm<{ name: string; email: string }>(registerSchema)

  const formData = { name, email }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!validate(formData)) return
    setLoading(true)
    try {
      await AuthService.register({ name, email })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h2">Criar conta</Typography>
        <Typography variant="body2" color="text.secondary">
          Preencha seus dados. Após a aprovação você receberá as instruções de acesso por email.
        </Typography>

        {done ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success" sx={{ borderRadius: '10px' }}>
              Solicitação enviada! Aguarde a aprovação e fique de olho no seu email.
            </Alert>
            <MuiLink component={Link} to="/login" variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
              ← Voltar ao login
            </MuiLink>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormField
              label="Nome"
              value={name}
              onChange={(e) => { setName(e.target.value); touchField('name', { ...formData, name: e.target.value }) }}
              error={!!errors.name}
              helperText={errors.name}
              required
              autoFocus
              autoComplete="name"
            />
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); touchField('email', { ...formData, email: e.target.value }) }}
              error={!!errors.email}
              helperText={errors.email}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ mt: 1 }}
            >
              Solicitar acesso
            </Button>

            <MuiLink component={Link} to="/login" variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
              Já tem conta? Entrar
            </MuiLink>
          </Box>
        )}
      </Box>
    </AuthLayout>
  )
}
