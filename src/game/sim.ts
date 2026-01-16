import type { GameState } from "./state";
import {
  applyAchievementUnlocks,
  applyEventState,
  getCollectionValueCents,
  getEventIncomeMultiplier,
  getEffectiveIncomeRateCentsPerSec,
} from "./state";

export const SIM_TICK_MS = 100;

const MAX_STEP_DT_MS = 1_000;

export function step(state: GameState, dtMs: number, nowMs = Date.now()): GameState {
  const clampedDtMs = Math.max(0, Math.min(MAX_STEP_DT_MS, dtMs));
  const collectionValue = getCollectionValueCents(state);
  const withEvents = applyEventState(state, nowMs, collectionValue);
  const eventMultiplier = getEventIncomeMultiplier(withEvents, nowMs);
  const incomeRate = getEffectiveIncomeRateCentsPerSec(withEvents, eventMultiplier);
  const earnedCents = (incomeRate * clampedDtMs) / 1_000;

  return applyAchievementUnlocks({
    ...withEvents,
    currencyCents: withEvents.currencyCents + earnedCents,
  });
}
