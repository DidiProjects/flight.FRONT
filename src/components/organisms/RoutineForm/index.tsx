import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  InputAdornment,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { useState, useEffect, type ChangeEvent } from 'react'
import { FormField } from '@atomic-components/molecules/FormField'
import { formStyles } from './style'
import type { Airline } from '@app-types/airlines'
import type { Routine, CreateRoutineRequest, UpdateRoutineRequest } from '@app-types/routines'

interface RoutineFormProps {
  open: boolean
  routine?: Routine | null
  airlines: Airline[]
  onClose: () => void
  onSubmit: (data: CreateRoutineRequest | UpdateRoutineRequest) => Promise<void>
}

const EMPTY: CreateRoutineRequest = {
  name: '',
  airline: '',
  origin: '',
  destination: '',
  outboundStart: '',
  outboundEnd: '',
  returnStart: null,
  returnEnd: null,
  passengers: 1,
  targetBrl: null,
  targetPts: null,
  targetHybPts: null,
  targetHybBrl: null,
  margin: 0.1,
  priority: 'brl',
  notificationMode: 'alert_only',
  notificationFrequency: 'hourly',
  endOfPeriodTime: null,
  ccEmails: [],
  isActive: true,
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="overline"
      sx={{ color: 'text.disabled', display: 'block', mb: 1.5, mt: 0.5 }}
    >
      {children}
    </Typography>
  )
}

