import { useState, useRef } from 'react'
import { Box, TextField, Popover, InputAdornment, IconButton } from '@mui/material'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import { DayPicker, type DateRange } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import 'react-day-picker/src/style.css'

function parseISO(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(date: Date | undefined): string {
  if (!date) return ''
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function fmtDisplay(iso: string | null | undefined): string {
  if (!iso) return '...'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const today = new Date()
today.setHours(0, 0, 0, 0)
const maxDate = new Date(today)
maxDate.setFullYear(maxDate.getFullYear() + 1)

const calendarStyle = {
  '--rdp-accent-color': '#1E3A5F',
  '--rdp-accent-background-color': 'rgba(30, 58, 95, 0.1)',
  '--rdp-day-height': '32px',
  '--rdp-day-width': '32px',
  '--rdp-day_button-height': '30px',
  '--rdp-day_button-width': '30px',
  '--rdp-nav_button-height': '1.5rem',
  '--rdp-nav_button-width': '1.5rem',
  '--rdp-nav-height': '1.75rem',
  '--rdp-weekday-padding': '0.2rem 0',
} as React.CSSProperties

const calendarSx = {
  p: 1,
  '& .rdp-month_caption': { fontSize: '0.75rem', fontWeight: 600 },
  '& .rdp-caption_label': { fontSize: '0.75rem', fontWeight: 600 },
  '& .rdp-weekday': { fontSize: '0.625rem', letterSpacing: '0.02em' },
  '& .rdp-day_button': { fontSize: '0.72rem' },
  '& .rdp-selected': { fontSize: 'inherit' },
  '& .rdp-chevron': { width: 14, height: 14 },
  '& .rdp-dropdown': { fontSize: '0.72rem' },
  '& .rdp-dropdown_root': { fontSize: '0.72rem' },
}

export interface DateRangePickerFieldProps {
  label: string
  startDate: string | null
  endDate: string | null
  onChange: (start: string, end: string) => void
  required?: boolean
  clearable?: boolean
  error?: boolean
  helperText?: string
  maxRangeDays?: number
}

export function DateRangePickerField({
  label,
  startDate,
  endDate,
  onChange,
  required,
  clearable,
  error,
  helperText,
  maxRangeDays,
}: DateRangePickerFieldProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [selecting, setSelecting] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const range: DateRange = {
    from: parseISO(startDate),
    to: parseISO(endDate),
  }

  // When a start date is selected and the user is picking the end date,
  // disable dates that would exceed maxRangeDays from the start.
  const rangeDisabled: { after: Date } | undefined = (() => {
    if (!maxRangeDays || !selecting || !range.from) return undefined
    const limit = new Date(range.from)
    limit.setDate(limit.getDate() + maxRangeDays)
    return { after: limit }
  })()

  const hasValue = !!(startDate || endDate)
  const displayValue = hasValue
    ? `${fmtDisplay(startDate)} – ${fmtDisplay(endDate)}`
    : ''

  function open() {
    setSelecting(false)
    setAnchorEl(rootRef.current)
  }

  function close() {
    setSelecting(false)
    setAnchorEl(null)
  }

  function handleSelect(selected: DateRange | undefined) {
    onChange(toISO(selected?.from), toISO(selected?.to))
    if (!selecting) {
      setSelecting(true)
    } else if (selected?.to) {
      close()
    } else {
      setSelecting(true)
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('', '')
  }

  return (
    <Box ref={rootRef} sx={{ width: '100%' }}>
      <TextField
        label={label}
        value={displayValue}
        onClick={open}
        required={required}
        error={error}
        helperText={helperText}
        size="medium"
        fullWidth
        placeholder="DD/MM/AAAA – DD/MM/AAAA"
        inputProps={{ readOnly: true, style: { cursor: 'pointer' } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {clearable && hasValue ? (
                <IconButton size="small" edge="end" onClick={handleClear} tabIndex={-1}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              ) : (
                <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              )}
            </InputAdornment>
          ),
        }}
      />
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ mt: 0.5 }}
      >
        <Box sx={calendarSx}>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            locale={ptBR}
            captionLayout="dropdown"
            startMonth={today}
            endMonth={maxDate}
            disabled={rangeDisabled
              ? [{ before: today }, { after: maxDate }, rangeDisabled]
              : [{ before: today }, { after: maxDate }]}
            style={calendarStyle}
          />
        </Box>
      </Popover>
    </Box>
  )
}
