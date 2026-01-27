import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getEnjoymentRateCentsPerSec,
  getPrestigeLegacyMultiplier,
  getWatchItemEnjoymentRateCentsPerSec,
  getWatchItems,
} from "../src/game/state";

describe("enjoyment tiers", () => {
  it("sums per-item enjoyment rates", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 3,
        classic: 2,
        chronograph: 1,
        tourbillon: 1,
      },
    };

    const enjoymentRates = new Map(
      getWatchItems().map((item) => [item.id, getWatchItemEnjoymentRateCentsPerSec(item)]),
    );

    const expected =
      (enjoymentRates.get("starter") ?? 0) * 3 +
      (enjoymentRates.get("classic") ?? 0) * 2 +
      (enjoymentRates.get("chronograph") ?? 0) +
      (enjoymentRates.get("tourbillon") ?? 0);

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
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        classic: 2,
      },
      workshopPrestigeCount: 2,
    };

    const baseRate = getWatchItems().reduce(
      (total, item) =>
        total + (seededState.items[item.id] ?? 0) * getWatchItemEnjoymentRateCentsPerSec(item),
      0,
    );

    const legacyMultiplier = getPrestigeLegacyMultiplier(seededState);
    expect(legacyMultiplier).toBeGreaterThan(1);
    expect(getEnjoymentRateCentsPerSec(seededState)).toBeCloseTo(baseRate * legacyMultiplier, 8);
  });
});
