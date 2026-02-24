import type { GameState, UnlockId } from '../types'

export type UnlockCategory = 'home-life' | 'career' | 'collection' | 'prestige' | 'meta'

export type UnlockEntry = {
  id: UnlockId
  category: UnlockCategory
  condition: (state: Readonly<GameState>) => boolean
  onUnlock?: (state: Readonly<GameState>) => GameState
}

export type UnlockRegistry = readonly UnlockEntry[]

