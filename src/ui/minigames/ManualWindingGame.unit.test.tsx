import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ManualWindingGame } from './ManualWindingGame'
import { gradeFromHoldDuration, calculateRotation } from './manualWindingEval'
import { MANUAL_WINDING } from '../../game/constants'

describe('ManualWindingGame', () => {
  it('grades from hold duration deterministically', () => {
    // Perfect window: within 200ms of 2000ms
    expect(gradeFromHoldDuration(2000)).toBe('Perfect')
    expect(gradeFromHoldDuration(1800)).toBe('Perfect')
    expect(gradeFromHoldDuration(2200)).toBe('Perfect')

    // Good window: within 500ms of 2000ms
    expect(gradeFromHoldDuration(1500)).toBe('Good')
    expect(gradeFromHoldDuration(2500)).toBe('Good')

    // Miss: outside good window
    expect(gradeFromHoldDuration(1000)).toBe('Miss')
    expect(gradeFromHoldDuration(3000)).toBe('Miss')
  })

  it('calculates rotation based on grade', () => {
    expect(calculateRotation('Perfect')).toBe(MANUAL_WINDING.ROTATION_PER_WIND)
    expect(calculateRotation('Good')).toBe(MANUAL_WINDING.ROTATION_PER_WIND)
    expect(calculateRotation('Miss')).toBe(0)
  })

  it('renders and can finish after three winds without throwing', async () => {
    const onComplete = vi.fn()
    render(<ManualWindingGame onComplete={onComplete} />)

    expect(screen.getByText('Wind 1/3')).toBeInTheDocument()

    // First wind - simulate a quick hold and release (will be Miss)
    const holdButton = screen.getByRole('button', { name: /hold to wind/i })
    fireEvent.pointerDown(holdButton)

    // Wait a bit and release
    await waitFor(() => {
      fireEvent.pointerUp(holdButton)
    })

    // Wait for the Next button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Wind 2/3')).toBeInTheDocument()

    // Second wind
    const holdButton2 = screen.getByRole('button', { name: /hold to wind/i })
    fireEvent.pointerDown(holdButton2)
    await waitFor(() => {
      fireEvent.pointerUp(holdButton2)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Wind 3/3')).toBeInTheDocument()

    // Third wind
    const holdButton3 = screen.getByRole('button', { name: /hold to wind/i })
    fireEvent.pointerDown(holdButton3)
    await waitFor(() => {
      fireEvent.pointerUp(holdButton3)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        totalWinds: 3,
        durationMs: expect.any(Number),
      })
    )
  })

  it('displays instruction text', () => {
    render(<ManualWindingGame onComplete={vi.fn()} />)
    expect(screen.getByText('Hold to wind, release at the right time.')).toBeInTheDocument()
  })

  it('shows stats with initial values', () => {
    render(<ManualWindingGame onComplete={vi.fn()} />)
    expect(screen.getByText('Perfects: 0')).toBeInTheDocument()
    expect(screen.getByText('Winds: 0/3')).toBeInTheDocument()
  })
})
