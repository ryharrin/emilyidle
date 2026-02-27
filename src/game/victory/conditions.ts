/**
 * Victory Conditions
 * Defines and checks victory criteria for game completion
 */

import type { GameState } from '../types'
import { WATCH_CATALOG } from '../data/watches'
import { ALL_HOME_LIFE_ITEMS } from '../data/homeLife'

/**
 * Victory criteria interface
 */
export interface VictoryCriteria {
  collectionComplete: boolean
  careerComplete: boolean
  prestigeComplete: boolean
  homeComplete: boolean
}

/**
 * Check if all victory conditions are met
 */
export function checkVictoryConditions(state: GameState): boolean {
  const criteria = getVictoryCriteria(state)
  return (
    criteria.collectionComplete &&
    criteria.careerComplete &&
    criteria.prestigeComplete &&
    criteria.homeComplete
  )
}

/**
 * Get detailed victory criteria status
 */
export function getVictoryCriteria(state: GameState): VictoryCriteria {
  return {
    collectionComplete: checkCollectionComplete(state),
    careerComplete: checkCareerComplete(state),
    prestigeComplete: checkPrestigeComplete(state),
    homeComplete: checkHomeComplete(state),
  }
}

/**
 * Check if collection is complete (all watches owned)
 */
function checkCollectionComplete(state: GameState): boolean {
  const allWatchIds = WATCH_CATALOG.map((w) => w.id)
  return allWatchIds.every((id) => state.ownedWatchIds.includes(id))
}

/**
 * Check if career is at Retirement stage
 */
function checkCareerComplete(state: GameState): boolean {
  return state.careerStage === 'Retirement'
}

/**
 * Check if all prestige tiers are unlocked
 */
function checkPrestigeComplete(state: GameState): boolean {
  return (
    state.prestige.workshop.unlocked &&
    state.prestige.maison.unlocked &&
    state.prestige.nostalgia.unlocked
  )
}

/**
 * Check if all home items are unlocked
 */
function checkHomeComplete(state: GameState): boolean {
  return ALL_HOME_LIFE_ITEMS.every((item) => {
    const itemId = item.type === 'photo' 
      ? item.data.id 
      : item.type === 'drawing' 
        ? item.data.id 
        : item.data.id
    return state.unlockedHomeItems.includes(itemId)
  })
}

/**
 * Get victory progress (0-1)
 */
export function getVictoryProgress(state: GameState): number {
  const criteria = getVictoryCriteria(state)
  const completed = Object.values(criteria).filter(Boolean).length
  return completed / 4
}

/**
 * Check if victory criteria are "near" complete (>75%)
 */
export function isVictoryNear(state: GameState): boolean {
  return getVictoryProgress(state) >= 0.75
}

/**
 * Get human-readable description of remaining requirements
 */
export function getVictoryRequirements(state: GameState): string[] {
  const criteria = getVictoryCriteria(state)
  const requirements: string[] = []

  if (!criteria.collectionComplete) {
    const owned = state.ownedWatchIds.length
    const total = WATCH_CATALOG.length
    requirements.push(`Complete your watch collection (${owned}/${total})`)
  }

  if (!criteria.careerComplete) {
    requirements.push('Reach the Retirement career stage')
  }

  if (!criteria.prestigeComplete) {
    const unlocked = [
      state.prestige.workshop.unlocked,
      state.prestige.maison.unlocked,
      state.prestige.nostalgia.unlocked,
    ].filter(Boolean).length
    requirements.push(`Unlock all prestige tiers (${unlocked}/3)`)
  }

  if (!criteria.homeComplete) {
    const unlocked = state.unlockedHomeItems.length
    requirements.push(`Complete your home gallery (${unlocked}/${ALL_HOME_LIFE_ITEMS.length})`)
  }

  return requirements
}
