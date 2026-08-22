/**
 * Time ceiling between outbound and return on a round-trip routine.
 * Mirrors `MAX_ROUNDTRIP_SPAN_MONTHS` in flight.API — validating here only lets
 * the user see the error before submitting; the back end decides.
 */
export const MAX_ROUNDTRIP_SPAN_MONTHS = 3

/** Ceiling of each window on one-way. Mirrors `MAX_DATE_RANGE_DAYS` in flight.API. */
export const MAX_DATE_RANGE_DAYS = 30

/**
 * Ceiling of each window on round-trip. Mirrors `MAX_ROUNDTRIP_RANGE_DAYS`.
 *
 * Much smaller than the one-way ceiling because RT collection goes by PAIR of
 * dates: the number of searches is the PRODUCT of the two windows. 30 days on
 * both sides would be 900 searches per cycle per airline; with 5, at most 25.
 */
export const MAX_ROUNDTRIP_RANGE_DAYS = 5

/** Last return date accepted for an outbound, as YYYY-MM-DD. */
export function maxInboundDate(outbound: string): string {
  const d = new Date(`${outbound.slice(0, 10)}T00:00:00Z`)
  const limit = new Date(d)
  limit.setUTCMonth(limit.getUTCMonth() + MAX_ROUNDTRIP_SPAN_MONTHS)
  // setUTCMonth overflows when the day does not exist in the target month
  // (31/01 + 3 months = 01/05). Step back to the last day of the intended month.
  if (limit.getUTCDate() !== d.getUTCDate()) limit.setUTCDate(0)
  return limit.toISOString().slice(0, 10)
}
