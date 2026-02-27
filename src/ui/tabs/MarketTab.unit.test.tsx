import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GameState } from '../../game/types'
import { initialGameState } from '../../game/types'
import { MarketTab } from './MarketTab'

const mockDispatch = vi.fn()
let mockState: GameState

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...initialGameState,
    ...overrides,
    ownedWatchIds: overrides.ownedWatchIds ?? [...initialGameState.ownedWatchIds],
    pendingPackages: overrides.pendingPackages ?? [...initialGameState.pendingPackages],
    pendingToasts: overrides.pendingToasts ?? [...initialGameState.pendingToasts],
    pendingUnlocks: overrides.pendingUnlocks ?? [...initialGameState.pendingUnlocks],
    triggeredUnlockIds:
      overrides.triggeredUnlockIds ?? { ...initialGameState.triggeredUnlockIds },
    interactionHistory:
      overrides.interactionHistory ?? [...initialGameState.interactionHistory],
    mail:
      overrides.mail ?? initialGameState.mail.map((mailItem) => ({ ...mailItem })),
    unlockedHomeItems:
      overrides.unlockedHomeItems ?? [...initialGameState.unlockedHomeItems],
    consecutiveSessions: overrides.consecutiveSessions
      ? { ...overrides.consecutiveSessions }
      : { ...initialGameState.consecutiveSessions },
    unlockedAchievementIds:
      overrides.unlockedAchievementIds ?? [...initialGameState.unlockedAchievementIds],
    prestige: overrides.prestige ?? {
      workshop: { ...initialGameState.prestige.workshop },
      maison: { ...initialGameState.prestige.maison },
      nostalgia: { ...initialGameState.prestige.nostalgia },
    },
  }
}

vi.mock('../hooks/useGameState', () => ({
  useGameState: () => mockState,
  useGameDispatch: () => mockDispatch,
}))

describe('MarketTab pre-onboarding guidance', () => {
  beforeEach(() => {
    mockDispatch.mockReset()
    mockState = createState()
  })

  it('shows onboarding guidance and no buy controls in pre-phd', () => {
    mockState = createState({
      careerStage: 'pre-phd',
      onboardingComplete: false,
    })

    render(<MarketTab />)

    expect(
      screen.getByText('Market purchases unlock after onboarding.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/read your acceptance letter in mail/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Buy' })).not.toBeInTheDocument()
  })

  it('hides onboarding guidance once market content unlocks', () => {
    mockState = createState({
      careerStage: 'PhDStudent',
      onboardingComplete: true,
      currencyCents: 0,
    })

    render(<MarketTab />)

    expect(
      screen.queryByText('Market purchases unlock after onboarding.'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /quartz watches/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Buy' }).length).toBeGreaterThan(0)
  })
})
