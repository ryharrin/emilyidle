import { describe, expect, it } from "vitest";

import { createInitialState, getWatchModels } from "../src/game/state";
import { getTabReadiness } from "../src/ui/navigation/tabReadiness";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

describe("tab readiness catalog contract", () => {
  it("shows catalog readiness when there is an unlocked unowned reference", () => {
    const state = createInitialState();
    state.catalogTierUnlocks = ["quartz", "automatic", "manual", "tourbillon"];
    state.watchModels = {
      ...state.watchModels,
      [CLASSIC_MODEL_ID]: 0,
    };

    const readiness = getTabReadiness(state, Date.now());
    expect(readiness.catalog).toEqual({ label: "New watch affordable" });
  });

  it("hides catalog readiness when all models are owned", () => {
    const state = createInitialState();
    state.catalogTierUnlocks = ["quartz", "automatic", "manual", "tourbillon"];
    // Own all models
    const models = getWatchModels();
    for (const model of models) {
      state.watchModels = {
        ...state.watchModels,
        [model.id]: 1,
      };
    }

    const readiness = getTabReadiness(state, Date.now());
    expect(readiness.catalog).toBeNull();
  });
});
