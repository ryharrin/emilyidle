import type { GameState } from '../types'
import { UNLOCK_REGISTRY } from './registry'
import type { UnlockEntry, UnlockRegistry } from './types'

function addUnique(arr: readonly string[], value: string): string[] | null {
  if (arr.includes(value)) return null
  return [...arr, value]
}

function markTriggered(
  triggeredUnlockIds: Readonly<GameState['triggeredUnlockIds']>,
  unlockId: string,
): GameState['triggeredUnlockIds'] | null {
  if (triggeredUnlockIds[unlockId]) return null
  return { ...triggeredUnlockIds, [unlockId]: true }
}

/**
 * Deterministically evaluates unlock rules in registry order.
 *
 * Requirements:
 * - Pure and deterministic.
 * - Returns the same state reference when no unlocks fire.
 * - Supports an empty registry.
 */
export function evaluateUnlocks(
  state: GameState,
  registry: UnlockRegistry = UNLOCK_REGISTRY,
): GameState {
  if (registry.length === 0) return state

  let next = state

  for (const entry of registry) {
    if (next.triggeredUnlockIds[entry.id]) continue
    if (!entry.condition(next)) continue

    // Apply optional one-time side effects first (still pure: returns next state).
    const afterOnUnlock = entry.onUnlock ? entry.onUnlock(next) : next

    const pendingUnlocks = addUnique(afterOnUnlock.pendingUnlocks, entry.id) ?? afterOnUnlock.pendingUnlocks
    const triggeredUnlockIds =
      markTriggered(afterOnUnlock.triggeredUnlockIds, entry.id) ?? afterOnUnlock.triggeredUnlockIds

    const changed =
      afterOnUnlock !== next ||
      pendingUnlocks !== afterOnUnlock.pendingUnlocks ||
      triggeredUnlockIds !== afterOnUnlock.triggeredUnlockIds

    if (changed) {
      next = {
        ...afterOnUnlock,
        pendingUnlocks,
        triggeredUnlockIds,
      }
    }
  }

  return next
}

export function emptyRegistry(): UnlockRegistry {
  return []
}

export function defineUnlock(entry: UnlockEntry): UnlockEntry {
  return entry
}

