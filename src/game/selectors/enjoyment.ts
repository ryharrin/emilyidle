import { WATCH_ITEMS } from "../data/items";
import { formatMoneyFromCents } from "../format";
import type { GameState, WatchItemDefinition } from "../model/types";

export function getWatchItemEnjoymentRateCentsPerSec(item: WatchItemDefinition): number {
  return item.enjoymentCentsPerSec;
}

export function getEnjoymentCents(state: GameState): number {
  return state.enjoymentCents;
}

export function getPrestigeLegacyMultiplier(state: GameState): number {
  const workshopPrestigeCount = Number.isFinite(state.workshopPrestigeCount)
    ? Math.max(0, Math.floor(state.workshopPrestigeCount))
    : 0;

  // Wave 1 compensation after Maison removal: slightly stronger workshop legacy scaling.
  return Math.min(10, Math.pow(1.06, workshopPrestigeCount));
}

export function getEnjoymentRateCentsPerSec(state: GameState): number {
  const baseRate = WATCH_ITEMS.reduce(
    (total, item) =>
      total + (state.items[item.id] ?? 0) * getWatchItemEnjoymentRateCentsPerSec(item),
    0,
  );
  return baseRate * getPrestigeLegacyMultiplier(state);
}

export function getEnjoymentThresholdLabel(cents: number): string {
  return `${formatMoneyFromCents(cents)} enjoyment`;
}
