import { z } from 'zod'

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
    airline: z.string().min(1, 'Companhia obrigatória'),
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
    targetBrl: z.number().nullable(),
    targetPts: z.number().nullable(),
    targetHybPts: z.number().nullable(),
    targetHybBrl: z.number().nullable(),
    margin: z.number().min(0).max(1),
    priority: z.enum(['brl', 'pts', 'hyb']),
    notificationMode: z.enum(['alert_only', 'daily_best_and_alert', 'end_of_period']),
    notificationFrequency: z.enum(['hourly', 'daily', 'monthly']),
    endOfPeriodTime: z.string().nullable(),
    ccEmails: z.array(z.string()),
    isActive: z.boolean(),
  })
  .refine(
    (d) => !d.outboundStart || !d.outboundEnd || d.outboundEnd >= d.outboundStart,
    { message: 'Deve ser após a data de início', path: ['outboundEnd'] },
  )
  .refine(
    (d) => !d.returnStart || !d.returnEnd || d.returnEnd >= d.returnStart,
    { message: 'Deve ser após a data de início', path: ['returnEnd'] },
  )
