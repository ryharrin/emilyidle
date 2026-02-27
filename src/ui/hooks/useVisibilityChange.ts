import { useEffect, useRef, useCallback, useState } from 'react'

export interface VisibilityState {
  isVisible: boolean
  isBackgrounded: boolean
  hiddenTime: number | null
  visibleTime: number | null
}

/**
 * Hook to track page visibility changes
 * Story 7.7: Battery Optimization - Reduces simulation rate when tab is hidden
 * @returns VisibilityState with current visibility status and timestamps
 */
export function useVisibilityChange(): VisibilityState {
  const [state, setState] = useState<VisibilityState>(() => {
    const now = Date.now()
    const isHidden = document.visibilityState === 'hidden'

    return {
      isVisible: !isHidden,
      isBackgrounded: isHidden,
      hiddenTime: isHidden ? now : null,
      visibleTime: isHidden ? null : now,
    }
  })

  const hiddenTimeRef = useRef<number | null>(null)

  const handleVisibilityChange = useCallback(() => {
    const isHidden = document.visibilityState === 'hidden'
    const now = Date.now()

    if (isHidden) {
      hiddenTimeRef.current = now
      setState(prev => ({
        ...prev,
        isVisible: false,
        isBackgrounded: true,
        hiddenTime: now,
      }))
    } else {
      setState(prev => ({
        ...prev,
        isVisible: true,
        isBackgrounded: false,
        visibleTime: now,
      }))
    }
  }, [])

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleVisibilityChange])

  return state
}

/**
 * Hook to throttle updates when tab is hidden
 * Story 7.7: Background Throttling - Reduces callback frequency when backgrounded
 * @param callback - Function to throttle
 * @param normalInterval - Normal interval in ms
 * @param backgroundInterval - Background interval in ms (default: 5x slower)
 */
export function useThrottledInBackground(
  callback: () => void,
  normalInterval: number,
  backgroundInterval?: number,
): void {
  const throttledInterval = backgroundInterval ?? normalInterval * 5
  const callbackRef = useRef(callback)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const visibilityRef = useRef({
    isHidden: false,
    currentInterval: normalInterval,
  })

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.visibilityState === 'hidden'
      visibilityRef.current.isHidden = isHidden

      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Set new interval based on visibility
      const interval = isHidden ? throttledInterval : normalInterval
      visibilityRef.current.currentInterval = interval

      intervalRef.current = setInterval(() => {
        callbackRef.current()
      }, interval)
    }

    // Initial setup
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [normalInterval, throttledInterval])
}

/**
 * Hook to pause/resume based on visibility
 * Story 7.7: Animation Control - Pause expensive animations when backgrounded
 * @returns Object with shouldPause flag
 */
export function usePauseInBackground(): { shouldPause: boolean } {
  const visibility = useVisibilityChange()

  return {
    shouldPause: visibility.isBackgrounded,
  }
}
