import { WATCH_ITEMS } from "../data/items";
import type { GameState, WatchItemId, WatchMovement } from "../model/types";

const WATCH_ITEM_MOVEMENTS = new Map<WatchItemId, WatchMovement>(
  WATCH_ITEMS.map((item) => [item.id, item.movement]),
);

function getWatchMovement(itemId: WatchItemId): WatchMovement {
  const movement = WATCH_ITEM_MOVEMENTS.get(itemId);
  if (!movement) {
    throw new Error(`Unknown watch item: ${itemId}`);
  }
  return movement;
}

export type InteractionMovementGate = {
  available: boolean;
  reason?: string;
};

export function getInteractionMovementGate(itemId: WatchItemId): InteractionMovementGate {
  getWatchMovement(itemId);
  return { available: true };
}

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

export type PowerReserveDetail = {
  reserve01: number;
  reservePercent: number;
  label: string;
  explanation: string;
};

const POWER_RESERVE_LABEL = "Power reserve";
const AUTOMATIC_RESERVE_EXPLANATION =
  "Automatic watches store reserve as they run; a fuller reserve boosts enjoyment while you wait.";
const MANUAL_RESERVE_EXPLANATION = "Manual watches wind via the crown and don’t rely on a reserve.";

export function getPowerReserveDetail(state: GameState, itemId: WatchItemId): PowerReserveDetail {
  const reserve01 = getPowerReserveForItem(state, itemId);
  const reservePercent = Math.round(reserve01 * 100);
  const movement = getWatchMovement(itemId);
  const explanation =
    movement === "automatic" ? AUTOMATIC_RESERVE_EXPLANATION : MANUAL_RESERVE_EXPLANATION;

  return {
    reserve01,
    reservePercent,
    label: POWER_RESERVE_LABEL,
    explanation,
  };
}
