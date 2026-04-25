import {
  Box,
  Typography,
  Button,
  Grid,
  Pagination,
  LinearProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import { useCallback, useEffect, useState } from 'react'
import { AppLayout } from '@atomic-components/templates/AppLayout'
import { RoutineCard } from '@atomic-components/molecules/RoutineCard'
import { RoutineForm } from '@atomic-components/organisms/RoutineForm'
import { EmptyState } from '@atomic-components/molecules/EmptyState'
import { ConfirmDialog } from '@atomic-components/molecules/ConfirmDialog'
import { RoutinesService } from '@services/RoutinesService'
import { AirlinesService } from '@services/AirlinesService'
import { toastEmitter } from '@utils/toast'
import type { Routine, CreateRoutineRequest, UpdateRoutineRequest } from '@app-types/routines'
import type { Airline } from '@app-types/airlines'
import { pageStyles } from './style'

const LIMIT = 10

export function DashboardPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Routine | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [r, a] = await Promise.all([RoutinesService.list(), AirlinesService.list()])
      setRoutines(r)
      setAirlines(a)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const paginated = routines.slice((page - 1) * LIMIT, page * LIMIT)
  const totalPages = Math.ceil(routines.length / LIMIT)

  function handleEdit(routine: Routine) {
    setEditTarget(routine)
    setFormOpen(true)
  }

  function handleNew() {
    setEditTarget(null)
    setFormOpen(true)
  }

  async function handleFormSubmit(data: CreateRoutineRequest | UpdateRoutineRequest) {
    if (editTarget) {
      const updated = await RoutinesService.update(editTarget.id, data as UpdateRoutineRequest)
      setRoutines((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      toastEmitter.success('Rotina atualizada!')
    } else {
      const created = await RoutinesService.create(data as CreateRoutineRequest)
      setRoutines((prev) => [...prev, created])
      toastEmitter.success('Rotina criada!')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await RoutinesService.remove(deleteTarget)
      setRoutines((prev) => prev.filter((r) => r.id !== deleteTarget))
      toastEmitter.success('Rotina removida.')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const updated = await (isActive
      ? RoutinesService.activate(id)
      : RoutinesService.deactivate(id))
    setRoutines((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    toastEmitter.success(isActive ? 'Rotina ativada.' : 'Rotina desativada.')
  }

  return (
    <AppLayout>
      <Box sx={pageStyles.header}>
        <Box>
          <Typography variant="h2">Minhas rotinas</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {routines.length} rotina{routines.length !== 1 ? 's' : ''} cadastrada{routines.length !== 1 ? 's' : ''}
            {' '}· limite de 10
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNew}
          disabled={routines.length >= 10}
        >
          Nova rotina
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ borderRadius: '4px', mb: 3 }} />}

      {!loading && routines.length === 0 && (
        <EmptyState
          Icon={FlightTakeoffIcon}
          title="Nenhuma rotina ainda"
          description="Crie sua primeira rotina para começar a monitorar passagens aéreas."
          actionLabel="Criar primeira rotina"
          onAction={handleNew}
        />
      )}

      {!loading && routines.length > 0 && (
        <>
          <Grid container spacing={2}>
            {paginated.map((routine) => (
              <Grid key={routine.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                <RoutineCard
                  routine={routine}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteTarget(id)}
                  onToggleActive={handleToggleActive}
                />
              </Grid>
            ))}
          </Grid>

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
        </>
      )}

      <RoutineForm
        open={formOpen}
        routine={editTarget}
        airlines={airlines}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir rotina"
        message="Tem certeza que deseja excluir esta rotina? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
