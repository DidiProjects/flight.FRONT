export type RoutinePriority = 'cash' | 'pts' | 'hyb'

export type NotificationMode = 'target' | 'scheduled'

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
  passengers: number
  currency: string | null
  targetCash: number | null
  targetPts: number | null
  targetHybPts: number | null
  targetHybCash: number | null
  margin: number
  priority: RoutinePriority
  notificationModes: NotificationMode[]
  notificationFrequency: NotificationFrequency
  scheduledTime: string | null
  ccEmails: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateRoutineRequest = Omit<
  Routine,
  'id' | 'userId' | 'currency' | 'createdAt' | 'updatedAt'
>

export type UpdateRoutineRequest = Partial<CreateRoutineRequest>

// Entrada do formulário de criação: rotina one-way + datas de volta opcionais.
// Quando há volta, o front divide em 2 rotinas one-way (IDA e VOLTA).
export interface CreateTripInput extends CreateRoutineRequest {
  returnStart: string | null
  returnEnd: string | null
}
