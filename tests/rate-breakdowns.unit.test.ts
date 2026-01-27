import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getCashRateBreakdown,
  getEnjoymentRateBreakdown,
  getEnjoymentRateCentsPerSec,
  getTotalCashRateCentsPerSec,
} from "../src/game/state";

describe("rate breakdown selectors", () => {
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

  it("matches cash rate totals and includes softcap efficiency + therapist addend", () => {
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

    const eventMultiplier = 1.2;
    const breakdown = getCashRateBreakdown(seededState, eventMultiplier);

    expect(breakdown.totalCentsPerSec).toBeCloseTo(
      getTotalCashRateCentsPerSec(seededState, eventMultiplier),
      6,
    );

    expect(breakdown.softcapEfficiency).toBeGreaterThanOrEqual(0);
    expect(breakdown.softcapEfficiency).toBeLessThanOrEqual(1);

    expect(breakdown.therapistAddends.some((term) => term.id === "therapist-salary")).toBe(true);
  });
});
