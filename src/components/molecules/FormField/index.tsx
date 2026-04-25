import { TextField, type TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'

type FormFieldProps = TextFieldProps & {
  serverError?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ serverError, error, helperText, ...props }, ref) => {
    const hasError = error || !!serverError
    const message = serverError ?? (typeof helperText === 'string' ? helperText : '')

    return (
      <TextField
        ref={ref}
        fullWidth
        error={hasError}
        helperText={message || helperText}
        {...props}
      />
    )
  },
)

FormField.displayName = 'FormField'
