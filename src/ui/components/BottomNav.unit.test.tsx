import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('uses singular unread message copy when badge is 1', () => {
    render(
      <BottomNav
        activeTab="home"
        onSelectTab={vi.fn()}
        tabs={[
          { id: 'home', label: 'Home' },
          { id: 'mail', label: 'Mail', badge: 1 },
        ]}
      />
    )

    expect(screen.getByRole('button', { name: 'Mail (1 unread message)' })).toBeInTheDocument()
  })

  it('uses plural unread messages copy when badge is greater than 1', () => {
    render(
      <BottomNav
        activeTab="home"
        onSelectTab={vi.fn()}
        tabs={[
          { id: 'home', label: 'Home' },
          { id: 'mail', label: 'Mail', badge: 2 },
        ]}
      />
    )

    expect(screen.getByRole('button', { name: 'Mail (2 unread messages)' })).toBeInTheDocument()
  })
})
