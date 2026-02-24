import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QuartzAlignmentGame } from './QuartzAlignmentGame'
import { gradeFromError } from './quartzAlignmentEval'

describe('QuartzAlignmentGame', () => {
  it('grades from error thresholds deterministically', () => {
    expect(gradeFromError(0)).toBe('Perfect')
    expect(gradeFromError(0.02)).toBe('Perfect')
    expect(gradeFromError(0.05)).toBe('Good')
    expect(gradeFromError(0.2)).toBe('Miss')
  })

  it('renders and can finish after three attempts without throwing', async () => {
    const onComplete = vi.fn()
    render(<QuartzAlignmentGame onComplete={onComplete} />)

    expect(screen.getByText('Attempt 1/3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Attempt 2/3')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Attempt 3/3')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
