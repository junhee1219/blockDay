import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useActivityStore } from '../stores/useActivityStore'
import { useEventStore } from '../stores/useEventStore'
import { useDateLogs } from '../hooks/useDateLogs'

function formatHour(hour: number): string {
  const ampm = hour < 12 ? '오전' : '오후'
  const h = hour % 12 || 12
  return `${ampm} ${h}시`
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const h = d.getHours()
  const m = d.getMinutes()
  const ampm = h < 12 ? '오전' : '오후'
  return `${ampm} ${h % 12 || 12}:${String(m).padStart(2, '0')}`
}

function formatLogDuration(startedAt: number, endedAt?: number): string {
  const end = endedAt ?? Date.now()
  const ms = end - startedAt
  const totalMinutes = Math.floor(ms / 60000)
  if (totalMinutes < 1) return '1분 미만'
  if (totalMinutes < 60) return `${totalMinutes}분`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes}분`
  const totalHours = Math.floor(totalMinutes / 60)
  const remainMinutes = totalMinutes % 60
  if (totalHours < 24) {
    return remainMinutes > 0 ? `${totalHours}시간 ${remainMinutes}분` : `${totalHours}시간`
  }
  const days = Math.floor(totalHours / 24)
  const remainHours = totalHours % 24
  if (remainHours === 0) return `${days}일`
  return `${days}일 ${remainHours}시간`
}

function formatDateLabel(date: Date): string {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return '오늘의 블록'
  if (date.toDateString() === yesterday.toDateString()) return '어제의 블록'

  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${month}월 ${day}일 (${weekday})`
}

