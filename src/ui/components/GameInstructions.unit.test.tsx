import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GameInstructions } from './GameInstructions'

describe('GameInstructions', () => {
  it('renders all instruction sections', () => {
    render(
      <GameInstructions
        goal="Test goal"
        howToPlay="Test how to play"
        reward="Test reward"
      />,
    )

    expect(screen.getByText('Goal')).toBeInTheDocument()
    expect(screen.getByText('Test goal')).toBeInTheDocument()

    expect(screen.getByText('How to Play')).toBeInTheDocument()
    expect(screen.getByText('Test how to play')).toBeInTheDocument()

    expect(screen.getByText('Reward')).toBeInTheDocument()
    expect(screen.getByText('Test reward')).toBeInTheDocument()
  })

  it('renders with empty strings', () => {
    render(<GameInstructions goal="" howToPlay="" reward="" />)

    expect(screen.getByText('Goal')).toBeInTheDocument()
    expect(screen.getByText('How to Play')).toBeInTheDocument()
    expect(screen.getByText('Reward')).toBeInTheDocument()
  })

  it('applies correct styling structure', () => {
    const { container } = render(
      <GameInstructions
        goal="Goal text"
        howToPlay="How text"
        reward="Reward text"
      />,
    )

    const wrapper = container.querySelector('.game-instructions')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper?.tagName).toBe('DIV')
  })
})
