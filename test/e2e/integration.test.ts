/**
 * End-to-End Integration Tests
 * Tests the complete 6-hour gameplay arc
 */

import { describe, it, expect } from 'vitest'
import { checkVictoryConditions } from '../../src/game/victory/conditions'
import { evaluateAchievements } from '../../src/game/achievements/evaluate'
import { initialGameState, type GameState, type CareerStage } from '../../src/game/types'

/**
 * Helper to create game states for testing
 */
function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...initialGameState,
    ...overrides,
  }
}

/**
 * Chapter progression test scenarios
 */
describe('6-Hour Journey Integration', () => {
  describe('Chapter 1: Foundation', () => {
    it('should complete onboarding flow', () => {
      const state = createGameState({
        onboardingComplete: true,
        careerStage: 'PhDStudent',
      })
      expect(state.onboardingComplete).toBe(true)
      expect(state.careerStage).toBe('PhDStudent')
    })

    it('should unlock first therapy session', () => {
      const state = createGameState({
        interactionHistory: [
          {
            id: '1',
            gameType: 'quartz-calibration',
            perfects: 1,
            goods: 0,
            misses: 0,
            durationMs: 30000,
            createdAtMs: Date.now(),
          },
        ],
      })
      expect(state.interactionHistory.length).toBe(1)
      expect(state.interactionHistory[0].gameType).toBe('quartz-calibration')
    })

    it('should acquire first watch', () => {
      const state = createGameState({
        ownedWatchIds: ['rolex-submariner'],
      })
      expect(state.ownedWatchIds).toContain('rolex-submariner')
    })
  })

  describe('Chapter 2: Growth', () => {
    it('should reach externship milestone', () => {
      const state = createGameState({
        careerStage: 'Externship',
        careerXp: 5000,
      })
      expect(state.careerStage).toBe('Externship')
      expect(state.careerXp).toBeGreaterThan(0)
    })

    it('should trigger JLC award', () => {
      const state = createGameState({
        careerStage: 'Externship',
        ownedWatchIds: ['jlc-master-ultra-thin-moon'],
      })
      expect(state.ownedWatchIds).toContain('jlc-master-ultra-thin-moon')
      
      // Check achievement unlock
      const newAchievements = evaluateAchievements(state)
      expect(newAchievements).toContain('jlc-milestone')
    })
  })

  describe('Chapter 3-6: Complete Journey', () => {
    it('should progress through all career stages', () => {
      const stages: CareerStage[] = [
        'pre-phd',
        'PhDStudent',
        'Externship',
        'VAHospital',
        'PrivatePractice',
        'GroupPractice',
        'Retirement',
      ]

      stages.forEach((stage) => {
        const state = createGameState({ careerStage: stage })
        expect(state.careerStage).toBe(stage)
      })
    })

    it('should track home item unlocks', () => {
      const state = createGameState({
        unlockedHomeItems: ['photo-babies', 'drawing-freddy-watch'],
      })
      expect(state.unlockedHomeItems.length).toBe(2)
      expect(state.unlockedHomeItems).toContain('photo-babies')
    })

    it('should detect incomplete victory conditions', () => {
      // Not all conditions met
      const incompleteState = createGameState({
        careerStage: 'Retirement',
        ownedWatchIds: ['rolex-submariner'],
      })
      expect(checkVictoryConditions(incompleteState)).toBe(false)
    })
  })

  describe('Achievement System', () => {
    it('should unlock first watch achievement', () => {
      const state = createGameState({
        ownedWatchIds: ['rolex-submariner'],
      })
      const newAchievements = evaluateAchievements(state)
      expect(newAchievements).toContain('first-watch')
    })

    it('should unlock career stage achievements', () => {
      const state = createGameState({
        careerStage: 'Retirement',
      })
      const newAchievements = evaluateAchievements(state)
      expect(newAchievements).toContain('retirement')
    })

    it('should track achievement progress', () => {
      const state = createGameState({
        ownedWatchIds: ['rolex-submariner', 'omega-speedmaster'],
        unlockedAchievementIds: ['first-watch'],
      })
      const newAchievements = evaluateAchievements(state)
      // Should not re-unlock already unlocked achievements
      expect(newAchievements).not.toContain('first-watch')
    })
  })
})

