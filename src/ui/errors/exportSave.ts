import { serializeSave } from '../../game/persistence'
import type { GameState } from '../../game/types'

export type ExportSaveResult = { ok: true; value: string } | { ok: false; error: string }

export function exportSave(state: GameState): ExportSaveResult {
  try {
    return { ok: true, value: serializeSave(state) }
  } catch (e) {
    return {
      ok: false,
      error: `Export failed: ${e instanceof Error ? e.message : 'unknown error'}`,
    }
  }
}

