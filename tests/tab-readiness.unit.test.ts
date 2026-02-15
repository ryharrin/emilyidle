import { describe, expect, it } from "vitest";

import { createInitialState } from "../src/game/state";
import { getTabReadiness } from "../src/ui/navigation/tabReadiness";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

describe("tab readiness catalog contract", () => {
  it("shows catalog readiness when there is a discovered unowned reference", () => {
    const state = createInitialState();
    state.discoveredCatalogEntries = [CLASSIC_MODEL_ID];
    state.watchModels = {
      ...state.watchModels,
      [CLASSIC_MODEL_ID]: 0,
    };

    const readiness = getTabReadiness(state, Date.now());
    expect(readiness.catalog).toEqual({ label: "New watch affordable" });
  });

  it("hides catalog readiness when all discovered references are already owned", () => {
    const state = createInitialState();
    state.discoveredCatalogEntries = [CLASSIC_MODEL_ID];
    state.watchModels = {
      ...state.watchModels,
      [CLASSIC_MODEL_ID]: 1,
    };

    const readiness = getTabReadiness(state, Date.now());
    expect(readiness.catalog).toBeNull();
  });
});
