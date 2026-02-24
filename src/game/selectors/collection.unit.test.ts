import { describe, expect, it } from 'vitest'
import { ownedWatches, affordableWatches, availableMarketWatches } from './collection'
import type { GameState } from '../types'
import { WATCH_CATALOG, isAwardedWatch } from '../data/watches'

// Count of purchasable watches (excludes awarded watches like JLC)
const purchasableWatchCount = WATCH_CATALOG.filter((w) => !isAwardedWatch(w.id)).length

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
    consecutiveSessions: { count: 0, lastSessionTime: 0 },
    ...overrides,
  }
}

describe('collection selectors', () => {
  describe('ownedWatches', () => {
    it('returns empty array when no watches owned', () => {
      const state = baseState({ ownedWatchIds: [] })
      expect(ownedWatches(state)).toHaveLength(0)
    })

    it('returns only owned watches', () => {
      const first = WATCH_CATALOG[0]
      const second = WATCH_CATALOG[1]
      expect(first).toBeTruthy()
      expect(second).toBeTruthy()

      const state = baseState({ ownedWatchIds: [first!.id, second!.id] })
      const result = ownedWatches(state)

      expect(result).toHaveLength(2)
      expect(result.map((w) => w.id)).toContain(first!.id)
      expect(result.map((w) => w.id)).toContain(second!.id)
    })

    it('ignores invalid watch IDs', () => {
      const first = WATCH_CATALOG[0]
      expect(first).toBeTruthy()

      const state = baseState({
        ownedWatchIds: [first!.id, 'invalid-watch-id'],
      })
      const result = ownedWatches(state)

      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe(first!.id)
    })

    it('maintains catalog order', () => {
      const first = WATCH_CATALOG[0]
      const third = WATCH_CATALOG[2]
      expect(first).toBeTruthy()
      expect(third).toBeTruthy()

      const state = baseState({
        ownedWatchIds: [third!.id, first!.id], // Reversed order
      })
      const result = ownedWatches(state)

      // Should be in catalog order, not ownedWatchIds order
      expect(result[0]!.id).toBe(first!.id)
      expect(result[1]!.id).toBe(third!.id)
    })
  })

  describe('affordableWatches', () => {
    it('returns empty array when no currency', () => {
      const state = baseState({ currencyCents: 0 })
      const result = affordableWatches(state)
      expect(result.length).toBe(0)
    })

    it('returns watches within budget', () => {
      // Timex Weekender is 30_00 cents
      const state = baseState({ currencyCents: 35_00 })
      const result = affordableWatches(state)

      expect(result.length).toBeGreaterThan(0)
      for (const w of result) {
        expect(w.priceCents).toBeLessThanOrEqual(35_00)
      }
    })

    it('returns all purchasable watches when budget is high', () => {
      const maxPrice = Math.max(...WATCH_CATALOG.map((w) => w.priceCents))
      const state = baseState({ currencyCents: maxPrice })
      const result = affordableWatches(state)

      // Should only include purchasable watches, not awarded ones
      expect(result).toHaveLength(purchasableWatchCount)
    })

    it('excludes awarded watches from affordable list', () => {
      const state = baseState({ currencyCents: 1_000_00 })
      const result = affordableWatches(state)

      for (const w of result) {
        expect(isAwardedWatch(w.id)).toBe(false)
      }
    })
  })

  describe('availableMarketWatches', () => {
    it('returns all purchasable watches when none owned', () => {
      const state = baseState({ ownedWatchIds: [] })
      const result = availableMarketWatches(state)
      expect(result).toHaveLength(purchasableWatchCount)
    })

    it('excludes owned watches', () => {
      const purchasable = WATCH_CATALOG.filter((w) => !isAwardedWatch(w.id))
      const first = purchasable[0]
      expect(first).toBeTruthy()

      const state = baseState({ ownedWatchIds: [first!.id] })
      const result = availableMarketWatches(state)

      expect(result).toHaveLength(purchasableWatchCount - 1)
      expect(result.map((w) => w.id)).not.toContain(first!.id)
    })

    it('excludes awarded watches from market', () => {
      const state = baseState({ ownedWatchIds: [] })
      const result = availableMarketWatches(state)

      for (const w of result) {
        expect(isAwardedWatch(w.id)).toBe(false)
      }
    })

    it('returns empty array when all purchasable watches owned', () => {
      const purchasableIds = WATCH_CATALOG.filter((w) => !isAwardedWatch(w.id)).map((w) => w.id)
      const state = baseState({ ownedWatchIds: purchasableIds })
      const result = availableMarketWatches(state)

      expect(result).toHaveLength(0)
    })
  })
})
