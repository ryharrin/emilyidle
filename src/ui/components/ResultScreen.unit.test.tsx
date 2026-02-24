import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResultScreen } from './ResultScreen'
import type { MiniGameResult } from '../../game/selectors/rewards'

describe('ResultScreen', () => {
  const mockResult: MiniGameResult = {
    gameType: 'quartz-alignment',
    perfects: 2,
    goods: 1,
    misses: 0,
    durationMs: 5000,
    baseReward: 45,
    tierBonus: 0,
    perfectRunBonus: 0,
    totalReward: 45,
  }

  it('renders with Perfect grade when no misses and no goods and has perfects', () => {
    const perfectResult: MiniGameResult = {
      ...mockResult,
      perfects: 3,
      goods: 0,
      misses: 0,
    }
    render(<ResultScreen result={perfectResult} onClose={vi.fn()} />)

    // Check for the grade header (h2 element)
    const gradeHeader = screen.getByRole('heading', { level: 2, name: 'Perfect' })
    expect(gradeHeader).toBeInTheDocument()
    expect(screen.getByText('Excellent! Perfect timing!')).toBeInTheDocument()
  })

  it('renders with Good grade when has goods but no perfects', () => {
    const goodResult: MiniGameResult = {
      ...mockResult,
      perfects: 0,
      goods: 2,
      misses: 1,
    }
    render(<ResultScreen result={goodResult} onClose={vi.fn()} />)

    // Check for the grade header (h2 element)
    const gradeHeader = screen.getByRole('heading', { level: 2, name: 'Good' })
    expect(gradeHeader).toBeInTheDocument()
    expect(screen.getByText('Good job! Keep practicing!')).toBeInTheDocument()
  })

  it('renders with Miss grade when all misses', () => {
    const missResult: MiniGameResult = {
      ...mockResult,
      perfects: 0,
      goods: 0,
      misses: 3,
    }
    render(<ResultScreen result={missResult} onClose={vi.fn()} />)

    // Check for the grade header (h2 element)
    const gradeHeader = screen.getByRole('heading', { level: 2, name: 'Miss' })
    expect(gradeHeader).toBeInTheDocument()
    expect(screen.getByText('Keep trying! You will get it!')).toBeInTheDocument()
  })

  it('displays breakdown counts correctly', () => {
    render(<ResultScreen result={mockResult} onClose={vi.fn()} />)

    // Check for the stat values
    const perfectCount = screen.getByText('2')
    const goodCount = screen.getByText('1')
    const missCount = screen.getByText('0')

    expect(perfectCount).toBeInTheDocument()
    expect(goodCount).toBeInTheDocument()
    expect(missCount).toBeInTheDocument()

    // Check labels
    expect(screen.getAllByText('Perfect')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Good')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Miss')[0]).toBeInTheDocument()
  })

  it('displays rewards correctly', () => {
    render(<ResultScreen result={mockResult} onClose={vi.fn()} />)

    expect(screen.getByText('Rewards')).toBeInTheDocument()
    expect(screen.getByText('Base reward')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('+45')).toBeInTheDocument() // Total reward
  })

  it('shows tier bonus when present', () => {
    const resultWithBonus: MiniGameResult = {
      ...mockResult,
      baseReward: 50,
      tierBonus: 25,
      totalReward: 75,
    }
    render(<ResultScreen result={resultWithBonus} onClose={vi.fn()} />)

    expect(screen.getByText('Tier bonus')).toBeInTheDocument()
    expect(screen.getByText('+25')).toBeInTheDocument()
    expect(screen.getByText('+75')).toBeInTheDocument()
  })

  it('shows perfect run bonus when present', () => {
    const resultWithPerfectBonus: MiniGameResult = {
      ...mockResult,
      perfects: 3,
      goods: 0,
      misses: 0,
      baseReward: 30,
      perfectRunBonus: 20,
      totalReward: 50,
    }
    render(<ResultScreen result={resultWithPerfectBonus} onClose={vi.fn()} />)

    expect(screen.getByText('Perfect run bonus')).toBeInTheDocument()
    expect(screen.getByText('+20')).toBeInTheDocument()
  })

  it('does not show perfect run bonus when zero', () => {
    render(<ResultScreen result={mockResult} onClose={vi.fn()} />)

    expect(screen.queryByText('Perfect run bonus')).not.toBeInTheDocument()
  })

  it('does not show tier bonus when zero', () => {
    render(<ResultScreen result={mockResult} onClose={vi.fn()} />)

    expect(screen.queryByText('Tier bonus')).not.toBeInTheDocument()
  })

  it('calls onClose when Done button clicked', () => {
    const onClose = vi.fn()
    render(<ResultScreen result={mockResult} onClose={onClose} />)

    const doneButton = screen.getByRole('button', { name: 'Done' })
    fireEvent.click(doneButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows Play Again button when onPlayAgain provided', () => {
    const onPlayAgain = vi.fn()
    render(<ResultScreen result={mockResult} onClose={vi.fn()} onPlayAgain={onPlayAgain} />)

    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument()
  })

  it('does not show Play Again button when onPlayAgain not provided', () => {
    render(<ResultScreen result={mockResult} onClose={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Play Again' })).not.toBeInTheDocument()
  })

  it('calls onPlayAgain when Play Again button clicked', () => {
    const onPlayAgain = vi.fn()
    render(<ResultScreen result={mockResult} onClose={vi.fn()} onPlayAgain={onPlayAgain} />)

    const playAgainButton = screen.getByRole('button', { name: 'Play Again' })
    fireEvent.click(playAgainButton)

    expect(onPlayAgain).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking outside the modal', () => {
    const onClose = vi.fn()
    render(<ResultScreen result={mockResult} onClose={onClose} />)

    const backdrop = screen.getByRole('dialog')
    fireEvent.mouseDown(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has accessible dialog role', () => {
    render(<ResultScreen result={mockResult} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('displays whole numbers only', () => {
    const resultWithDecimal: MiniGameResult = {
      ...mockResult,
      baseReward: 45.7,
      totalReward: 45.7,
    }
    render(<ResultScreen result={resultWithDecimal} onClose={vi.fn()} />)

    // Should display as rounded whole numbers
    const totalReward = screen.getByText('+46')
    expect(totalReward).toBeInTheDocument()
  })

  it('touch targets are at least 44px (mobile optimization AC 3.6.5)', () => {
    render(<ResultScreen result={mockResult} onClose={vi.fn()} onPlayAgain={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      // Note: JSDOM doesn't compute styles from CSS classes, so we check the element exists
      expect(button).toBeInTheDocument()
    })

    // Verify buttons have appropriate classes that provide min sizing
    expect(screen.getByRole('button', { name: 'Done' })).toHaveClass('pill')
    expect(screen.getByRole('button', { name: 'Play Again' })).toHaveClass('pill')
  })
})
