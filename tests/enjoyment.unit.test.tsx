import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getDuplicateRewardSum,
  getEnjoymentRateCentsPerSec,
  getPrestigeLegacyMultiplier,
  getWatchItemEnjoymentRateCentsPerSec,
  getWatchModels,
  getWatchItems,
} from "../src/game/state";

function getModelIdForTier(tierId: string): string {
  const model = getWatchModels().find((entry) => entry.tierId === tierId);
  if (!model) {
    throw new Error(`Missing model for tier: ${tierId}`);
  }
  return model.id;
}

function getTierEnjoymentRate(tierId: string): number {
  const item = getWatchItems().find((entry) => entry.id === tierId);
  if (!item) {
    throw new Error(`Missing item for tier: ${tierId}`);
  }
  return getWatchItemEnjoymentRateCentsPerSec(item);
}

describe("enjoyment tiers", () => {
  it("sums per-item enjoyment rates", () => {
    const baseState = createInitialState();
    const starterModelId = getModelIdForTier("starter");
    const classicModelId = getModelIdForTier("classic");
    const chronographModelId = getModelIdForTier("chronograph");
    const tourbillonModelId = getModelIdForTier("tourbillon");
    const seededState = {
      ...baseState,
      watchModels: {
        ...baseState.watchModels,
        [starterModelId]: 3,
        [classicModelId]: 2,
        [chronographModelId]: 1,
        [tourbillonModelId]: 1,
      },
    };

    const enjoymentRates = new Map(
      getWatchItems().map((item) => [item.id, getWatchItemEnjoymentRateCentsPerSec(item)]),
    );

    const expected =
      (enjoymentRates.get("starter") ?? 0) * getDuplicateRewardSum(3) +
      (enjoymentRates.get("classic") ?? 0) * getDuplicateRewardSum(2) +
      (enjoymentRates.get("chronograph") ?? 0) * getDuplicateRewardSum(1) +
      (enjoymentRates.get("tourbillon") ?? 0) * getDuplicateRewardSum(1);

    expect(getEnjoymentRateCentsPerSec(seededState)).toBe(expected);
  });

  it("scales enjoyment by watch tier", () => {
    const enjoymentRates = new Map(
      getWatchItems().map((item) => [item.id, getWatchItemEnjoymentRateCentsPerSec(item)]),
    );

    const starterRate = enjoymentRates.get("starter") ?? 0;
    const classicRate = enjoymentRates.get("classic") ?? 0;
    const chronographRate = enjoymentRates.get("chronograph") ?? 0;
    const tourbillonRate = enjoymentRates.get("tourbillon") ?? 0;

    expect(starterRate).toBeLessThan(classicRate);
    expect(classicRate).toBeLessThan(chronographRate);
    expect(chronographRate).toBeLessThan(tourbillonRate);
  });

  it("scales enjoyment/sec by the prestige legacy multiplier", () => {
    const baseState = createInitialState();
    const classicModelId = getModelIdForTier("classic");
    const seededState = {
      ...baseState,
      watchModels: {
        ...baseState.watchModels,
        [classicModelId]: 2,
      },
      workshopPrestigeCount: 2,
    };

    const baseRate = getTierEnjoymentRate("classic") * getDuplicateRewardSum(2);

    const legacyMultiplier = getPrestigeLegacyMultiplier(seededState);
    expect(legacyMultiplier).toBeGreaterThan(1);
    expect(getEnjoymentRateCentsPerSec(seededState)).toBeCloseTo(baseRate * legacyMultiplier, 8);
  });

  it("gives smaller enjoyment gains for duplicate copies", () => {
    const baseState = createInitialState();
    const classicModelId = getModelIdForTier("classic");
    const firstState = {
      ...baseState,
      watchModels: {
        ...baseState.watchModels,
        [classicModelId]: 1,
      },
    };
    const secondState = {
      ...baseState,
      watchModels: {
        ...baseState.watchModels,
        [classicModelId]: 2,
      },
    };

    const firstRate = getEnjoymentRateCentsPerSec(firstState);
    const secondRate = getEnjoymentRateCentsPerSec(secondState);
    const firstDelta = firstRate;
    const secondDelta = secondRate - firstRate;

    expect(secondDelta).toBeGreaterThan(0);
    expect(secondDelta).toBeLessThan(firstDelta);
  });
});
