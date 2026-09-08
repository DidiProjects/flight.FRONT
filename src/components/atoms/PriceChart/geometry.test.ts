import { describe, it, expect } from 'vitest'
import { colorForAirline, labelForAirline, AIRLINE_COLORS } from './geometry'

describe('colorForAirline', () => {
  it('companhia conhecida usa a cor da própria marca', () => {
    expect(colorForAirline('azul', 3)).toBe('#0033A0')
  })

  it('companhia desconhecida cai na paleta genérica pelo índice', () => {
    expect(colorForAirline('nova-cia', 1)).toBe(AIRLINE_COLORS[1])
  })

  it('índice fora da paleta gira (módulo), não estoura', () => {
    expect(colorForAirline('nova-cia', AIRLINE_COLORS.length)).toBe(AIRLINE_COLORS[0])
  })
})

describe('labelForAirline', () => {
  it('companhia conhecida usa o nome curto da marca', () => {
    expect(labelForAirline('britishairways')).toBe('British Airways')
  })

  it('companhia desconhecida cai no código em maiúsculas', () => {
    expect(labelForAirline('nova-cia')).toBe('NOVA-CIA')
  })
})
