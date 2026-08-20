import { describe, it, expect } from 'vitest'
import { formatMoney } from './money'

/**
 * O `Intl.NumberFormat` separa o símbolo do número com ESPAÇO NÃO-QUEBRÁVEL
 * (U+00A0), não com espaço comum — é o que impede "R$" de ficar sozinho no fim
 * de uma linha. Os testes escrevem `\u00A0` explicitamente porque a diferença é
 * invisível no editor: colar "R$ 2.600,00" com espaço normal falha, e a
 * mensagem do vitest mostra duas strings idênticas na tela.
 */
const NBSP = '\u00A0'

describe('formatMoney', () => {
  describe('com moeda resolvida', () => {
    it('formata BRL no padrão pt-BR: ponto no milhar, vírgula no centavo', () => {
      expect(formatMoney(2600, 'BRL')).toBe(`R$${NBSP}2.600,00`)
    })

    it('mantém a locale pt-BR mesmo com moeda estrangeira', () => {
      // A locale é do LEITOR, não da moeda: quem lê é brasileiro, então o
      // símbolo muda mas a pontuação continua brasileira.
      expect(formatMoney(26, 'GBP')).toBe(`£${NBSP}26,00`)
      expect(formatMoney(26, 'USD')).toBe(`US$${NBSP}26,00`)
      expect(formatMoney(26, 'EUR')).toBe(`€${NBSP}26,00`)
    })

    it('respeita moedas sem casa decimal', () => {
      // Iene e peso chileno não têm centavos; forçar ",00" inventaria precisão
      // que a moeda não tem. Quem decide isso é o Intl, não a função.
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
      // Regra de negócio: enquanto a moeda não chegou, não se chuta "R$".
      // Um preço em libras rotulado como real é pior que um preço sem rótulo.
      expect(formatMoney(2600, null)).toBe('2.600')
      expect(formatMoney(2600, undefined)).toBe('2.600')
    })

    it('trata string vazia como moeda ausente', () => {
      // A API devolve '' quando ainda não resolveu a moeda da rota; cair no
      // `Intl` com '' lançaria RangeError e derrubaria o card inteiro.
      expect(formatMoney(2600, '')).toBe('2.600')
    })

    it('omite os centavos quando o valor é inteiro', () => {
      // `minimumFractionDigits: 0` é o que separa este caminho do outro:
      // com moeda, 2600 vira "R$ 2.600,00"; sem moeda, vira "2.600".
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
      // O guarda é `!= null`, não um truthy check. Se fosse truthy,
      // `{ maximumFractionDigits: 0 }` seria silenciosamente descartado e o
      // valor voltaria com centavos — exatamente o bug que se quer evitar.
      expect(formatMoney(2600, 'BRL', { maximumFractionDigits: 0 })).not.toContain(',')
    })

    it('opts vazio se comporta como opts ausente', () => {
      expect(formatMoney(2600, 'BRL', {})).toBe(formatMoney(2600, 'BRL'))
      expect(formatMoney(2600, null, {})).toBe(formatMoney(2600, null))
    })
  })

  describe('entradas degeneradas', () => {
    it('propaga NaN em vez de fingir um valor', () => {
      // Um "R$ 0,00" no lugar de NaN esconderia o dado quebrado e viraria um
      // bug de leitura; "R$ NaN" na tela denuncia a origem.
      expect(formatMoney(NaN, 'BRL')).toBe(`R$${NBSP}NaN`)
      expect(formatMoney(NaN, null)).toBe('NaN')
    })

    it('formata infinito com o símbolo matemático', () => {
      expect(formatMoney(Infinity, 'BRL')).toBe(`R$${NBSP}∞`)
    })

    it('deixa o zero negativo vazar com sinal', () => {
      // Conhecido e aceito: -0 vem de subtrações de preços iguais e o Intl o
      // formata como negativo. Se algum dia incomodar na tela, o conserto é
      // normalizar o valor na origem (`value || 0`), não aqui.
      expect(formatMoney(-0, 'BRL')).toBe(`-R$${NBSP}0,00`)
    })

    it('aceita o código da moeda em minúsculas', () => {
      expect(formatMoney(26, 'brl')).toBe(`R$${NBSP}26,00`)
    })

    it('usa o próprio código quando a moeda é desconhecida mas válida', () => {
      expect(formatMoney(26, 'XYZ')).toBe(`XYZ${NBSP}26,00`)
    })

    it('LANÇA quando o código tem formato inválido', () => {
      // Documenta o limite da função: ela protege contra moeda AUSENTE
      // (null/undefined/''), não contra moeda MALFORMADA. Um 'BR' vindo da API
      // derruba o componente — quem consome dado não confiável precisa validar
      // antes, ou este teste vira a especificação de um try/catch aqui dentro.
      expect(() => formatMoney(26, 'BR')).toThrow(RangeError)
    })
  })
})
