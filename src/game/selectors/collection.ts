import type { GameState } from '../types'
import { WATCH_CATALOG, isAwardedWatch, type Watch, type WatchTier } from '../data/watches'
import { createSelector } from '../../utils/createSelector'

// ==========================================
// Base Selectors (Raw state accessors)
// ==========================================

const selectOwnedWatchIds = (state: GameState) => state.ownedWatchIds
const selectCurrencyCents = (state: GameState) => state.currencyCents

// ==========================================
// Memoized Collection Selectors
// ==========================================

/**
 * Returns all watches owned by the player.
 * Used by the Collection tab to display the player's watch collection.
 * MEMOIZED: Only recomputes when ownedWatchIds changes.
 */
export const ownedWatches = createSelector<GameState, Watch[]>(
  [selectOwnedWatchIds],
  (ownedWatchIds) => {
    const owned = new Set(ownedWatchIds as string[])
    return WATCH_CATALOG.filter((w) => owned.has(w.id))
  },
)

/**
 * Returns all watches the player can afford with current currency.
 * Used by the Market tab for purchase availability indicators.
 * Excludes awarded watches (they cannot be purchased).
 * MEMOIZED: Only recomputes when currencyCents changes.
 */
export const affordableWatches = createSelector<GameState, Watch[]>(
  [selectCurrencyCents],
  (currencyCents) => {
    return WATCH_CATALOG.filter(
      (w) => !isAwardedWatch(w.id) && w.priceCents <= (currencyCents as number),
    )
  },
)

/**
 * Returns watches available in the market (not yet owned).
 * Filters out watches the player already owns.
 * Excludes awarded watches (they cannot be purchased).
 * MEMOIZED: Only recomputes when ownedWatchIds changes.
 */
export const availableMarketWatches = createSelector<GameState, Watch[]>(
  [selectOwnedWatchIds],
  (ownedWatchIds) => {
    const owned = new Set(ownedWatchIds as string[])
    return WATCH_CATALOG.filter((w) => !owned.has(w.id) && !isAwardedWatch(w.id))
  },
)

// ==========================================
// Collection Completion Tracking (Story 5-7)
// ==========================================

export type TierStats = {
  tier: WatchTier
  owned: number
  total: number
  percentage: number
  isComplete: boolean
}

export type CollectionStats = {
  byTier: {
    quartz: TierStats
    manual: TierStats
    automatic: TierStats
    tourbillon: TierStats
  }
  overall: {
    owned: number
    total: number
    percentage: number
  }
  isComplete: boolean
  perfectCollection: boolean
}

/**
 * Get detailed collection statistics including tier breakdown.
 * Used for completion tracking and "Perfect Collection" achievement.
 * MEMOIZED: Only recomputes when ownedWatchIds changes.
 */
export const getCollectionStats = createSelector<GameState, CollectionStats>(
  [selectOwnedWatchIds],
  (ownedWatchIds) => {
    const ownedSet = new Set(ownedWatchIds as string[])

    // Count non-awarded watches for accurate completion
    const purchasableWatches = WATCH_CATALOG.filter((w) => !w.isAwarded)
    const totalPurchasable = purchasableWatches.length

    // Calculate stats for each tier
    const tiers: WatchTier[] = ['quartz', 'manual', 'automatic', 'tourbillon']
    const byTier = {} as CollectionStats['byTier']

    for (const tier of tiers) {
      const tierWatches = purchasableWatches.filter((w) => w.tier === tier)
      const tierOwned = tierWatches.filter((w) => ownedSet.has(w.id)).length
      const tierTotal = tierWatches.length

      byTier[tier] = {
        tier,
        owned: tierOwned,
        total: tierTotal,
        percentage: tierTotal > 0 ? Math.floor((tierOwned / tierTotal) * 100) : 0,
        isComplete: tierOwned === tierTotal && tierTotal > 0,
      }
    }

    // Calculate overall stats (only purchasable watches count toward completion)
    const totalOwned = purchasableWatches.filter((w) => ownedSet.has(w.id)).length

    return {
      byTier,
      overall: {
        owned: totalOwned,
        total: totalPurchasable,
        percentage: totalPurchasable > 0 ? Math.floor((totalOwned / totalPurchasable) * 100) : 0,
      },
      isComplete: totalOwned === totalPurchasable,
      perfectCollection: totalOwned === totalPurchasable && totalPurchasable > 0,
    }
  },
)

/**
 * Get a simplified completion percentage (0-100).
 * MEMOIZED: Derived from getCollectionStats.
 */
export const getCollectionPercentage = createSelector<GameState, number>(
  [getCollectionStats],
  (stats) => (stats as CollectionStats).overall.percentage,
)

/**
 * Check if a specific tier is complete.
 * NOTE: This requires tier parameter, so it cannot be fully memoized.
 * Use getCollectionStats and access .byTier[tier].isComplete for memoization.
 */
export function isTierComplete(state: GameState, tier: WatchTier): boolean {
  return getCollectionStats(state).byTier[tier].isComplete
}

/**
 * Get count of tiers completed.
 * MEMOIZED: Derived from getCollectionStats.
 */
export const getCompletedTierCount = createSelector<GameState, number>(
  [getCollectionStats],
  (stats) => Object.values((stats as CollectionStats).byTier).filter((t) => (t as TierStats).isComplete).length,
)
