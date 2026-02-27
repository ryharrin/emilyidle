/**
 * Achievement System Module
 * Exports all achievement-related types, functions, and utilities
 */

// Types
export type {
  Achievement,
  AchievementCategory,
  AchievementCondition,
  AchievementState,
  AchievementWithStatus,
  AchievementToast,
} from './types'

// Registry
export {
  ACHIEVEMENTS,
  getAchievement,
  getAchievementsByCategory,
  getVisibleAchievements,
  getSecretAchievements,
  isAchievementUnlocked,
} from './registry'

// Evaluation
export {
  evaluateAchievements,
  checkAchievement,
  getAchievementProgress,
  getNearCompleteAchievements,
  applyAchievementUnlocks,
  evaluateAndUnlockAchievements,
} from './evaluate'
