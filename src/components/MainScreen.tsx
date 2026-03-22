import { useEffect, useMemo, useCallback, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useActivityStore } from '../stores/useActivityStore'
import { useEventStore } from '../stores/useEventStore'
import { useTimer } from '../hooks/useTimer'

const spring = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 300,
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r},${g},${b},${alpha})`
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
    updateCurrentMemo,
  } = useActivityStore()

  const { eventTypes, loadEventTypes, logEvent } = useEventStore()
  const [loggedEventId, setLoggedEventId] = useState<string | null>(null)
  const [showMemo, setShowMemo] = useState(false)
  const [memoText, setMemoText] = useState('')
  const memoRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadActivities()
    loadCurrentLog()
    loadEventTypes()
  }, [loadActivities, loadCurrentLog, loadEventTypes])

  const currentActivity = useMemo(
    () => activities.find((a) => a.id === currentLog?.activityId),
    [activities, currentLog],
  )

  const { formatted } = useTimer(currentLog?.startedAt ?? null)

  const handleActivityTap = useCallback(
    (activityId: string) => {
      switchActivity(activityId)
    },
    [switchActivity],
  )

  const handleStop = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation()
      if (isTracking) stopTracking()
    },
    [isTracking, stopTracking],
  )

  const handleOpenMemo = useCallback(() => {
    setMemoText(currentLog?.memo ?? '')
    setShowMemo(true)
    setTimeout(() => memoRef.current?.focus(), 100)
  }, [currentLog])

  const handleSaveMemo = useCallback(async () => {
    await updateCurrentMemo(memoText.trim())
    setShowMemo(false)
  }, [memoText, updateCurrentMemo])

  const handleEventLog = useCallback(
    async (eventTypeId: string) => {
      await logEvent(eventTypeId)
      setLoggedEventId(eventTypeId)
      setTimeout(() => setLoggedEventId(null), 800)
    },
    [logEvent],
  )

  // 온보딩
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

  const activeColor = currentActivity?.color ?? '#333'

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        background: isTracking
          ? `linear-gradient(180deg, ${adjustColor(activeColor, -60)} 0%, var(--color-bg) 35%)`
          : 'var(--color-bg)',
        paddingBottom: 100,
        transition: 'background 0.5s ease',
      }}
    >
      {/* === 현재 활동 카드 (트래킹 중일 때) === */}
      <AnimatePresence mode="wait">
        {isTracking && currentActivity ? (
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mx-5 mt-6 rounded-3xl p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${activeColor} 0%, ${adjustColor(activeColor, -30)} 100%)`,
              boxShadow: `0 8px 32px ${hexToRgba(activeColor, 0.3)}, 0 2px 8px rgba(0,0,0,0.3)`,
            }}
          >
            {/* 배경 장식 */}
            <div
              className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
              style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }}
            />

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white/60 text-[13px] font-semibold tracking-widest uppercase mb-1">
                  현재 활동
                </p>
                <h2 className="text-white text-[32px] font-extrabold tracking-tight leading-tight">
                  {currentActivity.name}
                </h2>
                <motion.p
                  className="text-white/90 text-[48px] font-extralight tracking-tight tabular-nums mt-1 leading-none"
                  key={formatted}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                >
                  {formatted}
                </motion.p>
              </div>

              {/* 버튼들 */}
              <div className="flex flex-col gap-2.5">
                {/* 정지 버튼 */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleStop}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <div className="w-4 h-4 rounded-[3px] bg-white" />
                </motion.button>

                {/* 메모 버튼 */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleOpenMemo}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm relative"
                  style={{
                    backgroundColor: currentLog?.memo
                      ? 'rgba(255,255,255,0.3)'
                      : 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  {currentLog?.memo && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-5 mt-6 mb-1"
          >
            <h2 className="text-white/30 text-[20px] font-bold">
              활동을 선택하세요
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === 활동 블록 그리드 === */}
      <div className="px-5 mt-5">
        <p className="text-white/40 text-[13px] font-semibold tracking-widest uppercase mb-3 px-1">
          활동
        </p>
        <div className="grid grid-cols-3 gap-3">
          {activities.map((activity, i) => {
            const isActive = currentActivity?.id === activity.id
            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: i * 0.03 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleActivityTap(activity.id)}
                className="relative rounded-2xl p-4 text-left overflow-hidden"
                style={{
                  aspectRatio: '1',
                  background: isActive
                    ? `linear-gradient(135deg, ${activity.color} 0%, ${adjustColor(activity.color, -25)} 100%)`
                    : 'var(--color-surface)',
                  border: isActive
                    ? `2px solid ${hexToRgba(activity.color, 0.6)}`
                    : '2px solid transparent',
                  boxShadow: isActive
                    ? `0 4px 20px ${hexToRgba(activity.color, 0.25)}`
                    : 'none',
                  transition: 'box-shadow 0.3s, border-color 0.3s',
                }}
              >
                {/* 색상 도트 (비활성 시) */}
                {!isActive && (
                  <div
                    className="w-4 h-4 rounded-full mb-3"
                    style={{ backgroundColor: activity.color }}
                  />
                )}

                {/* 활성 표시 (재생 아이콘) */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 mb-3 flex items-center justify-center"
                  >
                    <div className="flex gap-[3px]">
                      <motion.div
                        animate={{ scaleY: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                        className="w-[3px] h-4 rounded-full bg-white/80"
                        style={{ transformOrigin: 'bottom' }}
                      />
                      <motion.div
                        animate={{ scaleY: [1, 0.4, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                        className="w-[3px] h-4 rounded-full bg-white/80"
                        style={{ transformOrigin: 'bottom' }}
                      />
                      <motion.div
                        animate={{ scaleY: [0.6, 1, 0.6] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                        className="w-[3px] h-4 rounded-full bg-white/80"
                        style={{ transformOrigin: 'bottom' }}
                      />
                    </div>
                  </motion.div>
                )}

                <span
                  className="text-[16px] font-bold block leading-snug"
                  style={{
                    color: isActive ? 'white' : 'var(--color-text-primary)',
                  }}
                >
                  {activity.name}
                </span>

                {/* 활성 블록에 체크 표시 */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-3 right-3"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* === 이벤트 섹션 === */}
      {eventTypes.length > 0 && (
        <div className="px-5 mt-7">
          <p className="text-white/40 text-[13px] font-semibold tracking-widest uppercase mb-3 px-1">
            이벤트
          </p>
          <div
            className="flex gap-2.5 overflow-x-auto pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {eventTypes.map((et, i) => (
              <motion.button
                key={et.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: i * 0.04 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEventLog(et.id)}
                className="flex items-center gap-2.5 px-5 py-3.5 rounded-full shrink-0 relative overflow-hidden"
                style={{
                  backgroundColor: loggedEventId === et.id
                    ? hexToRgba(et.color, 0.3)
                    : 'var(--color-surface)',
                  border: `1.5px solid ${loggedEventId === et.id ? hexToRgba(et.color, 0.5) : 'var(--color-border)'}`,
                  transition: 'background-color 0.3s, border-color 0.3s',
                }}
              >
                {/* 기록 성공 리플 */}
                <AnimatePresence>
                  {loggedEventId === et.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.4 }}
                      animate={{ scale: 3, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 m-auto w-10 h-10 rounded-full"
                      style={{ backgroundColor: et.color }}
                    />
                  )}
                </AnimatePresence>

                <div
                  className="w-3 h-3 rounded-full shrink-0 relative z-10"
                  style={{ backgroundColor: et.color }}
                />
                <span className="text-[15px] font-semibold whitespace-nowrap relative z-10"
                  style={{ color: loggedEventId === et.id ? 'white' : 'var(--color-text-primary)' }}
                >
                  {et.name}
                </span>

                {/* 체크 표시 */}
                <AnimatePresence>
                  {loggedEventId === et.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="relative z-10"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* === 메모 오버레이 === */}
      <AnimatePresence>
        {showMemo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={handleSaveMemo}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-[var(--color-surface)] rounded-t-3xl"
            >
              <div className="max-w-[430px] mx-auto px-6 pt-5 pb-10">
                <div className="w-10 h-1 bg-[var(--color-surface-3)] rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-bold">메모</h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSaveMemo}
                    className="text-[16px] font-bold px-4 py-2 rounded-xl"
                    style={{ color: currentActivity?.color ?? 'white' }}
                  >
                    완료
                  </motion.button>
                </div>
                <textarea
                  ref={memoRef}
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="이 활동에 대한 메모..."
                  rows={4}
                  className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3.5 text-[16px] text-white border-none outline-none resize-none placeholder:text-[var(--color-text-tertiary)]"
                  style={{ userSelect: 'text' }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
