import type { JobStatus, JobView } from '@app-types/jobs'

export type SortKey = 'airline' | 'route' | 'flightDate' | 'status' | 'runningSince'
export type SortDir = 'asc' | 'desc'

export interface JobsFilter {
  status: JobStatus | 'all'
  airline: string | 'all'
}

export interface JobsSort {
  key: SortKey
  dir: SortDir
}

export const DEFAULT_FILTER: JobsFilter = { status: 'all', airline: 'all' }
export const DEFAULT_SORT: JobsSort = { key: 'runningSince', dir: 'desc' }

const routeOf = (j: JobView): string => `${j.origin}-${j.destination}`

const COMPARATORS: Record<SortKey, (a: JobView, b: JobView) => number> = {
  airline:      (a, b) => a.airline.localeCompare(b.airline),
  route:        (a, b) => routeOf(a).localeCompare(routeOf(b)),
  flightDate:   (a, b) => a.flightDate.localeCompare(b.flightDate),
  status:       (a, b) => a.status.localeCompare(b.status),
  runningSince: (a, b) => (a.runningSince ?? '').localeCompare(b.runningSince ?? ''),
}

export function distinctAirlines(jobs: JobView[]): string[] {
  return [...new Set(jobs.map((j) => j.airline))].sort()
}

export function filterJobs(jobs: JobView[], filter: JobsFilter): JobView[] {
  return jobs.filter(
    (j) =>
      (filter.status === 'all' || j.status === filter.status) &&
      (filter.airline === 'all' || j.airline === filter.airline),
  )
}

export function sortJobs(jobs: JobView[], { key, dir }: JobsSort): JobView[] {
  const factor = dir === 'asc' ? 1 : -1
  return [...jobs].sort((a, b) => factor * COMPARATORS[key](a, b))
}

export function nextSort(current: JobsSort, key: SortKey): JobsSort {
  if (current.key !== key) return { key, dir: 'asc' }
  return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
}
