import { useEffect, useRef } from 'react'
import { isTestEnvironment } from '../../game/env'
import { SIM_TICK_MS } from '../../game/constants'
import { accumulateSimTicks } from '../../game/loop'
import { useGameDispatch } from './useGameState'

export function useGameRuntime() {
  const dispatch = useGameDispatch()
  const rafIdRef = useRef<number | null>(null)
  const accumulatorMsRef = useRef(0)
  const lastNowMsRef = useRef<number | null>(null)

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
      if (document.visibilityState === 'hidden') return
      if (rafIdRef.current != null) return
      rafIdRef.current = requestAnimationFrame(frame)
    }

    function frame(nowMs: number) {
      rafIdRef.current = null

      if (document.visibilityState === 'hidden') return

      const lastNowMs = lastNowMsRef.current ?? nowMs
      const deltaMs = Math.max(0, nowMs - lastNowMs)
      lastNowMsRef.current = nowMs

      const { accumulatorMs, ticks } = accumulateSimTicks(
        accumulatorMsRef.current,
        deltaMs,
      )
      accumulatorMsRef.current = accumulatorMs

      for (let i = 0; i < ticks; i++) {
        dispatch({ type: 'SIM_TICK', dtMs: SIM_TICK_MS })
      }

      rafIdRef.current = requestAnimationFrame(frame)
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') stopRaf()
      else ensureRunning()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    ensureRunning()

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stopRaf()
    }
  }, [dispatch])
}

