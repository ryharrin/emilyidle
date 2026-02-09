import type { GameState, InteractionMiniGameMode, WatchItemId } from "../model/types";
import {
  getInteractionPerfectStreakBonusMultiplierFromStreak,
  getPowerReserveForItem,
  isInteractionAvailable,
  type InteractionOutcomeTier,
} from "../selectors/interactions";

export type InteractionOutcome = InteractionOutcomeTier;

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

type InteractionRewardOptions = {
  mode?: InteractionMiniGameMode;
};

function resolveInteractionMode(options?: InteractionRewardOptions): InteractionMiniGameMode {
  return options?.mode === "practice" ? "practice" : "normal";
}

function getPerfectStreakMultiplier(
  state: GameState,
  outcome: InteractionOutcome,
  mode: InteractionMiniGameMode,
): number {
  if (mode !== "normal" || outcome !== "perfect") {
    return 1;
  }

  return getInteractionPerfectStreakBonusMultiplierFromStreak(state.interactionPerfectStreak);
}

function applyInteractionTracking(
  state: GameState,
  outcome: InteractionOutcome,
  mode: InteractionMiniGameMode,
): GameState {
  if (mode !== "normal") {
    return state;
  }

  const interactionRunsTotal = state.interactionRunsTotal + 1;
  const interactionPerfectRuns =
    outcome === "perfect" ? state.interactionPerfectRuns + 1 : state.interactionPerfectRuns;
  const interactionPerfectStreak = outcome === "perfect" ? state.interactionPerfectStreak + 1 : 0;
  const interactionBestPerfectStreak = Math.max(
    state.interactionBestPerfectStreak,
    interactionPerfectStreak,
  );

  return {
    ...state,
    interactionRunsTotal,
    interactionPerfectRuns,
    interactionPerfectStreak,
    interactionBestPerfectStreak,
  };
}

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
  options?: InteractionRewardOptions,
): GameState {
  if (!isInteractionAvailable(state, itemId, nowMs)) {
    return state;
  }

  const mode = resolveInteractionMode(options);
  const streakMultiplier = getPerfectStreakMultiplier(state, outcome, mode);
  const baseEnjoymentGain = WINDING_ENJOYMENT_BY_OUTCOME[outcome] ?? 0;
  const enjoymentGain =
    mode === "normal" ? Math.max(0, Math.floor(baseEnjoymentGain * streakMultiplier)) : 0;
  const withEnjoyment =
    enjoymentGain > 0 ? { ...state, enjoymentCents: state.enjoymentCents + enjoymentGain } : state;
  const withTracking = applyInteractionTracking(withEnjoyment, outcome, mode);

  if (mode === "practice") {
    return withTracking;
  }

  return setInteractionCooldown(withTracking, itemId, nowMs + INTERACTION_BASE_COOLDOWN_MS);
}

export function applyAutomaticReward(
  state: GameState,
  itemId: WatchItemId,
  nowMs: number,
  outcome: InteractionOutcome,
  options?: InteractionRewardOptions,
): GameState {
  if (!isInteractionAvailable(state, itemId, nowMs)) {
    return state;
  }

  const mode = resolveInteractionMode(options);
  const streakMultiplier = getPerfectStreakMultiplier(state, outcome, mode);
  const baseReserveGain = AUTOMATIC_RESERVE_GAIN_BY_OUTCOME[outcome] ?? 0;
  const reserveGain = mode === "normal" ? baseReserveGain * streakMultiplier : 0;
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
  const withTracking = applyInteractionTracking(withReserve, outcome, mode);

  if (mode === "practice") {
    return withTracking;
  }

  return setInteractionCooldown(withTracking, itemId, nowMs + INTERACTION_BASE_COOLDOWN_MS);
}

export function applyQuartzReward(
  state: GameState,
  itemId: WatchItemId,
  nowMs: number,
  outcome: InteractionOutcome,
  options?: InteractionRewardOptions,
): GameState {
  if (!isInteractionAvailable(state, itemId, nowMs)) {
    return state;
  }

  const mode = resolveInteractionMode(options);
  const streakMultiplier = getPerfectStreakMultiplier(state, outcome, mode);
  const basePayoutCents = QUARTZ_CASH_PAYOUT_BY_OUTCOME_CENTS[outcome] ?? 0;
  const payoutCents =
    mode === "normal" ? Math.max(0, Math.floor(basePayoutCents * streakMultiplier)) : 0;
  const withCash =
    payoutCents > 0 ? { ...state, currencyCents: state.currencyCents + payoutCents } : state;
  const withTracking = applyInteractionTracking(withCash, outcome, mode);

  if (mode === "practice") {
    return withTracking;
  }

  return setInteractionCooldown(withTracking, itemId, nowMs + INTERACTION_BASE_COOLDOWN_MS);
}
