import { motion } from 'framer-motion'

type Tab = 'main' | 'timeline' | 'settings'

interface NavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onEventPress: () => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'main', label: '기록' },
  { id: 'timeline', label: '타임라인' },
  { id: 'settings', label: '설정' },
]

export default function Navigation({ activeTab, onTabChange, onEventPress }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/95 to-transparent pt-6 pb-2 px-6">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* 탭 네비게이션 */}
          <div className="flex items-center bg-[var(--color-surface)]/80 backdrop-blur-xl rounded-2xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative px-5 py-2.5 text-[14px] font-medium transition-colors"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[var(--color-surface-3)] rounded-xl"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-[var(--color-text-tertiary)]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* 이벤트 빠른 기록 버튼 */}
          <motion.button
            onClick={onEventPress}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" fill="#0A0A0A" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Safe area spacer */}
      <div className="h-[env(safe-area-inset-bottom)] bg-[var(--color-bg)]" />
    </div>
  )
}
