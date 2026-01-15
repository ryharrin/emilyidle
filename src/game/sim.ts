import type { GameState } from "./state";

export const SIM_TICK_MS = 100;

const MAX_STEP_DT_MS = 1_000;

export function step(state: GameState, dtMs: number): GameState {
  const clampedDtMs = Math.max(0, Math.min(MAX_STEP_DT_MS, dtMs));

  const earnedCents = (state.incomeRateCentsPerSec * clampedDtMs) / 1_000;

  return {
    ...state,
    currencyCents: state.currencyCents + earnedCents,
  };
}
