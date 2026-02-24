import { describe, expect, it } from 'vitest'
import { getVignettesForStage } from './therapyVignettes'

describe('therapy vignettes', () => {
  it('provides externship-specific vignettes with supervised practice themes', () => {
    const externshipVignettes = getVignettesForStage('Externship')

    expect(externshipVignettes).toHaveLength(3)
    expect(externshipVignettes.map((v) => v.id)).toEqual([
      'extern-first-client',
      'extern-supervision',
      'extern-burnout',
    ])

    for (const vignette of externshipVignettes) {
      expect(vignette.stage).toBe('Externship')
      expect(vignette.exchangeCount).toBe(4)
      expect(vignette.reward.xp).toBeGreaterThan(10)
    }
  })
})
