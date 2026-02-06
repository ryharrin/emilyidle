import { WATCH_ITEMS } from "../data/items";
import type { GameState, WatchItemId, WatchMovement } from "../model/types";

export type InteractionOutcomeTier = "miss" | "good" | "perfect";

const WATCH_ITEM_MOVEMENTS = new Map<WatchItemId, WatchMovement>(
  WATCH_ITEMS.map((item) => [item.id, item.movement]),
);

export type InteractionDifficultyProfile = {
  id: WatchItemId;
  label: string;
  note: string;
  goodThreshold: number;
  perfectThreshold: number;
};

const INTERACTION_DIFFICULTY_BY_ITEM: Record<WatchItemId, InteractionDifficultyProfile> = {
  starter: {
    id: "starter",
    label: "Starter tuning",
    note: "Forgiving timing windows for practice and onboarding.",
    goodThreshold: 0.4,
    perfectThreshold: 0.72,
  },
  classic: {
    id: "classic",
    label: "Classic calibration",
    note: "Balanced timing windows with moderate precision pressure.",
    goodThreshold: 0.48,
    perfectThreshold: 0.8,
  },
  chronograph: {
    id: "chronograph",
    label: "Chronograph challenge",
    note: "Tighter windows reward steadier control.",
    goodThreshold: 0.55,
    perfectThreshold: 0.86,
  },
  tourbillon: {
    id: "tourbillon",
    label: "Tourbillon precision",
    note: "Elite windows demand near-perfect timing.",
    goodThreshold: 0.62,
    perfectThreshold: 0.9,
  },
};

export const INTERACTION_STREAK_MAX_STACK = 5;
export const INTERACTION_STREAK_STEP = 0.1;

function getWatchMovement(itemId: WatchItemId): WatchMovement {
  const movement = WATCH_ITEM_MOVEMENTS.get(itemId);
  if (!movement) {
    throw new Error(`Unknown watch item: ${itemId}`);
  }
  return movement;
}

export function getInteractionDifficultyProfile(itemId: WatchItemId): InteractionDifficultyProfile {
  return INTERACTION_DIFFICULTY_BY_ITEM[itemId];
}

export function resolveInteractionOutcomeTier(
  performance01: number,
  itemId: WatchItemId,
): InteractionOutcomeTier {
  const profile = getInteractionDifficultyProfile(itemId);
  const clamped = Math.max(0, Math.min(1, performance01));
  if (clamped >= profile.perfectThreshold) {
    return "perfect";
  }
  if (clamped >= profile.goodThreshold) {
    return "good";
  }
  return "miss";
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

export function getInteractionPerfectStreakBonusMultiplierFromStreak(streak: number): number {
  const normalized = Math.max(0, Math.floor(streak));
  const stack = Math.min(INTERACTION_STREAK_MAX_STACK, normalized);
  return 1 + stack * INTERACTION_STREAK_STEP;
}

export function getInteractionCurrentStreakBonusMultiplier(state: GameState): number {
  return getInteractionPerfectStreakBonusMultiplierFromStreak(state.interactionPerfectStreak);
}

export type InteractionStreakDetail = {
  currentStreak: number;
  bestStreak: number;
  nextPerfectBonusMultiplier: number;
  nextPerfectBonusPercent: number;
};

export function getInteractionStreakDetail(state: GameState): InteractionStreakDetail {
  const currentStreak = Math.max(0, Math.floor(state.interactionPerfectStreak));
  const bestStreak = Math.max(currentStreak, Math.floor(state.interactionBestPerfectStreak));
  const nextPerfectBonusMultiplier =
    getInteractionPerfectStreakBonusMultiplierFromStreak(currentStreak);
  const nextPerfectBonusPercent = Math.round((nextPerfectBonusMultiplier - 1) * 100);

  return {
    currentStreak,
    bestStreak,
    nextPerfectBonusMultiplier,
    nextPerfectBonusPercent,
  };
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
