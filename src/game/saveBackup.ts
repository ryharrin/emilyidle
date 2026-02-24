import type { GameState, Result } from './types'
import { loadSave, serializeSave } from './persistence'

export function exportSaveString(state: GameState): string {
  return serializeSave(state)
}

export function importSaveString(raw: string): Result<GameState> {
  return loadSave(raw)
}

