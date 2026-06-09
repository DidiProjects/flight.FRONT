import { useState, useEffect, useRef } from 'react'
import { AirportsService } from '@services/AirportsService'
import type { Airport, UnifiedAirport } from '@app-types/airports'

export interface UseCoverageResult {
  airports: UnifiedAirport[]
  coverageIndex: Map<string, Set<string>>
  loading: boolean
}

function countFields(airport: Airport): number {
  return [airport.name, airport.city, airport.region, airport.countryName, airport.timezone, airport.currency]
    .filter((v) => v != null && v !== '')
    .length
}

function mergeAirports(a: Airport, b: Airport): Airport {
  const aRicher = countFields(a) >= countFields(b)
  const base = aRicher ? a : b
  const other = aRicher ? b : a
  return {
    code: base.code,
    name: base.name ?? other.name,
    city: base.city ?? other.city,
    region: base.region ?? other.region,
    countryName: base.countryName ?? other.countryName,
    timezone: base.timezone ?? other.timezone,
    currency: base.currency ?? other.currency,
  }
}

export function useCoverage(airlineCodes: string[]): UseCoverageResult {
  const [airports, setAirports] = useState<UnifiedAirport[]>([])
  const [coverageIndex, setCoverageIndex] = useState<Map<string, Set<string>>>(new Map())
  const [loading, setLoading] = useState(false)
  const prevKeyRef = useRef<string>('')

  useEffect(() => {
    const key = JSON.stringify([...airlineCodes].sort())
    if (key === prevKeyRef.current) return
    prevKeyRef.current = key

    if (airlineCodes.length === 0) {
      setAirports([])
      setCoverageIndex(new Map())
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    Promise.all(airlineCodes.map((code) => AirportsService.listByAirline(code).then((list) => ({ code, list }))))
      .then((results) => {
        if (cancelled) return

        // Build coverage index: airlineCode -> Set<airportCode>
        const index = new Map<string, Set<string>>()
        for (const { code, list } of results) {
          index.set(code, new Set(list.map((a) => a.code)))
        }

        // Merge airports into unified list
        const airportMap = new Map<string, { airport: Airport; airlines: string[] }>()
        for (const { code, list } of results) {
          for (const airport of list) {
            const existing = airportMap.get(airport.code)
            if (!existing) {
              airportMap.set(airport.code, { airport, airlines: [code] })
            } else {
              existing.airport = mergeAirports(existing.airport, airport)
              if (!existing.airlines.includes(code)) {
                existing.airlines.push(code)
              }
            }
          }
        }

        const unified: UnifiedAirport[] = Array.from(airportMap.values())
          .map(({ airport, airlines }) => ({ ...airport, airlines }))
          .sort((a, b) => a.code.localeCompare(b.code))

        setAirports(unified)
        setCoverageIndex(index)
      })
      .catch(() => {
        if (!cancelled) {
          setAirports([])
          setCoverageIndex(new Map())
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify([...airlineCodes].sort())])

  return { airports, coverageIndex, loading }
}
