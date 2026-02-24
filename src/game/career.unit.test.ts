import { describe, expect, it } from 'vitest'
import { CAREER_STAGES } from './data/careers'
import {
  calculateDecayedCount,
  calculateSessionCost,
  canAdvanceCareer,
  canCompleteTherapySession,
  FAMILY_CHECKIN_COOLDOWN_MS,
  getCareerProgress,
  getFamilyCheckInCooldownRemaining,
  MAX_THERAPY_COOLDOWN_MS,
  getNextStageXpTarget,
  getTherapyCooldownRemaining,
  MAX_COOLDOWN_MS,
} from './career'
import { initialGameState, type GameState } from './types'

function withState(overrides: Partial<GameState>): GameState {
  return { ...initialGameState, ...overrides }
}

describe('career progression', () => {
  it('defines the six career stages in order', () => {
    expect(CAREER_STAGES).toHaveLength(6)
    expect(CAREER_STAGES.map((stage) => stage.id)).toEqual([
      'PhDStudent',
      'Externship',
      'VAHospital',
      'PrivatePractice',
      'GroupPractice',
      'Retirement',
    ])
  })

  it('computes career progress relative to current stage and next threshold', () => {
    const state = withState({ careerStage: 'Externship', careerXp: 300 })
    const progress = getCareerProgress(state)

    expect(progress.stage).toBe('Externship')
    expect(progress.nextTargetXp).toBe(500)
    expect(progress.ratio).toBeCloseTo(0.5)
  })

  it('reports completed progress when there is no next stage', () => {
    const state = withState({ careerStage: 'Retirement', careerXp: 25_000 })
    const progress = getCareerProgress(state)

    expect(progress.nextTargetXp).toBeNull()
    expect(progress.ratio).toBe(1)
  })

  it('reports zero progress before onboarding in pre-phd', () => {
    const state = withState({ careerStage: 'pre-phd', careerXp: 0 })
    const progress = getCareerProgress(state)

    expect(progress.nextTargetXp).toBe(0)
    expect(progress.ratio).toBe(0)
  })

  it('allows advance only when at or above the next threshold', () => {
    const blocked = withState({ careerStage: 'PhDStudent', careerXp: 99 })
    const ready = withState({ careerStage: 'PhDStudent', careerXp: 100 })

    expect(canAdvanceCareer(blocked)).toBe(false)
    expect(canAdvanceCareer(ready)).toBe(true)
    expect(getNextStageXpTarget('PhDStudent')).toBe(100)
  })

  it('never allows direct advance from pre-phd', () => {
    const prePhd = withState({ careerStage: 'pre-phd', careerXp: 10_000 })
    expect(canAdvanceCareer(prePhd)).toBe(false)
  })
})

describe('cooldown calculations', () => {
  it('returns 0 for expired therapy cooldown', () => {
    const state = withState({
      therapyCooldownUntilMs: 1000, // 1 second ago
      clockMs: 2000,
    })
    expect(getTherapyCooldownRemaining(state)).toBe(0)
  })

  it('returns remaining time for active therapy cooldown', () => {
    const state = withState({
      therapyCooldownUntilMs: 5000, // 5 seconds from now
      clockMs: 2000,
    })
    expect(getTherapyCooldownRemaining(state)).toBe(3000)
  })

  it('clamps therapy cooldown to max value', () => {
    const state = withState({
      therapyCooldownUntilMs: 10_000_000_000, // Way in future (simulates bug value)
      clockMs: 1000,
    })
    expect(getTherapyCooldownRemaining(state)).toBe(MAX_THERAPY_COOLDOWN_MS)
  })

  it('returns 0 for expired family check-in cooldown', () => {
    // Family check-in cooldown is 5 minutes.
    // If last check-in was at 0 and clock is at 400,000, cooldown has expired
    const state = withState({
      lastFamilyCheckIn: 100_000, // Check-in at 100s
      clockMs: 400_000, // Clock at 400s, cooldown expired at 400s (100 + 300)
    })
    expect(getFamilyCheckInCooldownRemaining(state)).toBe(0)
  })

  it('returns remaining time for active family check-in cooldown', () => {
    const state = withState({
      lastFamilyCheckIn: 10_000, // Check-in at 10 seconds
      clockMs: 60_000, // Clock at 60 seconds, 4 minutes remain until 310s
    })
    const remaining = getFamilyCheckInCooldownRemaining(state)
    expect(remaining).toBe(250_000) // 250 seconds = 4min 10s
  })

  it('clamps family check-in cooldown to max value', () => {
    const state = withState({
      lastFamilyCheckIn: 10_000_000_000, // Way in future (simulates bug value)
      clockMs: 1000,
    })
    expect(getFamilyCheckInCooldownRemaining(state)).toBe(MAX_COOLDOWN_MS)
  })

  it('handles undefined lastFamilyCheckIn as no cooldown', () => {
    const state = withState({
      lastFamilyCheckIn: undefined as unknown as number,
      clockMs: 0, // Clock at 0 means no time has passed, so no cooldown
    })
    // Undefined should behave like "never checked in".
    expect(getFamilyCheckInCooldownRemaining(state)).toBe(0)
  })

  it('uses configured family check-in cooldown duration', () => {
    expect(FAMILY_CHECKIN_COOLDOWN_MS).toBe(300_000)
  })
})

describe('consecutive session calculations', () => {
  it('returns base cost when consecutive count is 0', () => {
    const state = withState({ careerStage: 'PhDStudent', consecutiveSessions: { count: 0, lastSessionTime: 0 } })
    const cost = calculateSessionCost(100, state, 1_000)
    expect(cost.cost).toBe(100)
    expect(cost.multiplier).toBe(1)
    expect(cost.decayedCount).toBe(0)
  })

  it('scales cost by 50 percent per active consecutive session', () => {
    const state = withState({
      careerStage: 'PhDStudent',
      therapyCooldownUntilMs: 60_000,
      consecutiveSessions: { count: 3, lastSessionTime: 10_000, decayStartedAt: 30_000 },
    })
    const cost = calculateSessionCost(100, state, 35_000)
    expect(cost.decayedCount).toBe(3)
    expect(cost.multiplier).toBe(2.5)
    expect(cost.cost).toBe(250)
  })

  it('applies decay by one step every two minutes after decay starts', () => {
    const state = withState({
      careerStage: 'PhDStudent',
      therapyCooldownUntilMs: 1_000_000,
      consecutiveSessions: { count: 5, lastSessionTime: 10_000, decayStartedAt: 30_000 },
    })
    expect(calculateDecayedCount(state, 30_000 + 240_000)).toBe(3)
  })

  it('resets consecutive premium to base once cooldown fully elapses', () => {
    const state = withState({
      careerStage: 'PhDStudent',
      therapyCooldownUntilMs: 20_000,
      consecutiveSessions: { count: 4, lastSessionTime: 10_000, decayStartedAt: 20_000 },
    })

    const cost = calculateSessionCost(100, state, 20_000)
    expect(cost.decayedCount).toBe(0)
    expect(cost.multiplier).toBe(1)
    expect(cost.cost).toBe(100)
  })

  it('allows starting during cooldown if scaled cost is affordable', () => {
    const state = withState({
      onboardingComplete: true,
      careerStage: 'PhDStudent',
      therapyCooldownUntilMs: 50_000,
      clockMs: 10_000,
      enjoyment: 8,
      consecutiveSessions: { count: 0, lastSessionTime: 9_000, decayStartedAt: 29_000 },
    })
    expect(canCompleteTherapySession(state, state.clockMs)).toBe(true)
  })
})
