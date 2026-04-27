import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Switch,
  Tooltip,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { AppLayout } from '@atomic-components/templates/AppLayout'
import { StatusChip } from '@atomic-components/atoms/StatusChip'
import { ConfirmDialog } from '@atomic-components/molecules/ConfirmDialog'
import { EmptyState } from '@atomic-components/molecules/EmptyState'
import { RoutinesService } from '@services/RoutinesService'
import { useAdminUser } from '@contexts/AdminUserContext'
import { toastEmitter } from '@utils/toast'
import type { Routine } from '@app-types/routines'

function fmtDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${String(y).slice(2)}`
}

function formatPeriod(r: Routine): string {
  const outbound = `${fmtDate(r.outboundStart)} – ${fmtDate(r.outboundEnd)}`
  if (r.returnStart && r.returnEnd) {
    return `${outbound}\nVolta: ${fmtDate(r.returnStart)} – ${fmtDate(r.returnEnd)}`
  }
  return outbound
}

function formatTarget(r: Routine): string {
  if (r.priority === 'brl') {
    return r.targetBrl != null ? `R$ ${r.targetBrl.toLocaleString('pt-BR')}` : '—'
  }
  if (r.priority === 'pts') {
    return r.targetPts != null ? `${r.targetPts.toLocaleString('pt-BR')} pts` : '—'
  }
  const pts = r.targetHybPts != null ? `${r.targetHybPts.toLocaleString('pt-BR')} pts` : ''
  const brl = r.targetHybBrl != null ? `R$ ${r.targetHybBrl.toLocaleString('pt-BR')}` : ''
  return [pts, brl].filter(Boolean).join(' + ') || '—'
}

export function AdminUserRoutinesPage() {
  const navigate = useNavigate()
  const { selectedUser } = useAdminUser()

  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadRoutines = useCallback(async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      const data = await RoutinesService.listByUser(selectedUser.id)
      setRoutines(data)
    } finally {
      setLoading(false)
    }
  }, [selectedUser])

  useEffect(() => { void loadRoutines() }, [loadRoutines])

  // ── Selection ──────────────────────────────────────────────────────────────
  const allSelected = routines.length > 0 && selected.size === routines.length
  const someSelected = selected.size > 0 && selected.size < routines.length

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(routines.map((r) => r.id)))
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Individual actions ─────────────────────────────────────────────────────
  function startAction(id: string) {
    setActionLoading((prev) => new Set([...prev, id]))
  }
  function endAction(id: string) {
    setActionLoading((prev) => { const s = new Set(prev); s.delete(id); return s })
  }

  async function handleDispatch(routine: Routine) {
    startAction(routine.id)
    try {
      await RoutinesService.dispatch(routine.id)
      toastEmitter.success(`"${routine.name}" disparada.`)
    } catch {
      toastEmitter.error('Falha ao disparar rotina.')
    } finally {
      endAction(routine.id)
    }
  }

  async function handleToggleActive(routine: Routine) {
    startAction(routine.id)
    try {
      if (routine.isActive) {
        await RoutinesService.deactivate(routine.id)
        toastEmitter.info(`"${routine.name}" pausada.`)
      } else {
        await RoutinesService.activate(routine.id)
        toastEmitter.success(`"${routine.name}" ativada.`)
      }
      void loadRoutines()
    } catch {
      toastEmitter.error('Falha ao alterar status.')
    } finally {
      endAction(routine.id)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await RoutinesService.remove(deleteTarget.id)
      toastEmitter.success(`"${deleteTarget.name}" excluída.`)
      setSelected((prev) => { const s = new Set(prev); s.delete(deleteTarget.id); return s })
      void loadRoutines()
    } catch {
      toastEmitter.error('Falha ao excluir rotina.')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  // ── Bulk actions ───────────────────────────────────────────────────────────
  async function handleBulkDispatch() {
    setBulkLoading(true)
    try {
      await Promise.all([...selected].map((id) => RoutinesService.dispatch(id)))
      toastEmitter.success(`${selected.size} rotina(s) disparada(s).`)
    } catch {
      toastEmitter.error('Falha em uma ou mais rotinas.')
    } finally {
      setBulkLoading(false)
    }
  }

  async function handleBulkActivate() {
    setBulkLoading(true)
    try {
      await Promise.all([...selected].map((id) => RoutinesService.activate(id)))
      toastEmitter.success(`${selected.size} rotina(s) ativada(s).`)
      void loadRoutines()
    } catch {
      toastEmitter.error('Falha em uma ou mais rotinas.')
    } finally {
      setBulkLoading(false)
    }
  }

  async function handleBulkDeactivate() {
    setBulkLoading(true)
    try {
      await Promise.all([...selected].map((id) => RoutinesService.deactivate(id)))
      toastEmitter.info(`${selected.size} rotina(s) pausada(s).`)
      void loadRoutines()
    } catch {
      toastEmitter.error('Falha em uma ou mais rotinas.')
    } finally {
      setBulkLoading(false)
    }
  }

  async function handleBulkDelete() {
    setDeleteLoading(true)
    try {
      const ids = [...selected]
      await Promise.all(ids.map((id) => RoutinesService.remove(id)))
      toastEmitter.success(`${ids.length} rotina(s) excluída(s).`)
      setSelected(new Set())
      setBulkDeleteOpen(false)
      void loadRoutines()
    } catch {
      toastEmitter.error('Falha ao excluir rotinas.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!selectedUser) return <Navigate to="/admin" replace />

  const userLabel = [selectedUser.name, selectedUser.email].filter(Boolean).join(' — ')

  return (
    <AppLayout>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Tooltip title="Voltar para usuários">
          <IconButton size="small" onClick={() => navigate('/admin')} aria-label="Voltar">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h2">Rotinas do usuário</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {userLabel}
          </Typography>
        </Box>
        <Chip
          label={`${routines.length} rotina${routines.length !== 1 ? 's' : ''}`}
          size="small"
          sx={{ borderRadius: '6px', flexShrink: 0 }}
        />
      </Box>

      {loading && <LinearProgress sx={{ borderRadius: '4px', mb: 2 }} />}

      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            px: 2,
            py: 1.25,
            mb: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="body2" fontWeight={500} sx={{ flex: 1, minWidth: 100 }}>
            {selected.size} selecionada{selected.size !== 1 ? 's' : ''}
          </Typography>
          <Tooltip title="Disparar agora">
            <span>
              <Button
                size="small"
                startIcon={<PlayArrowIcon fontSize="small" />}
                onClick={handleBulkDispatch}
                disabled={bulkLoading}
                variant="outlined"
              >
                Disparar
              </Button>
            </span>
          </Tooltip>
          <Button
            size="small"
            startIcon={<PlayArrowIcon fontSize="small" />}
            onClick={handleBulkActivate}
            disabled={bulkLoading}
            variant="outlined"
            color="success"
          >
            Ativar
          </Button>
          <Button
            size="small"
            onClick={handleBulkDeactivate}
            disabled={bulkLoading}
            variant="outlined"
            color="warning"
          >
            Pausar
          </Button>
          <Button
            size="small"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={() => setBulkDeleteOpen(true)}
            disabled={bulkLoading}
            variant="outlined"
            color="error"
          >
            Excluir
          </Button>
        </Box>
      )}

      {/* ── Content ── */}
      {!loading && routines.length === 0 ? (
        <EmptyState
          Icon={RouteOutlinedIcon}
          title="Nenhuma rotina"
          description="Este usuário ainda não tem rotinas criadas."
        />
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small" aria-label="Rotinas do usuário">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      inputProps={{ 'aria-label': 'Selecionar todas' }}
                    />
                  </TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Rota</TableCell>
                  <TableCell>Período</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Ativo</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routines.map((routine) => {
                  const isSelected = selected.has(routine.id)
                  const isActing = actionLoading.has(routine.id)
                  const period = formatPeriod(routine)

                  return (
                    <TableRow
                      key={routine.id}
                      selected={isSelected}
                      hover
                      sx={{ opacity: isActing ? 0.6 : 1, transition: 'opacity 0.15s' }}
                    >
                      <TableCell
                        padding="checkbox"
                        onClick={() => toggleOne(routine.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          inputProps={{ 'aria-label': `Selecionar ${routine.name}` }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {routine.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {routine.airline} · {routine.passengers} pax
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 600 }}
                        >
                          {routine.origin.toUpperCase()} → {routine.destination.toUpperCase()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {period.includes('\n') ? (
                          <>
                            <Typography variant="caption" display="block">{period.split('\n')[0]}</Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {period.split('\n')[1]}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption">{period}</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusChip status={routine.isActive ? 'active' : 'paused'} />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{formatTarget(routine)}</Typography>
                      </TableCell>

                      <TableCell>
                        <Tooltip title={routine.isActive ? 'Pausar' : 'Ativar'}>
                          <Switch
                            size="small"
                            checked={routine.isActive}
                            disabled={isActing}
                            onChange={() => handleToggleActive(routine)}
                            inputProps={{ 'aria-label': routine.isActive ? 'Pausar' : 'Ativar' }}
                          />
                        </Tooltip>
                      </TableCell>

                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Disparar agora">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleDispatch(routine)}
                              disabled={isActing}
                              aria-label="Disparar"
                            >
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(routine)}
                              disabled={isActing}
                              aria-label="Excluir"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ── Single delete confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir rotina"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Bulk delete confirm ── */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Excluir rotinas selecionadas"
        message={`Tem certeza que deseja excluir ${selected.size} rotina(s)? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir todas"
        loading={deleteLoading}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </AppLayout>
  )
}
