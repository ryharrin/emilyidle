export type Grade = 'Miss' | 'Good' | 'Perfect'

export function gradeFromError(normalizedError: number): Grade {
  // normalizedError is 0..0.5 (distance from center in a 0..1 loop)
  if (normalizedError <= 0.03) return 'Perfect'
  if (normalizedError <= 0.1) return 'Good'
  return 'Miss'
}

