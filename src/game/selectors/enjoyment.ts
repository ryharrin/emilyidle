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
  const maisonHeritage = Number.isFinite(state.maisonHeritage)
    ? Math.max(0, Math.floor(state.maisonHeritage))
    : 0;

  const atelierLegacy = Math.pow(1.05, workshopPrestigeCount);
  const maisonLegacy = Math.pow(1.03, maisonHeritage);

  return Math.min(10, atelierLegacy * maisonLegacy);
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
