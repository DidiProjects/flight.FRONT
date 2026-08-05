import { describe, it, expect } from 'vitest'
import { buildBookingLink } from './bookingLink'

const base = {
  origin: 'GRU',
  destination: 'LHR',
  date: '2026-09-21',
  passengers: 1,
  fareType: 'cash' as const,
}
const rt = { ...base, returnDate: '2026-09-25' }

const q = (url: string) => new URL(url).searchParams

describe('buildBookingLink — só-ida', () => {
  it('não inventa volta em nenhuma companhia', () => {
    // O contrário do bug: sem returnDate o link tem de continuar só-ida.
    expect(buildBookingLink('azul', base)).not.toContain('c[1]')
    expect(q(buildBookingLink('latam', base)!).get('trip')).toBe('OW')
    expect(q(buildBookingLink('britishairways', base)!).get('trip')).toBe('oneWay')
    expect(q(buildBookingLink('ryanair', base)!).get('isReturn')).toBe('false')
  })

  it('companhia desconhecida não tem link', () => {
    expect(buildBookingLink('gol', base)).toBeNull()
  })
})

describe('buildBookingLink — ida-e-volta', () => {
  it('azul leva a segunda perna com a rota invertida', () => {
    const url = buildBookingLink('azul', rt)!
    expect(url).toContain('c[0].ds=GRU')
    expect(url).toContain('c[0].std=09/21/2026')
    expect(url).toContain('c[1].ds=LHR')
    expect(url).toContain('c[1].std=09/25/2026')
    expect(url).toContain('c[1].as=GRU')
  })

  it('ryanair traz as duas pernas na mesma busca', () => {
    const p = q(buildBookingLink('ryanair', rt)!)
    expect(p.get('isReturn')).toBe('true')
    expect(p.get('dateIn')).toBe('2026-09-25')
    // Os `tp*` acompanham a busca no site; sem eles a volta não é pré-preenchida.
    expect(p.get('tpEndDate')).toBe('2026-09-25')
  })

  it('BA muda para a UI velha, que é a única com fluxo de RT medido', () => {
    const url = buildBookingLink('britishairways', rt)!
    expect(url).toContain('/travel/book/public/en_gb/flightList')
    const p = q(url)
    expect(p.get('onds')).toBe('GRU-LHR_2026-09-21,LHR-GRU_2026-09-25')
    expect(p.get('ond')).toBe('2')
  })

  it('latam pede RT com a data de volta', () => {
    const p = q(buildBookingLink('latam', rt)!)
    expect(p.get('trip')).toBe('RT')
    expect(p.get('inbound')).toBe('2026-09-25')
  })

  it('pts troca a moeda da azul sem perder a volta', () => {
    const url = buildBookingLink('azul', { ...rt, fareType: 'pts' })!
    expect(url).toContain('cc=PTS')
    expect(url).toContain('c[1].ds=LHR')
  })
})
