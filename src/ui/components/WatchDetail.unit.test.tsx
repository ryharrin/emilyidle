import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WatchDetail } from './WatchDetail'
import type { Watch } from '../../game/data/watches'

const mockQuartzWatch: Watch = {
  id: 'quartz-watch-1',
  name: 'Quartz Test Watch',
  priceCents: 100_00,
  tier: 'quartz',
  imageUrl: '/test/quartz.jpg',
  enjoymentRate: 0.06,
  isFavorite: false,
}

const mockFavoriteWatch: Watch = {
  id: 'favorite-watch-1',
  name: 'Favorite Watch',
  priceCents: 250_00,
  tier: 'automatic',
  imageUrl: '/test/auto.jpg',
  enjoymentRate: 3.0,
  isFavorite: true,
}

describe('WatchDetail', () => {
  it('renders watch name in modal title', () => {
    render(<WatchDetail watch={mockQuartzWatch} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toHaveTextContent('Quartz Test Watch')
  })

  it('renders watch image with correct alt text', () => {
    render(<WatchDetail watch={mockQuartzWatch} onClose={vi.fn()} />)
    const img = screen.getByAltText('Quartz Test Watch')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test/quartz.jpg')
  })

  it('renders tier badge with proper display name', () => {
    render(<WatchDetail watch={mockQuartzWatch} onClose={vi.fn()} />)
    expect(screen.getByText('Tier: Quartz')).toBeInTheDocument()
  })

  it('displays passive enjoyment as whole numbers only', () => {
    render(<WatchDetail watch={mockQuartzWatch} onClose={vi.fn()} />)
    // 0.06 * 1.0 = 0.06, floor = 0
    expect(screen.getByText(/Passive: 0 enjoyment\/sec/i)).toBeInTheDocument()
  })

  it('calculates favorite bonus for passive enjoyment', () => {
    render(<WatchDetail watch={mockFavoriteWatch} onClose={vi.fn()} />)
    // 3.0 * 1.25 = 3.75, floor = 3
    expect(screen.getByText(/Passive: 3 enjoyment\/sec/i)).toBeInTheDocument()
  })

  it('shows favorite badge for favorite watches', () => {
    render(<WatchDetail watch={mockFavoriteWatch} onClose={vi.fn()} />)
    expect(screen.getByText(/Generates 25% more passive enjoyment/i)).toBeInTheDocument()
  })

  it('does not show favorite badge for non-favorite watches', () => {
    render(<WatchDetail watch={mockQuartzWatch} onClose={vi.fn()} />)
    expect(screen.queryByText(/Favorite Watch/i)).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<WatchDetail watch={mockQuartzWatch} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders Calibrate Quartz button for quartz watches', () => {
    const onInteractQuartz = vi.fn()
    render(
      <WatchDetail
        watch={mockQuartzWatch}
        onClose={vi.fn()}
        onInteractQuartz={onInteractQuartz}
      />
    )
    expect(screen.getByRole('button', { name: /calibrate quartz/i })).toBeInTheDocument()
  })

  it('does not render Calibrate Quartz button for non-quartz watches', () => {
    const autoWatch: Watch = { ...mockQuartzWatch, tier: 'automatic' }
    render(<WatchDetail watch={autoWatch} onClose={vi.fn()} onInteractQuartz={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /calibrate quartz/i })).not.toBeInTheDocument()
  })

  it('calls onInteractQuartz when Calibrate Quartz button is clicked', () => {
    const onInteractQuartz = vi.fn()
    render(
      <WatchDetail
        watch={mockQuartzWatch}
        onClose={vi.fn()}
        onInteractQuartz={onInteractQuartz}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /calibrate quartz/i }))
    expect(onInteractQuartz).toHaveBeenCalledTimes(1)
  })

  it('renders different tier display names', () => {
    const tiers: Array<{ tier: Watch['tier']; display: string }> = [
      { tier: 'quartz', display: 'Tier: Quartz' },
      { tier: 'automatic', display: 'Tier: Automatic' },
      { tier: 'manual', display: 'Tier: Manual' },
      { tier: 'tourbillon', display: 'Tier: Tourbillon' },
    ]

    for (const { tier, display } of tiers) {
      const { unmount } = render(
        <WatchDetail watch={{ ...mockQuartzWatch, tier }} onClose={vi.fn()} />
      )
      expect(screen.getByText(display)).toBeInTheDocument()
      unmount()
    }
  })

  it('renders interaction type and reward framing', () => {
    render(<WatchDetail watch={mockQuartzWatch} onClose={vi.fn()} />)
    expect(screen.getByText(/Interaction:/i)).toBeInTheDocument()
    expect(screen.getByText(/Reward:/i)).toBeInTheDocument()
  })
})
