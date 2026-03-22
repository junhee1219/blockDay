import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'
import type { ActivityLog, EventLog } from '../types'

function getStartOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function getEndOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export function useDateLogs(date: Date) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])

  const load = useCallback(async () => {
    const startOfDay = getStartOfDay(date)
    const endOfDay = getEndOfDay(date)

    // 해당 날짜에 시작된 로그
    const aLogs = await db.activityLogs
      .where('startedAt')
      .between(startOfDay, endOfDay, true, true)
      .toArray()

    // 이전에 시작됐지만 해당 날짜까지 이어지는 로그
    const ongoingOldLogs = await db.activityLogs
      .where('startedAt')
      .below(startOfDay)
      .filter((log) => !log.endedAt || log.endedAt > startOfDay)
      .toArray()

    const eLogs = await db.eventLogs
      .where('occurredAt')
      .between(startOfDay, endOfDay, true, true)
      .toArray()

    setActivityLogs([...ongoingOldLogs, ...aLogs])
    setEventLogs(eLogs)
  }, [date.toDateString()])

  useEffect(() => {
    load()

    // 오늘이면 주기적 갱신
    const isToday = date.toDateString() === new Date().toDateString()
    let interval: ReturnType<typeof setInterval> | null = null

    if (isToday) {
      interval = setInterval(load, 10000)

      const handleVisibility = () => {
        if (document.visibilityState === 'visible') load()
      }
      document.addEventListener('visibilitychange', handleVisibility)
      window.addEventListener('focus', load)

      return () => {
        if (interval) clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibility)
        window.removeEventListener('focus', load)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [load])

  return { activityLogs, eventLogs, reload: load }
}
