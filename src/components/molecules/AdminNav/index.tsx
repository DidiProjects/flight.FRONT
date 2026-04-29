import { Tabs, Tab } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'

export function AdminNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const value = pathname.startsWith('/admin/airlines') ? 1 : 0

  return (
    <Tabs
      value={value}
      onChange={(_, v: number) => navigate(v === 0 ? '/admin' : '/admin/airlines')}
      sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab label="Usuários" />
      <Tab label="Companhias aéreas" />
    </Tabs>
  )
}
