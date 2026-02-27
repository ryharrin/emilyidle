// Constants for Quartz Calibration mini-game
export const INITIAL_JITTER = 60
export const MIN_JITTER = 10
export const JITTER_DECREMENT = 10
export const TOTAL_ROUNDS = 1
export const ANIMATION_SPEED = 1.5 // Hz (beats per second) - Slower for easier gameplay
export const PERFECT_STREAK_THRESHOLD = 1 // Number of perfects to trigger celebration

// Clear instructions for the player (AC 3.5.2)
export const CALIBRATION_INSTRUCTIONS = {
  goal: "Calm the drifting quartz beat back to center. The crystal's rhythm has drifted and needs your steady hand.",
  howToPlay: 'Watch the beat dot oscillate across the center line. Tap "Calibrate" when the dot crosses the center to steady the rhythm. Closer to center = better results.',
  reward: 'Earn Enjoyment based on your calibration accuracy. Perfect calibrations steady the beat faster and grant bonus rewards.',
} as const

// Export legacy threshold constants for backwards compatibility
export const PERFECT_THRESHOLD = 10
export const GOOD_THRESHOLD = 25

export type CalibrationGrade = 'Miss' | 'Good' | 'Perfect'

// Overloaded evaluateGrade - can use default thresholds or custom ones
export function evaluateGrade(distanceFromCenter: number): CalibrationGrade
export function evaluateGrade(
  distanceFromCenter: number,
  perfectThreshold: number,
  goodThreshold: number
): CalibrationGrade
export function evaluateGrade(
  distanceFromCenter: number,
  perfectThreshold?: number,
  goodThreshold?: number
): CalibrationGrade {
  const pThreshold = perfectThreshold ?? PERFECT_THRESHOLD
  const gThreshold = goodThreshold ?? GOOD_THRESHOLD
  if (distanceFromCenter <= pThreshold) return 'Perfect'
  if (distanceFromCenter <= gThreshold) return 'Good'
  return 'Miss'
}

// Difficulty tiers for quartz calibration (generous timing windows - gift context)
export const QUARTZ_DIFFICULTY = {
  entry: { perfectWindow: 15, goodWindow: 30 }, // Most generous - budget/quartz tier
  mid: { perfectWindow: 10, goodWindow: 25 }, // Standard - automatic tier
  premium: { perfectWindow: 8, goodWindow: 20 }, // Premium - manual/tourbillon tier
} as const

export type DifficultyTier = keyof typeof QUARTZ_DIFFICULTY

// Map watch tier to difficulty tier
export function getDifficultyForWatchTier(watchTier: string): DifficultyTier {
  switch (watchTier) {
    case 'quartz':
      return 'entry'
    case 'automatic':
      return 'mid'
    case 'manual':
    case 'tourbillon':
      return 'premium'
    default:
      return 'entry'
  }
}

export function getThresholds(difficultyTier: DifficultyTier) {
  return QUARTZ_DIFFICULTY[difficultyTier]
}
