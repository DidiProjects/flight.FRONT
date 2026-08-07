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
 * Entrada do formulário. Mantém o vocabulário da UI (`returnStart`/`returnEnd`);
 * o RoutinesService traduz para `tripType` + `inboundStart`/`inboundEnd` ao enviar.
 * Uma viagem de ida-e-volta é UMA rotina — não são mais duas.
 */
export interface CreateTripInput extends Omit<CreateRoutineRequest, 'tripType' | 'inboundStart' | 'inboundEnd'> {
  returnStart: string | null
  returnEnd: string | null
}
