/**
 * Cor por companhia, estável entre renders e entre rotinas.
 *
 * Índice na lista ordenada, não hash do nome: hash dá cores parecidas para
 * códigos parecidos, e a lista é pequena o bastante para não repetir. Mora aqui,
 * e não no componente, porque a legenda precisa da MESMA cor da curva.
 *
 * Fallback para companhia sem marca cadastrada em `AIRLINE_BRAND` — cadastrada
 * pelo admin depois do deploy, por exemplo.
 */
export const AIRLINE_COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899']

/**
 * Cor primária e nome curto das companhias conhecidas, para a curva, a legenda
 * e o calendário falarem a mesma cor que o usuário já associa à marca — em vez
 * da paleta genérica por posição.
 */
export const AIRLINE_BRAND: Record<string, { color: string; label: string }> = {
  azul: { color: '#0033A0', label: 'Azul' },
  latam: { color: '#E4002B', label: 'LATAM' },
  britishairways: { color: '#075AAA', label: 'British Airways' },
  ryanair: { color: '#F2C230', label: 'Ryanair' },
  gol: { color: '#FF6600', label: 'GOL' },
}

/** Cor da companhia: da marca quando conhecida, senão a paleta genérica pelo índice. */
export function colorForAirline(airline: string, fallbackIndex: number): string {
  return AIRLINE_BRAND[airline]?.color ?? AIRLINE_COLORS[fallbackIndex % AIRLINE_COLORS.length]
}

/** Nome de exibição: o da marca quando conhecida, senão o código em maiúsculas. */
export function labelForAirline(airline: string): string {
  return AIRLINE_BRAND[airline]?.label ?? airline.toUpperCase()
}
