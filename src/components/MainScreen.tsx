import { useEffect, useMemo, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useActivityStore } from '../stores/useActivityStore'
import { useEventStore } from '../stores/useEventStore'
import { useTimer } from '../hooks/useTimer'

const spring = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 300,
}

// 색상을 어둡게/밝게 조절
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export default function MainScreen() {
  const {
    activities,
    currentLog,
    isTracking,
    loadActivities,
    loadCurrentLog,
    switchActivity,
    stopTracking,
  } = useActivityStore()

  const { eventTypes, loadEventTypes, logEvent } = useEventStore()

  const [loggedEventId, setLoggedEventId] = useState<string | null>(null)

  useEffect(() => {
    loadActivities()
    loadCurrentLog()
    loadEventTypes()
  }, [loadActivities, loadCurrentLog, loadEventTypes])

  const currentActivity = useMemo(
    () => activities.find((a) => a.id === currentLog?.activityId),
    [activities, currentLog],
  )

  const nextActivity = useMemo(() => {
    if (!currentActivity || activities.length === 0) return activities[0]
    const currentIndex = activities.findIndex((a) => a.id === currentActivity.id)
    return activities[(currentIndex + 1) % activities.length]
  }, [activities, currentActivity])

  const { formatted } = useTimer(currentLog?.startedAt ?? null)

  const handleTap = useCallback(() => {
    if (activities.length === 0) return

    if (!isTracking) {
      switchActivity(activities[0].id)
    } else if (nextActivity) {
      switchActivity(nextActivity.id)
    }
  }, [activities, isTracking, nextActivity, switchActivity])

  const handleLongPress = useCallback(() => {
    if (isTracking) {
      stopTracking()
    }
  }, [isTracking, stopTracking])

  const handleEventLog = useCallback(
    async (e: React.MouseEvent | React.TouchEvent, eventTypeId: string) => {
      e.stopPropagation()
      await logEvent(eventTypeId)
      setLoggedEventId(eventTypeId)
      setTimeout(() => setLoggedEventId(null), 800)
    },
    [logEvent],
  )

  // 활동이 없으면 온보딩
  if (activities.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full px-10"
        style={{
          background: 'linear-gradient(160deg, #1a1a2e 0%, #0a0a0a 50%, #16213e 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="text-center"
        >
          <h1
            className="text-[48px] font-extrabold tracking-tight leading-tight mb-4"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #a8b4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            블록데이
          </h1>
          <p className="text-white/50 text-[22px] leading-relaxed font-medium">
            탭 한번으로 기록하는
            <br />
            나의 하루
          </p>
          <p className="text-white/30 text-[17px] mt-6">
            아래 설정에서 활동을 추가해주세요
          </p>
        </motion.div>
      </div>
    )
  }

  const bgColor = currentActivity?.color ?? '#1E1E1E'
  const bgDark = adjustColor(bgColor, -40)
  const bgLight = adjustColor(bgColor, 30)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentActivity?.id ?? 'idle'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-full cursor-pointer relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${bgDark} 0%, ${bgColor} 40%, ${bgLight} 100%)`,
        }}
        onClick={handleTap}
        onContextMenu={(e) => {
          e.preventDefault()
          handleLongPress()
        }}
        onTouchStart={() => {
          const timer = setTimeout(handleLongPress, 600)
          const cleanup = () => {
            clearTimeout(timer)
            window.removeEventListener('touchend', cleanup)
            window.removeEventListener('touchmove', cleanup)
          }
          window.addEventListener('touchend', cleanup)
          window.addEventListener('touchmove', cleanup)
        }}
      >
        {/* 리플 이펙트 */}
        <motion.div
          key={`ripple-${currentLog?.startedAt}`}
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute w-40 h-40 rounded-full bg-white/10"
        />

        {/* 메인 콘텐츠 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="relative z-10 text-center px-8"
        >
          {isTracking && currentActivity ? (
            <>
              <h1
                className="text-[64px] font-extrabold tracking-tight mb-6"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {currentActivity.name}
              </h1>
              <motion.p
                className="text-[84px] font-extralight tracking-tight tabular-nums"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                key={formatted}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
              >
                {formatted}
              </motion.p>
            </>
          ) : (
            <>
              <p className="text-white/40 text-[17px] font-bold tracking-[0.2em] uppercase mb-4">
                탭하여 시작
              </p>
              <h1
                className="text-[56px] font-extrabold tracking-tight"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {activities[0]?.name}
              </h1>
            </>
          )}
        </motion.div>

        {/* 이벤트 버튼들 — 화면 하단에 바로 표시 */}
        {eventTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.3 }}
            className="absolute bottom-36 left-0 right-0 flex justify-center gap-3 px-6 z-20"
          >
            {eventTypes.map((et) => (
              <motion.button
                key={et.id}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => handleEventLog(e, et.id)}
                onTouchEnd={(e) => {
                  e.stopPropagation()
                }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full backdrop-blur-md"
                style={{
                  backgroundColor:
                    loggedEventId === et.id
                      ? 'rgba(255,255,255,0.35)'
                      : 'rgba(255,255,255,0.15)',
                  transition: 'background-color 0.3s',
                }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: et.color }}
                />
                <span className="text-white text-[16px] font-semibold whitespace-nowrap">
                  {et.name}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* 다음 활동 힌트 */}
        {isTracking && nextActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="absolute text-white/40 text-[18px] z-10"
            style={{ bottom: eventTypes.length > 0 ? 108 : 136 }}
          >
            탭 → <span className="font-bold text-white/60">{nextActivity.name}</span>
          </motion.div>
        )}

        {/* 정지 힌트 */}
        {isTracking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute text-white/25 text-[15px] z-10"
            style={{ bottom: eventTypes.length > 0 ? 88 : 120 }}
          >
            길게 눌러서 정지
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
