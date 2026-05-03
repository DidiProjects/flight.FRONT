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
import { useState, useEffect, useRef, type ChangeEvent, type ReactNode } from 'react'
import { FormField } from '@atomic-components/molecules/FormField'
import { useAuth } from '@hooks/useAuth'
import { useZodForm } from '@hooks/useZodForm'
import { routineSchema } from '@utils/schemas'
import type { TextFieldProps } from '@mui/material'

function DebouncedField({ value, onChange, delay = 300, ...props }: TextFieldProps & { delay?: number }) {
  const [local, setLocal] = useState(value ?? '')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setLocal(value ?? '')
  }, [value])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setLocal(e.target.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange?.(e), delay)
  }

  return <FormField {...props} value={local} onChange={handleChange} />
}
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
  currency: 'BRL',
  targetCash: null,
  targetPts: null,
  targetHybPts: null,
  targetHybCash: null,
  margin: 0.1,
  priority: 'cash',
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
  const { user } = useAuth()
  const userEmail = user?.email
  const [form, setForm] = useState<CreateRoutineRequest>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [ccEmailInput, setCcEmailInput] = useState('')
  const { errors, validate, touchField, reset } = useZodForm<CreateRoutineRequest>(routineSchema, 0)

  useEffect(() => {
    reset()
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
        currency: routine.currency,
        targetCash: routine.targetCash,
        targetPts: routine.targetPts,
        targetHybPts: routine.targetHybPts,
        targetHybCash: routine.targetHybCash,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine, open, airlines])

  // When airlines load after the drawer opens and airline is still unset, pick the first
  useEffect(() => {
    setForm((prev) => {
      if (prev.airline) return prev
      const first = airlines.find((a) => a.active)?.code
      return first ? { ...prev, airline: first } : prev
    })
  }, [airlines])

  // Sync currency and priority when airline changes
  useEffect(() => {
    if (!selectedAirline) return
    const supported = (
      (selectedAirline.has_brl ? ['cash'] : []) as Array<'cash' | 'pts' | 'hyb'>
    ).concat(selectedAirline.has_pts ? ['pts'] : []).concat(selectedAirline.has_hyb ? ['hyb'] : [])
    setForm((prev) => ({
      ...prev,
      currency: selectedAirline.currency,
      priority: supported.length > 0 && !supported.includes(prev.priority as 'cash' | 'pts' | 'hyb')
        ? supported[0]
        : prev.priority,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.airline])

  function set<K extends keyof CreateRoutineRequest>(key: K, value: CreateRoutineRequest[K]) {
    const updated = { ...form, [key]: value }
    setForm(updated)
    touchField(key, updated)
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
    if (!validate(form)) return
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
  const selectedAirline = airlines.find((a) => a.code === form.airline)

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
            <DebouncedField
              label="Nome da rotina"
              value={form.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name ?? 'Um nome para identificar esta rotina'}
              required
              size="medium"
              placeholder="Ex: Lisboa ida e volta"
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
              <DebouncedField
                label="Origem"
                value={form.origin}
                onChange={handleChange('origin')}
                error={!!errors.origin}
                helperText={errors.origin ?? 'Código IATA (ex: GRU)'}
                required
                size="medium"
                sx={{ flex: 1 }}
                inputProps={{
                  maxLength: 3,
                  style: { textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, fontSize: '1rem' },
                }}
              />
              <Box sx={formStyles.routeArrow}>
                <FlightIcon sx={{ fontSize: 20, transform: 'rotate(0deg)' }} />
              </Box>
              <DebouncedField
                label="Destino"
                value={form.destination}
                onChange={handleChange('destination')}
                error={!!errors.destination}
                helperText={errors.destination ?? 'Código IATA (ex: LIS)'}
                required
                size="medium"
                sx={{ flex: 1 }}
                inputProps={{
                  maxLength: 3,
                  style: { textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, fontSize: '1rem' },
                }}
              />
            </Box>
          </Section>

          <Divider />

          {/* Datas */}
          <Section icon={<CalendarTodayOutlinedIcon sx={formStyles.sectionIcon} />} title="Períodos">

            <Box sx={formStyles.dateGroup}>
              <Typography sx={formStyles.dateGroupLabel} style={{ marginBottom: '0.5rem' }}>
                Disponibilidade para ida <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '0.7rem' }}>obrigatório</span>
              </Typography>
              <Box sx={formStyles.row}>
                <FormField
                  label="Data de início"
                  type="date"
                  value={form.outboundStart}
                  onChange={handleChange('outboundStart')}
                  error={!!errors.outboundStart}
                  helperText={errors.outboundStart}
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
                  error={!!errors.outboundEnd}
                  helperText={errors.outboundEnd}
                  required
                  size="medium"
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <Box sx={formStyles.dateGroup}>
              <Typography sx={formStyles.dateGroupLabel} style={{ marginBottom: '0.5rem' }}>
                Disponibilidade para volta
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
                  error={!!errors.returnEnd}
                  helperText={errors.returnEnd}
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
                error={!!errors.passengers}
                helperText={errors.passengers ?? 'De 1 a 9'}
                required
                size="medium"
                sx={{ flex: 1, minWidth: 120 }}
                inputProps={{ min: 1, max: 9 }}
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
              {selectedAirline?.has_brl && <MenuItem value="cash">Dinheiro — Menor preço em moeda</MenuItem>}
              {selectedAirline?.has_pts && <MenuItem value="pts">Pontos — Menor preço em pontos</MenuItem>}
              {selectedAirline?.has_hyb && <MenuItem value="hyb">Híbrido — Menor em pontos + dinheiro</MenuItem>}
            </FormField>

            {form.priority === 'cash' && (
              <FormField
                label="Preço alvo"
                type="number"
                value={form.targetCash ?? ''}
                onChange={(e) => set('targetCash', e.target.value ? Number(e.target.value) : null)}
                size="medium"
                required
                error={!!errors.targetCash}
                helperText={errors.targetCash ?? 'Será notificado quando o preço atingir ou ficar abaixo deste valor'}
                InputProps={{ startAdornment: <InputAdornment position="start">{form.currency}</InputAdornment> }}
              />
            )}

            {form.priority === 'pts' && (
              <FormField
                label="Pontos alvo"
                type="number"
                value={form.targetPts ?? ''}
                onChange={(e) => set('targetPts', e.target.value ? Number(e.target.value) : null)}
                size="medium"
                required
                error={!!errors.targetPts}
                helperText={errors.targetPts ?? 'Será notificado quando os pontos atingirem ou ficarem abaixo deste valor'}
                InputProps={{ endAdornment: <InputAdornment position="end">pts</InputAdornment> }}
              />
            )}

            {form.priority === 'hyb' && (
              <>
                <Box sx={formStyles.row}>
                  <FormField
                    label="Pontos alvo"
                    type="number"
                    value={form.targetHybPts ?? ''}
                    onChange={(e) => set('targetHybPts', e.target.value ? Number(e.target.value) : null)}
                    size="medium"
                    sx={{ flex: 1 }}
                    required
                    error={!!errors.targetHybPts}
                    helperText={errors.targetHybPts ?? 'Pontos do modo híbrido'}
                    InputProps={{ endAdornment: <InputAdornment position="end">pts</InputAdornment> }}
                  />
                  <FormField
                    label="Taxa alvo"
                    type="number"
                    value={form.targetHybCash ?? ''}
                    onChange={(e) => set('targetHybCash', e.target.value ? Number(e.target.value) : null)}
                    size="medium"
                    sx={{ flex: 1 }}
                    required
                    error={!!errors.targetHybCash}
                    helperText={errors.targetHybCash ?? `Taxa em ${form.currency} do modo híbrido`}
                    InputProps={{ startAdornment: <InputAdornment position="start">{form.currency}</InputAdornment> }}
                  />
                </Box>
              </>
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
                <MenuItem value="alert_only">Melhor preço alcançado ou superado</MenuItem>
                <MenuItem value="daily_best_and_alert">Melhor do dia + melhor preço</MenuItem>
                <MenuItem value="end_of_period">Em horário agendado</MenuItem>
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

            {userEmail && (
              <FormField
                label="Seu email (sempre notificado)"
                value={userEmail}
                size="medium"
                disabled
                helperText="Você sempre receberá as notificações desta rotina"
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
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            size="large"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ minWidth: { sm: 160 }, width: { xs: '100%', sm: 'auto' } }}
          >
            {isEdit ? 'Salvar alterações' : 'Criar rotina'}
          </Button>
        </Box>

      </Box>
    </Drawer>
  )
}
