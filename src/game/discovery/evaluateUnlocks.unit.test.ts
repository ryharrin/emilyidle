import { describe, expect, it } from 'vitest'
import { evaluateUnlocks } from './evaluateUnlocks'
import type { GameState } from '../types'
import type { UnlockRegistry } from './types'

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

describe('evaluateUnlocks', () => {
  it('returns the same state reference for an empty registry', () => {
    const state = baseState()
    const next = evaluateUnlocks(state, [])
    expect(next).toBe(state)
  })

  it('enqueues an unlock and marks it triggered when a rule fires', () => {
    const registry: UnlockRegistry = [
      {
        id: 'unlock-1',
        category: 'meta',
        condition: (s) => s.currencyCents >= 100,
      },
    ]

    const state = baseState({ currencyCents: 100 })
    const next = evaluateUnlocks(state, registry)

    expect(next).not.toBe(state)
    expect(next.pendingUnlocks).toEqual(['unlock-1'])
    expect(next.triggeredUnlockIds).toEqual({ 'unlock-1': true })

    // Idempotent once triggered.
    const next2 = evaluateUnlocks(next, registry)
    expect(next2).toBe(next)
  })
})

describe('VA Hospital Stage Unlocks', () => {
  it('awards automatic tier unlock when reaching VA Hospital', () => {
    const registry: UnlockRegistry = [
      {
        id: 'career-VAHospital-automatic',
        category: 'career',
        condition: (s) => s.careerStage === 'VAHospital',
      },
    ]

    const state = baseState({ careerStage: 'VAHospital' })
    const next = evaluateUnlocks(state, registry)

    expect(next.pendingUnlocks).toContain('career-VAHospital-automatic')
    expect(next.triggeredUnlockIds['career-VAHospital-automatic']).toBe(true)
  })

  it('awards JLC watch when reaching VA Hospital', () => {
    const registry: UnlockRegistry = [
      {
        id: 'career-VAHospital-jlc-award',
        category: 'career',
        condition: (s) => s.careerStage === 'VAHospital',
        onUnlock: (s) => ({
          ...s,
          ownedWatchIds: [...s.ownedWatchIds, 'jlc-master-ultra-thin-moon'],
        }),
      },
    ]

    const state = baseState({ careerStage: 'VAHospital', ownedWatchIds: ['cartier-tank-quartz'] })
    const next = evaluateUnlocks(state, registry)

    expect(next.pendingUnlocks).toContain('career-VAHospital-jlc-award')
    expect(next.ownedWatchIds).toContain('jlc-master-ultra-thin-moon')
  })

  it('does not duplicate JLC watch if already owned', () => {
    const registry: UnlockRegistry = [
      {
        id: 'career-VAHospital-jlc-award',
        category: 'career',
        condition: (s) => s.careerStage === 'VAHospital',
        onUnlock: (s) => {
          // Only add if not already owned
          if (s.ownedWatchIds.includes('jlc-master-ultra-thin-moon')) {
            return s
          }
          return {
            ...s,
            ownedWatchIds: [...s.ownedWatchIds, 'jlc-master-ultra-thin-moon'],
          }
        },
      },
    ]

    const state = baseState({
      careerStage: 'VAHospital',
      ownedWatchIds: ['cartier-tank-quartz', 'jlc-master-ultra-thin-moon'],
    })
    const next = evaluateUnlocks(state, registry)

    // Unlock ID should still be added (for the unlock notification), but watch not duplicated
    expect(next.pendingUnlocks).toContain('career-VAHospital-jlc-award')
    expect(next.ownedWatchIds.filter((id) => id === 'jlc-master-ultra-thin-moon')).toHaveLength(1)
  })
})
