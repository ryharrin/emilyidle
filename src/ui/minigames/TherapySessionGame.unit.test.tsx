import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TherapySessionGame } from './TherapySessionGame'

describe('TherapySessionGame', () => {
  it('renders patient vignette text', () => {
    const onComplete = vi.fn()
    render(<TherapySessionGame stage="PhDStudent" onComplete={onComplete} />)

    // Should show patient text from the vignette
    expect(screen.getByText(/Exchange 1 of/)).toBeInTheDocument()
  })

  it('shows 3 response options', () => {
    const onComplete = vi.fn()
    render(<TherapySessionGame stage="PhDStudent" onComplete={onComplete} />)

    // Should show 3 response buttons (all are therapist responses)
    const buttons = screen.getAllByRole('button')
    // There should be at least 3 response option buttons plus possibly cancel
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('advances to next exchange when response is clicked', async () => {
    const onComplete = vi.fn()
    render(<TherapySessionGame stage="PhDStudent" onComplete={onComplete} />)

    // Click one of the response options
    const responseButtons = screen.getAllByRole('button')
    const firstResponse = responseButtons[0] // First response button
    fireEvent.click(firstResponse)

    // Should advance to exchange 2
    expect(screen.getByText(/Exchange 2 of/)).toBeInTheDocument()
  })

  it('completes session on final exchange', async () => {
    const onComplete = vi.fn()
    render(<TherapySessionGame stage="PhDStudent" onComplete={onComplete} />)

    // Advance through all exchanges (PhDStudent vignettes have 4 exchanges)
    for (let i = 0; i < 3; i++) {
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
    }

    // On 4th click should complete
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    // Should call onComplete with rewards
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        cashCents: expect.any(Number),
        xp: expect.any(Number),
        vignetteId: expect.any(String),
        durationMs: expect.any(Number),
      })
    )
  })

  it('shows completion state with rewards', async () => {
    const onComplete = vi.fn()
    render(<TherapySessionGame stage="PhDStudent" onComplete={onComplete} />)

    // Complete all exchanges
    for (let i = 0; i < 4; i++) {
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
    }

    // Should show session complete
    expect(screen.getByText('Session Complete')).toBeInTheDocument()
  })
})
