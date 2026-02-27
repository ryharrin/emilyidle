import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { MailToast } from './MailToast'
import { playSfx } from '../../audio/audioService'

const MAX_VISIBLE_TOASTS = 3

export function MailToastManager() {
  const state = useGameState()
  const dispatch = useGameDispatch()
  const playedToastsRef = useRef<Set<string>>(new Set())

  const toasts = useMemo(() => {
    return state.pendingToasts.slice(-MAX_VISIBLE_TOASTS)
  }, [state.pendingToasts])

  // Play sound effects for new toasts
  useEffect(() => {
    toasts.forEach((toast) => {
      if (!playedToastsRef.current.has(toast.id)) {
        playedToastsRef.current.add(toast.id)
        playSfx('ui.toast')
      }
    })
  }, [toasts])

  if (toasts.length === 0) return null

  return (
    <aside className="mail-toasts" aria-label="Mail notifications">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <MailToast
            key={toast.id}
            toast={toast}
            onDismiss={() => dispatch({ type: 'DISMISS_TOAST', toastId: toast.id })}
          />
        ))}
      </AnimatePresence>
    </aside>
  )
}
