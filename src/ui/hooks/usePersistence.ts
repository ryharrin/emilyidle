import { useEffect, useRef } from 'react'
import { AUTOSAVE_INTERVAL_MS, SAVE_KEY } from '../../game/constants'
import { loadSave, serializeSave } from '../../game/persistence'
import { useGameDispatch, useGameState } from './useGameState'
import { log } from '../../game/log'

export function usePersistence() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const lastSavedRef = useRef<string | null>(null)

  // Load on startup.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY) ?? ''
      const result = loadSave(raw)
      if (result.ok) {
        dispatch({ type: 'LOAD_SAVE', state: result.value })
      }
    } catch (e) {
      log({
        level: 'WARN',
        scope: 'persistence',
        msg: 'load failed',
        data: { error: e instanceof Error ? e.message : String(e) },
      })
      // Best-effort: persistence must never crash the app.
    }
  }, [dispatch])

  // Best-effort request for persistent storage (PWA install hint).
  useEffect(() => {
    let cancelled = false
    async function requestPersist() {
      try {
        await navigator.storage?.persist?.()
      } catch (e) {
        log({
          level: 'DEBUG',
          scope: 'persistence',
          msg: 'persist request failed',
          data: { error: e instanceof Error ? e.message : String(e) },
        })
        // Best-effort only.
      }
    }
    if (!cancelled) void requestPersist()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function trySaveNow() {
      try {
        const serialized = serializeSave(state)
        if (lastSavedRef.current === serialized) return
        localStorage.setItem(SAVE_KEY, serialized)
        lastSavedRef.current = serialized
      } catch (e) {
        log({
          level: 'WARN',
          scope: 'persistence',
          msg: 'save failed',
          data: { error: e instanceof Error ? e.message : String(e) },
        })
        // Best-effort: persistence must never crash the app.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') trySaveNow()
    }

    function onPageHide() {
      trySaveNow()
    }

    const intervalId = window.setInterval(() => {
      trySaveNow()
    }, AUTOSAVE_INTERVAL_MS)

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [state])
}
