import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  InputAdornment,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import FlightIcon from '@mui/icons-material/Flight'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react'
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

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <Box sx={formStyles.section}>
      <Box sx={formStyles.sectionHeader}>
        <Box sx={formStyles.sectionIcon}>{icon}</Box>
        <Typography sx={formStyles.sectionTitle}>{title}</Typography>
      </Box>
      {children}
    </Box>
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
      const firstAirline = airlines.find((a) => a.active)?.code ?? ''
      setForm({ ...EMPTY, airline: firstAirline })
    }
    setCcEmailInput('')
  }, [routine, open, airlines])

  // When airlines load after the drawer opens and airline is still unset, pick the first
  useEffect(() => {
    setForm((prev) => {
      if (prev.airline) return prev
      const first = airlines.find((a) => a.active)?.code
      return first ? { ...prev, airline: first } : prev
    })
  }, [airlines])

  function set<K extends keyof CreateRoutineRequest>(key: K, value: CreateRoutineRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleChange(key: keyof CreateRoutineRequest) {
    return (e: ChangeEvent<HTMLInputElement>) => set(key, e.target.value as never)
  }

  function addCcEmail() {
    const email = ccEmailInput.trim()
    if (!email || form.ccEmails.includes(email) || form.ccEmails.length >= 10) return
    set('ccEmails', [...form.ccEmails, email])
    setCcEmailInput('')
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.name || !form.airline || !form.origin || !form.destination || !form.outboundStart || !form.outboundEnd) {
      return
    }
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

        {/* ── Header ── */}
        <Box sx={formStyles.header}>
          <Box>
            <Typography variant="h5" fontWeight={600} lineHeight={1.2}>
              {isEdit ? 'Editar rotina' : 'Nova rotina'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEdit ? 'Atualize os parâmetros de monitoramento' : 'Configure um novo monitoramento de passagem'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Fechar">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* ── Body ── */}
        <Box sx={formStyles.body}>

          {/* Rota */}
          <Section icon={<RouteOutlinedIcon sx={formStyles.sectionIcon} />} title="Rota">
            <FormField
              label="Nome da rotina"
              value={form.name}
              onChange={handleChange('name')}
              required
              size="medium"
              placeholder="Ex: Lisboa ida e volta"
              helperText="Um nome para identificar esta rotina"
            />

            <FormField
              select
              label="Companhia aérea"
              value={form.airline}
              onChange={handleChange('airline')}
              required
              size="medium"
            >
              {activeAirlines.map((a) => (
                <MenuItem key={a.code} value={a.code}>
                  {a.name}
                </MenuItem>
              ))}
            </FormField>

            <Box sx={formStyles.routeRow}>
              <FormField
                label="Origem"
                value={form.origin}
                onChange={handleChange('origin')}
                required
                size="medium"
                sx={{ flex: 1 }}
                inputProps={{
                  maxLength: 3,
                  style: { textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, fontSize: '1rem' },
                }}
                helperText="Código IATA (ex: GRU)"
              />
              <Box sx={formStyles.routeArrow}>
                <FlightIcon sx={{ fontSize: 20, transform: 'rotate(0deg)' }} />
              </Box>
              <FormField
                label="Destino"
                value={form.destination}
                onChange={handleChange('destination')}
                required
                size="medium"
                sx={{ flex: 1 }}
                inputProps={{
                  maxLength: 3,
                  style: { textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, fontSize: '1rem' },
                }}
                helperText="Código IATA (ex: LIS)"
              />
            </Box>
          </Section>

          <Divider />

          {/* Datas */}
          <Section icon={<CalendarTodayOutlinedIcon sx={formStyles.sectionIcon} />} title="Período">

            <Box sx={formStyles.dateGroup}>
              <Typography sx={formStyles.dateGroupLabel}>
                Ida <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '0.7rem' }}>obrigatório</span>
              </Typography>
              <Box sx={formStyles.row}>
                <FormField
                  label="Data de início"
                  type="date"
                  value={form.outboundStart}
                  onChange={handleChange('outboundStart')}
                  required
                  size="medium"
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <FormField
                  label="Data de fim"
                  type="date"
                  value={form.outboundEnd}
                  onChange={handleChange('outboundEnd')}
                  required
                  size="medium"
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <Box sx={formStyles.dateGroup}>
              <Typography sx={formStyles.dateGroupLabel}>
                Volta
                <Typography component="span" sx={formStyles.optionalTag}>opcional</Typography>
              </Typography>
              <Box sx={formStyles.row}>
                <FormField
                  label="Data de início"
                  type="date"
                  value={form.returnStart ?? ''}
                  onChange={(e) => set('returnStart', e.target.value || null)}
                  size="medium"
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <FormField
                  label="Data de fim"
                  type="date"
                  value={form.returnEnd ?? ''}
                  onChange={(e) => set('returnEnd', e.target.value || null)}
                  size="medium"
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </Section>

          <Divider />

          {/* Target */}
          <Section icon={<TrendingDownOutlinedIcon sx={formStyles.sectionIcon} />} title="Target de preço">

            <Box sx={formStyles.row}>
              <FormField
                label="Passageiros"
                type="number"
                value={form.passengers}
                onChange={(e) => set('passengers', Number(e.target.value))}
                required
                size="medium"
                sx={{ flex: 1, minWidth: 120 }}
                inputProps={{ min: 1, max: 9 }}
                helperText="De 1 a 9"
              />
              <FormField
                label="Margem de tolerância"
                type="number"
                value={form.margin * 100}
                onChange={(e) => set('margin', Number(e.target.value) / 100)}
                required
                size="medium"
                sx={{ flex: 1.5 }}
                inputProps={{ min: 0, max: 100, step: 1 }}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                helperText="Notifica até X% acima do target"
              />
            </Box>

            <FormField
              select
              label="Prioridade de monitoramento"
              value={form.priority}
              onChange={handleChange('priority')}
              required
              size="medium"
            >
              <MenuItem value="brl">R$ — Menor preço em reais</MenuItem>
              <MenuItem value="pts">Pontos — Menor preço em pontos</MenuItem>
              <MenuItem value="hyb">Híbrido — Menor em pontos + taxa</MenuItem>
            </FormField>

            {form.priority === 'brl' && (
              <FormField
                label="Preço alvo"
                type="number"
                value={form.targetBrl ?? ''}
                onChange={(e) => set('targetBrl', e.target.value ? Number(e.target.value) : null)}
                size="medium"
                helperText="Será notificado quando o preço atingir ou ficar abaixo deste valor"
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              />
            )}

            {form.priority === 'pts' && (
              <FormField
                label="Pontos alvo"
                type="number"
                value={form.targetPts ?? ''}
                onChange={(e) => set('targetPts', e.target.value ? Number(e.target.value) : null)}
                size="medium"
                helperText="Será notificado quando os pontos atingirem ou ficarem abaixo deste valor"
                InputProps={{ endAdornment: <InputAdornment position="end">pts</InputAdornment> }}
              />
            )}

            {form.priority === 'hyb' && (
              <Box sx={formStyles.row}>
                <FormField
                  label="Pontos alvo"
                  type="number"
                  value={form.targetHybPts ?? ''}
                  onChange={(e) => set('targetHybPts', e.target.value ? Number(e.target.value) : null)}
                  size="medium"
                  sx={{ flex: 1 }}
                  helperText="Pontos do modo híbrido"
                  InputProps={{ endAdornment: <InputAdornment position="end">pts</InputAdornment> }}
                />
                <FormField
                  label="Taxa alvo"
                  type="number"
                  value={form.targetHybBrl ?? ''}
                  onChange={(e) => set('targetHybBrl', e.target.value ? Number(e.target.value) : null)}
                  size="medium"
                  sx={{ flex: 1 }}
                  helperText="Taxa em reais do modo híbrido"
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                />
              </Box>
            )}
          </Section>

          <Divider />

          {/* Notificações */}
          <Section icon={<NotificationsNoneOutlinedIcon sx={formStyles.sectionIcon} />} title="Notificações">

            <Box sx={formStyles.row}>
              <FormField
                select
                label="Modo de notificação"
                value={form.notificationMode}
                onChange={handleChange('notificationMode')}
                required
                size="medium"
                sx={{ flex: 3 }}
              >
                <MenuItem value="alert_only">Somente alertas de target</MenuItem>
                <MenuItem value="daily_best_and_alert">Melhor do dia + alertas</MenuItem>
                <MenuItem value="end_of_period">Ao final do período</MenuItem>
              </FormField>

              <FormField
                select
                label="Frequência"
                value={form.notificationFrequency}
                onChange={handleChange('notificationFrequency')}
                required
                size="medium"
                sx={{ flex: 2 }}
              >
                <MenuItem value="hourly">Horária</MenuItem>
                <MenuItem value="daily">Diária</MenuItem>
                <MenuItem value="monthly">Mensal</MenuItem>
              </FormField>
            </Box>

            {form.notificationMode === 'end_of_period' && (
              <FormField
                label="Horário do período"
                type="time"
                value={form.endOfPeriodTime ?? ''}
                onChange={(e) => set('endOfPeriodTime', e.target.value || null)}
                required
                size="medium"
                InputLabelProps={{ shrink: true }}
                helperText="Horário em que a notificação será enviada"
                sx={{ maxWidth: 220 }}
              />
            )}

            <Box>
              <Box sx={formStyles.ccRow}>
                <FormField
                  label="Emails em cópia (CC)"
                  value={ccEmailInput}
                  onChange={(e) => setCcEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addCcEmail() }
                  }}
                  type="email"
                  size="medium"
                  placeholder="email@exemplo.com"
                  sx={{ flex: 1 }}
                  helperText={`${form.ccEmails.length} de 10 emails adicionados`}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={addCcEmail}
                          disabled={form.ccEmails.length >= 10}
                          aria-label="Adicionar email"
                          edge="end"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {form.ccEmails.length > 0 && (
                <Box sx={formStyles.chips}>
                  {form.ccEmails.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      size="small"
                      onDelete={() => set('ccEmails', form.ccEmails.filter((e) => e !== email))}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: form.isActive ? 'rgba(45, 155, 107, 0.04)' : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Rotina ativa
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {form.isActive ? 'Monitoramento em execução' : 'Monitoramento pausado'}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => set('isActive', e.target.checked)}
                  />
                }
                label=""
                sx={{ mr: 0 }}
              />
            </Box>
          </Section>

        </Box>

        <Divider />

        {/* ── Footer ── */}
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
            sx={{ minWidth: 160 }}
          >
            {isEdit ? 'Salvar alterações' : 'Criar rotina'}
          </Button>
        </Box>

      </Box>
    </Drawer>
  )
}
