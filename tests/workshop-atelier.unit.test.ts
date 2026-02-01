import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getPrestigeLegacyMultiplier,
  getWorkshopNextBlueprintProgress,
  getWorkshopPrestigeThresholdCents,
} from "../src/game/state";

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

  it("boosts legacy after first workshop prestige and respects the cap", () => {
    const baseState = createInitialState();
    const firstPrestige = getPrestigeLegacyMultiplier({
      ...baseState,
      workshopPrestigeCount: 1,
    });
    expect(firstPrestige).toBeGreaterThanOrEqual(2);

    const capped = getPrestigeLegacyMultiplier({
      ...baseState,
      workshopPrestigeCount: 200,
      maisonHeritage: 200,
    });
    expect(capped).toBeLessThanOrEqual(10);
  });
});
