import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MiniGameShell, type InteractionResult } from './MiniGameShell'

function MockGame({ onComplete }: { onComplete: (result: InteractionResult) => void }) {
  return (
    <button type="button" onClick={() => onComplete({ perfects: 2, goods: 1, misses: 0, durationMs: 5000 })}>
      Complete Game
    </button>
  )
}

describe('MiniGameShell', () => {
  const mockDispatch = vi.fn()
  const mockOnClose = vi.fn()
  const mockOnComplete = vi.fn()

  const defaultProps = {
    title: 'Test Mini-Game',
    gameType: 'quartz-calibration' as const,
    tier: 'quartz' as const,
    instructions: {
      goal: 'Test goal',
      howToPlay: 'Test how to play',
      reward: 'Test reward',
    },
    renderGame: ({ onComplete }: { onComplete: (result: InteractionResult) => void }) => (
      <MockGame onComplete={onComplete} />
    ),
    onClose: mockOnClose,
    dispatch: mockDispatch,
    onComplete: mockOnComplete,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with title and instructions', () => {
    render(<MiniGameShell {...defaultProps} />)

    expect(screen.getByText('Test Mini-Game')).toBeInTheDocument()
    expect(screen.getByText('Goal')).toBeInTheDocument()
    expect(screen.getByText('Test goal')).toBeInTheDocument()
    expect(screen.getByText('How to Play')).toBeInTheDocument()
    expect(screen.getByText('Test how to play')).toBeInTheDocument()
    expect(screen.getByText('Reward')).toBeInTheDocument()
    expect(screen.getByText('Test reward')).toBeInTheDocument()
  })

  it('dispatches RECORD_INTERACTION when game completes', async () => {
    render(<MiniGameShell {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Complete Game' }))

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RECORD_INTERACTION',
        })
      )
    })
  })

  it('dispatches GAIN_ENJOYMENT when game completes', async () => {
    render(<MiniGameShell {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Complete Game' }))

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'GAIN_ENJOYMENT',
        })
      )
    })
  })

  it('calls onComplete callback with result', async () => {
    render(<MiniGameShell {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Complete Game' }))

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({ perfects: 2, goods: 1, misses: 0, durationMs: 5000 })
      )
    })
  })

  it('shows result screen when game completes', async () => {
    render(<MiniGameShell {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Complete Game' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Mini-game results' })).toBeInTheDocument()
    })
  })

  it('closes modal when close button is clicked', () => {
    render(<MiniGameShell {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when result screen Done button clicked', async () => {
    render(<MiniGameShell {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Complete Game' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
