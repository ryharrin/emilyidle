import { useMemo } from 'react'
import { useGameDispatch, useGameState } from '../hooks/useGameState'
import { MailToast } from './MailToast'

const MAX_VISIBLE_TOASTS = 3

export function MailToastManager() {
  const state = useGameState()
  const dispatch = useGameDispatch()

  const toasts = useMemo(() => {
    return state.pendingToasts.slice(-MAX_VISIBLE_TOASTS)
  }, [state.pendingToasts])

  if (toasts.length === 0) return null

  return (
    <aside className="mail-toasts" aria-label="Mail notifications">
      {toasts.map((toast) => (
        <MailToast
          key={toast.id}
          toast={toast}
          onDismiss={() => dispatch({ type: 'DISMISS_TOAST', toastId: toast.id })}
        />
      ))}
    </aside>
  )
}
