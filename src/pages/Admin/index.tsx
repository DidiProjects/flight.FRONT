import {
  Box,
  Typography,
  Button,
  Paper,
  Pagination,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminUser } from '@contexts/AdminUserContext'
import { AppLayout } from '@atomic-components/templates/AppLayout'
import { UserTable } from '@atomic-components/organisms/UserTable'
import { EmptyState } from '@atomic-components/molecules/EmptyState'
import { ConfirmDialog } from '@atomic-components/molecules/ConfirmDialog'
import { FormField } from '@atomic-components/molecules/FormField'
import { useZodForm } from '@hooks/useZodForm'
import { createUserSchema } from '@utils/schemas'
import { UsersService } from '@services/UsersService'
import { toastEmitter } from '@utils/toast'
import type { User, UserRole } from '@app-types/users'
import { pageStyles } from './style'

const LIMIT = 20

export function AdminPage() {
  const navigate = useNavigate()
  const { setSelectedUser } = useAdminUser()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const { errors: createErrors, validate: validateCreate, touchField: touchCreate, reset: resetCreate } = useZodForm<{ name: string; email: string }>(createUserSchema)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [approveTarget, setApproveTarget] = useState<User | null>(null)
  const [approveRole, setApproveRole] = useState<UserRole>('user')
  const [approveLoading, setApproveLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadUsers = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await UsersService.list({ page: p, limit: LIMIT })
      setUsers(res.users)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadUsers(page) }, [loadUsers, page])

  function closeCreate() {
    setCreateOpen(false)
    setNewName('')
    setNewEmail('')
    resetCreate()
  }

  async function handleCreate() {
    if (!validateCreate({ name: newName, email: newEmail })) return
    setCreateLoading(true)
    try {
      await UsersService.create({ name: newName, email: newEmail })
      toastEmitter.success('Usuário criado. Email com senha provisória enviado.')
      closeCreate()
      void loadUsers(page)
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleApprove() {
    if (!approveTarget) return
    setApproveLoading(true)
    try {
      if (approveTarget.status === 'pending') {
        await UsersService.approve(approveTarget.id, { role: approveRole })
        toastEmitter.success('Usuário aprovado.')
      } else {
        await UsersService.update(approveTarget.id, { status: 'active' })
        toastEmitter.success('Usuário reativado.')
      }
      void loadUsers(page)
    } finally {
      setApproveLoading(false)
      setApproveTarget(null)
    }
  }

  async function handleSuspend(user: User) {
    await UsersService.update(user.id, { status: 'suspended' })
    toastEmitter.warning('Usuário suspenso.')
    void loadUsers(page)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await UsersService.remove(deleteTarget.id)
      toastEmitter.success('Usuário removido.')
      void loadUsers(page)
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <AppLayout>
      <Box sx={pageStyles.header}>
        <Box>
          <Typography variant="h2">Usuários</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {total} usuário{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddAltIcon />} onClick={() => setCreateOpen(true)}>
          Novo usuário
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ borderRadius: '4px', mb: 3 }} />}

      {!loading && users.length === 0 ? (
        <EmptyState
          Icon={GroupOutlinedIcon}
          title="Nenhum usuário cadastrado"
          description="Crie o primeiro usuário para começar."
          actionLabel="Criar usuário"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <UserTable
            users={users}
            onApprove={(user) => { setApproveTarget(user); setApproveRole('user') }}
            onSuspend={handleSuspend}
            onDelete={(user) => setDeleteTarget(user)}
            onClickUser={(user) => { setSelectedUser(user); navigate('/admin/user-routines') }}
          />
        </Paper>
      )}

      {totalPages > 1 && (
        <Box sx={pageStyles.pagination}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Create user dialog */}
      <Dialog open={createOpen} onClose={closeCreate} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 500, fontSize: '1rem' }}>Novo usuário</DialogTitle>
        <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormField
            label="Nome"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              touchCreate('name', { name: e.target.value, email: newEmail })
            }}
            error={!!createErrors.name}
            helperText={createErrors.name}
            required
            autoFocus
            autoComplete="name"
          />
          <FormField
            label="Email"
            type="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value)
              touchCreate('email', { name: newName, email: e.target.value })
            }}
            error={!!createErrors.email}
            helperText={createErrors.email ?? 'Uma senha provisória será enviada para este email.'}
            required
            autoComplete="email"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={closeCreate} disabled={createLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createLoading}
            startIcon={createLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve / reactivate dialog */}
      {approveTarget && (
        <Dialog open onClose={() => setApproveTarget(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {approveTarget.status === 'pending' ? 'Aprovar usuário' : 'Reativar usuário'}
          </DialogTitle>
          <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {approveTarget.email}
            </Typography>
            {approveTarget.status === 'pending' && (
              <FormField
                select
                label="Role"
                value={approveRole}
                onChange={(e) => setApproveRole(e.target.value as UserRole)}
              >
                <MenuItem value="user">Usuário</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </FormField>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button variant="outlined" onClick={() => setApproveTarget(null)} disabled={approveLoading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleApprove}
              disabled={approveLoading}
              startIcon={approveLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir usuário"
        message={`Tem certeza que deseja excluir "${deleteTarget?.email}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
