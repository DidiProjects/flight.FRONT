import { describe, it, expect } from 'vitest'
import { mergeRuns, matchesRoutine } from './runMerge'
import type { AnalysisRun } from '@app-types/analysisRuns'
import type { JobView } from '@app-types/jobs'
import type { Routine } from '@app-types/routines'

function job(overrides: Partial<JobView> = {}): JobView {
  return {
    requestId: 'req-1',
    jobId: 'job-1',
    airline: 'latam',
    origin: 'ARN',
    destination: 'CNF',
    flightDate: '2026-08-29',
    status: 'success',
    runningSince: '2026-06-27T08:57:00Z',
    startedAt: '2026-06-27T08:57:00Z',
    finishedAt: '2026-06-27T09:13:00Z',
    lastError: null,
    faresFound: 7,
    userEmails: [],
    orphanedAt: null,
    ...overrides,
  }
}

function historyRun(overrides: Partial<AnalysisRun> = {}): AnalysisRun {
  return {
    id: 'run-1',
    requestId: 'req-1',
    airline: 'latam',
    origin: 'ARN',
    destination: 'CNF',
    flightDate: '2026-08-29',
    status: 'running',
    errorMessage: null,
    faresFound: null,
    startedAt: '2026-06-27T08:57:00Z',
    finishedAt: null,
    ...overrides,
  }
}

const routine = {
  airlines: ['latam'],
  origin: 'ARN',
  destination: 'CNF',
  outboundStart: '2026-08-01',
  outboundEnd: '2026-08-31',
} as Routine

describe('runMerge', () => {
  it('overlay: job.finished ao vivo preenche finishedAt e faresFound numa run que estava running', () => {
    const [merged] = mergeRuns([historyRun()], [job({ status: 'success', faresFound: 7 })])
    expect(merged.status).toBe('success')
    expect(merged.faresFound).toBe(7)
    expect(merged.finishedAt).toBe('2026-06-27T09:13:00Z')
  })

  it('jobToRun: run que só existe ao vivo (não estava no histórico REST) carrega faresFound e finishedAt', () => {
    const [merged] = mergeRuns([], [job({ requestId: 'req-novo', faresFound: 20 })])
    expect(merged.requestId).toBe('req-novo')
    expect(merged.status).toBe('success')
    expect(merged.faresFound).toBe(20)
    expect(merged.finishedAt).toBe('2026-06-27T09:13:00Z')
  })

  it('overlay não zera dados do histórico quando o job ao vivo ainda não tem (faresFound undefined)', () => {
    const run = historyRun({ status: 'success', faresFound: 5, finishedAt: '2026-06-27T09:00:00Z' })
    const live = job({ status: 'running', faresFound: undefined, finishedAt: null })
    const [merged] = mergeRuns([run], [live])
    expect(merged.faresFound).toBe(5)
    expect(merged.finishedAt).toBe('2026-06-27T09:00:00Z')
  })

  it('matchesRoutine casa por rota+data dentro do range e ignora fora', () => {
    expect(matchesRoutine(job(), routine)).toBe(true)
    expect(matchesRoutine(job({ destination: 'GRU' }), routine)).toBe(false)
    expect(matchesRoutine(job({ flightDate: '2026-09-10' }), routine)).toBe(false)
  })
})
