import { describe, expect, it } from "vitest";

import {
  canReachCatalogBuyAction,
  canReachCatalogUnownedBuyAction,
  createInitialState,
  getCatalogModelPurchaseReachability,
  hasCatalogReadyUnownedModel,
} from "../src/game/state";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

describe("catalog readiness contract", () => {
  it("does not treat locked-tier entries as buy-action reachable", () => {
    const state = createInitialState();
    state.currencyCents = 5_000_000_00;
    state.enjoymentCents = 5_000_000_00;
    // Only quartz tier unlocked
    state.catalogTierUnlocks = ["quartz"];

    const reachability = getCatalogModelPurchaseReachability(state, CLASSIC_MODEL_ID);

    expect(reachability.tierUnlocked).toBe(false);
    expect(reachability.gate.ok).toBe(true);
    expect(reachability.buyActionReachable).toBe(false);
    expect(canReachCatalogBuyAction(state, CLASSIC_MODEL_ID)).toBe(false);
  });

  it("treats unlocked, affordable entries as buy-action reachable", () => {
    const state = createInitialState();
    state.currencyCents = 5_000_000_00;
    state.enjoymentCents = 5_000_000_00;
    state.catalogTierUnlocks = ["quartz", "automatic", "manual", "tourbillon"];
    state.watchModels = {
      ...state.watchModels,
      [CLASSIC_MODEL_ID]: 0,
    };

    const reachability = getCatalogModelPurchaseReachability(state, CLASSIC_MODEL_ID);

    expect(reachability.buyActionReachable).toBe(true);
    expect(canReachCatalogUnownedBuyAction(state, CLASSIC_MODEL_ID)).toBe(true);
    expect(hasCatalogReadyUnownedModel(state)).toBe(true);
  });

  it("keeps tab-level readiness when an entry is unowned but not yet affordable", () => {
    const state = createInitialState();
    state.currencyCents = 0;
    state.enjoymentCents = 0;
    state.catalogTierUnlocks = ["quartz", "automatic", "manual", "tourbillon"];
    state.watchModels = {
      ...state.watchModels,
      [CLASSIC_MODEL_ID]: 0,
    };

    expect(canReachCatalogBuyAction(state, CLASSIC_MODEL_ID)).toBe(false);
    expect(canReachCatalogUnownedBuyAction(state, CLASSIC_MODEL_ID)).toBe(false);
    expect(hasCatalogReadyUnownedModel(state)).toBe(true);
  });

  it("excludes already-owned entries from unowned readiness", () => {
    const state = createInitialState();
    state.currencyCents = 5_000_000_00;
    state.enjoymentCents = 5_000_000_00;
    state.catalogTierUnlocks = ["quartz", "automatic", "manual", "tourbillon"];
    state.watchModels = {
      ...state.watchModels,
      [CLASSIC_MODEL_ID]: 1,
    };

    expect(canReachCatalogBuyAction(state, CLASSIC_MODEL_ID)).toBe(true);
    expect(canReachCatalogUnownedBuyAction(state, CLASSIC_MODEL_ID)).toBe(false);
    // There are still other unowned models from unlocked tiers
    expect(hasCatalogReadyUnownedModel(state)).toBe(true);
  });
});
