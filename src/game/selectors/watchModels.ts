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

export function getNextDuplicateRewardMultiplier(state: GameState, modelId: string): number {
  const owned = getWatchModelOwnedCount(state, modelId);
  return getDuplicateRewardMultiplierForNextPurchase(owned);
}
