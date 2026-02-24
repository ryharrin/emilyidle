import { CONSECUTIVE_CONFIG } from '../constants'
import { getConsecutiveSessionCostState } from '../career'
import type { GameState } from '../types'

export function getTherapySessionCost(state: GameState): {
  baseCost: number
  scaledCost: number
  multiplier: number
  consecutiveCount: number
  canAfford: boolean
  decayRemainingMs: number
  isAtMaxConsecutive: boolean
} {
  const cost = getConsecutiveSessionCostState(state)
  if (cost) return cost

  return {
    baseCost: 0,
    scaledCost: 0,
    multiplier: 1,
    consecutiveCount: 0,
    canAfford: false,
    decayRemainingMs: 0,
    isAtMaxConsecutive: false,
  }
}

export function getConsecutiveSessionProgress(state: GameState): {
  current: number
  max: number
  percentage: number
  warningLevel: 'none' | 'caution' | 'warning' | 'critical'
} {
  const cost = getTherapySessionCost(state)
  const current = cost.consecutiveCount
  const max = CONSECUTIVE_CONFIG.MAX_CONSECUTIVE
  const percentage = max > 0 ? (current / max) * 100 : 0

  let warningLevel: 'none' | 'caution' | 'warning' | 'critical' = 'none'
  if (current >= 9) warningLevel = 'critical'
  else if (current >= 7) warningLevel = 'warning'
  else if (current >= 4) warningLevel = 'caution'

  return { current, max, percentage, warningLevel }
}
