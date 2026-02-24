import { describe, expect, it } from 'vitest'
import { step } from './sim'
import { initialGameState } from './types'

describe('step', () => {
  it('is pure and does not mutate input state', () => {
    const state = Object.freeze({ ...initialGameState })
    const next = step(state, 100)
    expect(next).not.toBe(state)
    expect(next.clockMs).toBe(100)
    expect(state.clockMs).toBe(0)
  })
})
