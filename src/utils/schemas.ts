import { z } from 'zod'
import { MAX_ROUNDTRIP_RANGE_DAYS, MAX_DATE_RANGE_DAYS, MAX_ROUNDTRIP_SPAN_MONTHS, maxInboundDate } from './roundtrip'

function diffEmDias(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
}

/**
 * Ida-e-volta tem teto menor porque a coleta é por PAR: o número de buscas é o
 * PRODUTO das duas janelas. Preencher a volta é o que caracteriza o par aqui —
 * o `tripType` é derivado disso no envio.
 */
function tetoDeJanela(d: { returnStart?: string | null; returnEnd?: string | null }): number {
  return d.returnStart && d.returnEnd ? MAX_ROUNDTRIP_RANGE_DAYS : MAX_DATE_RANGE_DAYS
}

const email = z
  .string()
  .min(1, 'Email obrigatório')
  .email('Email inválido')

// Password rules matching backend constraints:
// min 8, max 100, uppercase + lowercase + number required
const password = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(100, 'Máximo 100 caracteres')
  .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
  .regex(/[a-z]/, 'Deve conter ao menos uma letra minúscula')
  .regex(/[0-9]/, 'Deve conter ao menos um número')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Senha obrigatória'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email,
})

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    password,
    confirm: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não coincidem',
    path: ['confirm'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: password,
    confirm: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'As senhas não coincidem',
    path: ['confirm'],
  })

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email,
})

export const routineSchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatório'),
    airlines: z.array(z.string()).min(1, 'Selecione ao menos uma companhia'),
    origin: z
      .string()
      .min(1, 'Origem obrigatória')
      .refine((v) => v.length === 3, 'Deve ter 3 letras (ex: GRU)'),
    destination: z
      .string()
      .min(1, 'Destino obrigatório')
      .refine((v) => v.length === 3, 'Deve ter 3 letras (ex: LIS)'),
    outboundStart: z.string().min(1, 'Data obrigatória'),
    outboundEnd: z.string().min(1, 'Data obrigatória'),
    returnStart: z.string().nullable(),
    returnEnd: z.string().nullable(),
    passengers: z.number().min(1, 'Mínimo 1').max(9, 'Máximo 9'),
    targetCash: z.number().nullable(),
    targetPts: z.number().nullable(),
    targetHybPts: z.number().nullable(),
    targetHybCash: z.number().nullable(),
    margin: z.number().min(0).max(1),
    priority: z.enum(['cash', 'pts', 'hyb']),
    notificationModes: z.array(z.enum(['target', 'scheduled'])).min(1, 'Selecione ao menos uma opção'),
    notificationFrequency: z.enum(['hourly', 'daily', 'monthly']),
    scheduledTime: z.string().nullable(),
    ccEmails: z.array(z.string()),
    isActive: z.boolean(),
  })
  .refine(
    (d) => !d.outboundStart || !d.outboundEnd || d.outboundEnd >= d.outboundStart,
    { message: 'Deve ser após a data de início', path: ['outboundEnd'] },
  )
  // Duas refines em vez de uma com mensagem dinâmica: no zod 4 o segundo
  // argumento não aceita mais função, então o teto entra no texto de cada uma.
  .refine(
    (d) => {
      if (!d.outboundStart || !d.outboundEnd) return true
      if (tetoDeJanela(d) !== MAX_DATE_RANGE_DAYS) return true
      return diffEmDias(d.outboundStart, d.outboundEnd) <= MAX_DATE_RANGE_DAYS
    },
    { message: `O range de datas de ida não pode exceder ${MAX_DATE_RANGE_DAYS} dias`, path: ['outboundEnd'] },
  )
  .refine(
    (d) => {
      if (!d.outboundStart || !d.outboundEnd) return true
      if (tetoDeJanela(d) !== MAX_ROUNDTRIP_RANGE_DAYS) return true
      return diffEmDias(d.outboundStart, d.outboundEnd) <= MAX_ROUNDTRIP_RANGE_DAYS
    },
    { message: `O range de datas de ida não pode exceder ${MAX_ROUNDTRIP_RANGE_DAYS} dias`, path: ['outboundEnd'] },
  )
  .refine(
    (d) => !d.returnStart || !d.returnEnd || d.returnEnd >= d.returnStart,
    { message: 'Deve ser após a data de início', path: ['returnEnd'] },
  )
  .refine(
    (d) => {
      if (!d.returnStart || !d.returnEnd) return true
      return diffEmDias(d.returnStart, d.returnEnd) <= MAX_ROUNDTRIP_RANGE_DAYS
    },
    { message: `O range de datas de volta não pode exceder ${MAX_ROUNDTRIP_RANGE_DAYS} dias`, path: ['returnEnd'] },
  )
  .refine(
    (d) => !d.returnStart || !d.outboundStart || d.returnStart >= d.outboundStart,
    { message: 'A volta não pode começar antes da ida', path: ['returnStart'] },
  )
  .refine(
    (d) => {
      if (!d.returnStart || !d.outboundEnd) return true
      return d.returnStart <= maxInboundDate(d.outboundEnd)
    },
    {
      message: `A volta não pode passar de ${MAX_ROUNDTRIP_SPAN_MONTHS} meses depois da ida`,
      path: ['returnStart'],
    },
  )
  .refine(
    (d) => !d.notificationModes.includes('target') || d.priority !== 'cash' || d.targetCash != null,
    { message: 'Preço alvo obrigatório', path: ['targetCash'] },
  )
  .refine(
    (d) => !d.notificationModes.includes('target') || d.priority !== 'pts' || d.targetPts != null,
    { message: 'Pontos alvo obrigatórios', path: ['targetPts'] },
  )
  .refine(
    (d) => !d.notificationModes.includes('target') || d.priority !== 'hyb' || d.targetHybPts != null,
    { message: 'Pontos alvo obrigatórios', path: ['targetHybPts'] },
  )
  .refine(
    (d) => !d.notificationModes.includes('target') || d.priority !== 'hyb' || d.targetHybCash != null,
    { message: 'Taxa alvo obrigatória', path: ['targetHybCash'] },
  )
  .refine(
    (d) =>
      !d.notificationModes.includes('target') ||
      d.targetCash != null || d.targetPts != null || d.targetHybPts != null || d.targetHybCash != null,
    { message: 'Defina ao menos um valor de target para usar este modo', path: ['targetCash'] },
  )
  .refine(
    (d) => !d.notificationModes.includes('scheduled') || (!!d.scheduledTime && d.scheduledTime.length > 0),
    { message: 'Horário agendado obrigatório', path: ['scheduledTime'] },
  )
