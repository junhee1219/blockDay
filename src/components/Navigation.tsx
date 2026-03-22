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
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#1C1C1E',
        borderTop: '1px solid #3A3A3C',
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '14px 16px 20px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '4px 0',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  style={{
                    position: 'absolute',
                    top: -6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 20,
                    height: 2,
                    backgroundColor: '#fff',
                    borderRadius: 999,
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <span
                style={{
                  fontSize: 15,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : '#888',
                  transition: 'color 0.2s',
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}

        {/* 이벤트 빠른 기록 */}
        <button
          onClick={onEventPress}
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            style={{
              width: 36,
              height: 36,
              backgroundColor: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.div>
        </button>
      </div>
    </nav>
  )
}
