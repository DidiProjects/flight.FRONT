export type RoutinePriority = 'cash' | 'pts' | 'hyb'

export type NotificationMode = 'target' | 'scheduled'

export type NotificationFrequency = 'hourly' | 'daily' | 'monthly'

export type TripType = 'one_way' | 'round_trip'

export interface Routine {
  id: string
  userId: string
  name: string
  airlines: string[]
  origin: string
  destination: string
  outboundStart: string
  outboundEnd: string
  tripType: TripType
  inboundStart: string | null
  inboundEnd: string | null
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

/**
 * Form input. Keeps the UI vocabulary (`returnStart`/`returnEnd`); RoutinesService
 * translates it into `tripType` + `inboundStart`/`inboundEnd` on submit.
 * A round-trip journey is ONE routine — no longer two.
 */
export interface CreateTripInput extends Omit<CreateRoutineRequest, 'tripType' | 'inboundStart' | 'inboundEnd'> {
  returnStart: string | null
  returnEnd: string | null
}
