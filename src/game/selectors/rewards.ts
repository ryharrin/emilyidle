import type { WatchTier } from '../data/watches'
import type { GameType } from '../types'

export type MiniGameResult = {
  gameType: GameType
  perfects: number
  goods: number
  misses: number
  durationMs: number
  baseReward: number
  tierBonus: number
  perfectRunBonus: number
  totalReward: number
}

// Tier multipliers for reward calculation
// Higher tier watches provide proportionally better rewards
const TIER_MULTIPLIERS: Record<WatchTier, number> = {
  quartz: 1,
  automatic: 1.5,
  manual: 2,
  tourbillon: 3,
}

// Base reward per perfect hit
const BASE_REWARD_PER_PERFECT = 10

// Base reward per good hit
const BASE_REWARD_PER_GOOD = 5

// Bonus for all perfects in a game
const PERFECT_RUN_BONUS = 20

/**
 * Calculate tier multiplier based on watch tier
 * AC 3.6.4: Higher-tier watches give proportionally better rewards
 */
export function getTierMultiplier(tier: WatchTier): number {
  return TIER_MULTIPLIERS[tier] ?? 1
}

/**
 * Calculate total reward for a mini-game session
 * AC 3.6.2: Shows Enjoyment earned, tier bonus, and any special bonuses
 * AC 3.6.4: Tier-based scaling
 * AC 3.6.3: Values are whole numbers only
 */
export function calculateMiniGameRewards(params: {
  gameType: GameType
  perfects: number
  goods: number
  misses: number
  durationMs: number
  tier: WatchTier
}): MiniGameResult {
  const { gameType, perfects, goods, misses, durationMs, tier } = params

  const tierMultiplier = getTierMultiplier(tier)

  // Base rewards
  const perfectReward = perfects * BASE_REWARD_PER_PERFECT
  const goodReward = goods * BASE_REWARD_PER_GOOD

  // Perfect run bonus (if no misses and at least one perfect)
  const perfectRunBonus = misses === 0 && perfects > 0 ? PERFECT_RUN_BONUS : 0

  // Calculate before tier multiplier
  const baseReward = perfectReward + goodReward + perfectRunBonus

  // Apply tier multiplier
  const tierBonus = Math.round(baseReward * (tierMultiplier - 1))
  const totalReward = Math.round(baseReward * tierMultiplier)

  return {
    gameType,
    perfects,
    goods,
    misses,
    durationMs,
    baseReward,
    tierBonus,
    perfectRunBonus,
    totalReward,
  }
}

/**
 * Format reward for display
 * AC 3.6.3: Values are whole numbers only
 */
export function formatReward(value: number): string {
  return Math.round(value).toString()
}
