import type { GameState, WatchItemId } from "./state";
import {
  applyAchievementUnlocks,
  applyTherapistPassiveProgress,
  applyEventState,
  discoverCatalogEntries,
  getCatalogEntryIdsForItems,
  getCollectionValueCents,
  getEnjoymentRateCentsPerSec,
  getEventIncomeMultiplier,
  getTotalCashRateCentsPerSec,
} from "./state";

export const SIM_TICK_MS = 100;

const MAX_STEP_DT_MS = 1_000;

const POWER_RESERVE_DRAIN_FULL_MS = 120_000;

function applyPowerReserveDecay(state: GameState, dtMs: number): GameState {
  if (dtMs <= 0) {
    return state;
  }

  const drainRatio = dtMs / POWER_RESERVE_DRAIN_FULL_MS;
  if (!Number.isFinite(drainRatio) || drainRatio <= 0) {
    return state;
  }

  let changed = false;
  const next: Partial<Record<WatchItemId, number>> = {};

  for (const [key, rawValue] of Object.entries(state.powerReserveByItem)) {
    if (typeof rawValue !== "number" || !Number.isFinite(rawValue)) {
      continue;
    }

    const current = Math.min(1, Math.max(0, rawValue));
    if (current <= 0) {
      continue;
    }

    const decayed = Math.max(0, current - drainRatio);
    if (decayed > 0) {
      next[key as WatchItemId] = decayed;
    }
    if (decayed !== current) {
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    powerReserveByItem: next,
  };
}

export function step(state: GameState, dtMs: number, nowMs = Date.now()): GameState {
  const clampedDtMs = Math.max(0, Math.min(MAX_STEP_DT_MS, dtMs));
  const withReserveDecay = applyPowerReserveDecay(state, clampedDtMs);
  const collectionValue = getCollectionValueCents(withReserveDecay);
  const withEvents = applyEventState(withReserveDecay, nowMs, collectionValue);
  const eventMultiplier = getEventIncomeMultiplier(withEvents, nowMs);
  const incomeRate = getTotalCashRateCentsPerSec(withEvents);
  const earnedCents = (incomeRate * clampedDtMs) / 1_000;

  const enjoymentRate = getEnjoymentRateCentsPerSec(withEvents) * eventMultiplier;
  const earnedEnjoyment = (enjoymentRate * clampedDtMs) / 1_000;

  const withIncome = {
    ...withEvents,
    currencyCents: withEvents.currencyCents + earnedCents,
    enjoymentCents: withEvents.enjoymentCents + earnedEnjoyment,
    nostalgiaEnjoymentEarnedCents: withEvents.nostalgiaEnjoymentEarnedCents + earnedEnjoyment,
  };

  const withCareerProgress = applyTherapistPassiveProgress(withIncome, clampedDtMs);

  const withDiscovery = discoverCatalogEntries(
    withCareerProgress,
    getCatalogEntryIdsForItems(withCareerProgress),
  );
  return applyAchievementUnlocks(withDiscovery);
}
