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
  FormHelperText,
  Collapse,
  Switch,
  Chip,
  InputAdornment,
  Checkbox,
  Alert,
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import FlightIcon from '@mui/icons-material/Flight'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { keyframes } from '@mui/system'
import { useState, useEffect, useRef, useMemo, type ChangeEvent, type ReactNode } from 'react'
import type { TextFieldProps } from '@mui/material'
import { FormField } from '@atomic-components/molecules/FormField'
import { DateRangePickerField } from '@atomic-components/molecules/DateRangePickerField'
import { AirportAutocomplete } from '@atomic-components/molecules/AirportAutocomplete'
import { useAuth } from '@hooks/useAuth'
import { useZodForm } from '@hooks/useZodForm'
import { useCoverage } from '@hooks/useCoverage'
import { routineSchema } from '@utils/schemas'
import { formStyles } from './style'
import type { Airline } from '@app-types/airlines'
import { toastEmitter } from '@utils/toast'
import type { Routine, CreateTripInput } from '@app-types/routines'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`
const anim = (delay: number) => ({
  animation: `${fadeIn} 1s ease both`,
  animationDelay: `${delay}ms`,
})

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

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
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

function FareBadge({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: '0.6rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        px: 0.75,
        py: 0.2,
        borderRadius: 0.75,
        backgroundColor: 'action.selected',
        color: 'text.secondary',
        lineHeight: 1.5,
      }}
    >
      {label}
    </Box>
  )
}

type CoverageStatus = 'covered' | 'uncovered'

function getAirlineCoverageStatus(
  airlineCode: string,
  origin: string,
  destination: string,
  coverageIndex: Map<string, Set<string>>,
): CoverageStatus {
  if (!origin && !destination) return 'covered'
  const covered = coverageIndex.get(airlineCode) ?? new Set<string>()
  const hasOrigin = !origin || covered.has(origin.toUpperCase())
  const hasDest   = !destination || covered.has(destination.toUpperCase())
  return hasOrigin && hasDest ? 'covered' : 'uncovered'
}

const coverageOrder: Record<CoverageStatus, number> = { covered: 0, uncovered: 1 }

interface RoutineFormProps {
  open: boolean
  routine?: Routine | null
  airlines: Airline[]
  onClose: () => void
  onSubmit: (data: CreateTripInput) => Promise<void>
}

const EMPTY: CreateTripInput = {
  name: '',
  airlines: [],
  origin: '',
  destination: '',
  outboundStart: '',
  outboundEnd: '',
  returnStart: null,
  returnEnd: null,
  passengers: 1,
  targetCash: null,
  targetPts: null,
  targetHybPts: null,
  targetHybCash: null,
  margin: 0.1,
  priority: 'cash',
  notificationModes: ['scheduled'],
  notificationFrequency: 'hourly',
  scheduledTime: '20:00',
  ccEmails: [],
  isActive: true,
}

export function RoutineForm({ open, routine, airlines, onClose, onSubmit }: RoutineFormProps) {
  const { user } = useAuth()
  const userEmail = user?.email
  const [form, setForm] = useState<CreateTripInput>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [ccEmailInput, setCcEmailInput] = useState('')
  const { errors, validate, touchField, reset } = useZodForm<CreateTripInput>(routineSchema, 0)

  const activeAirlines = airlines.filter((a) => a.active)
  const airlineCodes = useMemo(() => activeAirlines.map((a) => a.code), [activeAirlines])
  const { airports, coverageIndex, loading: coverageLoading } = useCoverage(airlineCodes)

  useEffect(() => {
    reset()
    if (routine) {
      setForm({
        name: routine.name,
        airlines: routine.airlines,
        origin: routine.origin,
        destination: routine.destination,
        outboundStart: routine.outboundStart,
        outboundEnd: routine.outboundEnd,
        returnStart: null,
        returnEnd: null,
        passengers: routine.passengers,
        targetCash: routine.targetCash,
        targetPts: routine.targetPts,
        targetHybPts: routine.targetHybPts,
        targetHybCash: routine.targetHybCash,
        margin: routine.margin,
        priority: routine.priority,
        notificationModes: routine.notificationModes,
        notificationFrequency: routine.notificationFrequency,
        scheduledTime: routine.scheduledTime ?? '20:00',
        ccEmails: routine.ccEmails,
        isActive: routine.isActive,
      })
    } else {
      setForm({ ...EMPTY })
    }
    setCcEmailInput('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine, open, airlines])

  useEffect(() => {
    const currentAirlines = airlines.filter((a) => form.airlines.includes(a.code))
    if (currentAirlines.length === 0) return
    const supportsCash = currentAirlines.some((a) => a.has_cash)
    const supportsPts  = currentAirlines.some((a) => a.has_pts)
    const supportsHyb  = currentAirlines.some((a) => a.has_hyb)
    const isSupported = (p: 'cash' | 'pts' | 'hyb') =>
      (p === 'cash' && supportsCash) || (p === 'pts' && supportsPts) || (p === 'hyb' && supportsHyb)
    if (!isSupported(form.priority as 'cash' | 'pts' | 'hyb')) {
      const fallback: 'cash' | 'pts' | 'hyb' = supportsCash ? 'cash' : supportsPts ? 'pts' : 'hyb'
      setForm((prev) => ({ ...prev, priority: fallback }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.airlines])

  function set<K extends keyof CreateTripInput>(key: K, value: CreateTripInput[K]) {
    const updated = { ...form, [key]: value }
    setForm(updated)
    touchField(key, updated)
  }

  function handleChange(key: Exclude<keyof CreateTripInput, 'notificationModes'>) {
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
    } catch (err) {
      toastEmitter.error(err instanceof Error ? err.message : 'Falha ao salvar rotina.')
    } finally {
      setLoading(false)
    }
  }

  // Sorted airlines for the Select — full coverage first, then partial, then none
  const sortedAirlines = useMemo(() => {
    if (!form.origin && !form.destination) return activeAirlines
    return [...activeAirlines].sort((a, b) => {
      const statusA = getAirlineCoverageStatus(a.code, form.origin, form.destination, coverageIndex)
      const statusB = getAirlineCoverageStatus(b.code, form.origin, form.destination, coverageIndex)
      return coverageOrder[statusA] - coverageOrder[statusB]
    })
  }, [activeAirlines, form.origin, form.destination, coverageIndex])

  const isEdit = !!routine
  const selectedAirlines = airlines.filter((a) => form.airlines.includes(a.code))
  // Moeda do target, em ordem: (1) moeda fixa da companhia (airlines.currency), quando definida;
  // (2) moeda do mercado da ORIGEM (airports.currency do trajeto).
  // Vazia quando ainda não há moeda resolvível — nesse caso nada é exibido no lugar.
  const derivedCurrency =
    selectedAirlines.find((a) => a.currency)?.currency ??
    airports.find((a) => a.code === form.origin)?.currency ??
    ''
  const hasCash = selectedAirlines.some((a) => a.has_cash)
  const hasPts  = selectedAirlines.some((a) => a.has_pts)
  const hasHyb  = selectedAirlines.some((a) => a.has_hyb)

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={formStyles.drawer}>
      <Box component="form" onSubmit={handleSubmit} sx={formStyles.container} noValidate>

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

        <Box sx={formStyles.body}>

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

            <Box sx={formStyles.routeRow}>
              <Box sx={{ flex: 1 }}>
                <AirportAutocomplete
                  label="Origem"
                  value={form.origin}
                  airports={airports}
                  onChange={(code) => set('origin', code.toUpperCase())}
                  error={!!errors.origin}
                  helperText={coverageLoading ? 'Carregando aeroportos…' : (errors.origin ?? 'Código IATA (ex: GRU)')}
                  required
                  size="medium"
                />
              </Box>
              <Box sx={formStyles.routeArrow}>
                <FlightIcon sx={{ fontSize: 20, transform: 'rotate(0deg)' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <AirportAutocomplete
                  label="Destino"
                  value={form.destination}
                  airports={airports}
                  onChange={(code) => set('destination', code.toUpperCase())}
                  error={!!errors.destination}
                  helperText={coverageLoading ? 'Carregando aeroportos…' : (errors.destination ?? 'Código IATA (ex: LIS)')}
                  required
                  size="medium"
                />
              </Box>
            </Box>

            <FormField
              select
              label="Companhia(s) aérea(s)"
              value={form.airlines}
              onChange={(e) => {
                const val = e.target.value
                set('airlines', typeof val === 'string' ? val.split(',') : val as string[])
              }}
              required
              size="medium"
              error={!!errors.airlines}
              helperText={errors.airlines ?? 'Selecione uma ou mais companhias'}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((code) => (
                      <Chip key={code} label={code.toUpperCase()} size="small" />
                    ))}
                  </Box>
                ),
              }}
            >
              {sortedAirlines.map((a) => {
                const status = getAirlineCoverageStatus(a.code, form.origin, form.destination, coverageIndex)
                const isSelected = form.airlines.includes(a.code)
                // Empresa sem cobertura no trajeto fica desabilitada (não dá pra raspar).
                // Mas se já estava selecionada, mantemos habilitada para permitir desmarcar.
                const disabled = status === 'uncovered' && !isSelected && !coverageLoading
                return (
                  <MenuItem
                    key={a.code}
                    value={a.code}
                    disabled={disabled}
                    sx={status === 'uncovered' && !isSelected ? { opacity: 0.5 } : {}}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">{a.name}</Typography>
                        {status === 'uncovered' && !coverageLoading && (
                          <Typography variant="caption" color="text.disabled">
                            Sem cobertura para {form.origin || '—'}→{form.destination || '—'}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                        {a.has_cash && <FareBadge label="cash" />}
                        {a.has_pts  && <FareBadge label="pts" />}
                        {a.has_hyb  && <FareBadge label="hyb" />}
                      </Box>
                    </Box>
                  </MenuItem>
                )
              })}
            </FormField>
          </Section>

          <Divider />

          <Section icon={<CalendarTodayOutlinedIcon sx={formStyles.sectionIcon} />} title="Períodos">
            <Box sx={formStyles.dateGroup}>
              <Typography sx={formStyles.dateGroupLabel}>
                Ida{' '}
                <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '0.7rem' }}>obrigatório</span>
              </Typography>
              <DateRangePickerField
                label="Período de ida"
                startDate={form.outboundStart}
                endDate={form.outboundEnd}
                onChange={(start, end) => {
                  const updated: CreateTripInput = { ...form, outboundStart: start, outboundEnd: end }
                  setForm(updated)
                  touchField('outboundStart', updated)
                  touchField('outboundEnd', updated)
                }}
                required
                maxRangeDays={30}
                error={!!(errors.outboundStart || errors.outboundEnd)}
                helperText={errors.outboundStart || errors.outboundEnd}
              />
            </Box>

            {!isEdit && (
              <Box sx={formStyles.dateGroup}>
                <Typography sx={formStyles.dateGroupLabel}>
                  Volta
                  <Typography component="span" sx={formStyles.optionalTag}>opcional · cria uma 2ª rotina</Typography>
                </Typography>
                <DateRangePickerField
                  label="Período de volta"
                  startDate={form.returnStart}
                  endDate={form.returnEnd}
                  onChange={(start, end) => {
                    const updated: CreateTripInput = { ...form, returnStart: start || null, returnEnd: end || null }
                    setForm(updated)
                    touchField('returnStart', updated)
                    touchField('returnEnd', updated)
                  }}
                  clearable
                  maxRangeDays={30}
                  error={!!errors.returnEnd}
                  helperText={errors.returnEnd}
                />
              </Box>
            )}
          </Section>

          <Divider />

          <Section icon={<NotificationsNoneOutlinedIcon sx={formStyles.sectionIcon} />} title="Notificações">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <FormControlLabel
                sx={{ alignItems: 'flex-start' }}
                control={
                  <Checkbox
                    sx={{ pt: 0.5, color: errors.notificationModes ? 'error.main' : undefined }}
                    color={errors.notificationModes ? 'error' : 'primary'}
                    checked={form.notificationModes.includes('target')}
                    onChange={() => {
                      const has = form.notificationModes.includes('target')
                      const next = has
                        ? form.notificationModes.filter((m) => m !== 'target') as CreateTripInput['notificationModes']
                        : [...form.notificationModes, 'target'] as CreateTripInput['notificationModes']
                      set('notificationModes', next)
                    }}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500} color={errors.notificationModes ? 'error' : 'text.primary'}>
                    Preço alvo: Sempre que uma passagem com um valor próximo ao alvo for encontrada ou atualizada, você será notificado
                  </Typography>
                }
              />
              <Collapse in={form.notificationModes.includes('target')} unmountOnExit>
                <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
                  <Alert severity="info" variant="outlined" sx={{ ...anim(0), py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Quando você recebe o e-mail de preço alvo
                    </Typography>
                    <Typography component="ul" variant="caption" sx={{ m: 0, pl: 2, color: 'text.secondary', '& li': { mb: 0.25 } }}>
                      <li>Assim que uma passagem é encontrada no seu alvo — ou até <strong>10% acima</strong> dele (margem de tolerância).</li>
                      <li>Considera o <strong>menor preço</strong> entre as datas e companhias monitoradas.</li>
                      <li>No máximo <strong>1 e-mail a cada 24&nbsp;h</strong>, enquanto a rotina estiver ativa.</li>
                    </Typography>
                  </Alert>
                  <Box sx={anim(0)}>
                    <FormField
                      label="Passageiros"
                      type="number"
                      value={form.passengers}
                      onChange={(e) => set('passengers', Number(e.target.value))}
                      error={!!errors.passengers}
                      helperText={errors.passengers ?? 'De 1 a 9'}
                      required
                      size="medium"
                      inputProps={{ min: 1, max: 9 }}
                    />
                  </Box>
                  <Box sx={anim(70)}>
                    <FormField
                      select
                      label="Prioridade de monitoramento"
                      value={form.priority}
                      onChange={handleChange('priority')}
                      required
                      size="medium"
                    >
                      {(hasCash || !selectedAirlines.length) && <MenuItem value="cash">Dinheiro - Menor preço em moeda</MenuItem>}
                      {(hasPts  || !selectedAirlines.length) && <MenuItem value="pts">Pontos - Menor preço em pontos</MenuItem>}
                      {(hasHyb  || !selectedAirlines.length) && <MenuItem value="hyb">Híbrido - Menor em pontos + dinheiro</MenuItem>}
                    </FormField>
                  </Box>
                  {form.priority === 'cash' && (
                    <Box sx={anim(140)}>
                      <FormField
                        label="Preço alvo"
                        type="number"
                        value={form.targetCash ?? ''}
                        onChange={(e) => set('targetCash', e.target.value ? Number(e.target.value) : null)}
                        size="medium"
                        required
                        error={!!errors.targetCash}
                        helperText={errors.targetCash ?? 'Notifica quando o preço atingir ou ficar abaixo deste valor'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography variant="body2" sx={{ fontWeight: 500, mr: 0.5, color: 'text.secondary' }}>
                                {derivedCurrency}
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  )}
                  {form.priority === 'pts' && (
                    <Box sx={anim(140)}>
                      <FormField
                        label="Pontos alvo"
                        type="number"
                        value={form.targetPts ?? ''}
                        onChange={(e) => set('targetPts', e.target.value ? Number(e.target.value) : null)}
                        size="medium"
                        required
                        error={!!errors.targetPts}
                        helperText={errors.targetPts ?? 'Notifica quando os pontos atingirem ou ficarem abaixo deste valor'}
                        InputProps={{ endAdornment: <InputAdornment position="end">pts</InputAdornment> }}
                      />
                    </Box>
                  )}
                  {form.priority === 'hyb' && (
                    <Box sx={anim(140)}>
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
                        helperText={errors.targetHybCash ?? (derivedCurrency ? `Taxa em ${derivedCurrency} do modo híbrido` : 'Taxa do modo híbrido')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography variant="body2" sx={{ fontWeight: 500, mr: 0.5, color: 'text.secondary' }}>
                                {derivedCurrency}
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    </Box>
                  )}
                  <Box sx={anim(210)}>
                    <FormField
                      select
                      label="Frequência de alerta"
                      value={form.notificationFrequency}
                      onChange={handleChange('notificationFrequency')}
                      required
                      size="medium"
                      helperText="Máximo de alertas por período"
                    >
                      <MenuItem value="hourly">Horária - sem limite</MenuItem>
                      <MenuItem value="daily">Diária - 1 por dia</MenuItem>
                      <MenuItem value="monthly">Mensal - 1 por mês</MenuItem>
                    </FormField>
                  </Box>
                </Box>
              </Collapse>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <FormControlLabel
                sx={{ alignItems: 'flex-start' }}
                control={
                  <Checkbox
                    sx={{ pt: 0.5, color: errors.notificationModes ? 'error.main' : undefined }}
                    color={errors.notificationModes ? 'error' : 'primary'}
                    checked={form.notificationModes.includes('scheduled')}
                    onChange={() => {
                      const has = form.notificationModes.includes('scheduled')
                      const next = has
                        ? form.notificationModes.filter((m) => m !== 'scheduled') as CreateTripInput['notificationModes']
                        : [...form.notificationModes, 'scheduled'] as CreateTripInput['notificationModes']
                      set('notificationModes', next)
                    }}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500} color={errors.notificationModes ? 'error' : 'text.primary'}>
                    Horário agendado: Você receberá um resumo diário no horário definido
                  </Typography>
                }
              />
              <Collapse in={form.notificationModes.includes('scheduled')} unmountOnExit>
                <Box sx={{ pt: 1, pb: 1 }}>
                  <Box sx={anim(0)}>
                    <FormField
                      label="Horário"
                      type="time"
                      value={form.scheduledTime ?? '20:00'}
                      onChange={(e) => set('scheduledTime', e.target.value || '20:00')}
                      required
                      size="medium"
                      InputLabelProps={{ shrink: true }}
                      helperText="Resumo diário enviado neste horário"
                      sx={{ maxWidth: 180 }}
                    />
                  </Box>
                </Box>
              </Collapse>
            </Box>

            {errors.notificationModes && (
              <FormHelperText error sx={{ mt: -1 }}>
                {errors.notificationModes}
              </FormHelperText>
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
                <Typography variant="body2" fontWeight={500}>Rotina ativa</Typography>
                <Typography variant="caption" color="text.secondary">
                  {form.isActive ? 'Monitoramento em execução' : 'Monitoramento pausado'}
                </Typography>
              </Box>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />}
                label=""
                sx={{ mr: 0 }}
              />
            </Box>
          </Section>

        </Box>

        <Divider />

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
