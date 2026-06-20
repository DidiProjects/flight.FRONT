import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material'
import type { JobStatus } from '@app-types/jobs'
import { STATUS_LABEL, STATUS_OPTIONS } from './jobsStatus'
import type { JobsFilter } from './jobsView'

interface Props {
  filter: JobsFilter
  airlines: string[]
  onChange: (filter: JobsFilter) => void
}

export function JobsFilters({ filter, airlines, onChange }: Props) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="jobs-status-filter">Status</InputLabel>
        <Select
          labelId="jobs-status-filter"
          label="Status"
          value={filter.status}
          onChange={(e) => onChange({ ...filter, status: e.target.value as JobStatus | 'all' })}
        >
          <MenuItem value="all">Todos</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>{STATUS_LABEL[s]}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="jobs-airline-filter">Companhia</InputLabel>
        <Select
          labelId="jobs-airline-filter"
          label="Companhia"
          value={filter.airline}
          onChange={(e) => onChange({ ...filter, airline: e.target.value })}
        >
          <MenuItem value="all">Todas</MenuItem>
          {airlines.map((a) => (
            <MenuItem key={a} value={a} sx={{ textTransform: 'capitalize' }}>{a}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}
