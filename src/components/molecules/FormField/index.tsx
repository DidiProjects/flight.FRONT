import { Box, TextField, Typography, type TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'
import { fieldStyles } from './style'

type FormFieldProps = TextFieldProps & {
  serverError?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ serverError, error, helperText, sx, ...props }, ref) => {
    const hasError = error || !!serverError
    const errorMessage = serverError ?? (hasError && typeof helperText === 'string' ? helperText : undefined)
    const hintText = !hasError ? helperText : undefined

    return (
      <Box sx={fieldStyles.wrapper(sx)}>
        <TextField
          ref={ref}
          fullWidth
          error={hasError}
          helperText={hintText}
          {...props}
        />
        {hasError && errorMessage && (
          <Typography component="span" sx={fieldStyles.errorText}>
            * {errorMessage}
          </Typography>
        )}
      </Box>
    )
  },
)

FormField.displayName = 'FormField'
