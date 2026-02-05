import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getPrestigeLegacyMultiplier,
  getPrestigeLegacyMultiplierBreakdown,
  getWorkshopNextBlueprintProgress,
  getWorkshopPrestigeThresholdCents,
  getWorkshopBlueprintCostDetail,
} from "../src/game/state";

describe("workshop atelier multiplier", () => {
  it("keeps the multiplier monotonic as prestige accumulates", () => {
    const baseState = createInitialState();
    let last = 0;

    for (let prestige = 0; prestige <= 10; prestige += 1) {
      const current = getPrestigeLegacyMultiplier({
        ...baseState,
        workshopPrestigeCount: prestige,
      });
      expect(current).toBeGreaterThanOrEqual(last);
      last = current;
    }
  });

  it("gives a noticeable boost after the first prestige", () => {
    const baseState = createInitialState();
    const firstPrestige = getPrestigeLegacyMultiplier({
      ...baseState,
      workshopPrestigeCount: 1,
    });
    expect(firstPrestige).toBeGreaterThanOrEqual(2.2);
  });

  it("reports components that multiply consistently with the final multiplier", () => {
    const baseState = createInitialState();
    const breakdown = getPrestigeLegacyMultiplierBreakdown({
      ...baseState,
      workshopPrestigeCount: 3,
      maisonHeritage: 2,
    });
    const rawProduct = breakdown.components.reduce(
      (product, component) => product * component.value,
      1,
    );
    expect(breakdown.rawMultiplier).toBe(rawProduct);
    expect(breakdown.multiplier01).toBe(Math.min(10, rawProduct));
    expect(breakdown.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "atelier-first" }),
        expect.objectContaining({ id: "atelier-compound" }),
        expect.objectContaining({ id: "maison-heritage" }),
      ]),
    );
  });
});

describe("workshop atelier progress", () => {
  it("keeps next-blueprint remaining monotonic below the first threshold", () => {
    const baseState = createInitialState();
    const threshold = getWorkshopPrestigeThresholdCents();
    const checkpoints = [0, threshold * 0.1, threshold * 0.3, threshold * 0.6, threshold * 0.9];
    let lastRemaining = Number.POSITIVE_INFINITY;

    for (const enjoyment of checkpoints) {
      const progress = getWorkshopNextBlueprintProgress(
        {
          ...baseState,
          enjoymentCents: Math.floor(enjoyment),
        },
        0,
      );
      expect(progress.enjoymentRemainingCents).toBeLessThanOrEqual(lastRemaining);
      lastRemaining = progress.enjoymentRemainingCents;
    }
  });

  it("returns null ETA and zero cash hint when enjoyment rate is zero", () => {
    const baseState = createInitialState();
    const progress = getWorkshopNextBlueprintProgress(
      {
        ...baseState,
        watchModels: {},
        enjoymentCents: Math.floor(getWorkshopPrestigeThresholdCents() * 0.5),
      },
      0,
    );

    expect(progress.etaSeconds).toBeNull();
    expect(progress.cashEarnedDuringEtaCents).toBe(0);
  });
});

describe("workshop blueprint cost detail", () => {
  it("keeps the next cost at least the current cost", () => {
    const detail = getWorkshopBlueprintCostDetail(createInitialState());
    expect(detail.nextCostCents).toBeGreaterThanOrEqual(detail.currentCostCents);
  });

  it("reports higher costs when enjoyment climbs", () => {
    const baseState = createInitialState();
    const baseDetail = getWorkshopBlueprintCostDetail(baseState);
    const elevated = {
      ...baseState,
      enjoymentCents: baseState.enjoymentCents + 2_000_000,
    };
    const higherDetail = getWorkshopBlueprintCostDetail(elevated);
    expect(higherDetail.currentCostCents).toBeGreaterThanOrEqual(baseDetail.currentCostCents);
    expect(higherDetail.nextCostCents).toBeGreaterThanOrEqual(baseDetail.nextCostCents);
    expect(higherDetail.deltaCents).toBeGreaterThanOrEqual(baseDetail.deltaCents);
  });
});
