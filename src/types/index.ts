export interface Activity {
  id: string
  name: string
  color: string
  order: number
  createdAt: number
}

export interface EventType {
  id: string
  name: string
  color: string
  icon?: string
  createdAt: number
}

export interface ActivityLog {
  id?: number
  activityId: string
  startedAt: number
  endedAt?: number
}

export interface EventLog {
  id?: number
  eventTypeId: string
  occurredAt: number
}
