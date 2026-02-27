import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { initialGameState } from '../../game/types'
import DebugPanel from './DebugPanel'

describe('DebugPanel', () => {
  it('renders nothing when enabled={false}', () => {
    const { container } = render(
      <DebugPanel enabled={false} state={initialGameState} dispatch={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a heading when enabled={true}', () => {
    render(<DebugPanel enabled state={initialGameState} dispatch={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Debug Panel (DEV)' })).toBeInTheDocument()
  })
})
