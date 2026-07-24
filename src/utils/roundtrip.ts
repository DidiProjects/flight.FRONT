/**
 * Teto de tempo entre a ida e a volta numa rotina round-trip.
 * Espelha `MAX_ROUNDTRIP_SPAN_MONTHS` do flight.API — a validação aqui é só
 * para o usuário ver o erro antes de submeter; quem decide é o back.
 */
export const MAX_ROUNDTRIP_SPAN_MONTHS = 3

/** Última data de volta aceita para uma ida, em YYYY-MM-DD. */
export function maxInboundDate(outbound: string): string {
  const d = new Date(`${outbound.slice(0, 10)}T00:00:00Z`)
  const limit = new Date(d)
  limit.setUTCMonth(limit.getUTCMonth() + MAX_ROUNDTRIP_SPAN_MONTHS)
  // setUTCMonth transborda quando o dia não existe no mês destino
  // (31/01 + 3 meses = 01/05). Recua para o último dia do mês pretendido.
  if (limit.getUTCDate() !== d.getUTCDate()) limit.setUTCDate(0)
  return limit.toISOString().slice(0, 10)
}
