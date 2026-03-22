import { useState, useEffect, useCallback } from 'react'

export function useTimer(startedAt: number | null) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0)
      return
    }

    // 즉시 계산 (백그라운드에서 복귀했을 때도 정확)
    setElapsed(Date.now() - startedAt)

    const interval = setInterval(() => {
      setElapsed(Date.now() - startedAt)
    }, 1000)

    // 백그라운드에서 포그라운드로 돌아올 때 즉시 재계산
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setElapsed(Date.now() - startedAt)
      }
    }

    // 모바일에서 화면 깨어날 때
    const handleFocus = () => {
      setElapsed(Date.now() - startedAt)
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handleFocus)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handleFocus)
    }
  }, [startedAt])

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (days > 0) {
      return `${days}일 ${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [])

  return { elapsed, formatted: formatTime(elapsed) }
}
