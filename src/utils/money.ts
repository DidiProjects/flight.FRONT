/**
 * Formata um valor monetário. Quando a moeda ainda não foi resolvida (null/undefined),
 * exibe apenas o número, sem símbolo de moeda no lugar (regra de negócio: nada no lugar).
 */
export function formatMoney(
  value: number,
  currency: string | null | undefined,
  opts?: { maximumFractionDigits?: number },
): string {
  if (!currency) {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
    })
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    ...(opts?.maximumFractionDigits != null ? { maximumFractionDigits: opts.maximumFractionDigits } : {}),
  }).format(value)
}
