import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '../stores/useEventStore'

interface EventQuickLogProps {
  isOpen: boolean
  onClose: () => void
}

export default function EventQuickLog({ isOpen, onClose }: EventQuickLogProps) {
  const { eventTypes, loadEventTypes, logEvent } = useEventStore()

  useEffect(() => {
    loadEventTypes()
  }, [loadEventTypes])

  const handleLog = async (eventTypeId: string) => {
    await logEvent(eventTypeId)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* 바텀시트 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] rounded-t-3xl px-6 pt-6 pb-10"
          >
            <div className="w-10 h-1 bg-[var(--color-surface-3)] rounded-full mx-auto mb-6" />

            <h3 className="text-[18px] font-bold mb-4">이벤트 기록</h3>

            {eventTypes.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] text-[15px] text-center py-8">
                설정에서 이벤트를 추가해주세요
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {eventTypes.map((eventType, i) => (
                  <motion.button
                    key={eventType.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleLog(eventType.id)}
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-[var(--color-surface-2)] active:scale-[0.95] transition-transform"
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: eventType.color }}
                    />
                    <span className="text-[14px] font-medium">{eventType.name}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
