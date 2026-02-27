/**
 * Victory System
 * Checks victory conditions and manages endgame state
 */

import type { GameState } from './types'

/**
 * Victory criteria structure
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
  return criteria.collectionComplete && 
         criteria.careerComplete && 
         criteria.prestigeComplete && 
         criteria.homeComplete
}

/**
 * Get detailed victory criteria status
 */
export function getVictoryCriteria(state: GameState): VictoryCriteria & { 
  progress: number
  checks: { label: string; complete: boolean; detail: string }[]
} {
  // Check collection (need actual watch data)
  const collectionProgress = state.ownedWatchIds.length
  const collectionTarget = 50 // Approximate total watches
  const collectionComplete = collectionProgress >= collectionTarget

  // Check career (at Retirement)
  const careerComplete = state.careerStage === 'Retirement'

  // Check prestige (all 3 tiers)
  const prestigeComplete = 
    state.prestige.workshop.unlocked && 
    state.prestige.maison.unlocked && 
    state.prestige.nostalgia.unlocked

  // Check home (all items)
  const homeProgress = state.unlockedHomeItems.length
  const homeTarget = 30 // Approximate total home items
  const homeComplete = homeProgress >= homeTarget

  // Calculate overall progress
  const checks = [
    { 
      label: 'Collection', 
      complete: collectionComplete, 
      detail: `${collectionProgress}/${collectionTarget} watches` 
    },
    { 
      label: 'Career', 
      complete: careerComplete, 
      detail: careerComplete ? 'Retired' : state.careerStage 
    },
    { 
      label: 'Prestige', 
      complete: prestigeComplete, 
      detail: `${[state.prestige.workshop.unlocked, state.prestige.maison.unlocked, state.prestige.nostalgia.unlocked].filter(Boolean).length}/3 tiers` 
    },
    { 
      label: 'Home', 
      complete: homeComplete, 
      detail: `${homeProgress}/${homeTarget} items` 
    },
  ]

  const progress = checks.filter(c => c.complete).length / checks.length

  return {
    collectionComplete,
    careerComplete,
    prestigeComplete,
    homeComplete,
    progress,
    checks,
  }
}

/**
 * Check if victory has been triggered
 */
export function isVictoryTriggered(state: GameState): boolean {
  return state.victoryComplete === true
}

/**
 * Get victory status message
 */
export function getVictoryStatus(state: GameState): string {
  const criteria = getVictoryCriteria(state)
  
  if (criteria.progress === 0) {
    return "Your journey is just beginning."
  } else if (criteria.progress < 0.5) {
    return "You're making progress on your journey."
  } else if (criteria.progress < 1) {
    return "You're close to completing your journey."
  } else {
    return "Your journey is complete. At Last."
  }
}
