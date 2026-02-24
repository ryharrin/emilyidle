import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WatchCard } from './WatchCard'
import type { Watch } from '../../game/data/watches'

const mockWatch: Watch = {
  id: 'test-watch-1',
  name: 'Test Watch',
  priceCents: 100_00,
  tier: 'quartz',
  imageUrl: '/test/image.jpg',
  enjoymentRate: 0.05,
  isFavorite: false,
}

describe('WatchCard', () => {
  it('renders watch name', () => {
    render(<WatchCard watch={mockWatch} onClick={vi.fn()} />)
    expect(screen.getByText('Test Watch')).toBeInTheDocument()
  })

  it('renders watch tier', () => {
    render(<WatchCard watch={mockWatch} onClick={vi.fn()} />)
    expect(screen.getByText(/Tier: quartz/i)).toBeInTheDocument()
  })

  it('renders watch image with correct alt text', () => {
    render(<WatchCard watch={mockWatch} onClick={vi.fn()} />)
    const img = screen.getByAltText('Test Watch')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test/image.jpg')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<WatchCard watch={mockWatch} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders with aria-label for accessibility', () => {
    render(<WatchCard watch={mockWatch} onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Test Watch')
  })
})
