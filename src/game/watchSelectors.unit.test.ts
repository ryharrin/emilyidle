import { describe, expect, it } from 'vitest'
import { affordableWatches, availableMarketWatches, ownedWatches } from './watchSelectors'
import type { GameState } from './types'
import { WATCH_CATALOG } from './data/watches'

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
    onboardingComplete: true,
    mail: [],
    pendingPackages: [],
    consecutiveSessions: { count: 0, lastSessionTime: 0 },
    ...overrides,
  } as GameState
}

describe('watchSelectors', () => {
  it('ownedWatches filters by ownedWatchIds', () => {
    const first = WATCH_CATALOG[0]
    expect(first).toBeTruthy()
    const state = baseState({ ownedWatchIds: [first!.id] })
    expect(ownedWatches(state).map((w) => w.id)).toEqual([first!.id])
  })

  it('affordableWatches filters by price <= currencyCents', () => {
    const minPrice = Math.min(...WATCH_CATALOG.map((w) => w.priceCents))
    const state = baseState({ currencyCents: minPrice })
    expect(affordableWatches(state).length).toBeGreaterThan(0)
    for (const w of affordableWatches(state)) {
      expect(w.priceCents).toBeLessThanOrEqual(state.currencyCents)
    }
  })

  it('keeps manual tier locked until externship unlock triggers', () => {
    const locked = baseState()
    const unlocked = baseState({
      triggeredUnlockIds: {
        'career-Externship-manual': true,
      },
    })

    expect(availableMarketWatches(locked).some((w) => w.tier === 'manual')).toBe(false)
    expect(availableMarketWatches(unlocked).some((w) => w.tier === 'manual')).toBe(true)
  })
})
