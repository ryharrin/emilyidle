import { describe, expect, it } from 'vitest'
import { gameReducer } from './reducer'
import { initialGameState, type GameState } from './types'

describe('onboarding actions (Story 2.4)', () => {
  it('starts in pre-phd stage with acceptance letter in mail', () => {
    expect(initialGameState.careerStage).toBe('pre-phd')
    expect(initialGameState.onboardingComplete).toBe(false)
    // Check mail system instead of mailbox
    const acceptanceLetter = initialGameState.mail.find((m) => m.type === 'acceptance-letter')
    expect(acceptanceLetter).toBeDefined()
    expect(acceptanceLetter?.read).toBe(false)
  })

  it('reads acceptance letter via READ_ACCEPTANCE_LETTER', () => {
    const state: GameState = {
      ...initialGameState,
      mail: [
        {
          id: 'acceptance-letter-initial',
          type: 'acceptance-letter',
          subject: 'Your Admission Decision',
          from: 'Graduate Division',
          body: '',
          receivedAtMs: 0,
          read: false,
        },
      ],
    }

    const next = gameReducer(state, { type: 'READ_ACCEPTANCE_LETTER' })
    expect(next).not.toBe(state)
    const acceptanceLetter = next.mail.find((m) => m.type === 'acceptance-letter')
    expect(acceptanceLetter?.read).toBe(true)
  })

  it('cannot read letter if already read', () => {
    const state: GameState = {
      ...initialGameState,
      mail: [
        {
          id: 'acceptance-letter-initial',
          type: 'acceptance-letter',
          subject: 'Your Admission Decision',
          from: 'Graduate Division',
          body: '',
          receivedAtMs: 0,
          read: true,
        },
      ],
    }

    const next = gameReducer(state, { type: 'READ_ACCEPTANCE_LETTER' })
    expect(next).toBe(state)
  })

  it('cannot read letter if not present', () => {
    const state: GameState = {
      ...initialGameState,
      mail: [],
    }

    const next = gameReducer(state, { type: 'READ_ACCEPTANCE_LETTER' })
    expect(next).toBe(state)
  })

  it('completes onboarding via COMPLETE_ONBOARDING after reading letter', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'pre-phd',
      onboardingComplete: false,
      mail: [
        {
          id: 'acceptance-letter-initial',
          type: 'acceptance-letter',
          subject: 'Your Admission Decision',
          from: 'Graduate Division',
          body: '',
          receivedAtMs: 0,
          read: true, // Letter has been read
        },
      ],
    }

    const next = gameReducer(state, { type: 'COMPLETE_ONBOARDING' })
    expect(next).not.toBe(state)
    expect(next.careerStage).toBe('PhDStudent')
    expect(next.onboardingComplete).toBe(true)
    // Letter should still be in mail but marked as read
    const acceptanceLetter = next.mail.find((m) => m.type === 'acceptance-letter')
    expect(acceptanceLetter?.read).toBe(true)
  })

  it('cannot complete onboarding if letter not read', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'pre-phd',
      onboardingComplete: false,
      mail: [
        {
          id: 'acceptance-letter-initial',
          type: 'acceptance-letter',
          subject: 'Your Admission Decision',
          from: 'Graduate Division',
          body: '',
          receivedAtMs: 0,
          read: false, // Letter NOT read
        },
      ],
    }

    const next = gameReducer(state, { type: 'COMPLETE_ONBOARDING' })
    expect(next).toBe(state)
  })

  it('cannot complete onboarding twice', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: true,
    }

    const next = gameReducer(state, { type: 'COMPLETE_ONBOARDING' })
    expect(next).toBe(state)
  })

  it('rejects onboarding completion unless current stage is pre-phd', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'Externship',
      onboardingComplete: false,
      mail: [
        {
          id: 'acceptance-letter-initial',
          type: 'acceptance-letter',
          subject: 'Your Admission Decision',
          from: 'Graduate Division',
          body: '',
          receivedAtMs: 0,
          read: true,
        },
      ],
    }

    const next = gameReducer(state, { type: 'COMPLETE_ONBOARDING' })
    expect(next).toBe(state)
  })

  it('validates therapy session start without consuming enjoyment', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: true,
      enjoyment: 5,
    }

    const next = gameReducer(state, { type: 'START_THERAPY_SESSION', enjoymentCost: 5 })
    // Starting should not consume enjoyment - only validates prerequisites
    expect(next.enjoyment).toBe(5)
  })

  it('rejects therapy start with invalid enjoymentCost', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: true,
      enjoyment: 5,
    }

    // Invalid cost (not matching PhDStudent enjoymentCost = 5)
    const next = gameReducer(state, { type: 'START_THERAPY_SESSION', enjoymentCost: 2 })
    expect(next).toBe(state)

    const next2 = gameReducer(state, { type: 'START_THERAPY_SESSION', enjoymentCost: 0 })
    expect(next2).toBe(state)

    const next3 = gameReducer(state, { type: 'START_THERAPY_SESSION', enjoymentCost: 1 })
    expect(next3).toBe(state)
  })

  it('cannot start therapy session during pre-phd', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'pre-phd',
      onboardingComplete: false,
      enjoyment: 5,
    }

    const next = gameReducer(state, { type: 'START_THERAPY_SESSION', enjoymentCost: 5 })
    expect(next).toBe(state)
  })

  it('cannot start therapy session if not enough enjoyment', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: true,
      enjoyment: 4,
    }

    const next = gameReducer(state, { type: 'START_THERAPY_SESSION', enjoymentCost: 5 })
    expect(next).toBe(state)
  })

  it('cannot start therapy session if onboarding not complete', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: false,
      enjoyment: 5,
    }

    const next = gameReducer(state, { type: 'START_THERAPY_SESSION', enjoymentCost: 5 })
    expect(next).toBe(state)
  })

  it('completes therapy session with rewards and consumes enjoyment', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: true,
      currencyCents: 0,
      careerXp: 0,
      enjoyment: 6,
      therapyCooldownUntilMs: 0,
    }

    const nowMs = 1_000
    const next = gameReducer(state, {
      type: 'COMPLETE_THERAPY_SESSION',
      payload: { cashCents: 75_00, xp: 10, nowMs },
    })
    expect(next).not.toBe(state)
    expect(next.enjoyment).toBe(1) // Consumed on completion
    expect(next.currencyCents).toBe(75_00)
    expect(next.careerXp).toBe(10)
    expect(next.therapyCooldownUntilMs).toBeGreaterThan(nowMs)
  })

  it('cannot complete therapy session without enough enjoyment', () => {
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: true,
      currencyCents: 0,
      careerXp: 0,
      enjoyment: 0, // Not enough enjoyment
      therapyCooldownUntilMs: 0,
    }

    const nowMs = 1_000
    const next = gameReducer(state, {
      type: 'COMPLETE_THERAPY_SESSION',
      payload: { cashCents: 75_00, xp: 10, nowMs },
    })
    expect(next).toBe(state)
  })

  it('allows consecutive therapy session during cooldown when affordable', () => {
    const nowMs = 1_000
    const state: GameState = {
      ...initialGameState,
      careerStage: 'PhDStudent',
      onboardingComplete: true,
      currencyCents: 0,
      careerXp: 0,
      enjoyment: 8,
      therapyCooldownUntilMs: nowMs + 1000,
    }

    const next = gameReducer(state, {
      type: 'COMPLETE_THERAPY_SESSION',
      payload: { cashCents: 75_00, xp: 10, nowMs },
    })
    expect(next).not.toBe(state)
    expect(next.enjoyment).toBe(3)
  })
})
