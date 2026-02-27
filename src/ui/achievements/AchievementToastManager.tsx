/**
 * Achievement Toast Manager
 * Manages the display of achievement unlock notifications
 */

import { useEffect, useReducer, useCallback } from 'react'
import { AnimatePresence } from 'motion/react'
import { useGameState } from '../hooks/useGameState'
import { AchievementToast } from './AchievementToast'

interface ToastState {
  id: string
  achievementId: string
}

interface ManagerState {
  toasts: ToastState[]
  processedIds: Set<string>
  serial: number
}

type ManagerAction =
  | { type: 'SYNC_UNLOCKS'; unlockedIds: string[] }
  | { type: 'DISMISS_TOAST'; toastId: string }

function reduceManagerState(state: ManagerState, action: ManagerAction): ManagerState {
  switch (action.type) {
    case 'SYNC_UNLOCKS': {
      const unlockedSet = new Set(action.unlockedIds)
      const processedIds = new Set(
        Array.from(state.processedIds).filter((achievementId) => unlockedSet.has(achievementId)),
      )
      const toasts = state.toasts.filter((toast) => unlockedSet.has(toast.achievementId))
      const newUnlocks = action.unlockedIds.filter((achievementId) => !processedIds.has(achievementId))
      if (newUnlocks.length === 0) {
        return { ...state, toasts, processedIds }
      }

      let serial = state.serial
      const newToasts: ToastState[] = newUnlocks.map((achievementId) => {
        const toastId = `${achievementId}-${serial}`
        serial += 1
        processedIds.add(achievementId)
        return {
          id: toastId,
          achievementId,
        }
      })

      return {
        toasts: [...toasts, ...newToasts],
        processedIds,
        serial,
      }
    }
    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId),
      }
    default:
      return state
  }
}

const INITIAL_STATE: ManagerState = {
  toasts: [],
  processedIds: new Set(),
  serial: 0,
}

/**
 * Achievement Toast Manager
 * Listens for newly unlocked achievements and displays toast notifications
 */
export function AchievementToastManager() {
  const state = useGameState()
  const [managerState, dispatch] = useReducer(reduceManagerState, INITIAL_STATE)

  useEffect(() => {
    dispatch({
      type: 'SYNC_UNLOCKS',
      unlockedIds: state.unlockedAchievementIds ?? [],
    })
  }, [state.unlockedAchievementIds])

  const dismissToast = useCallback((toastId: string) => {
    dispatch({ type: 'DISMISS_TOAST', toastId })
  }, [])

  if (managerState.toasts.length === 0) return null

  return (
    <div
      className="achievement-toast-container"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {managerState.toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'none' }}>
            <AchievementToast
              achievementId={toast.achievementId}
              onDismiss={() => dismissToast(toast.id)}
              duration={5000}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
