/**
 * Formats a monetary value. When the currency is not resolved yet
 * (null/undefined), shows the number alone — business rule: nothing in its place.
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
