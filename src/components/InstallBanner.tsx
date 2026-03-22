import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    const dismissed = localStorage.getItem('install-banner-dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      if (Date.now() - dismissedAt < 86400000) return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (isIOS()) {
      setShow(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setShow(false)
    } else if (isIOS()) {
      setShowIOSGuide(true)
    }
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShow(false)
    setShowIOSGuide(false)
    localStorage.setItem('install-banner-dismissed', String(Date.now()))
  }, [])

  if (isStandalone()) return null

  return (
    <AnimatePresence>
      {show && !showIOSGuide && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] px-4 pt-3"
        >
          <div className="max-w-[430px] mx-auto bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl p-5 shadow-2xl">
            <p className="text-white text-[17px] font-bold mb-1">
              앱으로 설치하기
            </p>
            <p className="text-white/50 text-[14px] mb-4">
              홈 화면에 추가하면 더 빠르게 사용할 수 있어요
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-3 rounded-xl bg-[#2C2C2E] text-white/60 text-[15px] font-semibold active:scale-[0.97] transition-transform"
              >
                나중에
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 py-3 rounded-xl bg-white text-black text-[15px] font-bold active:scale-[0.97] transition-transform"
              >
                설치
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* iOS 가이드 — 하단에서 올라오며 화살표로 공유 버튼 가리킴 */}
      {show && showIOSGuide && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 flex flex-col items-center"
        >
          <div className="max-w-[430px] w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <p className="text-white text-[18px] font-bold mb-4">
              홈 화면에 추가하기
            </p>

            <div className="space-y-4 mb-5">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#2C2C2E] flex items-center justify-center shrink-0">
                  <span className="text-white text-[16px] font-bold">1</span>
                </div>
                <div>
                  <p className="text-white text-[16px] font-semibold">
                    아래 공유 버튼을 탭하세요
                  </p>
                  <p className="text-white/40 text-[14px] mt-0.5">
                    Safari 하단 가운데 버튼
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#2C2C2E] flex items-center justify-center shrink-0">
                  <span className="text-white text-[16px] font-bold">2</span>
                </div>
                <p className="text-white text-[16px] font-semibold">
                  "홈 화면에 추가"를 탭하세요
                </p>
              </div>
            </div>

            {/* 공유 버튼 아이콘 (Safari share icon) */}
            <div className="flex justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>
          </div>

          {/* 아래로 가리키는 화살표 */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="mt-2"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
