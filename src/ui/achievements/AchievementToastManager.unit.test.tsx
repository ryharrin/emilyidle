import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AchievementToastManager } from './AchievementToastManager'

vi.mock('../../audio/audioService', () => ({
  playSfx: vi.fn(),
}))

const mockState = {
  unlockedAchievementIds: ['secret-first-click'],
}

vi.mock('../hooks/useGameState', () => ({
  useGameState: () => mockState,
}))

describe('AchievementToastManager', () => {
  it('renders toasts as non-interactive overlays', () => {
    render(<AchievementToastManager />)

    const container = document.querySelector('.achievement-toast-container') as HTMLElement
    expect(container).toBeInTheDocument()
    expect(container.style.pointerEvents).toBe('none')

    const toastInteractiveWrapper = container.querySelector('div[style*="pointer-events: none"]') as HTMLElement
    expect(toastInteractiveWrapper).toBeInTheDocument()
    expect(toastInteractiveWrapper.style.pointerEvents).toBe('none')

    const toast = container.querySelector('.achievement-toast') as HTMLElement
    expect(toast).toBeInTheDocument()
    expect(window.getComputedStyle(toast).pointerEvents).toBe('none')
    expect(screen.getByText(/secret achievement unlocked!/i)).toBeInTheDocument()
  })

  it('clears active toasts when unlocked achievement list is reset', () => {
    const { rerender } = render(<AchievementToastManager />)
    expect(document.querySelector('.achievement-toast')).toBeInTheDocument()

    mockState.unlockedAchievementIds = []
    rerender(<AchievementToastManager />)

    expect(document.querySelector('.achievement-toast')).not.toBeInTheDocument()
  })
})
