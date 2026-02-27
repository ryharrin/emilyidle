import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { SFX_CATALOG } from './sfxCatalog'
import { MUSIC_ASSETS } from './types'

function publicAssetPath(assetUrl: string): string {
  return resolve(process.cwd(), 'public', assetUrl.replace(/^\//, ''))
}

describe('audio assets', () => {
  it('has placeholder files for every SFX catalog entry', () => {
    const missing = Object.values(SFX_CATALOG)
      .map((sfx) => publicAssetPath(sfx.file))
      .filter((assetPath) => !existsSync(assetPath))

    expect(missing).toEqual([])
  })

  it('has placeholder files for every music track asset entry', () => {
    const missing = Object.values(MUSIC_ASSETS)
      .flatMap((asset) => asset.src)
      .map((assetUrl) => publicAssetPath(assetUrl))
      .filter((assetPath) => !existsSync(assetPath))

    expect(missing).toEqual([])
  })
})
