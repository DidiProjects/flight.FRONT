import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FlightIcon from '@mui/icons-material/Flight'
import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@atomic-components/templates/AppLayout'
import { AdminNav } from '@atomic-components/molecules/AdminNav'
import { EmptyState } from '@atomic-components/molecules/EmptyState'
import { ConfirmDialog } from '@atomic-components/molecules/ConfirmDialog'
import { FormField } from '@atomic-components/molecules/FormField'
import { AirlinesService } from '@services/AirlinesService'
import { toastEmitter } from '@utils/toast'
import type { Airline } from '@app-types/airlines'
import { pageStyles } from './style'

export function AdminAirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())

  const [createOpen, setCreateOpen] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newName, setNewName] = useState('')
  const [newCurrency, setNewCurrency] = useState('BRL')
  const [createLoading, setCreateLoading] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Airline | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setAirlines(await AirlinesService.listAdmin())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  function startAction(code: string) {
    setActionLoading((prev) => new Set([...prev, code]))
  }
  function endAction(code: string) {
    setActionLoading((prev) => { const s = new Set(prev); s.delete(code); return s })
  }
  function updateRow(updated: Airline) {
    setAirlines((prev) => prev.map((a) => (a.code === updated.code ? updated : a)))
  }

  async function handleToggleActive(airline: Airline) {
    startAction(airline.code)
    try {
      const updated = await (airline.active
        ? AirlinesService.deactivate(airline.code)
        : AirlinesService.activate(airline.code))
      updateRow(updated)
      toastEmitter.success(updated.active ? `"${updated.name}" ativada.` : `"${updated.name}" desativada.`)
    } finally {
      endAction(airline.code)
    }
  }

  async function handleToggleFare(airline: Airline, fare: 'hasBrl' | 'hasPts' | 'hasHyb') {
    startAction(airline.code)
    try {
      const updated = await AirlinesService.updateFareTypes(airline.code, {
        hasBrl: fare === 'hasBrl' ? !airline.has_brl : airline.has_brl,
        hasPts: fare === 'hasPts' ? !airline.has_pts : airline.has_pts,
        hasHyb: fare === 'hasHyb' ? !airline.has_hyb : airline.has_hyb,
      })
      updateRow(updated)
    } finally {
      endAction(airline.code)
    }
  }

  function closeCreate() {
    setCreateOpen(false)
    setNewCode('')
    setNewName('')
    setNewCurrency('BRL')
  }

  async function handleCreate() {
    if (!newCode.trim() || !newName.trim() || !newCurrency.trim()) return
    setCreateLoading(true)
    try {
      const created = await AirlinesService.create({ code: newCode.trim().toLowerCase(), name: newName.trim(), currency: newCurrency.trim().toUpperCase() })
      setAirlines((prev) => [...prev, created])
      toastEmitter.success(`"${created.name}" criada.`)
      closeCreate()
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await AirlinesService.remove(deleteTarget.code)
      setAirlines((prev) => prev.filter((a) => a.code !== deleteTarget.code))
      toastEmitter.success(`"${deleteTarget.name}" removida.`)
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <AppLayout>
      <Box sx={pageStyles.header}>
        <Box>
          <Typography variant="h2">Companhias aéreas</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {airlines.length} companhia{airlines.length !== 1 ? 's' : ''} cadastrada{airlines.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Nova companhia
        </Button>
      </Box>

      <AdminNav />

      {loading && <LinearProgress sx={{ borderRadius: '4px', mb: 3 }} />}

      {!loading && airlines.length === 0 ? (
        <EmptyState
          Icon={FlightIcon}
          title="Nenhuma companhia cadastrada"
          description="Adicione a primeira companhia aérea para começar."
          actionLabel="Nova companhia"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Companhia</TableCell>
                  <TableCell>Fares</TableCell>
                  <TableCell>Ativa</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {airlines.map((airline) => {
                  const acting = actionLoading.has(airline.code)
                  return (
                    <TableRow key={airline.code} hover sx={{ opacity: acting ? 0.6 : 1, transition: 'opacity 0.15s' }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{airline.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {airline.code}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          {(
                            [
                              { key: 'hasBrl', label: 'BRL', active: airline.has_brl },
                              { key: 'hasPts', label: 'PTS', active: airline.has_pts },
                              { key: 'hasHyb', label: 'HYB', active: airline.has_hyb },
                            ] as const
                          ).map(({ key, label, active }) => (
                            <Tooltip key={key} title={active ? `Desativar ${label}` : `Ativar ${label}`}>
                              <Chip
                                label={label}
                                size="small"
                                color={active ? 'primary' : 'default'}
                                variant={active ? 'filled' : 'outlined'}
                                onClick={() => handleToggleFare(airline, key)}
                                disabled={acting}
                                sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Tooltip title={airline.active ? 'Desativar' : 'Ativar'}>
                          <Switch
                            size="small"
                            checked={airline.active}
                            disabled={acting}
                            onChange={() => handleToggleActive(airline)}
                            inputProps={{ 'aria-label': airline.active ? 'Desativar' : 'Ativar' }}
                          />
                        </Tooltip>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Excluir">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(airline)}
                              disabled={acting}
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

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={closeCreate} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 500, fontSize: '1rem' }}>Nova companhia</DialogTitle>
        <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormField
            label="Código"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            required
            autoFocus
            inputProps={{ maxLength: 20, style: { textTransform: 'lowercase' } }}
            helperText='Identificador único (ex: "latam", "azul")'
          />
          <FormField
            label="Nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            helperText='Nome de exibição (ex: "LATAM Airlines")'
          />
          <FormField
            label="Moeda"
            value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value)}
            required
            inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
            helperText='Código ISO 4217 (ex: "BRL", "USD", "EUR")'
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={closeCreate} disabled={createLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createLoading || !newCode.trim() || !newName.trim() || !newCurrency.trim()}
            startIcon={createLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir companhia"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        warningMessage="Todas as rotinas de monitoramento vinculadas a esta companhia também serão removidas."
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
