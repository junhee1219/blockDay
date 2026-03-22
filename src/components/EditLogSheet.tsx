import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ActivityLog, EventLog } from '../types'

interface EditActivityLogProps {
  type: 'activity'
  log: ActivityLog
  name: string
  color: string
  onSave: (data: { startedAt: number; endedAt?: number; memo?: string }) => void
  onDelete: () => void
  onClose: () => void
}

interface EditEventLogProps {
  type: 'event'
  log: EventLog
  name: string
  color: string
  onSave: (data: { occurredAt: number; memo?: string }) => void
  onDelete: () => void
  onClose: () => void
}

type EditLogSheetProps = EditActivityLogProps | EditEventLogProps

function tsToTimeStr(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function timeStrToTs(ts: number, timeStr: string): number {
  const d = new Date(ts)
  const [h, m] = timeStr.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

export default function EditLogSheet(props: EditLogSheetProps) {
  const { type, name, color, onSave, onDelete, onClose } = props

  const [memo, setMemo] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (type === 'activity') {
      const log = props.log as ActivityLog
      setMemo(log.memo ?? '')
      setStartTime(tsToTimeStr(log.startedAt))
      setEndTime(log.endedAt ? tsToTimeStr(log.endedAt) : '')
    } else {
      const log = props.log as EventLog
      setMemo(log.memo ?? '')
      setEventTime(tsToTimeStr(log.occurredAt))
    }
  }, [])

  const handleSave = () => {
    if (type === 'activity') {
      const log = props.log as ActivityLog
      const data: { startedAt: number; endedAt?: number; memo?: string } = {
        startedAt: timeStrToTs(log.startedAt, startTime),
        memo: memo.trim() || undefined,
      }
      if (endTime) {
        data.endedAt = timeStrToTs(log.endedAt ?? log.startedAt, endTime)
      }
      ;(onSave as EditActivityLogProps['onSave'])(data)
    } else {
      const log = props.log as EventLog
      ;(onSave as EditEventLogProps['onSave'])({
        occurredAt: timeStrToTs(log.occurredAt, eventTime),
        memo: memo.trim() || undefined,
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }
    onDelete()
    onClose()
  }

  return (
    <AnimatePresence>
      {/* 백드롭 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-[var(--color-surface)] rounded-t-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-[430px] mx-auto px-6 pt-5 pb-10">
          {/* 핸들 */}
          <div className="w-10 h-1 bg-[var(--color-surface-3)] rounded-full mx-auto mb-5" />

          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-5 h-5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-[20px] font-bold flex-1">{name}</h3>
            <span className="text-[14px] text-[var(--color-text-tertiary)]">
              {type === 'activity' ? '활동' : '이벤트'}
            </span>
          </div>

          {/* 시간 편집 */}
          {type === 'activity' ? (
            <div className="flex gap-3 mb-5">
              <div className="flex-1">
                <label className="text-[13px] text-[var(--color-text-secondary)] font-semibold mb-1.5 block">
                  시작
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3.5 text-[17px] font-semibold text-white border-none outline-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="flex items-end pb-3.5 text-[var(--color-text-tertiary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="text-[13px] text-[var(--color-text-secondary)] font-semibold mb-1.5 block">
                  종료
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="진행 중"
                  className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3.5 text-[17px] font-semibold text-white border-none outline-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-5">
              <label className="text-[13px] text-[var(--color-text-secondary)] font-semibold mb-1.5 block">
                시간
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3.5 text-[17px] font-semibold text-white border-none outline-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          )}

          {/* 메모 */}
          <div className="mb-6">
            <label className="text-[13px] text-[var(--color-text-secondary)] font-semibold mb-1.5 block">
              메모
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 남겨보세요..."
              rows={3}
              className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3.5 text-[16px] text-white border-none outline-none resize-none placeholder:text-[var(--color-text-tertiary)]"
              style={{ userSelect: 'text' }}
            />
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="px-6 py-4 rounded-2xl text-[16px] font-bold"
              style={{
                backgroundColor: showDeleteConfirm ? '#FF3B30' : 'var(--color-surface-2)',
                color: showDeleteConfirm ? 'white' : '#FF6B6B',
              }}
            >
              {showDeleteConfirm ? '정말 삭제' : '삭제'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="flex-1 py-4 rounded-2xl text-[16px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              저장
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
