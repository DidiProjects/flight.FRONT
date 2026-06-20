import { Tabs, Tab } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'

export function AdminNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const value = pathname.startsWith('/admin/jobs')
    ? 1
    : pathname.startsWith('/admin/airlines')
      ? 2
      : 0

  const paths = ['/admin', '/admin/jobs', '/admin/airlines']

  return (
    <Tabs
      value={value}
      onChange={(_, v: number) => navigate(paths[v])}
      sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab label="Usuários" />
      <Tab label="Jobs" />
      <Tab label="Companhias aéreas" />
    </Tabs>
  )
}
