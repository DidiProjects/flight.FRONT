import { useState, useEffect, useRef } from 'react'
import { AirlinesService } from '@services/AirlinesService'
import type { AirlineRecommendation, RecommendationReason } from '@app-types/airlines'

/**
 * Quais companhias fazem sentido para o trajeto, segundo a API.
 *
 * Substitui o `getAirlineCoverageStatus` que vivia no `RoutineForm` e decidia
 * isso no browser, perguntando se a lista de aeroportos da companhia continha
 * as duas pontas. Aquela regra oferece LATAM para um Madri–Barcelona: a lista
 * dela é de destinos bilhetáveis, com codeshare dentro, não de rede operada. O
 * que separa as duas é direito de tráfego, e isso mora no banco — não dá para
 * derivar da lista de aeroportos.
 */
export interface UseAirlineRecommendationResult {
  /** Todas as ativas, recomendadas primeiro. Vazio enquanto não há trajeto. */
  airlines: AirlineRecommendation[]
  /** Só os códigos recomendados, na ordem em que vieram. */
  recommendedCodes: string[]
  loading: boolean
  /** Trajeto informado e nenhuma companhia atende. */
  uncovered: boolean
  reasonOf: (code: string) => RecommendationReason | undefined
}

export function useAirlineRecommendation(origin: string, destination: string): UseAirlineRecommendationResult {
  const [airlines, setAirlines] = useState<AirlineRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const prevKeyRef = useRef<string>('')

  useEffect(() => {
    const o = origin.trim().toUpperCase()
    const d = destination.trim().toUpperCase()
    // O trajeto só existe com as duas pontas; e origem igual a destino a API
    // recusa, então nem chega lá.
    const completo = o.length === 3 && d.length === 3 && o !== d
    const key = completo ? `${o}-${d}` : ''
    if (key === prevKeyRef.current) return
    prevKeyRef.current = key

    if (!completo) {
      setAirlines([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    AirlinesService.recommended(o, d)
      .then((list) => { if (!cancelled) setAirlines(list) })
      // Falha de rede não pode travar o formulário: sem recomendação, o seletor
      // volta a oferecer tudo sem destaque, que é pior mas não impede criar.
      .catch(() => { if (!cancelled) setAirlines([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [origin, destination])

  const recomendadas = airlines.filter((a) => a.recommended)

  return {
    airlines,
    recommendedCodes: recomendadas.map((a) => a.code),
    loading,
    // `airlines.length > 0` separa "nenhuma atende" de "ainda não perguntei":
    // a API devolve todas as ativas, então lista cheia sem nenhuma recomendada
    // é resposta, lista vazia é ausência de resposta.
    uncovered: !loading && airlines.length > 0 && recomendadas.length === 0,
    reasonOf: (code) => airlines.find((a) => a.code === code)?.reason,
  }
}
