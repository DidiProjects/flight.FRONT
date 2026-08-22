import { describe, it, expect } from 'vitest'
import { computeVerdict, referenceFor } from './priceVerdict'

/**
 * This rule is shared between the card and the calendar on purpose: while each
 * decided the colour on its own, the calendar normalised by window (always
 * painting something green) and the card used history — the two contradicted
 * each other on the same screen.
 */
describe('computeVerdict', () => {
  it('abaixo do P20 é preço baixo', () => {
    expect(computeVerdict(300, 500, 350)).toBe('low')
  })

  it('no P20 exato ainda é baixo', () => {
    expect(computeVerdict(350, 500, 350)).toBe('low')
  })

  it('entre o P20 e a média é típico', () => {
    expect(computeVerdict(450, 500, 350)).toBe('typical')
  })

  it('acima da média é alto', () => {
    expect(computeVerdict(600, 500, 350)).toBe('high')
  })

  it('sem régua não emite veredito', () => {
    // Guessing "typical" would assert something never measured — and paint the
    // cell a colour the user would read as information.
    expect(computeVerdict(450, null, null)).toBeNull()
    expect(computeVerdict(null, 500, 350)).toBeNull()
  })

  it('sem P20 cai para a comparação com a média', () => {
    expect(computeVerdict(400, 500, null)).toBe('typical')
    expect(computeVerdict(600, 500, null)).toBe('high')
  })
})

describe('referenceFor', () => {
  const summary = { avgCash30d: 500, p20Cash30d: 350, avgPts30d: 30000, minPts30d: 20000 }

  it('dinheiro usa média e P20', () => {
    expect(referenceFor('cash', summary)).toEqual({ avg: 500, threshold: 350 })
  })

  it('pontos usam média e mínimo — não há P20 em pontos', () => {
    expect(referenceFor('pts', summary)).toEqual({ avg: 30000, threshold: 20000 })
  })

  it('híbrido não tem régua: duas dimensões não se resumem a um número', () => {
    expect(referenceFor('hyb', summary)).toEqual({ avg: null, threshold: null })
  })
})
