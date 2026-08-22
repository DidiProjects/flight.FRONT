import { describe, it, expect } from 'vitest'
import { MAX_ROUNDTRIP_SPAN_MONTHS, maxInboundDate } from './roundtrip'
import { routineSchema } from './schemas'

describe('maxInboundDate', () => {
  it('o teto é de 3 meses, igual ao do flight.API', () => {
    expect(MAX_ROUNDTRIP_SPAN_MONTHS).toBe(3)
  })

  it('soma 3 meses mantendo o dia', () => {
    expect(maxInboundDate('2026-09-10')).toBe('2026-12-10')
  })

  it('recua para o último dia quando o mês destino é mais curto', () => {
    expect(maxInboundDate('2026-01-31')).toBe('2026-04-30')
  })

  it('atravessa a virada de ano', () => {
    expect(maxInboundDate('2026-11-30')).toBe('2027-02-28')
  })
})

describe('routineSchema — janela de volta', () => {
  const base = {
    name: 'Viagem',
    airlines: ['azul'],
    origin: 'GRU',
    destination: 'LIS',
    // 5 days: the window ceiling when a return exists, and all these cases have one.
    outboundStart: '2026-06-01',
    outboundEnd: '2026-06-06',
    returnStart: null as string | null,
    returnEnd: null as string | null,
    passengers: 1,
    targetCash: 3000,
    targetPts: null,
    targetHybPts: null,
    targetHybCash: null,
    margin: 0.1,
    priority: 'cash' as const,
    notificationModes: ['target' as const],
    notificationFrequency: 'hourly' as const,
    scheduledTime: null,
    ccEmails: [],
    isActive: true,
  }

  const parse = (o: Partial<typeof base>) => routineSchema.safeParse({ ...base, ...o })
  const firstError = (r: ReturnType<typeof parse>) => (r.success ? null : r.error.issues[0].message)

  it('sem volta é válido', () => {
    expect(parse({}).success).toBe(true)
  })

  it('volta dentro do teto é válida', () => {
    expect(parse({ returnStart: '2026-07-01', returnEnd: '2026-07-05' }).success).toBe(true)
  })

  it('volta antes da ida é rejeitada', () => {
    expect(firstError(parse({ returnStart: '2026-05-01', returnEnd: '2026-05-05' })))
      .toMatch(/não pode começar antes da ida/)
  })

  it('volta além de 3 meses da ida é rejeitada', () => {
    expect(firstError(parse({ returnStart: '2026-09-10', returnEnd: '2026-09-15' })))
      .toMatch(/não pode passar de 3 meses/)
  })

  it('volta no limite exato de 3 meses é aceita', () => {
    expect(parse({ returnStart: '2026-09-06', returnEnd: '2026-09-10' }).success).toBe(true)
  })

  /**
   * The 5-day ceiling exists because round-trip collection goes by PAIR: the
   * number of searches is the PRODUCT of the two windows, not the sum.
   */
  it('com volta, janela de ida acima de 5 dias é rejeitada', () => {
    expect(firstError(parse({
      outboundStart: '2026-06-01', outboundEnd: '2026-06-07',
      returnStart: '2026-07-01', returnEnd: '2026-07-05',
    }))).toMatch(/ida não pode exceder 5 dias/)
  })

  it('com volta, janela de volta acima de 5 dias é rejeitada', () => {
    expect(firstError(parse({ returnStart: '2026-07-01', returnEnd: '2026-07-07' })))
      .toMatch(/volta não pode exceder 5 dias/)
  })

  it('sem volta, a ida continua aceitando 30 dias', () => {
    expect(parse({ outboundStart: '2026-06-01', outboundEnd: '2026-07-01' }).success).toBe(true)
  })
})
