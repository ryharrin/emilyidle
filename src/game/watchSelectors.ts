import type { GameState } from './types'
import { WATCH_CATALOG, type Watch } from './data/watches'

function isTierUnlocked(state: GameState, tier: Watch['tier']): boolean {
  switch (tier) {
    case 'quartz':
      return true
    case 'manual':
      return (
        state.triggeredUnlockIds['career-Externship-manual'] === true ||
        state.triggeredUnlockIds['career-GroupPractice-all-tiers'] === true
      )
    case 'automatic':
      return (
        state.triggeredUnlockIds['career-VAHospital-automatic'] === true ||
        state.triggeredUnlockIds['career-GroupPractice-all-tiers'] === true
      )
    case 'tourbillon':
      return (
        state.triggeredUnlockIds['career-PrivatePractice-tourbillon'] === true ||
        state.triggeredUnlockIds['career-GroupPractice-all-tiers'] === true
      )
    default:
      return false
  }
}

export function ownedWatches(state: GameState): Watch[] {
  const owned = new Set(state.ownedWatchIds)
  return WATCH_CATALOG.filter((w) => owned.has(w.id))
}

export function affordableWatches(state: GameState): Watch[] {
  return WATCH_CATALOG.filter((w) => w.priceCents <= state.currencyCents)
}

export function availableMarketWatches(state: GameState): Watch[] {
  return WATCH_CATALOG.filter((w) => isTierUnlocked(state, w.tier))
}
