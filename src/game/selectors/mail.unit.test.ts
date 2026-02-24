import { describe, expect, it } from 'vitest'
import type { GameState } from '../types'
import { activeToasts, inboxItems, unopenedMailCount } from './mail'

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    version: 1,
    clockMs: 0,
    currencyCents: 0,
    enjoyment: 0,
    uncollectedEnjoyment: 0,
    love: 0,
    lastFamilyCheckIn: 0,
    careerXp: 0,
    careerStage: 'PhDStudent',
    therapyCooldownUntilMs: 0,
    ownedWatchIds: [],
    pendingToasts: [],
    pendingUnlocks: [],
    triggeredUnlockIds: {},
    interactionHistory: [],
    onboardingComplete: true,
    mail: [],
    pendingPackages: [],
    prestige: {
      workshop: { unlocked: false, blueprints: 0, upgrades: [] },
      maison: { unlocked: false, heritage: 0, upgrades: [] },
      nostalgia: { unlocked: false, points: 0, upgrades: [], museumQuality: false },
    },
    unlockedHomeItems: [],
    consecutiveSessions: { count: 0, lastSessionTime: 0 },
    ...overrides,
  }
}

describe('mail selectors', () => {
  it('counts unopened mail correctly', () => {
    const state = baseState({
      mail: [
        { id: '1', type: 'acceptance-letter', subject: 'A', from: 'A', body: '', receivedAtMs: 1, read: false },
        { id: '2', type: 'shipping-notification', subject: 'B', from: 'B', body: '', receivedAtMs: 2, read: true },
        { id: '3', type: 'ryan-message', subject: 'C', from: 'C', body: '', receivedAtMs: 3, read: false },
      ],
    })
    expect(unopenedMailCount(state)).toBe(2)
  })

  it('sorts inbox items by newest first', () => {
    const state = baseState({
      mail: [
        { id: 'old', type: 'ryan-message', subject: 'Old', from: 'Ryan', body: '', receivedAtMs: 1, read: false },
        { id: 'new', type: 'ryan-message', subject: 'New', from: 'Ryan', body: '', receivedAtMs: 10, read: false },
      ],
    })
    expect(inboxItems(state).map((item) => item.id)).toEqual(['new', 'old'])
  })

  it('returns active toast queue', () => {
    const state = baseState({
      pendingToasts: [{ id: 'toast-1', message: 'Mail', createdAtMs: 1, kind: 'package' }],
    })
    expect(activeToasts(state)).toHaveLength(1)
  })
})
