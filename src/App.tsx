import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MainScreen from './components/MainScreen'
import TimelineScreen from './components/TimelineScreen'
import SettingsScreen from './components/SettingsScreen'
import Navigation from './components/Navigation'
import EventQuickLog from './components/EventQuickLog'

type Tab = 'main' | 'timeline' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('main')
  const [showEventSheet, setShowEventSheet] = useState(false)

  return (
    <div className="h-full relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="h-full"
        >
          {activeTab === 'main' && <MainScreen />}
          {activeTab === 'timeline' && <TimelineScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </motion.div>
      </AnimatePresence>

      {activeTab !== 'main' && (
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onEventPress={() => setShowEventSheet(true)}
        />
      )}

      {activeTab === 'main' && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="flex items-center justify-between max-w-lg mx-auto px-6 pb-6 pt-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('timeline')}
                className="px-4 py-2 rounded-xl bg-white/10 text-white/60 text-[13px] font-medium backdrop-blur-xl active:scale-[0.95] transition-transform"
              >
                타임라인
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 rounded-xl bg-white/10 text-white/60 text-[13px] font-medium backdrop-blur-xl active:scale-[0.95] transition-transform"
              >
                설정
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEventSheet(true)}
              className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center active:bg-white/30 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3" fill="white" />
              </svg>
            </motion.button>
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      )}

      <EventQuickLog
        isOpen={showEventSheet}
        onClose={() => setShowEventSheet(false)}
      />
    </div>
  )
}
