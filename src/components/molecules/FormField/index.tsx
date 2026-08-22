import { Box, TextField, type TextFieldProps } from '@mui/material'
import { forwardRef } from 'react'
import { fieldStyles } from './style'

type FormFieldProps = TextFieldProps & {
  serverError?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ serverError, error, helperText, sx, onWheel, onKeyDown, ...props }, ref) => {
    const hasError = error || !!serverError
    const hintText = hasError ? `* ${serverError ?? helperText}` : helperText
    const isNumero = props.type === 'number'

    /**
     * A number field must not change value by scroll or arrow key.
     *
     * Hiding the spinner in the theme only removed the buttons: `input[type=number]`
     * still increments with the mouse wheel while focused, and with
     * ArrowUp/ArrowDown. Hovering a price target and scrolling the page changed
     * the value without the user noticing.
     *
     * Scroll is handled with `blur` instead of `preventDefault`: React registers
     * `wheel` as passive, so preventDefault would have no effect. Unfocused, the
     * input ignores the wheel. The arrows are cancelled on keydown, which is not
     * passive.
     *
     * `type="number"` stays: it is what brings the numeric keypad on mobile.
     */
    const bloqueiaScroll = (e: React.WheelEvent<HTMLDivElement>) => {
      if (isNumero) (e.target as HTMLElement).blur()
      onWheel?.(e)
    }

    const bloqueiaSetas = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isNumero && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) e.preventDefault()
      onKeyDown?.(e)
    }

    return (
      <Box sx={fieldStyles.wrapper(sx)}>
        <TextField
          ref={ref}
          fullWidth
          error={hasError}
          helperText={hintText}
          onWheel={bloqueiaScroll}
          onKeyDown={bloqueiaSetas}
          {...props}
        />
      </Box>
    )
  },
)

FormField.displayName = 'FormField'
