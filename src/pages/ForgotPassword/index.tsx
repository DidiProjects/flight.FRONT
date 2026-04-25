import { Box, Typography, Button, CircularProgress, Link as MuiLink, Alert } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@atomic-components/templates/AuthLayout'
import { FormField } from '@atomic-components/molecules/FormField'
import { AuthService } from '@services/AuthService'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    try {
      await AuthService.forgotPassword({ email })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h2">Recuperar senha</Typography>
        <Typography variant="body2" color="text.secondary">
          Informe seu email para receber as instruções de redefinição.
        </Typography>

        {sent ? (
          <Alert severity="success" sx={{ borderRadius: '10px' }}>
            Se o email existir em nossa base, você receberá as instruções em breve.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Enviar instruções
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