export default function TimelineScreen() {
  const { activities } = useActivityStore()
  const { eventTypes } = useEventStore()

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const isToday = selectedDate.toDateString() === new Date().toDateString()

  const { activityLogs, eventLogs } = useDateLogs(selectedDate)

  const goBack = () => {
    setSelectedDate((d) => {
      const prev = new Date(d)
      prev.setDate(prev.getDate() - 1)
      return prev
    })
  }

  const goForward = () => {
    if (isToday) return
    setSelectedDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      return next
    })
  }

  const goToday = () => setSelectedDate(new Date())

  const hours = useMemo(() => {
    if (isToday) {
      const now = new Date()
      return Array.from({ length: now.getHours() + 1 }, (_, i) => i)
    }
    // 과거 날짜면 24시간 전체 (기록이 있는 시간대만)
    return Array.from({ length: 24 }, (_, i) => i)
  }, [isToday, selectedDate.toDateString()])

  // 활동별 총 시간 계산
  const activitySummary = useMemo(() => {
    const summary = new Map<string, number>()
    const now = Date.now()

    activityLogs.forEach((log) => {
      const duration = (log.endedAt ?? now) - log.startedAt
      summary.set(log.activityId, (summary.get(log.activityId) ?? 0) + duration)
    })

    return activities
      .map((a) => ({
        activity: a,
        duration: summary.get(a.id) ?? 0,
      }))
      .filter((s) => s.duration > 0)
      .sort((a, b) => b.duration - a.duration)
  }, [activities, activityLogs])

  const totalTracked = useMemo(
    () => activitySummary.reduce((sum, s) => sum + s.duration, 0),
    [activitySummary],
  )

  // 이벤트별 횟수 계산
  const eventSummary = useMemo(() => {
    const counts = new Map<string, number>()

    eventLogs.forEach((log) => {
      counts.set(log.eventTypeId, (counts.get(log.eventTypeId) ?? 0) + 1)
    })

    return eventTypes
      .map((e) => ({
        eventType: e,
        count: counts.get(e.id) ?? 0,
      }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [eventTypes, eventLogs])

  if (activityLogs.length === 0 && eventLogs.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* 날짜 네비게이션 — 빈 화면에서도 표시 */}
        <div className="px-6 pt-14 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="w-11 h-11 rounded-full bg-[var(--color-surface)] flex items-center justify-center active:scale-[0.9] transition-transform"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-[28px] font-extrabold tracking-tight">
                {formatDateLabel(selectedDate)}
              </h2>
            </div>
            <button
              onClick={goForward}
              disabled={isToday}
              className="w-11 h-11 rounded-full bg-[var(--color-surface)] flex items-center justify-center active:scale-[0.9] transition-transform disabled:opacity-20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          {!isToday && (
            <button
              onClick={goToday}
              className="mt-3 mx-auto block text-[14px] text-[var(--color-text-secondary)] font-semibold px-4 py-1.5 rounded-full bg-[var(--color-surface)] active:scale-[0.95] transition-transform"
            >
              오늘로 돌아가기
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-[var(--color-text-secondary)] text-[20px]">
              기록이 없어요
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pb-24">
      {/* 날짜 네비게이션 + 요약 헤더 */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goBack}
            className="w-11 h-11 rounded-full bg-[var(--color-surface)] flex items-center justify-center active:scale-[0.9] transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-center">
            <motion.h2
              key={selectedDate.toDateString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[28px] font-extrabold tracking-tight"
            >
              {formatDateLabel(selectedDate)}
            </motion.h2>
          </div>
          <button
            onClick={goForward}
            disabled={isToday}
            className="w-11 h-11 rounded-full bg-[var(--color-surface)] flex items-center justify-center active:scale-[0.9] transition-transform disabled:opacity-20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        {!isToday && (
          <button
            onClick={goToday}
            className="mx-auto block text-[14px] text-[var(--color-text-secondary)] font-semibold px-4 py-1.5 rounded-full bg-[var(--color-surface)] active:scale-[0.95] transition-transform mb-2"
          >
            오늘로 돌아가기
          </button>
        )}
        <p className="text-[var(--color-text-secondary)] text-[18px] text-center">
          총 {formatDuration(totalTracked)} 기록됨
        </p>
      </div>

      {/* 활동 요약 바 */}
      {totalTracked > 0 && (
        <div className="px-6 mb-8">
          <div className="flex rounded-2xl overflow-hidden h-14">
            {activitySummary.map((s, i) => (
              <motion.div
                key={s.activity.id}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
                className="h-full origin-left flex items-center justify-center"
                style={{
                  backgroundColor: s.activity.color,
                  width: `${(s.duration / totalTracked) * 100}%`,
                }}
              >
                {s.duration / totalTracked > 0.15 && (
                  <span className="text-white text-[15px] font-bold truncate px-2">
                    {s.activity.name}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 활동별 상세 */}
      <div className="px-6 space-y-3 mb-8">
        {activitySummary.map((s, i) => (
          <motion.div
            key={s.activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl px-6 py-5"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: s.activity.color }}
              />
              <span className="text-[19px] font-bold">{s.activity.name}</span>
            </div>
            <span className="text-[var(--color-text-secondary)] text-[18px] font-semibold tabular-nums">
              {formatDuration(s.duration)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 이벤트 요약 */}
      {eventSummary.length > 0 && (
        <div className="px-6 space-y-3 mb-8">
          <h3 className="text-[17px] font-bold text-[var(--color-text-secondary)] mb-5">
            이벤트 요약
          </h3>
          {eventSummary.map((s, i) => (
            <motion.div
              key={s.eventType.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl px-6 py-5"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: s.eventType.color }}
                />
                <span className="text-[19px] font-bold">{s.eventType.name}</span>
              </div>
              <span className="text-[var(--color-text-secondary)] text-[18px] font-semibold tabular-nums">
                {s.count}회
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* 타임라인 */}
      <div className="px-6">
        <h3 className="text-[17px] font-bold text-[var(--color-text-secondary)] mb-5">
          타임라인
        </h3>
        <div className="relative">
          <div className="space-y-0">
            {hours.map((hour) => {
              const dayBase = new Date(selectedDate)
              dayBase.setHours(0, 0, 0, 0)
              const hourStart = new Date(dayBase)
              hourStart.setHours(hour)
              const hourEnd = new Date(dayBase)
              hourEnd.setHours(hour + 1)

              const hourLogs = activityLogs.filter((log) => {
                const end = log.endedAt ?? Date.now()
                return log.startedAt < hourEnd.getTime() && end > hourStart.getTime()
              })

              const hourEvents = eventLogs.filter((log) => {
                return (
                  log.occurredAt >= hourStart.getTime() &&
                  log.occurredAt < hourEnd.getTime()
                )
              })

              if (!isToday && hourLogs.length === 0 && hourEvents.length === 0) return null

              return (
                <div key={hour} className="flex gap-4 min-h-[52px]">
                  <div className="w-16 text-[15px] text-[var(--color-text-tertiary)] pt-1 shrink-0">
                    {formatHour(hour)}
                  </div>
                  <div className="flex-1 border-l border-[var(--color-border)] pl-4 pb-4">
                    <div className="space-y-1.5">
                      {hourLogs.map((log) => {
                        const activity = activities.find(
                          (a) => a.id === log.activityId,
                        )
                        if (!activity) return null
                        return (
                          <div
                            key={log.id}
                            className="rounded-2xl px-5 py-3.5 text-white"
                            style={{ backgroundColor: activity.color }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[17px] font-bold">
                                {activity.name}
                              </span>
                              <span className="text-[15px] text-white/70 font-semibold">
                                {formatLogDuration(log.startedAt, log.endedAt)}
                              </span>
                            </div>
                            <div className="text-[13px] text-white/50 mt-1">
                              {formatTime(log.startedAt)}
                              {' → '}
                              {log.endedAt ? formatTime(log.endedAt) : '진행 중'}
                            </div>
                          </div>
                        )
                      })}
                      {hourEvents.map((log) => {
                        const eventType = eventTypes.find(
                          (e) => e.id === log.eventTypeId,
                        )
                        if (!eventType) return null
                        return (
                          <div
                            key={log.id}
                            className="flex items-center gap-3 py-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: eventType.color }}
                            />
                            <span className="text-[16px] text-[var(--color-text-secondary)] font-semibold">
                              {eventType.name}
                            </span>
                            <span className="text-[14px] text-[var(--color-text-tertiary)]">
                              {formatTime(log.occurredAt)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
