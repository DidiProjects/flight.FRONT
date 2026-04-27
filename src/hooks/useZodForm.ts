import { useCallback, useRef, useState } from 'react'
import type { ZodTypeAny } from 'zod'

type Errors<T> = Partial<Record<keyof T, string>>

export function useZodForm<T extends object>(schema: ZodTypeAny, delay = 400) {
  const [errors, setErrors] = useState<Errors<T>>({})
  const timers = useRef<Partial<Record<keyof T, ReturnType<typeof setTimeout>>>>({})

  function validate(data: T): boolean {
    const result = schema.safeParse(data)
    if (!result.success) {
      const errs: Errors<T> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof T
        if (key !== undefined && !errs[key]) errs[key] = issue.message
      }
      setErrors(errs)
      return false
    }
    setErrors({})
    return true
  }

  function touchField(key: keyof T, data: T) {
    clearTimeout(timers.current[key])
    timers.current[key] = setTimeout(() => {
      const result = schema.safeParse(data)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === key)
        setErrors((prev) => ({ ...prev, [key]: issue?.message }))
      } else {
        setErrors((prev) => ({ ...prev, [key]: undefined }))
      }
    }, delay)
  }

  const reset = useCallback(() => {
    Object.values(timers.current).forEach((t) => clearTimeout(t as ReturnType<typeof setTimeout>))
    timers.current = {}
    setErrors({})
  }, [])

  return { errors, validate, touchField, reset }
}
