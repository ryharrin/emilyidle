import { WATCH_MODELS, type WatchModelDefinition } from "../data/watchModels";
import { WATCH_ENJOYMENT_REQUIREMENTS_CENTS, WATCH_ITEMS } from "../data/items";
import type { GameState, WatchItemDefinition, WatchItemId } from "../model/types";
import { getDuplicateRewardMultiplierForNextPurchase } from "./duplicates";

const WATCH_MODEL_LOOKUP = new Map(WATCH_MODELS.map((model) => [model.id, model]));
const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));

export type WatchModelPurchaseGate =
  | { ok: true; cashPriceCents: number; enjoymentRequiredCents: number }
  | {
      ok: false;
      cashPriceCents: number;
      enjoymentRequiredCents: number;
      blocksBy: "enjoyment" | "cash";
      enjoymentDeficitCents?: number;
      cashDeficitCents?: number;
    };

export function getWatchModelOwnedCount(state: GameState, modelId: string): number {
  return state.watchModels[modelId] ?? 0;
}

export function requireWatchModel(modelId: string): WatchModelDefinition {
  const model = WATCH_MODEL_LOOKUP.get(modelId);
  if (!model) {
    throw new Error(`Unknown watch model: ${modelId}`);
  }
  return model;
}

export function getWatchModelTierId(modelId: string): WatchItemId {
  return requireWatchModel(modelId).tierId;
}

function requireWatchItem(tierId: WatchItemId): WatchItemDefinition {
  const item = WATCH_ITEM_LOOKUP.get(tierId);
  if (!item) {
    throw new Error(`Unknown watch item: ${tierId}`);
  }
  return item;
}

export function getWatchModelPriceCents(state: GameState, modelId: string): number {
  const model = requireWatchModel(modelId);
  const owned = getWatchModelOwnedCount(state, modelId);
  const tier = requireWatchItem(model.tierId);
  const startPrice = tier.basePriceCents * tier.priceGrowth ** owned;
  return Math.max(0, Math.ceil(startPrice));
}

export function getWatchModelPurchaseGate(
  state: GameState,
  modelId: string,
): WatchModelPurchaseGate {
  const tierId = getWatchModelTierId(modelId);
  const cashPriceCents = getWatchModelPriceCents(state, modelId);
  const enjoymentRequiredCents = WATCH_ENJOYMENT_REQUIREMENTS_CENTS[tierId] ?? 0;
  const cashDeficitCents = Math.max(0, cashPriceCents - state.currencyCents);
  const enjoymentDeficitCents = Math.max(0, enjoymentRequiredCents - state.enjoymentCents);
  const lacksEnjoyment = enjoymentDeficitCents > 0;
  const lacksCash = cashDeficitCents > 0;

  if (!lacksEnjoyment && !lacksCash) {
    return { ok: true, cashPriceCents, enjoymentRequiredCents };
  }

  const gate: WatchModelPurchaseGate = {
    ok: false,
    cashPriceCents,
    enjoymentRequiredCents,
    blocksBy: lacksEnjoyment ? "enjoyment" : "cash",
  };

  if (enjoymentDeficitCents > 0) {
    gate.enjoymentDeficitCents = enjoymentDeficitCents;
  }

  if (cashDeficitCents > 0) {
    gate.cashDeficitCents = cashDeficitCents;
  }

  return gate;
}

function isCatalogTierUnlocked(state: GameState, tierId: WatchItemId): boolean {
  if (state.catalogTierUnlocks.includes(tierId)) {
    return true;
  }

  const item = requireWatchItem(tierId);
  if (!item.unlockMilestoneId) {
    return true;
  }

  return (
    state.unlockedMilestones.includes(item.unlockMilestoneId) ||
    state.nostalgiaUnlockedItems.includes(tierId)
  );
}

/**
 * Canonical contract for catalog purchase reachability.
 * A buy action is reachable only when a model is discovered and the purchase gate is currently
 * open. Tier-unlock status is exposed as metadata for callers that need lock/explainer detail.
 */
export type CatalogModelPurchaseReachability = {
  ownedCount: number;
  tierUnlocked: boolean;
  gate: WatchModelPurchaseGate;
  buyActionReachable: boolean;
};

export function getCatalogModelPurchaseReachability(
  state: GameState,
  modelId: string,
): CatalogModelPurchaseReachability {
  const tierId = getWatchModelTierId(modelId);
  const ownedCount = getWatchModelOwnedCount(state, modelId);
  const tierUnlocked = isCatalogTierUnlocked(state, tierId);
  const gate = getWatchModelPurchaseGate(state, modelId);
  const buyActionReachable = tierUnlocked && gate.ok;

  return {
    ownedCount,
    tierUnlocked,
    gate,
    buyActionReachable,
  };
}

export function canReachCatalogBuyAction(state: GameState, modelId: string): boolean {
  return getCatalogModelPurchaseReachability(state, modelId).buyActionReachable;
}

export function canReachCatalogUnownedBuyAction(state: GameState, modelId: string): boolean {
  const reachability = getCatalogModelPurchaseReachability(state, modelId);
  return reachability.ownedCount === 0 && reachability.buyActionReachable;
}

export function hasCatalogReadyUnownedModel(state: GameState): boolean {
  return WATCH_MODELS.some((model) => {
    const reachability = getCatalogModelPurchaseReachability(state, model.id);
    return reachability.tierUnlocked && reachability.ownedCount === 0;
  });
}

export function getNextDuplicateRewardMultiplier(state: GameState, modelId: string): number {
  const owned = getWatchModelOwnedCount(state, modelId);
  return getDuplicateRewardMultiplierForNextPurchase(owned);
}
