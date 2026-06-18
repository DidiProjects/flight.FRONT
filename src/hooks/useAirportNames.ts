import { useState, useEffect } from 'react'
import { AirportsService } from '@services/AirportsService'

/**
 * Mapa IATA -> cidade (fallback: nome) agregado a partir dos aeroportos das
 * companhias informadas. Usado para exibir nomes amigáveis no lugar de só o código.
 */
export function useAirportNames(airlineCodes: string[]): Map<string, string> {
  const [names, setNames] = useState<Map<string, string>>(new Map())
  const key = JSON.stringify([...new Set(airlineCodes)].sort())

  useEffect(() => {
    const codes = [...new Set(airlineCodes)]
    if (codes.length === 0) {
      setNames(new Map())
      return
    }

    let cancelled = false
    Promise.all(codes.map((c) => AirportsService.listByAirline(c).catch(() => [])))
      .then((lists) => {
        if (cancelled) return
        const map = new Map<string, string>()
        for (const list of lists) {
          for (const airport of list) {
            const label = airport.city ?? airport.name ?? undefined
            if (label && !map.has(airport.code)) map.set(airport.code, label)
          }
        }
        setNames(map)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return names
}
