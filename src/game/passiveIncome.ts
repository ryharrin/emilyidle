import type { GameState } from './types'
import { ownedWatches } from './watchSelectors'
import { getPassiveEnjoymentRate } from './data/watches'

/**
 * Calculate the love multiplier for enjoyment generation.
 * Formula: multiplier = 1 + (love / 100)
 * Examples:
 *   - love = 0: 1x (no boost)
 *   - love = 50: 1.5x
 *   - love = 100: 2x
 */
function getLoveMultiplier(love: number): number {
  return 1 + love / 100
}

export function getPassiveEnjoymentRatePerSecond(state: GameState): number {
  let total = 0
  for (const w of ownedWatches(state)) {
    total += getPassiveEnjoymentRate(w)
  }
  // Apply love multiplier to total rate
  return total * getLoveMultiplier(state.love)
}

export function accruePassiveEnjoyment(state: GameState, dtMs: number): number {
  const rate = getPassiveEnjoymentRatePerSecond(state)
  const delta = (rate * dtMs) / 1000
  if (!Number.isFinite(delta) || delta <= 0) return 0
  return delta
}

