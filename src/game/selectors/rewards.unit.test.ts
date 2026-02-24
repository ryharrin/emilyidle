import { describe, expect, it } from 'vitest'
import {
  calculateMiniGameRewards,
  formatReward,
  getTierMultiplier,
} from './rewards'
import type { WatchTier } from '../data/watches'

describe('getTierMultiplier', () => {
  it('returns correct multiplier for each tier', () => {
    expect(getTierMultiplier('quartz')).toBe(1)
    expect(getTierMultiplier('automatic')).toBe(1.5)
    expect(getTierMultiplier('manual')).toBe(2)
    expect(getTierMultiplier('tourbillon')).toBe(3)
  })

  it('returns 1 for unknown tier', () => {
    expect(getTierMultiplier('unknown' as WatchTier)).toBe(1)
  })
})

describe('calculateMiniGameRewards', () => {
  it('calculates base rewards for quartz tier', () => {
    const result = calculateMiniGameRewards({
      gameType: 'quartz-alignment',
      perfects: 2,
      goods: 1,
      misses: 0,
      durationMs: 5000,
      tier: 'quartz',
    })

    expect(result.baseReward).toBe(45) // 2*10 + 1*5 + 20 bonus
    expect(result.tierBonus).toBe(0) // No bonus for quartz tier (multiplier 1)
    expect(result.totalReward).toBe(45)
    expect(result.gameType).toBe('quartz-alignment')
    expect(result.perfects).toBe(2)
    expect(result.goods).toBe(1)
    expect(result.misses).toBe(0)
  })

  it('applies tier bonus for automatic tier', () => {
    const result = calculateMiniGameRewards({
      gameType: 'quartz-alignment',
      perfects: 2,
      goods: 1,
      misses: 0,
      durationMs: 5000,
      tier: 'automatic',
    })

    expect(result.baseReward).toBe(45)
    expect(result.tierBonus).toBe(23) // 45 * 0.5 rounded
    expect(result.totalReward).toBe(68) // 45 * 1.5 rounded
  })

  it('applies higher tier bonus for manual tier', () => {
    const result = calculateMiniGameRewards({
      gameType: 'quartz-alignment',
      perfects: 3,
      goods: 0,
      misses: 0,
      durationMs: 5000,
      tier: 'manual',
    })

    expect(result.baseReward).toBe(50) // 3*10 + 20 bonus
    expect(result.tierBonus).toBe(50) // 50 * 1.0
    expect(result.totalReward).toBe(100) // 50 * 2.0
  })

  it('applies highest tier bonus for tourbillon tier', () => {
    const result = calculateMiniGameRewards({
      gameType: 'quartz-alignment',
      perfects: 1,
      goods: 0,
      misses: 2,
      durationMs: 5000,
      tier: 'tourbillon',
    })

    expect(result.baseReward).toBe(10) // 1*10 (no perfect run bonus due to misses)
    expect(result.tierBonus).toBe(20) // 10 * 2.0
    expect(result.totalReward).toBe(30) // 10 * 3.0
  })

  it('does not apply perfect run bonus when there are misses', () => {
    const result = calculateMiniGameRewards({
      gameType: 'quartz-alignment',
      perfects: 3,
      goods: 0,
      misses: 1,
      durationMs: 5000,
      tier: 'quartz',
    })

    expect(result.baseReward).toBe(30) // 3*10 (no bonus due to misses)
    expect(result.totalReward).toBe(30)
  })

  it('handles all misses', () => {
    const result = calculateMiniGameRewards({
      gameType: 'quartz-alignment',
      perfects: 0,
      goods: 0,
      misses: 3,
      durationMs: 5000,
      tier: 'quartz',
    })

    expect(result.baseReward).toBe(0)
    expect(result.tierBonus).toBe(0)
    expect(result.totalReward).toBe(0)
  })

  it('returns whole numbers only', () => {
    const result = calculateMiniGameRewards({
      gameType: 'quartz-alignment',
      perfects: 1,
      goods: 1,
      misses: 0,
      durationMs: 3333,
      tier: 'automatic',
    })

    // Base: 15 (10 + 5), with automatic tier (1.5x)
    // Total: 22.5 -> rounded to 23
    expect(Number.isInteger(result.totalReward)).toBe(true)
    expect(Number.isInteger(result.tierBonus)).toBe(true)
    expect(Number.isInteger(result.baseReward)).toBe(true)
  })
})

describe('formatReward', () => {
  it('returns whole number as string', () => {
    expect(formatReward(42)).toBe('42')
    expect(formatReward(0)).toBe('0')
    expect(formatReward(999)).toBe('999')
  })

  it('rounds decimals to whole numbers', () => {
    expect(formatReward(42.7)).toBe('43')
    expect(formatReward(42.2)).toBe('42')
    expect(formatReward(42.5)).toBe('43')
  })

  it('handles negative numbers', () => {
    expect(formatReward(-5)).toBe('-5')
    expect(formatReward(-5.7)).toBe('-6')
  })
})
