import { useState, useEffect, useCallback } from 'react'

export function useTimer(startedAt: number | null) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0)
      return
    }

    setElapsed(Date.now() - startedAt)

    const interval = setInterval(() => {
      setElapsed(Date.now() - startedAt)
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt])

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [])

  return { elapsed, formatted: formatTime(elapsed) }
}
