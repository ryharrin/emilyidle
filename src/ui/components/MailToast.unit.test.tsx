import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MailToast } from './MailToast'

describe('MailToast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays package sender name', () => {
    render(
      <MailToast
        toast={{
          id: 'toast-1',
          kind: 'package',
          title: 'Package Arrived!',
          sender: 'Ethan',
          message: 'Your watch is here.',
          createdAtMs: 1,
        }}
        onDismiss={vi.fn()}
      />,
    )

    expect(screen.getByText('From: Ethan')).toBeInTheDocument()
  })

  it('applies toast variant class by kind', () => {
    const { container } = render(
      <MailToast
        toast={{
          id: 'toast-2',
          kind: 'letter',
          title: 'Important Letter',
          message: 'Tap to read',
          createdAtMs: 1,
        }}
        onDismiss={vi.fn()}
      />,
    )

    expect(container.querySelector('.mail-toast--letter')).not.toBeNull()
  })

  it('auto-dismisses after provided duration', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()

    render(
      <MailToast
        toast={{
          id: 'toast-3',
          kind: 'system',
          title: 'System Update',
          message: 'Message',
          createdAtMs: 1,
          durationMs: 1200,
        }}
        onDismiss={onDismiss}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(1199)
    })
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
