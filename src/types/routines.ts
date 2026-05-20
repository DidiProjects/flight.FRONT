export type RoutinePriority = 'cash' | 'pts' | 'hyb'

export type NotificationMode = 'alert_only' | 'daily_best_and_alert' | 'end_of_period'

export type NotificationFrequency = 'hourly' | 'daily' | 'monthly'

export interface Routine {
  id: string
  userId: string
  name: string
  airlines: string[]
  origin: string
  destination: string
  outboundStart: string
  outboundEnd: string
  returnStart: string | null
  returnEnd: string | null
  passengers: number
  currency: string
  targetCash: number | null
  targetPts: number | null
  targetHybPts: number | null
  targetHybCash: number | null
  margin: number
  priority: RoutinePriority
  notificationMode: NotificationMode
  notificationFrequency: NotificationFrequency
  endOfPeriodTime: string | null
  ccEmails: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateRoutineRequest = Omit<
  Routine,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>

export type UpdateRoutineRequest = Partial<CreateRoutineRequest>
