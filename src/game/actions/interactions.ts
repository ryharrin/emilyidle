import type { GameState, WatchItemId } from "../model/types";
import { getPowerReserveForItem, isInteractionAvailable } from "../selectors/interactions";

export type InteractionOutcome = "miss" | "good" | "perfect";

export const INTERACTION_BASE_COOLDOWN_MS = 20_000;

const WINDING_ENJOYMENT_BY_OUTCOME: Record<InteractionOutcome, number> = {
  miss: 25,
  good: 75,
  perfect: 150,
};

const AUTOMATIC_RESERVE_GAIN_BY_OUTCOME: Record<InteractionOutcome, number> = {
  miss: 0.05,
  good: 0.1,
  perfect: 0.2,
};

const QUARTZ_CASH_PAYOUT_BY_OUTCOME_CENTS: Record<InteractionOutcome, number> = {
  miss: 100,
  good: 250,
  perfect: 500,
};

export function setInteractionCooldown(
  state: GameState,
  itemId: WatchItemId,
  nextAvailableAtMs: number,
): GameState {
  const clampedNextAvailableAtMs = Number.isFinite(nextAvailableAtMs)
    ? Math.max(0, Math.floor(nextAvailableAtMs))
    : 0;
  const current = state.interactionNextAvailableAtMsByItem[itemId] ?? 0;
  if (current === clampedNextAvailableAtMs) {
    return state;
  }

  return {
    ...state,
    interactionNextAvailableAtMsByItem: {
      ...state.interactionNextAvailableAtMsByItem,
      [itemId]: clampedNextAvailableAtMs,
    },
  };
}

export function applyWindingReward(
  state: GameState,
  itemId: WatchItemId,
  nowMs: number,
  outcome: InteractionOutcome,
): GameState {
  if (!isInteractionAvailable(state, itemId, nowMs)) {
    return state;
  }

  const enjoymentGain = WINDING_ENJOYMENT_BY_OUTCOME[outcome] ?? 0;
  const withEnjoyment =
    enjoymentGain > 0 ? { ...state, enjoymentCents: state.enjoymentCents + enjoymentGain } : state;

  return setInteractionCooldown(withEnjoyment, itemId, nowMs + INTERACTION_BASE_COOLDOWN_MS);
}

export function applyAutomaticReward(
  state: GameState,
  itemId: WatchItemId,
  nowMs: number,
  outcome: InteractionOutcome,
): GameState {
  if (!isInteractionAvailable(state, itemId, nowMs)) {
    return state;
  }

  const reserveGain = AUTOMATIC_RESERVE_GAIN_BY_OUTCOME[outcome] ?? 0;
  const currentReserve = getPowerReserveForItem(state, itemId);
  const nextReserve = Math.min(1, Math.max(0, currentReserve + reserveGain));
  const withReserve =
    nextReserve !== currentReserve
      ? {
          ...state,
          powerReserveByItem: {
            ...state.powerReserveByItem,
            [itemId]: nextReserve,
          },
        }
      : state;

  return setInteractionCooldown(withReserve, itemId, nowMs + INTERACTION_BASE_COOLDOWN_MS);
}

export function applyQuartzReward(
  state: GameState,
  itemId: WatchItemId,
  nowMs: number,
  outcome: InteractionOutcome,
): GameState {
  if (!isInteractionAvailable(state, itemId, nowMs)) {
    return state;
  }

  const payoutCents = QUARTZ_CASH_PAYOUT_BY_OUTCOME_CENTS[outcome] ?? 0;
  const withCash =
    payoutCents > 0 ? { ...state, currencyCents: state.currencyCents + payoutCents } : state;

  return setInteractionCooldown(withCash, itemId, nowMs + INTERACTION_BASE_COOLDOWN_MS);
}
