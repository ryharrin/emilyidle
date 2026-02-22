// Main selectors barrel file - re-exports all selectors
// Original file split into domain modules

// Career selectors (includes all therapist modules)
export * from "./career";

// Collection selectors
export * from "./collection";

// Economy selectors
export * from "./economy";

// Prestige selectors
export * from "./prestige";

// Interactions selectors
export * from "./interactions/index";

// Milestones and achievements
export * from "./milestones";

// Game loop selectors
export * from "./gameLoop";

// Other existing modules
export * from "./enjoyment";
export * from "./incomeMultipliers";
export * from "./watchModels";
export * from "./perWatchStats";
export * from "./duplicates";
export * from "./statsBreakdown";
export * from "./collectionInsights";
export { getTherapistXpRequiredForNextLevel } from "./therapistPolicy";

// Additional selectors not yet moved to domain files
import type { GameState, EventId } from "../model/types";
import { EVENTS } from "../model/state";
import { getWatchItems } from "./collection";
import { getTherapistCashRateCentsPerSec as getTherapistCashRateImpl } from "./therapistSalary";

// Re-export with proper implementation to resolve circular dependencies
export function getTotalCashRateCentsPerSec(state: GameState, nowMs: number): number {
  return getTherapistCashRateImpl(state, nowMs);
}

export function getEffectiveCashRateCentsPerSec(
  state: GameState,
  nowMs: number,
  eventMultiplier = 1,
): number {
  return getTotalCashRateCentsPerSec(state, nowMs) * eventMultiplier;
}

export function getWindUpIncomeMultiplierForTension(tension: number): number {
  const clamped = Math.max(0, Math.min(10, Math.floor(tension)));
  return Math.min(1.25, 1.05 + 0.02 * clamped);
}

export function getWindSessionCashPayoutCents(
  state: GameState,
  itemId: string,
  tension: number,
): number {
  const items = getWatchItems();
  const item = items.find((i) => i.id === itemId);
  if (!item) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(10, Math.floor(tension)));
  const base = Math.max(1_000, item.incomeCentsPerSec * 10);
  return Math.max(0, Math.round(base * (1 + clamped / 10)));
}

export function getEventStatusLabel(state: GameState, eventId: EventId, nowMs: number): string {
  const event = EVENTS.find((entry) => entry.id === eventId);
  if (!event) {
    return "";
  }

  const entry = state.eventStates[eventId];
  if (!entry) {
    return "";
  }

  if (nowMs < entry.activeUntilMs) {
    const secondsLeft = Math.max(0, Math.ceil((entry.activeUntilMs - nowMs) / 1000));
    return `Active for ${secondsLeft}s`;
  }

  if (nowMs < entry.nextAvailableAtMs) {
    const secondsLeft = Math.max(0, Math.ceil((entry.nextAvailableAtMs - nowMs) / 1000));
    return `Cooldown ${secondsLeft}s`;
  }

  return "Ready";
}
