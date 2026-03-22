import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useActivityStore } from '../stores/useActivityStore'
import { useEventStore } from '../stores/useEventStore'
import { useTodayLogs } from '../hooks/useTodayLogs'

function formatHour(hour: number): string {
  const ampm = hour < 12 ? '오전' : '오후'
  const h = hour % 12 || 12
  return `${ampm} ${h}시`
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes}분`
  const hours = Math.floor(minutes / 60)
  const remainMinutes = minutes % 60
  return remainMinutes > 0 ? `${hours}시간 ${remainMinutes}분` : `${hours}시간`
}

export default function TimelineScreen() {
  const { activities } = useActivityStore()
  const { eventTypes } = useEventStore()
  const { activityLogs, eventLogs } = useTodayLogs()

  const hours = useMemo(() => {
    const now = new Date()
    return Array.from({ length: now.getHours() + 1 }, (_, i) => i)
  }, [])

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

  if (activityLogs.length === 0 && eventLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-[var(--color-text-secondary)] text-[17px]">
            아직 오늘 기록이 없어요
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pb-24">
      {/* 요약 헤더 */}
      <div className="px-6 pt-14 pb-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[28px] font-bold tracking-tight mb-1"
        >
          오늘의 블록
        </motion.h2>
        <p className="text-[var(--color-text-secondary)] text-[15px]">
          총 {formatDuration(totalTracked)} 기록됨
        </p>
      </div>

      {/* 활동 요약 바 */}
      {totalTracked > 0 && (
        <div className="px-6 mb-8">
          <div className="flex rounded-2xl overflow-hidden h-12">
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
                  <span className="text-white text-[13px] font-semibold truncate px-2">
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
            className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: s.activity.color }}
              />
              <span className="text-[16px] font-medium">{s.activity.name}</span>
            </div>
            <span className="text-[var(--color-text-secondary)] text-[15px] tabular-nums">
              {formatDuration(s.duration)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 타임라인 */}
      <div className="px-6">
        <h3 className="text-[15px] font-semibold text-[var(--color-text-secondary)] mb-4">
          타임라인
        </h3>
        <div className="relative">
          {/* 시간축 */}
          <div className="space-y-0">
            {hours.map((hour) => {
              const hourStart = new Date()
              hourStart.setHours(hour, 0, 0, 0)
              const hourEnd = new Date()
              hourEnd.setHours(hour + 1, 0, 0, 0)

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

              return (
                <div key={hour} className="flex gap-4 min-h-[48px]">
                  <div className="w-14 text-[13px] text-[var(--color-text-tertiary)] pt-1 shrink-0">
                    {formatHour(hour)}
                  </div>
                  <div className="flex-1 border-l border-[var(--color-border)] pl-4 pb-4">
                    <div className="space-y-1">
                      {hourLogs.map((log) => {
                        const activity = activities.find(
                          (a) => a.id === log.activityId,
                        )
                        if (!activity) return null
                        return (
                          <div
                            key={log.id}
                            className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-white"
                            style={{ backgroundColor: activity.color }}
                          >
                            {activity.name}
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
                            className="flex items-center gap-2 text-[13px]"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: eventType.color }}
                            />
                            <span className="text-[var(--color-text-secondary)]">
                              {eventType.name}
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
