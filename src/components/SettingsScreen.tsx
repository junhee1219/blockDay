import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useActivityStore } from '../stores/useActivityStore'
import { useEventStore } from '../stores/useEventStore'

const PRESET_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC653', '#51CF66',
  '#339AF0', '#7950F2', '#E64980', '#20C997',
  '#845EF7', '#F06595', '#FF922B', '#94D82D',
]

const spring = {
  type: 'spring' as const,
  damping: 25,
  stiffness: 300,
}

interface ItemFormProps {
  initialName?: string
  initialColor?: string
  onSave: (name: string, color: string) => void
  onCancel: () => void
}

function ItemForm({ initialName = '', initialColor = PRESET_COLORS[0], onSave, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={spring}
      className="overflow-hidden"
    >
      <div className="bg-[var(--color-surface)] rounded-2xl p-5 space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          autoFocus
          className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-[16px] text-white placeholder:text-[var(--color-text-tertiary)] outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />

        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-9 h-9 rounded-full transition-transform"
              style={{
                backgroundColor: c,
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
                boxShadow: color === c ? `0 0 0 2px var(--color-bg), 0 0 0 4px ${c}` : 'none',
              }}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] text-[15px] font-medium active:scale-[0.97] transition-transform"
          >
            취소
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim(), color)}
            className="flex-1 py-3 rounded-xl bg-white text-black text-[15px] font-semibold active:scale-[0.97] transition-transform disabled:opacity-30"
            disabled={!name.trim()}
          >
            저장
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function SettingsScreen() {
  const { activities, addActivity, updateActivity, deleteActivity } = useActivityStore()
  const { eventTypes, addEventType, updateEventType, deleteEventType } = useEventStore()
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="px-6 pt-14 pb-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[28px] font-bold tracking-tight"
        >
          설정
        </motion.h2>
      </div>

      {/* 활동 관리 */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-secondary)]">
            활동
          </h3>
          <button
            onClick={() => {
              setShowActivityForm(true)
              setEditingActivityId(null)
            }}
            className="text-[14px] font-medium text-[var(--color-text-secondary)] active:text-white transition-colors px-2 py-1"
          >
            + 추가
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {showActivityForm && !editingActivityId && (
              <ItemForm
                onSave={(name, color) => {
                  addActivity(name, color)
                  setShowActivityForm(false)
                }}
                onCancel={() => setShowActivityForm(false)}
              />
            )}
          </AnimatePresence>

          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <AnimatePresence mode="wait">
                {editingActivityId === activity.id ? (
                  <ItemForm
                    key="edit"
                    initialName={activity.name}
                    initialColor={activity.color}
                    onSave={(name, color) => {
                      updateActivity(activity.id, name, color)
                      setEditingActivityId(null)
                    }}
                    onCancel={() => setEditingActivityId(null)}
                  />
                ) : (
                  <motion.div
                    key="display"
                    className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: activity.color }}
                      />
                      <span className="text-[16px] font-medium">{activity.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingActivityId(activity.id)}
                        className="text-[13px] text-[var(--color-text-tertiary)] px-2 py-1 active:text-white transition-colors"
                      >
                        편집
                      </button>
                      <button
                        onClick={() => deleteActivity(activity.id)}
                        className="text-[13px] text-red-500/60 px-2 py-1 active:text-red-400 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 이벤트 관리 */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-secondary)]">
            이벤트
          </h3>
          <button
            onClick={() => {
              setShowEventForm(true)
              setEditingEventId(null)
            }}
            className="text-[14px] font-medium text-[var(--color-text-secondary)] active:text-white transition-colors px-2 py-1"
          >
            + 추가
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {showEventForm && !editingEventId && (
              <ItemForm
                onSave={(name, color) => {
                  addEventType(name, color)
                  setShowEventForm(false)
                }}
                onCancel={() => setShowEventForm(false)}
              />
            )}
          </AnimatePresence>

          {eventTypes.map((eventType, i) => (
            <motion.div
              key={eventType.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <AnimatePresence mode="wait">
                {editingEventId === eventType.id ? (
                  <ItemForm
                    key="edit"
                    initialName={eventType.name}
                    initialColor={eventType.color}
                    onSave={(name, color) => {
                      updateEventType(eventType.id, name, color)
                      setEditingEventId(null)
                    }}
                    onCancel={() => setEditingEventId(null)}
                  />
                ) : (
                  <motion.div
                    key="display"
                    className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: eventType.color }}
                      />
                      <span className="text-[16px] font-medium">{eventType.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingEventId(eventType.id)}
                        className="text-[13px] text-[var(--color-text-tertiary)] px-2 py-1 active:text-white transition-colors"
                      >
                        편집
                      </button>
                      <button
                        onClick={() => deleteEventType(eventType.id)}
                        className="text-[13px] text-red-500/60 px-2 py-1 active:text-red-400 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {eventTypes.length === 0 && !showEventForm && (
            <p className="text-[var(--color-text-tertiary)] text-[14px] py-4 text-center">
              순간 기록을 위한 이벤트를 추가해보세요
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
