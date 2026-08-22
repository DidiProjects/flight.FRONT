import { describe, it, expect } from 'vitest'
import { formatMoney } from './money'

/**
 * `Intl.NumberFormat` separates the symbol from the number with a NON-BREAKING
 * SPACE (U+00A0), not an ordinary one — that is what keeps "R$" from being left
 * alone at the end of a line. The tests spell `\u00A0` out because the
 * difference is invisible in the editor: pasting "R$ 2.600,00" with a normal
 * space fails, and vitest then shows two identical-looking strings.
 */
const NBSP = '\u00A0'

describe('formatMoney', () => {
  describe('com moeda resolvida', () => {
    it('formata BRL no padrão pt-BR: ponto no milhar, vírgula no centavo', () => {
      expect(formatMoney(2600, 'BRL')).toBe(`R$${NBSP}2.600,00`)
    })

    it('mantém a locale pt-BR mesmo com moeda estrangeira', () => {
      // The locale belongs to the READER, not to the currency: the reader is
      // Brazilian, so the symbol changes but the punctuation stays Brazilian.
      expect(formatMoney(26, 'GBP')).toBe(`£${NBSP}26,00`)
      expect(formatMoney(26, 'USD')).toBe(`US$${NBSP}26,00`)
      expect(formatMoney(26, 'EUR')).toBe(`€${NBSP}26,00`)
    })

    it('respeita moedas sem casa decimal', () => {
      // Yen and Chilean peso have no cents; forcing ",00" would invent precision
      // the currency does not have. Intl decides that, not this function.
      expect(formatMoney(26, 'JPY')).toBe(`JP¥${NBSP}26`)
      expect(formatMoney(26, 'CLP')).toBe(`CLP${NBSP}26`)
    })

    it('agrupa milhares em todas as casas', () => {
      expect(formatMoney(1_000_000, 'BRL')).toBe(`R$${NBSP}1.000.000,00`)
    })

    it('arredonda o centavo em vez de truncar', () => {
      expect(formatMoney(1234.567, 'BRL')).toBe(`R$${NBSP}1.234,57`)
      expect(formatMoney(1234.564, 'BRL')).toBe(`R$${NBSP}1.234,56`)
    })

    it('formata zero com os centavos visíveis', () => {
      expect(formatMoney(0, 'BRL')).toBe(`R$${NBSP}0,00`)
    })

    it('põe o sinal antes do símbolo em valores negativos', () => {
      expect(formatMoney(-1500.5, 'BRL')).toBe(`-R$${NBSP}1.500,50`)
    })
  })

  describe('sem moeda resolvida', () => {
    it('exibe só o número, sem símbolo no lugar', () => {
      // Business rule: while the currency has not arrived, never guess "R$".
      // A price in pounds labelled as Real is worse than one with no label.
      expect(formatMoney(2600, null)).toBe('2.600')
      expect(formatMoney(2600, undefined)).toBe('2.600')
    })

    it('trata string vazia como moeda ausente', () => {
      // The API returns '' while the route currency is unresolved; reaching
      // `Intl` with '' throws RangeError and takes the whole card down.
      expect(formatMoney(2600, '')).toBe('2.600')
    })

    it('omite os centavos quando o valor é inteiro', () => {
      // `minimumFractionDigits: 0` is what separates this path from the other:
      // with a currency 2600 becomes "R$ 2.600,00"; without one, "2.600".
      expect(formatMoney(2600, null)).toBe('2.600')
      expect(formatMoney(0, null)).toBe('0')
    })

    it('mostra os centavos quando eles existem', () => {
      expect(formatMoney(1234.567, null)).toBe('1.234,57')
      expect(formatMoney(0.5, null)).toBe('0,5')
    })
  })

  describe('maximumFractionDigits', () => {
    it('corta os centavos da moeda quando pedido', () => {
      expect(formatMoney(2600, 'BRL', { maximumFractionDigits: 0 })).toBe(`R$${NBSP}2.600`)
      expect(formatMoney(26.4, 'GBP', { maximumFractionDigits: 0 })).toBe(`£${NBSP}26`)
    })

    it('arredonda ao cortar, não trunca', () => {
      expect(formatMoney(2599.6, 'BRL', { maximumFractionDigits: 0 })).toBe(`R$${NBSP}2.600`)
      expect(formatMoney(1234.56, null, { maximumFractionDigits: 0 })).toBe('1.235')
    })

    it('vale também no caminho sem moeda', () => {
      expect(formatMoney(1234.567, null, { maximumFractionDigits: 1 })).toBe('1.234,6')
    })

    it('respeita o zero explícito em vez de descartá-lo como falsy', () => {
      // The guard is `!= null`, not a truthy check. With truthy,
      // `{ maximumFractionDigits: 0 }` would be silently discarded and the value
      // would come back with cents — exactly the bug this avoids.
      expect(formatMoney(2600, 'BRL', { maximumFractionDigits: 0 })).not.toContain(',')
    })

    it('opts vazio se comporta como opts ausente', () => {
      expect(formatMoney(2600, 'BRL', {})).toBe(formatMoney(2600, 'BRL'))
      expect(formatMoney(2600, null, {})).toBe(formatMoney(2600, null))
    })
  })

  describe('entradas degeneradas', () => {
    it('propaga NaN em vez de fingir um valor', () => {
      // An "R$ 0,00" in place of NaN would hide the broken data and become a
      // reading bug; "R$ NaN" on screen points at where it came from.
      expect(formatMoney(NaN, 'BRL')).toBe(`R$${NBSP}NaN`)
      expect(formatMoney(NaN, null)).toBe('NaN')
    })

    it('formata infinito com o símbolo matemático', () => {
      expect(formatMoney(Infinity, 'BRL')).toBe(`R$${NBSP}∞`)
    })

    it('deixa o zero negativo vazar com sinal', () => {
      // Known and accepted: -0 comes from subtracting equal prices and Intl
      // formats it as negative. If it ever bothers on screen, the fix is to
      // normalise at the source (`value || 0`), not here.
      expect(formatMoney(-0, 'BRL')).toBe(`-R$${NBSP}0,00`)
    })

    it('aceita o código da moeda em minúsculas', () => {
      expect(formatMoney(26, 'brl')).toBe(`R$${NBSP}26,00`)
    })

    it('usa o próprio código quando a moeda é desconhecida mas válida', () => {
      expect(formatMoney(26, 'XYZ')).toBe(`XYZ${NBSP}26,00`)
    })

    it('LANÇA quando o código tem formato inválido', () => {
      // Documents the limit of this function: it guards against a MISSING
      // currency (null/undefined/''), not a MALFORMED one. A 'BR' from the API
      // takes the component down — whoever consumes untrusted data must validate
      // first, or this test becomes the spec for a try/catch in here.
      expect(() => formatMoney(26, 'BR')).toThrow(RangeError)
    })
  })
})
