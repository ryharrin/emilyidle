/**
 * Achievement System Types
 * Defines the achievement data model and types
 */

import type { GameState } from '../types'

/** Achievement categories */
export type AchievementCategory =
  | 'collection'
  | 'career'
  | 'minigame'
  | 'home'
  | 'secret'

/** Achievement definition */
export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
  secret?: boolean
  condition: AchievementCondition
}

/** Achievement condition types */
export type AchievementCondition =
  | { type: 'watchCount'; count: number }
  | { type: 'careerStage'; stage: string }
  | { type: 'miniGameScore'; game: string; perfects: number }
  | { type: 'homeItems'; count: number }
  | { type: 'custom'; check: (state: GameState) => boolean }

/** Achievement state in GameState */
export interface AchievementState {
  unlockedAchievementIds: string[]
}

/** Achievement with unlock status */
export interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  unlockedAt?: number
}

/** Achievement toast notification */
export interface AchievementToast {
  id: string
  achievementId: string
  name: string
  description: string
  icon: string
  createdAtMs: number
}
