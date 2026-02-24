import type { GameState } from './types'
import { WATCH_CATALOG, getWatchesByTier, type WatchTier } from './data/watches'

// ==========================================
// Workshop Prestige (Story 5-4)
// ==========================================

export type WorkshopUpgrade = {
  id: string
  name: string
  description: string
  cost: number
  multiplier: number
  unlocksTier?: WatchTier
}

export const WORKSHOP_UPGRADES: readonly WorkshopUpgrade[] = [
  {
    id: 'income-boost-1',
    name: 'Basic Income Boost',
    description: '+20% income from therapy sessions',
    cost: 10,
    multiplier: 1.2,
  },
  {
    id: 'income-boost-2',
    name: 'Advanced Income Boost',
    description: '+50% income from therapy sessions',
    cost: 25,
    multiplier: 1.5,
  },
  {
    id: 'manual-unlock',
    name: 'Manual Watch Access',
    description: 'Unlock manual winding tier',
    cost: 15,
    multiplier: 1.0,
    unlocksTier: 'manual',
  },
  {
    id: 'home-expansion-1',
    name: 'Home Gallery',
    description: 'Display more watches in your home',
    cost: 20,
    multiplier: 1.0,
  },
] as const

/**
 * Calculate workshop blueprints earned when unlocking.
 * Based on career progress and owned watches.
 */
export function calculateWorkshopBlueprints(state: GameState): number {
  // Base blueprints based on career stage
  const stageBlueprints: Record<string, number> = {
    'pre-phd': 0,
    'PhDStudent': 0,
    'Externship': 5,
    'VAHospital': 10,
    'PrivatePractice': 15,
    'GroupPractice': 20,
    'Retirement': 25,
  }

  const stageBonus = stageBlueprints[state.careerStage] || 0

  // Bonus for each watch owned (1 blueprint per 5 watches)
  const watchBonus = Math.floor(state.ownedWatchIds.length / 5)

  return stageBonus + watchBonus
}

// ==========================================
// Maison Prestige (Story 5-5)
// ==========================================

export type MaisonUpgrade = {
  id: string
  name: string
  description: string
  cost: number
  multiplier: number
  unlocksTier?: WatchTier
  collectionBonus?: number // percentage per owned watch
}

export const MAISON_UPGRADES: readonly MaisonUpgrade[] = [
  {
    id: 'income-boost-3',
    name: 'Premium Income Boost',
    description: '+100% income from therapy sessions',
    cost: 30,
    multiplier: 2.0,
  },
  {
    id: 'tourbillon-unlock',
    name: 'Tourbillon Access',
    description: 'Unlock tourbillon watch tier',
    cost: 50,
    multiplier: 1.0,
    unlocksTier: 'tourbillon',
  },
  {
    id: 'premium-home',
    name: 'Premium Home Features',
    description: 'Unlock premium home decorations',
    cost: 40,
    multiplier: 1.0,
  },
  {
    id: 'collection-bonus',
    name: 'Collection Bonus',
    description: '+10% enjoyment per owned watch',
    cost: 35,
    multiplier: 1.0,
    collectionBonus: 10,
  },
] as const

/**
 * Calculate maison heritage earned when unlocking.
 */
export function calculateMaisonHeritage(state: GameState): number {
  // Base heritage based on career stage
  const stageHeritage: Record<string, number> = {
    'pre-phd': 0,
    'PhDStudent': 0,
    'Externship': 0,
    'VAHospital': 5,
    'PrivatePractice': 10,
    'GroupPractice': 15,
    'Retirement': 20,
  }

  const stageBonus = stageHeritage[state.careerStage] || 0

  // Bonus for each tier completed
  const ownedSet = new Set(state.ownedWatchIds)
  let tiersCompleted = 0
  const tiers: WatchTier[] = ['quartz', 'manual', 'automatic', 'tourbillon']
  for (const tier of tiers) {
    const tierWatches = getWatchesByTier(tier)
    const ownedInTier = tierWatches.filter((w) => ownedSet.has(w.id))
    if (ownedInTier.length === tierWatches.length && tierWatches.length > 0) {
      tiersCompleted++
    }
  }

  return stageBonus + tiersCompleted * 5
}

// ==========================================
// Nostalgia Prestige (Story 5-6)
// ==========================================

export type NostalgiaUpgrade = {
  id: string
  name: string
  description: string
  cost: number
  multiplier: number
  achievement?: string
  unlocksFeature?: string
}

export const NOSTALGIA_UPGRADES: readonly NostalgiaUpgrade[] = [
  {
    id: 'ultimate-multiplier',
    name: 'Ultimate Multiplier',
    description: '+200% income multiplier',
    cost: 100,
    multiplier: 3.0,
  },
  {
    id: 'museum-status',
    name: 'Museum Quality',
    description: 'Achieve collection perfection',
    cost: 75,
    multiplier: 1.0,
    achievement: 'museum-quality',
  },
  {
    id: 'final-gallery',
    name: 'Complete Home Gallery',
    description: 'Final home expansion',
    cost: 80,
    multiplier: 1.0,
    unlocksFeature: 'complete-home',
  },
  {
    id: 'legacy-bonus',
    name: 'Legacy Bonus',
    description: 'Permanent bonus for all future saves',
    cost: 60,
    multiplier: 1.0,
  },
] as const

