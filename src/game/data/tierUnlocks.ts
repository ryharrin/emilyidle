import type { CareerStage } from '../types'

// Tier unlock mapping - which career stage unlocks which watch tier
export const TIER_UNLOCKS: Record<string, CareerStage> = {
  quartz: 'PhDStudent',
  manual: 'Externship',
  automatic: 'VAHospital',
  tourbillon: 'PrivatePractice',
}

// Stage order for comparison
const STAGE_ORDER: CareerStage[] = [
  'pre-phd',
  'PhDStudent',
  'Externship',
  'VAHospital',
  'PrivatePractice',
  'GroupPractice',
  'Retirement',
]

/**
 * Check if a tier is unlocked at the current career stage
 * @param tier - The watch tier to check
 * @param currentStage - The player's current career stage
 * @returns boolean indicating if the tier is unlocked
 */
export function isTierUnlocked(tier: string, currentStage: CareerStage): boolean {
  const requiredStage = TIER_UNLOCKS[tier]
  if (!requiredStage) return false

  const currentIndex = STAGE_ORDER.indexOf(currentStage)
  const requiredIndex = STAGE_ORDER.indexOf(requiredStage)

  return currentIndex >= requiredIndex
}

/**
 * Get the required career stage to unlock a tier
 * @param tier - The watch tier
 * @returns The career stage required to unlock it
 */
export function getTierRequiredStage(tier: string): CareerStage | null {
  return TIER_UNLOCKS[tier] ?? null
}

/**
 * Get all unlocked tiers at the current career stage
 * @param currentStage - The player's current career stage
 * @returns Array of unlocked tier names
 */
export function getUnlockedTiers(currentStage: CareerStage): string[] {
  return Object.keys(TIER_UNLOCKS).filter((tier) =>
    isTierUnlocked(tier, currentStage),
  )
}

/**
 * Get all locked tiers at the current career stage
 * @param currentStage - The player's current career stage
 * @returns Array of locked tier names with their required stages
 */
export function getLockedTiers(
  currentStage: CareerStage,
): Array<{ tier: string; requiredStage: CareerStage }> {
  return Object.entries(TIER_UNLOCKS)
    .filter(([tier]) => !isTierUnlocked(tier, currentStage))
    .map(([tier, requiredStage]) => ({ tier, requiredStage }))
}

/**
 * Check if a tier was newly unlocked (previous stage didn't have it, current does)
 * @param tier - The watch tier to check
 * @param previousStage - The player's previous career stage
 * @param currentStage - The player's current career stage
 * @returns boolean indicating if the tier is newly unlocked
 */
export function isNewlyUnlocked(
  tier: string,
  previousStage: CareerStage,
  currentStage: CareerStage,
): boolean {
  return !isTierUnlocked(tier, previousStage) && isTierUnlocked(tier, currentStage)
}
