export type RoutinePriority = 'brl' | 'pts' | 'hyb'

export type NotificationMode = 'alert_only' | 'daily_best_and_alert' | 'end_of_period'

export type NotificationFrequency = 'hourly' | 'daily' | 'monthly'

export interface Routine {
  id: string
  userId: string
  name: string
  airline: string
  origin: string
  destination: string
  outboundStart: string
  outboundEnd: string
  returnStart: string | null
  returnEnd: string | null
  passengers: number
  targetBrl: number | null
  targetPts: number | null
  targetHybPts: number | null
  targetHybBrl: number | null
  margin: number
  priority: RoutinePriority
  notificationMode: NotificationMode
  notificationFrequency: NotificationFrequency
  endOfPeriodTime: string | null
  ccEmails: string[]
  pendingRequestId: string | null
  pendingRequestAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateRoutineRequest = Omit<
  Routine,
  'id' | 'userId' | 'pendingRequestId' | 'pendingRequestAt' | 'createdAt' | 'updatedAt'
>

export type UpdateRoutineRequest = Partial<CreateRoutineRequest>
