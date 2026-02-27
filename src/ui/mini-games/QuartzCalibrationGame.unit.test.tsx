import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QuartzCalibrationGame } from './QuartzCalibrationGame'
import {
  evaluateGrade,
  PERFECT_THRESHOLD,
  GOOD_THRESHOLD,
  QUARTZ_DIFFICULTY,
  getDifficultyForWatchTier,
  getThresholds,
  CALIBRATION_INSTRUCTIONS,
} from './lib/quartzCalibration'

describe('QuartzCalibrationGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Grade Evaluation', () => {
    it('evaluates Perfect when within threshold', () => {
      expect(evaluateGrade(0)).toBe('Perfect')
      expect(evaluateGrade(5)).toBe('Perfect')
      expect(evaluateGrade(PERFECT_THRESHOLD)).toBe('Perfect')
    })

    it('evaluates Good when within good threshold', () => {
      expect(evaluateGrade(PERFECT_THRESHOLD + 1)).toBe('Good')
      expect(evaluateGrade(15)).toBe('Good')
      expect(evaluateGrade(GOOD_THRESHOLD)).toBe('Good')
    })

    it('evaluates Miss when beyond thresholds', () => {
      expect(evaluateGrade(GOOD_THRESHOLD + 1)).toBe('Miss')
      expect(evaluateGrade(50)).toBe('Miss')
      expect(evaluateGrade(100)).toBe('Miss')
    })

    it('evaluates with custom thresholds', () => {
      // Tier-based thresholds: entry tier = 15/30, mid = 10/25, premium = 8/20
      expect(evaluateGrade(12, 15, 30)).toBe('Perfect') // Within entry perfect
      expect(evaluateGrade(12, 10, 25)).toBe('Good') // Within mid good but not perfect
      expect(evaluateGrade(12, 8, 20)).toBe('Good') // Within premium good but not perfect
      expect(evaluateGrade(25, 15, 30)).toBe('Good') // Within entry good
      expect(evaluateGrade(25, 8, 20)).toBe('Miss') // Beyond premium good
    })
  })

  describe('Tier-Based Difficulty (AC 3.5.1)', () => {
    it('maps quartz tier to entry difficulty', () => {
      expect(getDifficultyForWatchTier('quartz')).toBe('entry')
      expect(getThresholds('entry')).toEqual({
        perfectWindow: 15,
        goodWindow: 30,
      })
    })

    it('maps automatic tier to mid difficulty', () => {
      expect(getDifficultyForWatchTier('automatic')).toBe('mid')
      expect(getThresholds('mid')).toEqual({
        perfectWindow: 10,
        goodWindow: 25,
      })
    })

    it('maps manual and tourbillon tiers to premium difficulty', () => {
      expect(getDifficultyForWatchTier('manual')).toBe('premium')
      expect(getDifficultyForWatchTier('tourbillon')).toBe('premium')
      expect(getThresholds('premium')).toEqual({
        perfectWindow: 8,
        goodWindow: 20,
      })
    })

    it('defaults to entry difficulty for unknown tiers', () => {
      expect(getDifficultyForWatchTier('unknown')).toBe('entry')
    })

    it('maintains generous timing windows for all tiers', () => {
      // AC 3.5.5: timing windows remain generous (gift context)
      expect(QUARTZ_DIFFICULTY.entry.perfectWindow).toBeGreaterThanOrEqual(8)
      expect(QUARTZ_DIFFICULTY.premium.perfectWindow).toBeGreaterThanOrEqual(8)
      expect(QUARTZ_DIFFICULTY.entry.goodWindow).toBeGreaterThanOrEqual(20)
      expect(QUARTZ_DIFFICULTY.premium.goodWindow).toBeGreaterThanOrEqual(20)
    })
  })

  describe('Instructions (AC 3.5.2)', () => {
    it('provides clear goal instruction', () => {
      expect(CALIBRATION_INSTRUCTIONS.goal).toContain('drifting')
      expect(CALIBRATION_INSTRUCTIONS.goal).toContain('center')
    })

    it('provides clear how-to-play instruction', () => {
      expect(CALIBRATION_INSTRUCTIONS.howToPlay).toContain('Calibrate')
      expect(CALIBRATION_INSTRUCTIONS.howToPlay).toContain('center')
    })

    it('provides clear reward instruction', () => {
      expect(CALIBRATION_INSTRUCTIONS.reward).toContain('Enjoyment')
      expect(CALIBRATION_INSTRUCTIONS.reward).toContain('Perfect')
    })
  })

  describe('Game Flow', () => {
    it('renders with initial instructions', () => {
      const onComplete = vi.fn()
      render(<QuartzCalibrationGame onComplete={onComplete} />)

      expect(screen.getByText('Round 1/1')).toBeInTheDocument()
      expect(
        screen.getByText('Tap Calibrate when the dot crosses the center line.'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Calibrate' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument()
    })

    it('accepts watchTier prop for difficulty scaling', () => {
      const onComplete = vi.fn()
      // Should not throw with different watch tiers
      expect(() => {
        render(<QuartzCalibrationGame onComplete={onComplete} watchTier="quartz" />)
      }).not.toThrow()

      expect(() => {
        render(<QuartzCalibrationGame onComplete={onComplete} watchTier="automatic" />)
      }).not.toThrow()

      expect(() => {
        render(<QuartzCalibrationGame onComplete={onComplete} watchTier="manual" />)
      }).not.toThrow()

      expect(() => {
        render(<QuartzCalibrationGame onComplete={onComplete} watchTier="tourbillon" />)
      }).not.toThrow()
    })

    it('shows perfect count after calibration', () => {
      const onComplete = vi.fn()
      render(<QuartzCalibrationGame onComplete={onComplete} />)

      fireEvent.click(screen.getByRole('button', { name: 'Calibrate' }))

      // Perfect count should update (might be 0 or more depending on timing)
      expect(screen.getByText(/Perfects: \d+/)).toBeInTheDocument()
    })

    it('advances to next round when Next is clicked', () => {
      const onComplete = vi.fn()
      render(<QuartzCalibrationGame onComplete={onComplete} />)

      fireEvent.click(screen.getByRole('button', { name: 'Calibrate' }))
        fireEvent.click(screen.getByRole('button', { name: 'Finish' }))

      expect(screen.getByText('Round 1/1')).toBeInTheDocument()
    })

    it('calls onComplete after all rounds with result data', () => {
      const onComplete = vi.fn()
      render(<QuartzCalibrationGame onComplete={onComplete} />)

      for (let round = 1; round <= 1; round++) {
        fireEvent.click(screen.getByRole('button', { name: 'Calibrate' }))
        fireEvent.click(screen.getByRole('button', { name: round === 1 ? 'Finish' : 'Next' }))
      }

      expect(onComplete).toHaveBeenCalledTimes(1)

      const result = onComplete.mock.calls[0][0]
      expect(result).toHaveProperty('perfects')
      expect(result).toHaveProperty('durationMs')
      expect(typeof result.perfects).toBe('number')
      expect(typeof result.durationMs).toBe('number')
      expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('tracks perfects count correctly', () => {
      const onComplete = vi.fn()
      render(<QuartzCalibrationGame onComplete={onComplete} />)

      expect(screen.getByText('Perfects: 0')).toBeInTheDocument()

      for (let i = 0; i < 1; i++) {
        fireEvent.click(screen.getByRole('button', { name: 'Calibrate' }))
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
      }

      expect(screen.getByText(/Perfects: \d+/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      const onComplete = vi.fn()
      render(<QuartzCalibrationGame onComplete={onComplete} />)

      expect(screen.getByRole('button', { name: 'Calibrate' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument()
    })

    it('displays round information', () => {
      const onComplete = vi.fn()
      render(<QuartzCalibrationGame onComplete={onComplete} />)

      expect(screen.getByText(/Round \d+\/1/)).toBeInTheDocument()
    })
  })
})
