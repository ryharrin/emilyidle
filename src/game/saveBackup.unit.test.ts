import { describe, expect, it } from 'vitest'
import { exportSaveString, importSaveString } from './saveBackup'
import { initialGameState } from './types'

describe('saveBackup', () => {
  it('exports then imports a save string', () => {
    const state = { ...initialGameState, currencyCents: 1234, enjoyment: 2.5 }
    const raw = exportSaveString(state)
    const result = importSaveString(raw)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.currencyCents).toBe(1234)
    expect(result.value.enjoyment).toBe(2.5)
  })

  it('rejects invalid import strings', () => {
    const result = importSaveString('not json')
    expect(result.ok).toBe(false)
  })
})

