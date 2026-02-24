import { MANUAL_WINDING } from '../../game/constants'

export type Grade = 'Miss' | 'Good' | 'Perfect'

export function gradeFromHoldDuration(holdDurationMs: number): Grade {
  const diff = Math.abs(holdDurationMs - MANUAL_WINDING.OPTIMAL_HOLD_MS)

  if (diff <= MANUAL_WINDING.PERFECT_WINDOW_MS) return 'Perfect'
  if (diff <= MANUAL_WINDING.GOOD_WINDOW_MS) return 'Good'
  return 'Miss'
}

export function calculateRotation(grade: Grade): number {
  if (grade === 'Perfect' || grade === 'Good') {
    return MANUAL_WINDING.ROTATION_PER_WIND
  }
  return 0
}
