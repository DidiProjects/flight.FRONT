import { ApiService } from './ApiService'
import type { Routine, CreateRoutineRequest, UpdateRoutineRequest } from '@app-types/routines'

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
    airline: raw.airline as string,
    origin: raw.origin as string,
    destination: raw.destination as string,
    outboundStart: toDate(raw.outbound_start ?? raw.outboundStart),
    outboundEnd: toDate(raw.outbound_end ?? raw.outboundEnd),
    returnStart: raw.return_start ?? raw.returnStart ? toDate(raw.return_start ?? raw.returnStart) : null,
    returnEnd: raw.return_end ?? raw.returnEnd ? toDate(raw.return_end ?? raw.returnEnd) : null,
    passengers: Number(raw.passengers),
    currency: (raw.currency ?? 'BRL') as string,
    targetCash: toNum(raw.target_cash ?? raw.targetCash),
    targetPts: toNum(raw.target_pts ?? raw.targetPts),
    targetHybPts: toNum(raw.target_hyb_pts ?? raw.targetHybPts),
    targetHybCash: toNum(raw.target_hyb_cash ?? raw.targetHybCash),
    margin: Number(raw.margin),
    priority: (raw.priority as Routine['priority']),
    notificationMode: (raw.notification_mode ?? raw.notificationMode) as Routine['notificationMode'],
    notificationFrequency: (raw.notification_frequency ?? raw.notificationFrequency) as Routine['notificationFrequency'],
    endOfPeriodTime: (raw.end_of_period_time ?? raw.endOfPeriodTime ?? null) as string | null,
    ccEmails: (raw.cc_emails ?? raw.ccEmails ?? []) as string[],
    pendingRequestId: (raw.pending_request_id ?? raw.pendingRequestId ?? null) as string | null,
    pendingRequestAt: (raw.pending_request_at ?? raw.pendingRequestAt ?? null) as string | null,
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
}

export const RoutinesService = new RoutinesServiceClass()
