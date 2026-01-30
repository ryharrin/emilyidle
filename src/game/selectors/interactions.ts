import type { GameState, WatchItemId } from "../model/types";

function getOwnedItemCount(state: GameState, itemId: WatchItemId): number {
  const raw = state.items[itemId];
  return Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
}

export function getInteractionNextAvailableAtMs(state: GameState, itemId: WatchItemId): number {
  const raw = state.interactionNextAvailableAtMsByItem[itemId];
  return typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
}

export function getInteractionCooldownRemainingMs(
  state: GameState,
  itemId: WatchItemId,
  nowMs: number,
): number {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  return Math.max(0, getInteractionNextAvailableAtMs(state, itemId) - clampedNowMs);
}

export function isInteractionAvailable(
  state: GameState,
  itemId: WatchItemId,
  nowMs: number,
): boolean {
  if (getOwnedItemCount(state, itemId) <= 0) {
    return false;
  }

  return getInteractionCooldownRemainingMs(state, itemId, nowMs) <= 0;
}

export function getPowerReserveForItem(state: GameState, itemId: WatchItemId): number {
  const raw = state.powerReserveByItem[itemId];
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return 0;
  }

  return Math.min(1, Math.max(0, raw));
}
