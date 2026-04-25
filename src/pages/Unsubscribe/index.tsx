import { Box, Typography, Alert, CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@atomic-components/templates/AuthLayout'

export function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); return }

    fetch(`${import.meta.env.VITE_API_URL}/unsubscribe/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = (await res.json()) as { message: string }
        if (res.ok) {
          setMessage(data.message)
          setStatus('success')
        } else {
          setMessage(data.message ?? 'Link inválido ou expirado.')
          setStatus('error')
        }
      })
      .catch(() => {
        setMessage('Não foi possível processar sua solicitação.')
        setStatus('error')
      })
  }, [token])

  return (
    <AuthLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h2">Cancelar notificações</Typography>

        {status === 'loading' && (
          <Box sx={{ py: 3 }}>
            <CircularProgress size={32} thickness={2} />
          </Box>
        )}

        {status === 'success' && (
          <Alert severity="success" sx={{ borderRadius: '10px', width: '100%' }}>
            {message}
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ borderRadius: '10px', width: '100%' }}>
            {message || 'Link inválido ou expirado.'}
          </Alert>
        )}
      </Box>
    </AuthLayout>
  )
}
