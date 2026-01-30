import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getCashRateBreakdown,
  getEffectiveCashRateCentsPerSec,
  getEnjoymentRateBreakdown,
  getEnjoymentRateCentsPerSec,
  getWornWatchEnjoymentMultiplier,
  getWatchModels,
} from "../src/game/state";

describe("rate breakdown selectors", () => {
  it("omits worn-watch term when wear none", () => {
    const baseState = createInitialState();
    const breakdown = getEnjoymentRateBreakdown(baseState, 1);
    expect(breakdown.multiplierTerms.some((term) => term.id === "worn-watch")).toBe(false);
  });

  it("uses correct worn multipliers per bucket and reflects them in the breakdown", () => {
    const baseState = createInitialState();
    const watchModels = getWatchModels();

    const buckets = [
      { tierId: "starter" as const, expectedMultiplier: 1.02 },
      { tierId: "classic" as const, expectedMultiplier: 1.05 },
      { tierId: "chronograph" as const, expectedMultiplier: 1.08 },
      { tierId: "tourbillon" as const, expectedMultiplier: 1.12 },
    ];

    for (const { tierId, expectedMultiplier } of buckets) {
      const model = watchModels.find((entry) => entry.tierId === tierId);
      expect(model).toBeTruthy();
      if (!model) {
        continue;
      }

      const state = {
        ...baseState,
        wornWatchId: model.id,
        watchModels: {
          ...baseState.watchModels,
          [model.id]: 1,
        },
      };

      expect(getWornWatchEnjoymentMultiplier(state)).toBe(expectedMultiplier);

      const breakdown = getEnjoymentRateBreakdown(state, 1);
      const wornTerms = breakdown.multiplierTerms.filter((term) => term.id === "worn-watch");
      expect(wornTerms).toHaveLength(1);
      expect(wornTerms[0]?.multiplier).toBe(expectedMultiplier);
    }
  });

  it("updates worn-watch term when switching worn watch", () => {
    const baseState = createInitialState();
    const watchModels = getWatchModels();
    const starterModel = watchModels.find((entry) => entry.tierId === "starter");
    const tourbillonModel = watchModels.find((entry) => entry.tierId === "tourbillon");

    expect(starterModel).toBeTruthy();
    expect(tourbillonModel).toBeTruthy();
    if (!starterModel || !tourbillonModel) {
      return;
    }

    const withStarter = {
      ...baseState,
      wornWatchId: starterModel.id,
      watchModels: {
        ...baseState.watchModels,
        [starterModel.id]: 1,
        [tourbillonModel.id]: 1,
      },
    };

    const withTourbillon = {
      ...withStarter,
      wornWatchId: tourbillonModel.id,
    };

    const starterTerm = getEnjoymentRateBreakdown(withStarter, 1).multiplierTerms.find(
      (term) => term.id === "worn-watch",
    );
    const tourbillonTerm = getEnjoymentRateBreakdown(withTourbillon, 1).multiplierTerms.find(
      (term) => term.id === "worn-watch",
    );

    expect(starterTerm?.multiplier).toBe(1.02);
    expect(tourbillonTerm?.multiplier).toBe(1.12);
  });

  it("includes event multiplier and matches enjoyment rate under events", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 10,
        classic: 3,
      },
      workshopPrestigeCount: 1,
    };

    const eventMultiplier = 1.15;
    const breakdown = getEnjoymentRateBreakdown(seededState, eventMultiplier);

    expect(breakdown.multiplierTerms.some((term) => term.id === "event")).toBe(true);
    expect(breakdown.effectiveCentsPerSec).toBeCloseTo(
      getEnjoymentRateCentsPerSec(seededState) * eventMultiplier,
      8,
    );
  });

  it("matches cash rate totals and includes career salary addend", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 25,
        classic: 8,
        chronograph: 2,
      },
      upgrades: {
        ...baseState.upgrades,
        "polishing-tools": 2,
      },
      workshopPrestigeCount: 1,
      therapistCareer: {
        ...baseState.therapistCareer,
        level: 3,
      },
    };

    const breakdown = getCashRateBreakdown(seededState);

    expect(breakdown.totalCentsPerSec).toBeCloseTo(
      getEffectiveCashRateCentsPerSec(seededState, 1),
      6,
    );
    expect(breakdown.careerAddends.some((term) => term.id === "career-salary")).toBe(true);
    expect(breakdown.multiplierTerms.some((term) => term.id === "event")).toBe(true);
  });
});
