import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initialGameState, type GameState } from '../../game/types'
import { HomeTab } from './HomeTab'

const mockDispatch = vi.fn()
let mockState: GameState = initialGameState

vi.mock('../hooks/useGameState', () => ({
  useGameState: () => mockState,
  useGameDispatch: () => mockDispatch,
}))

vi.mock('../components/FamilyCheckIn', () => ({
  FamilyCheckIn: () => null,
}))

vi.mock('../components/AcceptanceLetter', () => ({
  AcceptanceLetter: () => null,
}))

vi.mock('../components/HomeGallery', () => ({
  HomeGallery: () => null,
}))

vi.mock('../achievements/AchievementGallery', () => ({
  AchievementGallery: () => null,
}))

vi.mock('../settings/SettingsModal', () => ({
  SettingsModal: () => null,
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

describe('HomeTab therapy copy', () => {
  beforeEach(() => {
    mockDispatch.mockReset()
    mockState = buildState({
      onboardingComplete: true,
      careerStage: 'PhDStudent',
      enjoyment: 10,
    })
  })

  it('shows completion semantics copy when therapy section is unlocked', () => {
    render(<HomeTab />)

    expect(screen.getByRole('heading', { name: '🛋️ Therapy Session' })).toBeInTheDocument()
    expect(
      screen.getByText(
        /Complete a session to spend \d+ Enjoyment and earn Cash \+ Career XP\. Ending early gives no cost and no rewards\./,
      ),
    ).toBeInTheDocument()
  })
})
