import type { GameState } from './types'
import { accruePassiveEnjoyment } from './passiveIncome'

export function step(state: GameState, dtMs: number): GameState {
  // Keep a monotonic game clock for UI gating and deterministic cooldowns.
  const clampedDtMs = Math.max(0, dtMs)
  const clockMs = state.clockMs + clampedDtMs

  const passiveDelta = accruePassiveEnjoyment(state, clampedDtMs)
  const uncollectedEnjoyment = state.uncollectedEnjoyment + passiveDelta

  const changed = clockMs !== state.clockMs || uncollectedEnjoyment !== state.uncollectedEnjoyment
  if (!changed) return state
  return { ...state, clockMs, uncollectedEnjoyment }
}
