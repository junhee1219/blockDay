import { useState, useEffect } from 'react'
import { db } from '../db'
import type { ActivityLog, EventLog } from '../types'

function getStartOfDay(): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.getTime()
}

export function useTodayLogs() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])

  const load = async () => {
    const startOfDay = getStartOfDay()

    const aLogs = await db.activityLogs
      .where('startedAt')
      .aboveOrEqual(startOfDay)
      .toArray()

    const eLogs = await db.eventLogs
      .where('occurredAt')
      .aboveOrEqual(startOfDay)
      .toArray()

    setActivityLogs(aLogs)
    setEventLogs(eLogs)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [])

  return { activityLogs, eventLogs, reload: load }
}