/**
 * Calculate nostalgia points earned when unlocking.
 */
export function calculateNostalgiaPoints(state: GameState): number {
  // Base points based on collection completion
  const totalWatches = WATCH_CATALOG.filter((w) => !w.isAwarded).length
  const ownedCount = state.ownedWatchIds.filter(
    (id) => !WATCH_CATALOG.find((w) => w.id === id)?.isAwarded,
  ).length

  // Points based on collection percentage
  const completionRatio = ownedCount / Math.max(totalWatches, 1)
  const completionPoints = Math.floor(completionRatio * 30)

  // Stage-based points
  const stagePoints: Record<string, number> = {
    'pre-phd': 0,
    'PhDStudent': 0,
    'Externship': 0,
    'VAHospital': 0,
    'PrivatePractice': 5,
    'GroupPractice': 10,
    'Retirement': 15,
  }

  return completionPoints + (stagePoints[state.careerStage] || 0)
}

// ==========================================
// Multiplier Calculations (Stories 5-4, 5-5, 5-6)
// ==========================================

/**
 * Get the workshop income multiplier based on upgrades purchased.
 */
export function getWorkshopMultiplier(state: GameState): number {
  if (!state.prestige.workshop.unlocked) return 1.0

  let multiplier = 1.0
  for (const upgradeId of state.prestige.workshop.upgrades) {
    const upgrade = WORKSHOP_UPGRADES.find((u) => u.id === upgradeId)
    if (upgrade) {
      multiplier *= upgrade.multiplier
    }
  }
  return multiplier
}

/**
 * Get the maison income multiplier based on upgrades purchased.
 */
export function getMaisonMultiplier(state: GameState): number {
  if (!state.prestige.maison.unlocked) return 1.0

  let multiplier = 1.0
  for (const upgradeId of state.prestige.maison.upgrades) {
    const upgrade = MAISON_UPGRADES.find((u) => u.id === upgradeId)
    if (upgrade) {
      multiplier *= upgrade.multiplier
    }
  }
  return multiplier
}

/**
 * Get the nostalgia income multiplier based on upgrades purchased.
 */
export function getNostalgiaMultiplier(state: GameState): number {
  if (!state.prestige.nostalgia.unlocked) return 1.0

  let multiplier = 1.0
  for (const upgradeId of state.prestige.nostalgia.upgrades) {
    const upgrade = NOSTALGIA_UPGRADES.find((u) => u.id === upgradeId)
    if (upgrade) {
      multiplier *= upgrade.multiplier
    }
  }
  return multiplier
}

/**
 * Calculate the total income multiplier from all prestige layers.
 */
export function calculateTotalIncomeMultiplier(state: GameState): number {
  return (
    getWorkshopMultiplier(state) *
    getMaisonMultiplier(state) *
    getNostalgiaMultiplier(state)
  )
}

/**
 * Calculate collection bonus from maison upgrades.
 */
export function getCollectionBonus(state: GameState): number {
  if (!state.prestige.maison.unlocked) return 0

  let bonus = 0
  for (const upgradeId of state.prestige.maison.upgrades) {
    const upgrade = MAISON_UPGRADES.find((u) => u.id === upgradeId)
    if (upgrade?.collectionBonus) {
      bonus += upgrade.collectionBonus
    }
  }
  return bonus / 100 // Convert to decimal
}

/**
 * Check if a tier is unlocked through prestige upgrades.
 */
export function isTierUnlockedByPrestige(state: GameState, tier: WatchTier): boolean {
  // Check workshop upgrades
  for (const upgradeId of state.prestige.workshop.upgrades) {
    const upgrade = WORKSHOP_UPGRADES.find((u) => u.id === upgradeId)
    if (upgrade?.unlocksTier === tier) return true
  }
  // Check maison upgrades
  for (const upgradeId of state.prestige.maison.upgrades) {
    const upgrade = MAISON_UPGRADES.find((u) => u.id === upgradeId)
    if (upgrade?.unlocksTier === tier) return true
  }
  return false
}

/**
 * Check if workshop prestige can be unlocked.
 * Unlocked after Externship career stage.
 */
export function canUnlockWorkshop(state: GameState): boolean {
  if (state.prestige.workshop.unlocked) return false

  const unlockStages = ['Externship', 'VAHospital', 'PrivatePractice', 'GroupPractice', 'Retirement']
  return unlockStages.includes(state.careerStage)
}

/**
 * Check if maison prestige can be unlocked.
 * Unlocked after VA Hospital career stage.
 */
export function canUnlockMaison(state: GameState): boolean {
  if (state.prestige.maison.unlocked) return false

  const unlockStages = ['VAHospital', 'PrivatePractice', 'GroupPractice', 'Retirement']
  return unlockStages.includes(state.careerStage)
}

/**
 * Check if nostalgia prestige can be unlocked.
 * Unlocked at Retirement (endgame).
 */
export function canUnlockNostalgia(state: GameState): boolean {
  if (state.prestige.nostalgia.unlocked) return false

  return state.careerStage === 'Retirement'
}
