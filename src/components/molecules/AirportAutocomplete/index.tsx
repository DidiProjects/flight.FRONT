import { useState, useMemo, useEffect, useRef } from 'react'
import { Autocomplete, TextField, CircularProgress, Typography, Box } from '@mui/material'
import type { UnifiedAirport } from '@app-types/airports'

const MIN_CHARS = 3
const DEBOUNCE_MS = 300

export interface AirportAutocompleteProps {
  label: string
  value: string
  airports: UnifiedAirport[]
  onChange: (code: string) => void
  error?: boolean
  helperText?: string
  required?: boolean
  size?: 'small' | 'medium'
}

function normalize(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function scoreMatch(airport: UnifiedAirport, query: string): number {
  const q = normalize(query)
  if (!q) return -1
  const code    = normalize(airport.code)
  const city    = normalize(airport.city)
  const name    = normalize(airport.name)
  const region  = normalize(airport.region)
  const country = normalize(airport.countryName)

  if (code === q)             return 0
  if (code.startsWith(q))    return 1
  if (city.startsWith(q))    return 2
  if (name.startsWith(q))    return 3
  if (city.includes(q))      return 4
  if (name.includes(q))      return 5
  if (region.includes(q))    return 6
  if (country.includes(q))   return 7
  return -1
}

function formatDisplay(airport: UnifiedAirport): string {
  return airport.city ? `${airport.code} - ${airport.city}` : airport.code
}

export function AirportAutocomplete({
  label,
  value,
  airports,
  onChange,
  error,
  helperText,
  required,
  size = 'medium',
}: AirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState<string>(() => {
    if (!value) return ''
    const found = airports.find((a) => a.code === value.toUpperCase())
    return found ? formatDisplay(found) : value
  })

  // Debounced copy of inputValue — updated only after DEBOUNCE_MS of inactivity
  const [debouncedInput, setDebouncedInput] = useState(inputValue)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Sync inputValue when value prop changes externally (e.g. form reset)
  useEffect(() => {
    if (!value) {
      setInputValue('')
      setDebouncedInput('')
      return
    }
    const found = airports.find((a) => a.code === value.toUpperCase())
    const display = found ? formatDisplay(found) : value
    setInputValue(display)
    setDebouncedInput(display)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Normalized index for performant filtering — recomputed only when airports changes
  const normalizedAirports = useMemo(
    () =>
      airports.map((a) => ({
        airport: a,
        nCode:    normalize(a.code),
        nCity:    normalize(a.city),
        nName:    normalize(a.name),
        nRegion:  normalize(a.region),
        nCountry: normalize(a.countryName),
      })),
    [airports],
  )

  const filteredOptions = useMemo(() => {
    // Require at least MIN_CHARS characters before filtering
    if (debouncedInput.length < MIN_CHARS) return []

    const q = normalize(debouncedInput)
    if (!q) return []

    const scored: Array<{ airport: UnifiedAirport; score: number }> = []
    for (const entry of normalizedAirports) {
      const score = scoreMatch(entry.airport, debouncedInput)
      if (score !== -1) {
        scored.push({ airport: entry.airport, score })
      }
    }

    scored.sort((a, b) => a.score - b.score || a.airport.code.localeCompare(b.airport.code))
    return scored.slice(0, 50).map((s) => s.airport)
  }, [normalizedAirports, debouncedInput])

  const loading = airports.length === 0 && inputValue.length >= MIN_CHARS

  function handleInputChange(_: React.SyntheticEvent, newInput: string) {
    setInputValue(newInput)

    clearTimeout(debounceTimer.current)

    // If below minimum chars, clear options immediately without waiting
    if (newInput.length < MIN_CHARS) {
      setDebouncedInput(newInput)
      return
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedInput(newInput)
    }, DEBOUNCE_MS)
  }

  function handleChange(_: React.SyntheticEvent, newValue: UnifiedAirport | string | null) {
    if (newValue === null) {
      onChange('')
      setInputValue('')
    } else if (typeof newValue === 'string') {
      const code = newValue.toUpperCase()
      onChange(code)
      setInputValue(code)
    } else {
      onChange(newValue.code)
      setInputValue(formatDisplay(newValue))
    }
  }

  return (
    <Autocomplete
      freeSolo
      options={filteredOptions}
      loading={loading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      filterOptions={(x) => x}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : formatDisplay(option)
      }
      renderOption={(props, option) => {
        const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key }
        return (
          <li key={key} {...rest}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {option.code}
                {option.name ? ` — ${option.name}` : option.city ? ` — ${option.city}` : ''}
              </Typography>
              {(option.city || option.countryName) && (
                <Typography variant="caption" color="text.secondary">
                  {[option.city, option.countryName].filter(Boolean).join(', ')}
                </Typography>
              )}
            </Box>
          </li>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          size={size}
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
