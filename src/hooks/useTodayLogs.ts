import { useState, useEffect, useCallback } from 'react'
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

  const load = useCallback(async () => {
    const startOfDay = getStartOfDay()

    // 오늘 시작된 로그 + 어제 시작됐지만 아직 안 끝난 로그 (날짜 걸치는 경우)
    const aLogs = await db.activityLogs
      .where('startedAt')
      .aboveOrEqual(startOfDay)
      .toArray()

    // 어제 이전에 시작됐지만 오늘까지 이어지는 로그
    const ongoingOldLogs = await db.activityLogs
      .where('startedAt')
      .below(startOfDay)
      .filter((log) => !log.endedAt || log.endedAt > startOfDay)
      .toArray()

    const eLogs = await db.eventLogs
      .where('occurredAt')
      .aboveOrEqual(startOfDay)
      .toArray()

    setActivityLogs([...ongoingOldLogs, ...aLogs])
    setEventLogs(eLogs)
  }, [])

  useEffect(() => {
    load()

    const interval = setInterval(load, 10000)

    // 백그라운드에서 복귀 시 즉시 로드
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        load()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', load)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', load)
    }
  }, [load])

  return { activityLogs, eventLogs, reload: load }
}
