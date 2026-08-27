import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { AirlineRecommendation } from '@app-types/airlines'

const mockRecommended = vi.fn()
vi.mock('@services/AirlinesService', () => ({
  AirlinesService: { recommended: (...a: unknown[]) => mockRecommended(...a) },
}))

import { useAirlineRecommendation } from './useAirlineRecommendation'

function cia(code: string, recommended: boolean, reason: AirlineRecommendation['reason']): AirlineRecommendation {
  return {
    code, name: code, currency: null, active: true,
    has_cash: true, has_pts: false, has_hyb: false,
    recommended, reason,
  }
}

// MAD→BCN é o caso que motivou o mapa: LATAM e BA listam os dois aeroportos,
// mas cabotagem impede as duas de vender um doméstico espanhol.
const MAD_BCN = [
  cia('ryanair', true, 'serves_route'),
  cia('latam', false, 'outside_market'),
  cia('britishairways', false, 'outside_market'),
  cia('azul', false, 'no_route'),
]

describe('useAirlineRecommendation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('não chama a API sem as duas pontas', async () => {
    const { result } = renderHook(() => useAirlineRecommendation('MAD', ''))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockRecommended).not.toHaveBeenCalled()
    expect(result.current.airlines).toEqual([])
  })

  // A API recusa origem igual a destino; não faz sentido gastar a ida.
  it('não chama a API com origem igual ao destino', async () => {
    renderHook(() => useAirlineRecommendation('GRU', 'gru'))
    await waitFor(() => expect(mockRecommended).not.toHaveBeenCalled())
  })

  it('normaliza para maiúsculas antes de perguntar', async () => {
    mockRecommended.mockResolvedValue(MAD_BCN)
    renderHook(() => useAirlineRecommendation(' mad ', 'bcn'))
    await waitFor(() => expect(mockRecommended).toHaveBeenCalledWith('MAD', 'BCN'))
  })

  it('devolve só as recomendadas em recommendedCodes, e todas em airlines', async () => {
    mockRecommended.mockResolvedValue(MAD_BCN)
    const { result } = renderHook(() => useAirlineRecommendation('MAD', 'BCN'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.recommendedCodes).toEqual(['ryanair'])
    // Todas continuam na lista: o mapa decide o padrão, não o teto.
    expect(result.current.airlines).toHaveLength(4)
    expect(result.current.reasonOf('latam')).toBe('outside_market')
    expect(result.current.uncovered).toBe(false)
  })

  it('uncovered quando a API responde e nenhuma companhia atende', async () => {
    mockRecommended.mockResolvedValue(MAD_BCN.map((a) => ({ ...a, recommended: false })))
    const { result } = renderHook(() => useAirlineRecommendation('IVL', 'LEU'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.uncovered).toBe(true)
  })

  // Lista vazia é ausência de resposta, não "ninguém atende" — senão uma falha
  // de rede acusaria trajeto não coberto e assustaria o usuário à toa.
  it('falha de rede não vira "não atendemos esse trajeto"', async () => {
    mockRecommended.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useAirlineRecommendation('GRU', 'LHR'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.uncovered).toBe(false)
    expect(result.current.airlines).toEqual([])
  })

  it('não repete a chamada quando o trajeto não mudou', async () => {
    mockRecommended.mockResolvedValue(MAD_BCN)
    const { rerender, result } = renderHook(
      ({ o, d }) => useAirlineRecommendation(o, d),
      { initialProps: { o: 'MAD', d: 'BCN' } },
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    rerender({ o: 'mad', d: 'bcn' })
    await waitFor(() => expect(mockRecommended).toHaveBeenCalledTimes(1))
  })
})
