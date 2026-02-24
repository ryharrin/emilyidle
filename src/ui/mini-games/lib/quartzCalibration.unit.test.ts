import { describe, expect, it } from 'vitest'
import {
  evaluateGrade,
  getDifficultyForWatchTier,
  getThresholds,
  QUARTZ_DIFFICULTY,
  CALIBRATION_INSTRUCTIONS,
  INITIAL_JITTER,
  MIN_JITTER,
  JITTER_DECREMENT,
  TOTAL_ROUNDS,
  ANIMATION_SPEED,
  PERFECT_STREAK_THRESHOLD,
  PERFECT_THRESHOLD,
  GOOD_THRESHOLD,
} from './quartzCalibration'

describe('quartzCalibration lib', () => {
  describe('Constants', () => {
    it('exports timing window constants for backwards compatibility', () => {
      expect(PERFECT_THRESHOLD).toBe(10)
      expect(GOOD_THRESHOLD).toBe(25)
    })

    it('exports game constants', () => {
      expect(INITIAL_JITTER).toBe(60)
      expect(MIN_JITTER).toBe(10)
      expect(JITTER_DECREMENT).toBe(10)
      expect(TOTAL_ROUNDS).toBe(5)
      expect(ANIMATION_SPEED).toBe(2.5)
      expect(PERFECT_STREAK_THRESHOLD).toBe(3)
    })
  })

  describe('evaluateGrade', () => {
    describe('with default thresholds', () => {
      it('returns Perfect for distances within PERFECT_THRESHOLD', () => {
        expect(evaluateGrade(0)).toBe('Perfect')
        expect(evaluateGrade(5)).toBe('Perfect')
        expect(evaluateGrade(10)).toBe('Perfect')
      })

      it('returns Good for distances within GOOD_THRESHOLD but beyond PERFECT_THRESHOLD', () => {
        expect(evaluateGrade(11)).toBe('Good')
        expect(evaluateGrade(20)).toBe('Good')
        expect(evaluateGrade(25)).toBe('Good')
      })

      it('returns Miss for distances beyond GOOD_THRESHOLD', () => {
        expect(evaluateGrade(26)).toBe('Miss')
        expect(evaluateGrade(50)).toBe('Miss')
        expect(evaluateGrade(100)).toBe('Miss')
      })
    })

    describe('with custom thresholds (tier-based)', () => {
      it('respects entry tier thresholds', () => {
        const { perfectWindow, goodWindow } = QUARTZ_DIFFICULTY.entry
        expect(evaluateGrade(15, perfectWindow, goodWindow)).toBe('Perfect')
        expect(evaluateGrade(25, perfectWindow, goodWindow)).toBe('Good')
        expect(evaluateGrade(35, perfectWindow, goodWindow)).toBe('Miss')
      })

      it('respects mid tier thresholds', () => {
        const { perfectWindow, goodWindow } = QUARTZ_DIFFICULTY.mid
        expect(evaluateGrade(10, perfectWindow, goodWindow)).toBe('Perfect')
        expect(evaluateGrade(20, perfectWindow, goodWindow)).toBe('Good')
        expect(evaluateGrade(30, perfectWindow, goodWindow)).toBe('Miss')
      })

      it('respects premium tier thresholds', () => {
        const { perfectWindow, goodWindow } = QUARTZ_DIFFICULTY.premium
        expect(evaluateGrade(8, perfectWindow, goodWindow)).toBe('Perfect')
        expect(evaluateGrade(15, perfectWindow, goodWindow)).toBe('Good')
        expect(evaluateGrade(25, perfectWindow, goodWindow)).toBe('Miss')
      })
    })
  })

  describe('getDifficultyForWatchTier', () => {
    it('maps quartz tier to entry difficulty', () => {
      expect(getDifficultyForWatchTier('quartz')).toBe('entry')
    })

    it('maps automatic tier to mid difficulty', () => {
      expect(getDifficultyForWatchTier('automatic')).toBe('mid')
    })

    it('maps manual tier to premium difficulty', () => {
      expect(getDifficultyForWatchTier('manual')).toBe('premium')
    })

    it('maps tourbillon tier to premium difficulty', () => {
      expect(getDifficultyForWatchTier('tourbillon')).toBe('premium')
    })

    it('defaults to entry for unknown tiers', () => {
      expect(getDifficultyForWatchTier('unknown')).toBe('entry')
      expect(getDifficultyForWatchTier('')).toBe('entry')
    })
  })

  describe('getThresholds', () => {
    it('returns entry tier thresholds', () => {
      expect(getThresholds('entry')).toEqual({
        perfectWindow: 15,
        goodWindow: 30,
      })
    })

    it('returns mid tier thresholds', () => {
      expect(getThresholds('mid')).toEqual({
        perfectWindow: 10,
        goodWindow: 25,
      })
    })

    it('returns premium tier thresholds', () => {
      expect(getThresholds('premium')).toEqual({
        perfectWindow: 8,
        goodWindow: 20,
      })
    })
  })

  describe('QUARTZ_DIFFICULTY', () => {
    it('has progressive difficulty (tighter windows at higher tiers)', () => {
      // Entry should be most generous
      expect(QUARTZ_DIFFICULTY.entry.perfectWindow).toBeGreaterThan(
        QUARTZ_DIFFICULTY.mid.perfectWindow
      )
      expect(QUARTZ_DIFFICULTY.entry.goodWindow).toBeGreaterThan(
        QUARTZ_DIFFICULTY.mid.goodWindow
      )

      // Mid should be more generous than premium
      expect(QUARTZ_DIFFICULTY.mid.perfectWindow).toBeGreaterThan(
        QUARTZ_DIFFICULTY.premium.perfectWindow
      )
      expect(QUARTZ_DIFFICULTY.mid.goodWindow).toBeGreaterThan(
        QUARTZ_DIFFICULTY.premium.goodWindow
      )
    })

    it('maintains generous windows even at premium tier (AC 3.5.5)', () => {
      // Even the tightest (premium) should still be generous
      expect(QUARTZ_DIFFICULTY.premium.perfectWindow).toBeGreaterThanOrEqual(8)
      expect(QUARTZ_DIFFICULTY.premium.goodWindow).toBeGreaterThanOrEqual(20)
    })
  })

  describe('CALIBRATION_INSTRUCTIONS', () => {
    it('has a clear goal description', () => {
      expect(CALIBRATION_INSTRUCTIONS.goal).toBeTruthy()
      expect(CALIBRATION_INSTRUCTIONS.goal.length).toBeGreaterThan(20)
    })

    it('has clear how-to-play instructions', () => {
      expect(CALIBRATION_INSTRUCTIONS.howToPlay).toBeTruthy()
      expect(CALIBRATION_INSTRUCTIONS.howToPlay.length).toBeGreaterThan(30)
    })

    it('has clear reward description', () => {
      expect(CALIBRATION_INSTRUCTIONS.reward).toBeTruthy()
      expect(CALIBRATION_INSTRUCTIONS.reward.length).toBeGreaterThan(20)
    })

    it('explains the calibration concept', () => {
      expect(CALIBRATION_INSTRUCTIONS.goal).toContain('drifting')
      expect(CALIBRATION_INSTRUCTIONS.goal).toContain('center')
    })

    it('explains the gameplay mechanics', () => {
      expect(CALIBRATION_INSTRUCTIONS.howToPlay).toContain('Calibrate')
      expect(CALIBRATION_INSTRUCTIONS.howToPlay).toContain('center')
    })

    it('explains the rewards', () => {
      expect(CALIBRATION_INSTRUCTIONS.reward).toContain('Enjoyment')
    })
  })
})
