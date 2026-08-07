/**
 * Veredito de preço — a régua única do sistema.
 *
 * Vive aqui porque o card e o calendário PRECISAM concordar. Antes cada um
 * decidia a cor à sua maneira: o card comparava com o histórico (p20 e média de
 * 30 dias) e o calendário normalizava entre o menor e o maior da janela
 * exibida. O calendário então sempre pintava algo de verde — mesmo numa janela
 * inteira de preços ruins — e o card, logo acima, dizia "Preço alto".
 *
 * Agora verde significa a mesma coisa nos dois lugares: barato em relação ao
 * histórico da rota. "O mais barato da janela" continua sinalizado, mas por
 * estrela e borda, que é informação de posição — não de preço.
 */
export type Verdict = 'low' | 'typical' | 'high'

export const verdictMeta: Record<Verdict, { label: string; color: 'success' | 'default' | 'warning' }> = {
  low: { label: 'Preço baixo', color: 'success' },
  typical: { label: 'Preço típico', color: 'default' },
  high: { label: 'Preço alto', color: 'warning' },
}

/**
 * `threshold` é o p20 (ou o mínimo, em pontos): abaixo dele o preço é
 * historicamente baixo. Sem régua não há veredito — `null` é "não sei", e
 * chutar "típico" afirmaria algo que não foi medido.
 */
export function computeVerdict(
  value: number | null,
  avg: number | null,
  threshold: number | null,
): Verdict | null {
  if (value == null || avg == null) return null
  if (threshold != null && value <= threshold) return 'low'
  if (value <= avg) return 'typical'
  return 'high'
}

/** Régua da dimensão exibida. Em híbrido não há série histórica para comparar. */
export function referenceFor(
  track: 'cash' | 'pts' | 'hyb',
  summary: {
    avgCash30d: number | null
    p20Cash30d: number | null
    avgPts30d: number | null
    minPts30d: number | null
  },
): { avg: number | null; threshold: number | null } {
  if (track === 'pts') return { avg: summary.avgPts30d, threshold: summary.minPts30d }
  if (track === 'hyb') return { avg: null, threshold: null }
  return { avg: summary.avgCash30d, threshold: summary.p20Cash30d }
}
