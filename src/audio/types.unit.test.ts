import { describe, expect, it } from 'vitest'
import { MUSIC_ASSETS } from './types'

describe('audio asset defaults', () => {
  it('does not preload music assets by default', () => {
    const tracks = Object.values(MUSIC_ASSETS)
    expect(tracks.every((track) => track.preload !== true)).toBe(true)
  })
})
