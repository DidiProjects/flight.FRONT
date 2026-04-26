import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Tooltip,
  Box,
  Typography,
  MenuItem,
  Menu,
  Chip,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import BlockIcon from '@mui/icons-material/Block'
import { useState } from 'react'
import { StatusChip } from '@atomic-components/atoms/StatusChip'
import type { User } from '@app-types/users'

interface UserTableProps {
  users: User[]
  onApprove: (user: User) => void
  onSuspend: (user: User) => void
  onDelete: (user: User) => void
}

export function UserTable({ users, onApprove, onSuspend, onDelete }: UserTableProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  function openMenu(el: HTMLElement, user: User) {
    setMenuAnchor(el)
    setSelectedUser(user)
  }

  function closeMenu() {
    setMenuAnchor(null)
    setSelectedUser(null)
  }

  const actionsMenu = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={closeMenu}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {selectedUser?.status === 'active' && (
        <MenuItem
          onClick={() => { selectedUser && onSuspend(selectedUser); closeMenu() }}
          sx={{ color: 'warning.main' }}
        >
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          Suspender
        </MenuItem>
      )}
      {selectedUser?.status === 'suspended' && (
        <MenuItem
          onClick={() => { selectedUser && onApprove(selectedUser); closeMenu() }}
          sx={{ color: 'success.main' }}
        >
          <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          Reativar
        </MenuItem>
      )}
      <MenuItem
        onClick={() => { selectedUser && onDelete(selectedUser); closeMenu() }}
        sx={{ color: 'error.main' }}
      >
        <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
        Excluir
      </MenuItem>
    </Menu>
  )

  return (
    <>
      {/* Mobile card list — xs only */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column' }}>
        {users.map((user, i) => (
          <Box
            key={user.id}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: i < users.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {user.email}
              </Typography>
              {user.mustChangePassword && (
                <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                  Deve trocar senha
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
                <Chip
                  label={user.role}
                  size="small"
                  sx={{ textTransform: 'capitalize', borderRadius: '6px', fontSize: '0.6875rem', height: 20 }}
                />
                <StatusChip status={user.status} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              {user.status === 'pending' ? (
                <Tooltip title="Aprovar">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => onApprove(user)}
                    aria-label={`Aprovar ${user.email}`}
                  >
                    <CheckCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <IconButton
                  size="small"
                  onClick={(e) => openMenu(e.currentTarget, user)}
                  aria-label={`Ações para ${user.email}`}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Desktop table — sm+ */}
      <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Table size="small" aria-label="Tabela de usuários">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {user.email}
                    </Typography>
                    {user.mustChangePassword && (
                      <Typography variant="caption" color="warning.main">
                        Deve trocar senha
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {user.role}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={user.status} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {user.status === 'pending' ? (
                    <Tooltip title="Aprovar">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => onApprove(user)}
                        aria-label={`Aprovar ${user.email}`}
                      >
                        <CheckCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={(e) => openMenu(e.currentTarget, user)}
                      aria-label={`Ações para ${user.email}`}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {actionsMenu}
    </>
  )
}
