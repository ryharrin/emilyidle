/**
 * Achievement Evaluation System
 * Evaluates achievement conditions and triggers unlocks
 */

import type { GameState } from '../types'
import type { Achievement, AchievementCondition } from './types'
import { ACHIEVEMENTS, isAchievementUnlocked } from './registry'

/**
 * Evaluate a single achievement condition with null-safe checks
 */
function evaluateCondition(
  condition: AchievementCondition,
  state: GameState,
): boolean {
  switch (condition.type) {
    case 'watchCount': {
      return (state.ownedWatchIds?.length ?? 0) >= condition.count
    }

    case 'careerStage': {
      return state.careerStage === condition.stage
    }

    case 'miniGameScore': {
      // Find best score/perfects for the specified game
      const records =
        state.interactionHistory?.filter((r) => r.gameType === condition.game) ??
        []
      if (records.length === 0) return false

      const bestPerfects = Math.max(...records.map((r) => r.perfects ?? 0))
      return bestPerfects >= condition.perfects
    }

    case 'homeItems': {
      return (state.unlockedHomeItems?.length ?? 0) >= condition.count
    }

    case 'custom': {
      try {
        return condition.check(state)
      } catch {
        // Silently fail on custom check errors
        return false
      }
    }

    default: {
      return false
    }
  }
}

/**
 * Evaluate all achievements and return newly unlocked ones
 */
export function evaluateAchievements(state: GameState): string[] {
  const newlyUnlocked: string[] = []

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (isAchievementUnlocked(state, achievement.id)) {
      continue
    }

    // Check if condition is met
    if (evaluateCondition(achievement.condition, state)) {
      newlyUnlocked.push(achievement.id)
    }
  }

  return newlyUnlocked
}

/**
 * Check specific achievement by ID
 */
export function checkAchievement(
  achievementId: string,
  state: GameState,
): boolean {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
  if (!achievement) return false

  return evaluateCondition(achievement.condition, state)
}

/**
 * Get progress toward an achievement (0-1)
 */
export function getAchievementProgress(
  achievementId: string,
  state: GameState,
): number {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)
  if (!achievement) return 0

  // Already unlocked
  if (isAchievementUnlocked(state, achievementId)) return 1

  const condition = achievement.condition

  switch (condition.type) {
    case 'watchCount': {
      const count = state.ownedWatchIds?.length ?? 0
      return Math.min(1, count / condition.count)
    }

    case 'homeItems': {
      const count = state.unlockedHomeItems?.length ?? 0
      return Math.min(1, count / condition.count)
    }

    case 'careerStage': {
      // Simple progress based on career stages
      const careerStages = [
        'pre-phd',
        'PhDStudent',
        'Externship',
        'VAHospital',
        'PrivatePractice',
        'GroupPractice',
        'Retirement',
      ]
      const currentIndex = careerStages.indexOf(state.careerStage ?? '')
      const targetIndex = careerStages.indexOf(condition.stage)
      if (targetIndex === -1) return 0
      if (currentIndex >= targetIndex) return 1
      return targetIndex > 0 ? currentIndex / targetIndex : 0
    }

    case 'miniGameScore': {
      const records =
        state.interactionHistory?.filter((r) => r.gameType === condition.game) ??
        []
      if (records.length === 0) return 0
      const bestPerfects = Math.max(...records.map((r) => r.perfects ?? 0))
      return Math.min(1, bestPerfects / condition.perfects)
    }

    case 'custom': {
      // Custom conditions don't have progress - binary check
      return checkAchievement(achievementId, state) ? 1 : 0
    }

    default: {
      return 0
    }
  }
}

/**
 * Get achievements that are close to unlocking (>50% progress)
 */
export function getNearCompleteAchievements(
  state: GameState,
  threshold = 0.5,
): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => {
    if (isAchievementUnlocked(state, achievement.id)) return false
    const progress = getAchievementProgress(achievement.id, state)
    return progress >= threshold
  })
}

/**
 * Apply achievement unlocks to game state
 * Returns new state with achievements marked as unlocked
 */
export function applyAchievementUnlocks(
  state: GameState,
  achievementIds: string[],
): GameState {
  if (achievementIds.length === 0) return state

  const currentIds = state.unlockedAchievementIds ?? []
  const newIds = achievementIds.filter((id) => !currentIds.includes(id))

  if (newIds.length === 0) return state

  return {
    ...state,
    unlockedAchievementIds: [...currentIds, ...newIds],
  }
}

/**
 * Full evaluation cycle: check all achievements and update state
 * Pure function - returns new state only if changes occurred
 */
export function evaluateAndUnlockAchievements(state: GameState): GameState {
  const newlyUnlocked = evaluateAchievements(state)
  return applyAchievementUnlocks(state, newlyUnlocked)
}
