import { WATCH_ITEMS } from "../data/items";
import { WATCH_MODELS } from "../data/watchModels";
import { formatMoneyFromCents } from "../format";
import type { GameState, WatchItemDefinition } from "../model/types";
import { getDuplicateRewardSum } from "./duplicates";

const WATCH_MODEL_LOOKUP = new Map(WATCH_MODELS.map((model) => [model.id, model]));
const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));

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
  const baseRate = Object.entries(state.watchModels).reduce((total, [modelId, rawOwned]) => {
    if (!Number.isFinite(rawOwned)) {
      return total;
    }

    const model = WATCH_MODEL_LOOKUP.get(modelId);
    if (!model) {
      return total;
    }

    const tier = WATCH_ITEM_LOOKUP.get(model.tierId);
    if (!tier) {
      return total;
    }

    const owned = Math.max(0, Math.floor(rawOwned));
    if (owned === 0) {
      return total;
    }

    return total + getDuplicateRewardSum(owned) * getWatchItemEnjoymentRateCentsPerSec(tier);
  }, 0);
  return baseRate * getPrestigeLegacyMultiplier(state);
}

export function getEnjoymentThresholdLabel(cents: number): string {
  return `${formatMoneyFromCents(cents)} enjoyment`;
}
