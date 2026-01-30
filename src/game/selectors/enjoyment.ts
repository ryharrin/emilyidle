import { WATCH_ITEMS, getWatchBucket } from "../data/items";
import { WATCH_MODELS } from "../data/watchModels";
import { formatMoneyFromCents } from "../format";
import type { GameState, WatchItemDefinition, WatchItemId } from "../model/types";
import { getDuplicateRewardSum } from "./duplicates";

const WATCH_MODEL_LOOKUP = new Map(WATCH_MODELS.map((model) => [model.id, model]));
const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));

const WORN_WATCH_ENJOYMENT_MULTIPLIERS: Record<WatchItemId, number> = {
  starter: 1.02,
  classic: 1.05,
  chronograph: 1.08,
  tourbillon: 1.12,
};

function getWornWatchBucketId(state: GameState): WatchItemId | null {
  const wornId = state.wornWatchId;
  if (wornId === null) {
    return null;
  }

  const model = WATCH_MODEL_LOOKUP.get(wornId);
  if (model) {
    return model.tierId;
  }

  return getWatchBucket(wornId);
}

export function getWornWatchEnjoymentMultiplier(state: GameState): number {
  const bucketId = getWornWatchBucketId(state);
  if (!bucketId) {
    return 1;
  }

  return WORN_WATCH_ENJOYMENT_MULTIPLIERS[bucketId];
}

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

  const workshopJump = workshopPrestigeCount >= 1 ? 2.25 : 1;
  const workshopCompounding = Math.pow(1.05, Math.max(0, workshopPrestigeCount - 1));
  const atelierLegacy = workshopJump * workshopCompounding;
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

    const reserveMultiplier =
      tier.movement === "automatic" ? 1 + 0.5 * (state.powerReserveByItem[tier.id] ?? 0) : 1;

    return (
      total +
      getDuplicateRewardSum(owned) * getWatchItemEnjoymentRateCentsPerSec(tier) * reserveMultiplier
    );
  }, 0);

  return baseRate * getPrestigeLegacyMultiplier(state) * getWornWatchEnjoymentMultiplier(state);
}

export function getEnjoymentThresholdLabel(cents: number): string {
  return `${formatMoneyFromCents(cents)} enjoyment`;
}
