import { Box, TextField, type TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'
import { fieldStyles } from './style'

type FormFieldProps = TextFieldProps & {
  serverError?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ serverError, error, helperText, sx, ...props }, ref) => {
    const hasError = error || !!serverError
    const hintText = hasError ? `* ${serverError ?? helperText}` : helperText

    return (
      <Box sx={fieldStyles.wrapper(sx)}>
        <TextField
          ref={ref}
          fullWidth
          error={hasError}
          helperText={hintText}
          {...props}
        />
      </Box>
    )
  },
)

FormField.displayName = 'FormField'
