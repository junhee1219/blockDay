import Dexie, { type EntityTable } from 'dexie'
import type { Activity, EventType, ActivityLog, EventLog } from '../types'

const db = new Dexie('BlockDayDB') as Dexie & {
  activities: EntityTable<Activity, 'id'>
  eventTypes: EntityTable<EventType, 'id'>
  activityLogs: EntityTable<ActivityLog, 'id'>
  eventLogs: EntityTable<EventLog, 'id'>
}

db.version(1).stores({
  activities: 'id, order, createdAt',
  eventTypes: 'id, createdAt',
  activityLogs: '++id, activityId, startedAt, endedAt',
  eventLogs: '++id, eventTypeId, occurredAt',
})

export { db }
