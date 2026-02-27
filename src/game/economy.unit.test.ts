import { describe, expect, it } from 'vitest'
import { applyRateCentsPerSecond, clampCurrencyCents, getCurrencyDisplay } from './economy'
import type { GameState } from './types'
import { MAX_CURRENCY_CENTS } from './constants'

function baseState(overrides?: Partial<GameState>): GameState {
  return {
    version: 1,
    clockMs: 0,
    currencyCents: 0,
    enjoyment: 0,
    uncollectedEnjoyment: 0,
    love: 0,
    lastFamilyCheckIn: 0,
    careerXp: 0,
    careerStage: 'PhDStudent',
    therapyCooldownUntilMs: 0,
    ownedWatchIds: [],
    pendingToasts: [],
    pendingUnlocks: [],
    triggeredUnlockIds: {},
    interactionHistory: [],
    onboardingComplete: false,
    mail: [],
    pendingPackages: [],
    prestige: {
      workshop: { unlocked: false, blueprints: 0, upgrades: [] },
      maison: { unlocked: false, heritage: 0, upgrades: [] },
      nostalgia: { unlocked: false, points: 0, upgrades: [], museumQuality: false },
    },
    unlockedHomeItems: [],
    unlockedAchievementIds: [],
    consecutiveSessions: { count: 0, lastSessionTime: 0 },
    ...overrides,
  }
}

describe('economy', () => {
  it('formats currency display as $12.34', () => {
    expect(getCurrencyDisplay(baseState({ currencyCents: 0 }))).toBe('$0.00')
    expect(getCurrencyDisplay(baseState({ currencyCents: 12_34 }))).toBe('$12.34')
    expect(getCurrencyDisplay(baseState({ currencyCents: 1_234_56 }))).toBe('$1,234.56')
  })

  it('applies rate * dtMs / 1000 for income math', () => {
    // rate=123 cents/sec for 1000ms -> 123 cents
    expect(applyRateCentsPerSecond(123, 1_000)).toBe(123)
    // 250 cents/sec for 2000ms -> 500 cents
    expect(applyRateCentsPerSecond(250, 2_000)).toBe(500)
  })

  it('clamps currency cents at MAX_CURRENCY_CENTS', () => {
    expect(clampCurrencyCents(MAX_CURRENCY_CENTS + 1)).toBe(MAX_CURRENCY_CENTS)
    expect(clampCurrencyCents(Number.POSITIVE_INFINITY)).toBe(0)
  })
})