export function RoutineForm({ open, routine, airlines, onClose, onSubmit }: RoutineFormProps) {
  const [form, setForm] = useState<CreateRoutineRequest>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [ccEmailInput, setCcEmailInput] = useState('')

  useEffect(() => {
    if (routine) {
      setForm({
        name: routine.name,
        airline: routine.airline,
        origin: routine.origin,
        destination: routine.destination,
        outboundStart: routine.outboundStart,
        outboundEnd: routine.outboundEnd,
        returnStart: routine.returnStart,
        returnEnd: routine.returnEnd,
        passengers: routine.passengers,
        targetBrl: routine.targetBrl,
        targetPts: routine.targetPts,
        targetHybPts: routine.targetHybPts,
        targetHybBrl: routine.targetHybBrl,
        margin: routine.margin,
        priority: routine.priority,
        notificationMode: routine.notificationMode,
        notificationFrequency: routine.notificationFrequency,
        endOfPeriodTime: routine.endOfPeriodTime,
        ccEmails: routine.ccEmails,
        isActive: routine.isActive,
      })
    } else {
      setForm(EMPTY)
    }
    setCcEmailInput('')
  }, [routine, open])

  function set<K extends keyof CreateRoutineRequest>(key: K, value: CreateRoutineRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTextChange(key: keyof CreateRoutineRequest) {
    return (e: ChangeEvent<HTMLInputElement>) => set(key, e.target.value as never)
  }

  function addCcEmail() {
    const email = ccEmailInput.trim()
    if (!email || form.ccEmails.includes(email) || form.ccEmails.length >= 10) return
    set('ccEmails', [...form.ccEmails, email])
    setCcEmailInput('')
  }

  function removeCcEmail(email: string) {
    set('ccEmails', form.ccEmails.filter((e) => e !== email))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const isEdit = !!routine
  const activeAirlines = airlines.filter((a) => a.active)

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={formStyles.drawer}>
      <Box component="form" onSubmit={handleSubmit} sx={formStyles.container} noValidate>

        {/* Header */}
        <Box sx={formStyles.header}>
          <Typography variant="h5" fontWeight={600}>
            {isEdit ? 'Editar rotina' : 'Nova rotina'}
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Fechar formulário">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Body */}
        <Box sx={formStyles.body}>

          {/* — Identificação — */}
          <SectionLabel>Identificação</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormField
                label="Nome da rotina"
                value={form.name}
                onChange={handleTextChange('name')}
                required
                size="medium"
                inputProps={{ 'aria-label': 'Nome da rotina' }}
              />
            </Grid>
            <Grid size={12}>
              <FormField
                select
                label="Companhia aérea"
                value={form.airline}
                onChange={handleTextChange('airline')}
                required
                size="medium"
              >
                {activeAirlines.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.name}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={6}>
              <FormField
                label="Origem (IATA)"
                value={form.origin}
                onChange={handleTextChange('origin')}
                required
                size="medium"
                inputProps={{ maxLength: 3, style: { textTransform: 'uppercase', letterSpacing: '0.12em' } }}
                helperText="Ex: GRU"
              />
            </Grid>
            <Grid size={6}>
              <FormField
                label="Destino (IATA)"
                value={form.destination}
                onChange={handleTextChange('destination')}
                required
                size="medium"
                inputProps={{ maxLength: 3, style: { textTransform: 'uppercase', letterSpacing: '0.12em' } }}
                helperText="Ex: LIS"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* — Datas — */}
          <SectionLabel>Datas</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormField
                label="Ida — início"
                type="date"
                value={form.outboundStart}
                onChange={handleTextChange('outboundStart')}
                required
                size="medium"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={6}>
              <FormField
                label="Ida — fim"
                type="date"
                value={form.outboundEnd}
                onChange={handleTextChange('outboundEnd')}
                required
                size="medium"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={6}>
              <FormField
                label="Volta — início"
                type="date"
                value={form.returnStart ?? ''}
                onChange={(e) => set('returnStart', e.target.value || null)}
                size="medium"
                InputLabelProps={{ shrink: true }}
                helperText="Opcional"
              />
            </Grid>
            <Grid size={6}>
              <FormField
                label="Volta — fim"
                type="date"
                value={form.returnEnd ?? ''}
                onChange={(e) => set('returnEnd', e.target.value || null)}
                size="medium"
                InputLabelProps={{ shrink: true }}
                helperText="Opcional"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* — Monitoramento — */}
          <SectionLabel>Monitoramento</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormField
                label="Passageiros"
                type="number"
                value={form.passengers}
                onChange={(e) => set('passengers', Number(e.target.value))}
                required
                size="medium"
                inputProps={{ min: 1, max: 9 }}
              />
            </Grid>
            <Grid size={6}>
              <FormField
                label="Margem"
                type="number"
                value={form.margin * 100}
                onChange={(e) => set('margin', Number(e.target.value) / 100)}
                required
                size="medium"
                inputProps={{ min: 0, max: 100, step: 1 }}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
            <Grid size={12}>
              <FormField
                select
                label="Prioridade"
                value={form.priority}
                onChange={handleTextChange('priority')}
                required
                size="medium"
              >
                <MenuItem value="brl">R$ — Menor preço em reais</MenuItem>
                <MenuItem value="pts">Pontos — Menor em pontos</MenuItem>
                <MenuItem value="hyb">Híbrido — Pontos + taxa</MenuItem>
              </FormField>
            </Grid>

            {form.priority === 'brl' && (
              <Grid size={12}>
                <FormField
                  label="Target (R$)"
                  type="number"
                  value={form.targetBrl ?? ''}
                  onChange={(e) => set('targetBrl', e.target.value ? Number(e.target.value) : null)}
                  size="medium"
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                />
              </Grid>
            )}

            {form.priority === 'pts' && (
              <Grid size={12}>
                <FormField
                  label="Target (pontos)"
                  type="number"
                  value={form.targetPts ?? ''}
                  onChange={(e) => set('targetPts', e.target.value ? Number(e.target.value) : null)}
                  size="medium"
                />
              </Grid>
            )}

            {form.priority === 'hyb' && (
              <>
                <Grid size={6}>
                  <FormField
                    label="Target (pontos)"
                    type="number"
                    value={form.targetHybPts ?? ''}
                    onChange={(e) => set('targetHybPts', e.target.value ? Number(e.target.value) : null)}
                    size="medium"
                  />
                </Grid>
                <Grid size={6}>
                  <FormField
                    label="Target (taxa R$)"
                    type="number"
                    value={form.targetHybBrl ?? ''}
                    onChange={(e) => set('targetHybBrl', e.target.value ? Number(e.target.value) : null)}
                    size="medium"
                    InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* — Notificações — */}
          <SectionLabel>Notificações</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormField
                select
                label="Modo"
                value={form.notificationMode}
                onChange={handleTextChange('notificationMode')}
                required
                size="medium"
              >
                <MenuItem value="alert_only">Somente alertas de target</MenuItem>
                <MenuItem value="daily_best_and_alert">Melhor do dia + alertas</MenuItem>
                <MenuItem value="end_of_period">Ao final do período</MenuItem>
              </FormField>
            </Grid>

            {form.notificationMode === 'end_of_period' && (
              <Grid size={12}>
                <FormField
                  label="Horário do período"
                  type="time"
                  value={form.endOfPeriodTime ?? ''}
                  onChange={(e) => set('endOfPeriodTime', e.target.value || null)}
                  required
                  size="medium"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            <Grid size={12}>
              <FormField
                select
                label="Frequência de busca"
                value={form.notificationFrequency}
                onChange={handleTextChange('notificationFrequency')}
                required
                size="medium"
              >
                <MenuItem value="hourly">A cada hora</MenuItem>
                <MenuItem value="daily">Uma vez por dia</MenuItem>
                <MenuItem value="monthly">Uma vez por mês</MenuItem>
              </FormField>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FormField
                  label="Emails adicionais (CC)"
                  value={ccEmailInput}
                  onChange={(e) => setCcEmailInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCcEmail() } }}
                  type="email"
                  size="medium"
                  placeholder="email@exemplo.com"
                  helperText={`${form.ccEmails.length}/10 emails`}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={addCcEmail}
                  disabled={form.ccEmails.length >= 10}
                  aria-label="Adicionar email"
                  sx={{ height: 56, minWidth: 48, px: 1.5, flexShrink: 0 }}
                >
                  <AddIcon />
                </Button>
              </Box>
              {form.ccEmails.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                  {form.ccEmails.map((email) => (
                    <Chip key={email} label={email} size="small" onDelete={() => removeCcEmail(email)} />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => set('isActive', e.target.checked)}
                  />
                }
                label="Rotina ativa"
                sx={{ ml: 0 }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={formStyles.footer}>
          <Button variant="outlined" onClick={onClose} disabled={loading} size="large">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isEdit ? 'Salvar alterações' : 'Criar rotina'}
          </Button>
        </Box>

      </Box>
    </Drawer>
  )
}
