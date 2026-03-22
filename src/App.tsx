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
    <div className="h-full relative max-w-[430px] mx-auto">
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

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onEventPress={() => setShowEventSheet(true)}
      />

      <EventQuickLog
        isOpen={showEventSheet}
        onClose={() => setShowEventSheet(false)}
      />
    </div>
  )
}
