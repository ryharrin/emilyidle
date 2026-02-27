import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('has modal a11y attributes and is focusable', () => {
    render(
      <Modal title="Test modal" onClose={vi.fn()}>
        <p>Body</p>
      </Modal>
    )

    const dialog = screen.getByRole('dialog', { name: 'Test modal' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('tabIndex', '-1')
    expect(dialog).toHaveFocus()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Test modal" onClose={onClose}>
        <p>Body</p>
      </Modal>
    )

    const dialog = screen.getByRole('dialog', { name: 'Test modal' })
    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
