import { describe, expect, it } from 'vitest'
import { getPassiveEnjoymentRatePerSecond } from './passiveIncome'
import { initialGameState, type GameState } from './types'
import { step } from './sim'

describe('passiveIncome', () => {
  it('computes a non-zero passive rate when a starter watch is owned', () => {
    const state: GameState = {
      ...initialGameState,
      ownedWatchIds: ['cartier-tank-quartz'],
    }
    expect(getPassiveEnjoymentRatePerSecond(state)).toBeGreaterThan(0)
  })

  it('accrues uncollected enjoyment during sim ticks', () => {
    const state: GameState = {
      ...initialGameState,
      ownedWatchIds: ['cartier-tank-quartz'],
      uncollectedEnjoyment: 0,
    }
    const next = step(state, 1_000)
    expect(next.uncollectedEnjoyment).toBeGreaterThan(0)
  })
})

