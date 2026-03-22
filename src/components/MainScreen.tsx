import { useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useActivityStore } from '../stores/useActivityStore'
import { useTimer } from '../hooks/useTimer'

const spring = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 300,
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

  useEffect(() => {
    loadActivities()
    loadCurrentLog()
  }, [loadActivities, loadCurrentLog])

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

  // 활동이 없으면 온보딩
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-[32px] font-bold tracking-tight leading-tight mb-3">
            블록데이
          </h1>
          <p className="text-[var(--color-text-secondary)] text-[17px] leading-relaxed">
            탭 한번으로 기록하는 나의 하루
            <br />
            아래 설정에서 활동을 추가해주세요
          </p>
        </motion.div>
      </div>
    )
  }

  const bgColor = currentActivity?.color ?? '#1E1E1E'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentActivity?.id ?? 'idle'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-full cursor-pointer relative overflow-hidden"
        style={{ backgroundColor: bgColor }}
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
          className="absolute w-32 h-32 rounded-full bg-white/10"
        />

        {/* 메인 콘텐츠 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="relative z-10 text-center"
        >
          {isTracking && currentActivity ? (
            <>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/60 text-[15px] font-medium tracking-wide uppercase mb-2"
              >
                진행 중
              </motion.p>
              <h1 className="text-[48px] font-bold tracking-tight text-white mb-4">
                {currentActivity.name}
              </h1>
              <motion.p
                className="text-[64px] font-extralight tracking-tight text-white/90 tabular-nums"
                key={formatted}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
              >
                {formatted}
              </motion.p>
            </>
          ) : (
            <>
              <p className="text-white/60 text-[15px] font-medium mb-2">
                탭하여 시작
              </p>
              <h1 className="text-[40px] font-bold tracking-tight text-white">
                {activities[0]?.name}
              </h1>
            </>
          )}
        </motion.div>

        {/* 다음 활동 힌트 */}
        {isTracking && nextActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="absolute bottom-16 text-white/40 text-[14px]"
          >
            탭하면 → <span className="font-semibold text-white/60">{nextActivity.name}</span>
          </motion.div>
        )}

        {/* 정지 힌트 */}
        {isTracking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-6 text-white/25 text-[12px]"
          >
            길게 눌러서 정지
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
