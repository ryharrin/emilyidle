import { describe, expect, it } from 'vitest'
import { getConsecutiveSessionProgress, getTherapySessionCost } from './consecutiveSessions'
import { initialGameState, type GameState } from '../types'

function withState(overrides: Partial<GameState>): GameState {
  return { ...initialGameState, ...overrides }
}

describe('consecutive session selectors', () => {
  it('returns scaled cost from consecutive count', () => {
    const state = withState({
      careerStage: 'PhDStudent',
      clockMs: 10_000,
      therapyCooldownUntilMs: 60_000,
      consecutiveSessions: {
        count: 2,
        lastSessionTime: 5_000,
        decayStartedAt: 40_000,
      },
      enjoyment: 100,
    })

    const cost = getTherapySessionCost(state)
    expect(cost.baseCost).toBe(5)
    expect(cost.scaledCost).toBe(10)
    expect(cost.multiplier).toBe(2)
  })

  it('returns warning level progression', () => {
    const state = withState({
      careerStage: 'PhDStudent',
      consecutiveSessions: {
        count: 8,
        lastSessionTime: 5_000,
        decayStartedAt: 40_000,
      },
    })

    const progress = getConsecutiveSessionProgress(state)
    expect(progress.warningLevel).toBe('warning')
    expect(progress.current).toBe(8)
    expect(progress.max).toBe(10)
  })
})
