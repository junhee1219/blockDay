import { motion } from 'framer-motion'

type Tab = 'main' | 'timeline' | 'settings'

interface NavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'main', label: '기록' },
  { id: 'timeline', label: '타임라인' },
  { id: 'settings', label: '설정' },
]

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
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
                  fontSize: 16,
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
      </div>
    </nav>
  )
}
