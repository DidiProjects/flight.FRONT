import { useRef, useState } from 'react'
import type { ZodTypeAny } from 'zod'

type Errors<T> = Partial<Record<keyof T, string>>

export function useZodForm<T extends Record<string, unknown>>(schema: ZodTypeAny) {
  const [errors, setErrors] = useState<Errors<T>>({})
  const attempted = useRef(false)

  function validate(data: T): boolean {
    const result = schema.safeParse(data)
    if (!result.success) {
      const errs: Errors<T> = {}
      for (const err of result.error.issues) {
        const key = err.path[0] as keyof T
        if (key !== undefined && !errs[key]) errs[key] = err.message
      }
      setErrors(errs)
      attempted.current = true
      return false
    }
    setErrors({})
    return true
  }

  // Re-validate only after the first failed submit attempt
  function revalidate(data: T) {
    if (attempted.current) validate(data)
  }

  return { errors, validate, revalidate }
}
