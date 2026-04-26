import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@atomic-components/templates/AuthLayout'
import { FormField } from '@atomic-components/molecules/FormField'
import { useAuth } from '@hooks/useAuth'
import { useZodForm } from '@hooks/useZodForm'
import { changePasswordSchema } from '@utils/schemas'
import { toastEmitter } from '@utils/toast'

export function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const { errors, validate, revalidate } = useZodForm<{
    currentPassword: string
    newPassword: string
    confirm: string
  }>(changePasswordSchema)

  const formData = { currentPassword: current, newPassword: next, confirm }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!validate(formData)) return
    setLoading(true)
    try {
      await changePassword({ currentPassword: current, newPassword: next })
      toastEmitter.success('Senha alterada com sucesso!')
      navigate('/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h2">Trocar senha</Typography>

        <Alert severity="info" sx={{ borderRadius: '10px' }}>
          Sua conta exige a troca de senha antes de continuar.
        </Alert>

        <FormField
          label="Senha atual"
          type="password"
          value={current}
          onChange={(e) => { setCurrent(e.target.value); revalidate({ ...formData, currentPassword: e.target.value }) }}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
          required
          autoFocus
          autoComplete="current-password"
        />
        <FormField
          label="Nova senha"
          type="password"
          value={next}
          onChange={(e) => { setNext(e.target.value); revalidate({ ...formData, newPassword: e.target.value }) }}
          error={!!errors.newPassword}
          helperText={errors.newPassword ?? 'Mín. 8 caracteres, letras maiúsculas, minúsculas e números'}
          required
          autoComplete="new-password"
        />
        <FormField
          label="Confirmar nova senha"
          type="password"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); revalidate({ ...formData, confirm: e.target.value }) }}
          error={!!errors.confirm}
          helperText={errors.confirm}
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
          sx={{ mt: 1 }}
        >
          Alterar senha
        </Button>
      </Box>
    </AuthLayout>
  )
}
