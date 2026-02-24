import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  AutomaticMovementGame,
  type AutomaticMovementResult,
} from './AutomaticMovementGame'
import { AUTOMATIC_MOVEMENT, MS_PER_BEAT } from '../../game/constants'

describe('AutomaticMovementGame', () => {
  it('renders with initial state', () => {
    const onComplete = vi.fn()
    render(<AutomaticMovementGame onComplete={onComplete} />)

    expect(screen.getByText('Power Reserve')).toBeInTheDocument()
    expect(screen.getByText('Tap in rhythm with the beat to spin the rotor.')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tap to Wind/i })).toBeInTheDocument()
  })

  it('increases power on tap', () => {
    const onComplete = vi.fn()
    render(<AutomaticMovementGame onComplete={onComplete} />)

    // Initial state
    expect(screen.getByText('0%')).toBeInTheDocument()

    // Tap once
    fireEvent.click(screen.getByRole('button', { name: /Tap to Wind/i }))

    // Power should have increased (at least Miss: +3)
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })

  it('calls onComplete when Finish is clicked', () => {
    const onComplete = vi.fn()
    render(<AutomaticMovementGame onComplete={onComplete} />)

    // Tap a few times first
    fireEvent.click(screen.getByRole('button', { name: /Tap to Wind/i }))
    fireEvent.click(screen.getByRole('button', { name: /Tap to Wind/i }))

    // Click finish
    fireEvent.click(screen.getByRole('button', { name: /Finish/i }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    const result = onComplete.mock.calls[0][0] as AutomaticMovementResult
    expect(result).toHaveProperty('perfects')
    expect(result).toHaveProperty('powerLevel')
    expect(result).toHaveProperty('durationMs')
    expect(result.powerLevel).toBeGreaterThan(0)
  })

  it('tracks perfect count', () => {
    const onComplete = vi.fn()
    render(<AutomaticMovementGame onComplete={onComplete} />)

    // Initial perfect count should be 0
    expect(screen.getByText(/Perfects: 0/)).toBeInTheDocument()

    // Tap multiple times
    fireEvent.click(screen.getByRole('button', { name: /Tap to Wind/i }))

    // Perfect count is shown
    expect(screen.getByText(/Perfects:/)).toBeInTheDocument()
  })

  it('shows grade feedback on tap', () => {
    const onComplete = vi.fn()
    render(<AutomaticMovementGame onComplete={onComplete} />)

    // No grade badge initially (grade badge appears alone, not as part of "Perfects:")
    const gradeElements = screen.queryAllByText(/^(Perfect|Good|Miss)$/)
    expect(gradeElements).toHaveLength(0)

    // Tap once
    fireEvent.click(screen.getByRole('button', { name: /Tap to Wind/i }))

    // Some grade badge should appear (exact match)
    const gradeElement = screen.queryByText(/^(Perfect|Good|Miss)$/)
    expect(gradeElement).toBeInTheDocument()
  })

  it('updates instruction after first tap', () => {
    const onComplete = vi.fn()
    render(<AutomaticMovementGame onComplete={onComplete} />)

    // Initial instruction
    expect(screen.getByText('Tap in rhythm with the beat to spin the rotor.')).toBeInTheDocument()

    // Tap once
    fireEvent.click(screen.getByRole('button', { name: /Tap to Wind/i }))

    // Instruction should have changed
    expect(screen.queryByText('Tap in rhythm with the beat to spin the rotor.')).not.toBeInTheDocument()
  })
})

describe('AUTOMATIC_MOVEMENT constants', () => {
  it('has correct BPM value', () => {
    expect(AUTOMATIC_MOVEMENT.BPM).toBe(80)
  })

  it('has correct perfect window', () => {
    expect(AUTOMATIC_MOVEMENT.PERFECT_WINDOW_MS).toBe(100)
  })

  it('has correct power max', () => {
    expect(AUTOMATIC_MOVEMENT.POWER_MAX).toBe(100)
  })

  it('has correct rotor spin degrees', () => {
    expect(AUTOMATIC_MOVEMENT.ROTOR_SPIN_DEGREES).toBe(360)
  })

  it('calculates correct MS_PER_BEAT', () => {
    // 60,000ms / 80 BPM = 750ms per beat
    expect(MS_PER_BEAT).toBe(750)
  })
})
