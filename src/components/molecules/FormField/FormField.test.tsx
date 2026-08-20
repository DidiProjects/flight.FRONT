import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormField } from '@atomic-components/molecules/FormField'

/**
 * Esconder o spinner no tema tira só os BOTÕES. O `input[type=number]` continua
 * mudando de valor com a roda do mouse e com ArrowUp/ArrowDown — foi assim que
 * o primeiro ajuste passou por completo sem estar.
 */
describe('FormField — campo numérico não muda por scroll nem por seta', () => {
  it('ArrowUp e ArrowDown são cancelados no type=number', () => {
    render(<FormField label="Passageiros" type="number" defaultValue={3} />)
    const input = screen.getByLabelText('Passageiros')

    for (const key of ['ArrowUp', 'ArrowDown']) {
      const cancelado = !fireEvent.keyDown(input, { key })
      expect(cancelado).toBe(true)
    }
  })

  it('scroll tira o foco do campo — sem foco o input ignora a roda', () => {
    render(<FormField label="Margem" type="number" defaultValue={10} />)
    const input = screen.getByLabelText('Margem') as HTMLInputElement

    input.focus()
    expect(document.activeElement).toBe(input)

    fireEvent.wheel(input)
    expect(document.activeElement).not.toBe(input)
  })

  it('campo de texto não é afetado', () => {
    // A trava é só do numérico: cancelar seta em texto quebraria a navegação
    // por teclado em qualquer campo comum.
    render(<FormField label="Nome" type="text" />)
    const input = screen.getByLabelText('Nome')

    input.focus()
    const cancelado = !fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(cancelado).toBe(false)

    fireEvent.wheel(input)
    expect(document.activeElement).toBe(input)
  })

  it('handlers do chamador continuam sendo chamados', () => {
    const onKeyDown = vi.fn()
    const onWheel = vi.fn()
    render(<FormField label="Alvo" type="number" onKeyDown={onKeyDown} onWheel={onWheel} />)
    const input = screen.getByLabelText('Alvo')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.wheel(input)

    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onWheel).toHaveBeenCalledTimes(1)
  })
})
