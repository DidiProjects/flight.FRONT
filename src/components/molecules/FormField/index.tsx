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
     * Campo numérico não muda de valor por scroll nem por seta.
     *
     * Esconder o spinner no tema tirou só os botões: o `input[type=number]`
     * continua incrementando com a roda do mouse enquanto está focado e com
     * ArrowUp/ArrowDown. Passar o mouse sobre um alvo de preço e rolar a página
     * alterava o valor sem o usuário perceber.
     *
     * O scroll é resolvido com `blur` em vez de `preventDefault`: o React
     * registra `wheel` como passivo, então o preventDefault não teria efeito.
     * Sem foco, o input ignora a roda. As setas são canceladas no keydown, que
     * não é passivo.
     *
     * `type="number"` fica: é ele que traz o teclado numérico no celular.
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
