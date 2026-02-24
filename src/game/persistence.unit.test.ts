import { describe, expect, it } from 'vitest'
import { initialGameState } from './types'
import { loadSave, migrateSave, serializeSave } from './persistence'

describe('persistence', () => {
  it('serializeSave includes version and round-trips via loadSave', () => {
    const raw = serializeSave(initialGameState)
    const parsed = JSON.parse(raw) as { version?: unknown }
    expect(parsed.version).toBe(1)

    const result = loadSave(raw)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.version).toBe(1)
    expect(result.value.currencyCents).toBe(initialGameState.currencyCents)
  })

  it('loadSave returns ok:false on corrupted JSON and never throws', () => {
    const result = loadSave('{nope')
    expect(result.ok).toBe(false)
  })

  it('migrateSave supports legacy shape missing version', () => {
    const legacy = {
      currencyCents: 123,
      enjoyment: 5,
      love: 9,
      careerXp: 7,
      careerStage: 'PhDStudent',
      ownedWatchIds: ['seiko-5-snk'],
      pendingToasts: [{ id: 't1', message: 'hi', createdAtMs: 1 }],
      pendingUnlocks: ['home-photo-1'],
    }
    const result = migrateSave(legacy)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.version).toBe(1)
    expect(result.value.currencyCents).toBe(123)
  })

  it('preserves cooldown timestamps across save/load', () => {
    const state = {
      ...initialGameState,
      clockMs: 10_000,
      therapyCooldownUntilMs: 28_000,
      lastFamilyCheckIn: 5_000,
    }

    const raw = serializeSave(state)
    const result = loadSave(raw)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.clockMs).toBe(10_000)
    expect(result.value.therapyCooldownUntilMs).toBe(28_000)
    expect(result.value.lastFamilyCheckIn).toBe(5_000)
  })
})
