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
