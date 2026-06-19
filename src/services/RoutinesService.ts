import { ApiService } from './ApiService'
import type { Routine, CreateRoutineRequest, UpdateRoutineRequest, CreateTripInput } from '@app-types/routines'

const MAX_ROUTINES = 10
import type { AnalysisRun, AnalysisRunStatus } from '@app-types/analysisRuns'

function analysisRunFromApi(raw: RawRoutine): AnalysisRun {
  return {
    id: raw.id as string,
    airline: raw.airline as string,
    origin: raw.origin as string,
    destination: raw.destination as string,
    flightDate: toDate(raw.flight_date ?? raw.flightDate),
    status: (raw.status ?? 'running') as AnalysisRunStatus,
    errorMessage: (raw.error_message ?? raw.errorMessage ?? null) as string | null,
    faresFound: toNum(raw.fares_found ?? raw.faresFound),
    startedAt: (raw.started_at ?? raw.startedAt) as string,
    finishedAt: (raw.finished_at ?? raw.finishedAt ?? null) as string | null,
  }
}

// The API returns snake_case with string numbers and ISO datetimes
type RawRoutine = Record<string, unknown>

function toDate(val: unknown): string {
  if (!val) return ''
  return String(val).substring(0, 10)
}

function toNum(val: unknown): number | null {
  if (val == null) return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function fromApi(raw: RawRoutine): Routine {
  return {
    id: raw.id as string,
    userId: (raw.user_id ?? raw.userId) as string,
    name: raw.name as string,
    airlines: (raw.airlines ?? (raw.airline ? [raw.airline as string] : [])) as string[],
    origin: raw.origin as string,
    destination: raw.destination as string,
    outboundStart: toDate(raw.outbound_start ?? raw.outboundStart),
    outboundEnd: toDate(raw.outbound_end ?? raw.outboundEnd),
    passengers: Number(raw.passengers),
    currency: (raw.currency ?? 'BRL') as string,
    targetCash: toNum(raw.target_cash ?? raw.targetCash),
    targetPts: toNum(raw.target_pts ?? raw.targetPts),
    targetHybPts: toNum(raw.target_hyb_pts ?? raw.targetHybPts),
    targetHybCash: toNum(raw.target_hyb_cash ?? raw.targetHybCash),
    margin: Number(raw.margin),
    priority: (raw.priority as Routine['priority']),
    notificationModes: ((raw.notification_modes ?? raw.notificationModes ?? []) as string[]) as Routine['notificationModes'],
    notificationFrequency: (raw.notification_frequency ?? raw.notificationFrequency) as Routine['notificationFrequency'],
    scheduledTime: (raw.scheduled_time ?? raw.scheduledTime ?? null) as string | null,
    ccEmails: (raw.cc_emails ?? raw.ccEmails ?? []) as string[],
    isActive: Boolean(raw.is_active ?? raw.isActive),
    createdAt: (raw.created_at ?? raw.createdAt) as string,
    updatedAt: (raw.updated_at ?? raw.updatedAt) as string,
  }
}

class RoutinesServiceClass extends ApiService {
  async list(): Promise<Routine[]> {
    const raw = await this.get<RawRoutine[]>('/routines')
    return raw.map(fromApi)
  }

  async getById(id: string): Promise<Routine> {
    const raw = await this.get<RawRoutine>(`/routines/${id}`)
    return fromApi(raw)
  }

  create(data: CreateRoutineRequest): Promise<Routine> {
    return this.post<RawRoutine>('/routines', data).then(fromApi)
  }

  /**
   * Criação de viagem. Sem volta → 1 rotina one-way. Com volta → 2 rotinas
   * one-way (IDA e VOLTA, com sufixo no nome). Pré-checa o limite de 10 rotinas.
   */
  async createTrip(input: CreateTripInput, currentCount: number): Promise<Routine[]> {
    const { returnStart, returnEnd, ...base } = input
    const hasReturn = !!returnStart && !!returnEnd

    if (!hasReturn) {
      return [await this.create(base)]
    }

    if (currentCount + 2 > MAX_ROUTINES) {
      const free = Math.max(0, MAX_ROUTINES - currentCount)
      throw new Error(
        `Ida e volta cria 2 rotinas e você tem só ${free} vaga(s) livre(s) (limite ${MAX_ROUTINES}). Crie só a ida ou libere espaço primeiro.`,
      )
    }

    const ida = await this.create({ ...base, name: `${base.name} (IDA)` })
    const volta = await this.create({
      ...base,
      name: `${base.name} (VOLTA)`,
      origin: base.destination,
      destination: base.origin,
      outboundStart: returnStart,
      outboundEnd: returnEnd,
    })
    return [ida, volta]
  }

  update(id: string, data: UpdateRoutineRequest): Promise<Routine> {
    return this.patch<RawRoutine>(`/routines/${id}`, data).then(fromApi)
  }

  remove(id: string): Promise<void> {
    return this.delete<void>(`/routines/${id}`)
  }

  activate(id: string): Promise<Routine> {
    return this.patch<RawRoutine>(`/routines/${id}/activate`).then(fromApi)
  }

  deactivate(id: string): Promise<Routine> {
    return this.patch<RawRoutine>(`/routines/${id}/deactivate`).then(fromApi)
  }

  async listByUser(userId: string): Promise<Routine[]> {
    const raw = await this.get<RawRoutine[]>(`/routines/admin/users/${userId}`)
    return raw.map(fromApi)
  }

  dispatch(id: string): Promise<void> {
    return this.post<void>(`/routines/${id}/dispatch`)
  }

  adminUpdateRoutine(id: string, data: UpdateRoutineRequest): Promise<Routine> {
    return this.patch<RawRoutine>(`/routines/admin/${id}`, data).then(fromApi)
  }

  async listAnalysisRuns(routineId: string): Promise<AnalysisRun[]> {
    const raw = await this.get<RawRoutine[]>(`/routines/admin/${routineId}/analysis-runs`)
    return raw.map(analysisRunFromApi)
  }
}

export const RoutinesService = new RoutinesServiceClass()