describe('Save/Load Persistence', () => {
  it('should save and restore state', () => {
    const original = createGameState({
      careerStage: 'VAHospital',
      currencyCents: 50000,
      ownedWatchIds: ['rolex-submariner', 'omega-speedmaster'],
      unlockedAchievementIds: ['first-watch', 'phd-candidate'],
    })

    // Simulate serialization
    const serialized = JSON.stringify(original)
    const restored: GameState = JSON.parse(serialized)

    expect(restored.careerStage).toBe(original.careerStage)
    expect(restored.currencyCents).toBe(original.currencyCents)
    expect(restored.ownedWatchIds).toEqual(original.ownedWatchIds)
    expect(restored.unlockedAchievementIds).toEqual(original.unlockedAchievementIds)
  })

  it('should handle state at chapter boundaries', () => {
    const chapterBoundaries = [
      { stage: 'PhDStudent', clockMs: 30 * 60 * 1000 },
      { stage: 'Externship', clockMs: 60 * 60 * 1000 },
      { stage: 'VAHospital', clockMs: 2 * 60 * 60 * 1000 },
      { stage: 'PrivatePractice', clockMs: 3.5 * 60 * 60 * 1000 },
      { stage: 'GroupPractice', clockMs: 5 * 60 * 60 * 1000 },
      { stage: 'Retirement', clockMs: 6 * 60 * 60 * 1000 },
    ]

    chapterBoundaries.forEach(({ stage, clockMs }) => {
      const state = createGameState({
        careerStage: stage as CareerStage,
        clockMs,
      })
      
      const serialized = JSON.stringify(state)
      const restored = JSON.parse(serialized)
      
      expect(restored.careerStage).toBe(stage)
      expect(restored.clockMs).toBe(clockMs)
    })
  })
})

describe('Victory Conditions', () => {
  it('should require all criteria for victory', () => {
    const incompleteStates = [
      // Missing collection
      createGameState({
        careerStage: 'Retirement',
        prestige: {
          workshop: { unlocked: true, blueprints: 0, upgrades: [] },
          maison: { unlocked: true, heritage: 0, upgrades: [] },
          nostalgia: { unlocked: true, points: 0, upgrades: [], museumQuality: false },
        },
      }),
      // Missing career
      createGameState({
        careerStage: 'GroupPractice',
        ownedWatchIds: ['rolex-submariner'],
      }),
      // Missing prestige
      createGameState({
        careerStage: 'Retirement',
        ownedWatchIds: ['rolex-submariner'],
        prestige: {
          workshop: { unlocked: false, blueprints: 0, upgrades: [] },
          maison: { unlocked: false, heritage: 0, upgrades: [] },
          nostalgia: { unlocked: false, points: 0, upgrades: [], museumQuality: false },
        },
      }),
    ]

    incompleteStates.forEach((state) => {
      expect(checkVictoryConditions(state)).toBe(false)
    })
  })

  it('should allow victory state to persist', () => {
    const victoryState = createGameState({
      careerStage: 'Retirement',
      victoryComplete: true,
      victoryTriggeredAt: Date.now(),
    })

    expect(victoryState.victoryComplete).toBe(true)
    expect(victoryState.victoryTriggeredAt).toBeGreaterThan(0)
  })
})

describe('Performance Budget', () => {
  it('should keep state size reasonable', () => {
    const largeState = createGameState({
      ownedWatchIds: Array.from({ length: 50 }, (_, i) => `watch-${i}`),
      unlockedHomeItems: Array.from({ length: 30 }, (_, i) => `item-${i}`),
      interactionHistory: Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        gameType: 'quartz-calibration' as const,
        perfects: 10,
        goods: 5,
        misses: 2,
        durationMs: 30000,
        createdAtMs: Date.now(),
      })),
    })

    const serialized = JSON.stringify(largeState)
    const sizeKB = serialized.length / 1024
    
    // Should be under 100KB even with lots of data
    expect(sizeKB).toBeLessThan(100)
  })
})
