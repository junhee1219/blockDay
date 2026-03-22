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
      <div className="bg-[var(--color-surface-2)] rounded-2xl p-5 space-y-5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          autoFocus
          className="w-full bg-[var(--color-surface-3)] rounded-2xl px-5 py-4 text-[17px] text-white placeholder:text-[var(--color-text-tertiary)] outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />

        <div className="flex flex-wrap gap-3">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-10 h-10 rounded-full transition-all duration-200"
              style={{
                backgroundColor: c,
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
                boxShadow: color === c ? `0 0 0 3px var(--color-bg), 0 0 0 5px ${c}` : 'none',
              }}
            />
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] text-[16px] font-semibold active:scale-[0.97] transition-transform"
          >
            취소
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim(), color)}
            className="flex-1 py-4 rounded-2xl bg-white text-black text-[16px] font-bold active:scale-[0.97] transition-transform disabled:opacity-30"
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
    <div className="h-full overflow-y-auto pb-40">
      {/* 헤더 */}
      <div className="px-7 pt-16 pb-8">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[34px] font-extrabold tracking-tight"
        >
          설정
        </motion.h2>
      </div>

      {/* 활동 관리 */}
      <div className="px-7 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            활동
          </h3>
          <button
            onClick={() => {
              setShowActivityForm(true)
              setEditingActivityId(null)
            }}
            className="text-[15px] font-semibold text-white bg-[var(--color-surface-2)] rounded-full px-5 py-2.5 active:scale-[0.95] transition-transform"
          >
            + 추가
          </button>
        </div>

        <div className="space-y-3">
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
                    className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl px-5 py-5"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-5 h-5 rounded-full shrink-0"
                        style={{ backgroundColor: activity.color }}
                      />
                      <span className="text-[17px] font-semibold">{activity.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingActivityId(activity.id)}
                        className="text-[14px] text-[var(--color-text-secondary)] px-3 py-2 rounded-xl active:bg-[var(--color-surface-2)] transition-colors"
                      >
                        편집
                      </button>
                      <button
                        onClick={() => deleteActivity(activity.id)}
                        className="text-[14px] text-red-400/70 px-3 py-2 rounded-xl active:bg-red-500/10 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {activities.length === 0 && !showActivityForm && (
            <div className="text-center py-10">
              <p className="text-[var(--color-text-tertiary)] text-[15px] mb-1">
                아직 활동이 없어요
              </p>
              <p className="text-[var(--color-text-tertiary)] text-[13px]">
                수면, 일상, 공부 등을 추가해보세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 이벤트 관리 */}
      <div className="px-7 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            이벤트
          </h3>
          <button
            onClick={() => {
              setShowEventForm(true)
              setEditingEventId(null)
            }}
            className="text-[15px] font-semibold text-white bg-[var(--color-surface-2)] rounded-full px-5 py-2.5 active:scale-[0.95] transition-transform"
          >
            + 추가
          </button>
        </div>

        <div className="space-y-3">
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
                    className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl px-5 py-5"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: eventType.color }}
                      />
                      <span className="text-[17px] font-semibold">{eventType.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingEventId(eventType.id)}
                        className="text-[14px] text-[var(--color-text-secondary)] px-3 py-2 rounded-xl active:bg-[var(--color-surface-2)] transition-colors"
                      >
                        편집
                      </button>
                      <button
                        onClick={() => deleteEventType(eventType.id)}
                        className="text-[14px] text-red-400/70 px-3 py-2 rounded-xl active:bg-red-500/10 transition-colors"
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
            <div className="text-center py-10">
              <p className="text-[var(--color-text-tertiary)] text-[15px] mb-1">
                아직 이벤트가 없어요
              </p>
              <p className="text-[var(--color-text-tertiary)] text-[13px]">
                물 마시기, 약 먹기 등을 추가해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
