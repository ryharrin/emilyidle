import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CONSECUTIVE_CONFIG } from '../../game/constants'
import { initialGameState, type GameState } from '../../game/types'
import { CareerTab } from './CareerTab'

const mockDispatch = vi.fn()
let mockState: GameState = initialGameState

vi.mock('../hooks/useGameState', () => ({
  useGameState: () => mockState,
  useGameDispatch: () => mockDispatch,
}))

function buildState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...initialGameState,
    ...overrides,
    consecutiveSessions: {
      ...initialGameState.consecutiveSessions,
      ...(overrides.consecutiveSessions ?? {}),
    },
  }
}

describe('CareerTab', () => {
  beforeEach(() => {
    mockDispatch.mockReset()
    mockState = buildState({
      onboardingComplete: true,
      careerStage: 'PhDStudent',
      enjoyment: 10,
    })
  })

  it('shows onboarding lock messaging when onboarding is incomplete', () => {
    mockState = buildState({
      onboardingComplete: false,
      careerStage: 'PhDStudent',
      enjoyment: 10,
    })

    render(<CareerTab />)

    expect(screen.getByRole('button', { name: /Start Session/i })).toBeDisabled()
    expect(screen.getAllByText('Complete onboarding to unlock therapy sessions.')).toHaveLength(1)
    expect(screen.queryByText('Ready when you are.')).not.toBeInTheDocument()
    expect(screen.queryByText(/You need \d+ Enjoyment to start\./)).not.toBeInTheDocument()
  })

  it('shows career-stage lock messaging when still pre-phd', () => {
    mockState = buildState({
      onboardingComplete: true,
      careerStage: 'pre-phd',
      enjoyment: 10,
    })

    render(<CareerTab />)

    expect(screen.getByRole('button', { name: /Start Session/i })).toBeDisabled()
    expect(screen.getAllByText('Reach PhD Student stage to unlock therapy sessions.')).toHaveLength(1)
    expect(screen.queryByText('Ready when you are.')).not.toBeInTheDocument()
    expect(screen.queryByText(/You need \d+ Enjoyment to start\./)).not.toBeInTheDocument()
  })

  it('shows max consecutive disabled reason', () => {
    mockState = buildState({
      onboardingComplete: true,
      careerStage: 'PhDStudent',
      enjoyment: 100,
      therapyCooldownUntilMs: 1,
      consecutiveSessions: {
        count: CONSECUTIVE_CONFIG.MAX_CONSECUTIVE,
        lastSessionTime: 0,
        decayStartedAt: undefined,
      },
    })

    render(<CareerTab />)

    expect(screen.getByRole('button', { name: 'Max consecutive reached' })).toBeDisabled()
    expect(screen.getByText('Maximum consecutive sessions reached. Wait for decay.')).toBeInTheDocument()
  })

  it('shows affordability disabled reason when enjoyment is too low', () => {
    mockState = buildState({
      onboardingComplete: true,
      careerStage: 'PhDStudent',
      enjoyment: 1,
    })

    render(<CareerTab />)

    expect(screen.getByRole('button', { name: /Start Session/i })).toBeDisabled()
    expect(screen.getByText('You need 5 Enjoyment to start.')).toBeInTheDocument()
  })

  it('enables start session when requirements are met', () => {
    render(<CareerTab />)

    expect(screen.getByRole('button', { name: /Start Session/i })).toBeEnabled()
    expect(screen.getByText('Ready when you are.')).toBeInTheDocument()
    expect(screen.queryByText('Complete onboarding to unlock therapy sessions.')).not.toBeInTheDocument()
    expect(screen.queryByText('Reach PhD Student stage to unlock therapy sessions.')).not.toBeInTheDocument()
    expect(screen.queryByText(/You need \d+ Enjoyment to start\./)).not.toBeInTheDocument()
  })
})
