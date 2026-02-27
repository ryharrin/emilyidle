import { useEffect, useRef, useCallback } from 'react'
import { isTestEnvironment } from '../../game/env'
import { SIM_TICK_MS } from '../../game/constants'
import { accumulateSimTicks } from '../../game/loop'
import { useGameDispatch } from './useGameState'
import { getPerformanceMonitor } from '../../utils/performance'

// Story 7.7: Adaptive tick rate configuration
const NORMAL_TICK_RATE = 1 // 1 tick per frame
const BACKGROUND_TICK_RATE = 0.2 // 20% of normal rate when backgrounded
const MAX_BACKGROUND_DELTA_MS = 5000 // Cap delta time when returning from background

export function useGameRuntime() {
  const dispatch = useGameDispatch()
  const rafIdRef = useRef<number | null>(null)
  const accumulatorMsRef = useRef(0)
  const lastNowMsRef = useRef<number | null>(null)
  const isBackgroundedRef = useRef(false)
  const tickRateRef = useRef(NORMAL_TICK_RATE)
  const lastDispatchRef = useRef<number>(0)

  const shouldThrottle = useCallback(() => {
    const monitor = getPerformanceMonitor()
    return monitor.shouldThrottle()
  }, [])

  useEffect(() => {
    if (isTestEnvironment()) return

    function stopRaf() {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      lastNowMsRef.current = null
      accumulatorMsRef.current = 0
    }

    function ensureRunning() {
      if (rafIdRef.current != null) return
      rafIdRef.current = requestAnimationFrame(frame)
    }

    function frame(nowMs: number) {
      rafIdRef.current = null

      // Story 7.7: Skip frames when backgrounded
      if (document.visibilityState === 'hidden') return

      const lastNowMs = lastNowMsRef.current ?? nowMs
      let deltaMs = Math.max(0, nowMs - lastNowMs)
      lastNowMsRef.current = nowMs

      // Story 7.7: Cap delta time when returning from background
      if (isBackgroundedRef.current && deltaMs > MAX_BACKGROUND_DELTA_MS) {
        deltaMs = MAX_BACKGROUND_DELTA_MS
        isBackgroundedRef.current = false
      }

      // Story 7.7: Adaptive tick rate based on battery status
      const throttleMultiplier = shouldThrottle() ? 0.5 : 1
      const effectiveTickRate = tickRateRef.current * throttleMultiplier

      const { accumulatorMs, ticks } = accumulateSimTicks(
        accumulatorMsRef.current,
        deltaMs * effectiveTickRate,
      )
      accumulatorMsRef.current = accumulatorMs

      // Story 7.7: Batch state updates - dispatch all ticks together
      if (ticks > 0) {
        const batchSize = Math.min(ticks, 10) // Cap batch size
        const dtMs = SIM_TICK_MS

        // Dispatch ticks
        for (let i = 0; i < batchSize; i++) {
          dispatch({ type: 'SIM_TICK', dtMs })
        }

        lastDispatchRef.current = nowMs
      }

      // Continue animation loop
      rafIdRef.current = requestAnimationFrame(frame)
    }

    function onVisibilityChange() {
      const isHidden = document.visibilityState === 'hidden'

      if (isHidden) {
        // Story 7.7: Pause animations and reduce tick rate
        isBackgroundedRef.current = true
        tickRateRef.current = BACKGROUND_TICK_RATE
        // Don't stop RAF completely - let it run at reduced rate for passive income
      } else {
        // Story 7.7: Resume normal operation
        isBackgroundedRef.current = false
        tickRateRef.current = NORMAL_TICK_RATE
        ensureRunning()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    ensureRunning()

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stopRaf()
    }
  }, [dispatch, shouldThrottle])
}
