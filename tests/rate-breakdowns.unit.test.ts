import { describe, expect, it } from "vitest";

import {
  getAffordabilityEtaSecondsForDeficit,
  createInitialState,
  getCashRateBreakdown,
  getEffectiveCashRateCentsPerSec,
  getEnjoymentRateBreakdown,
  getEnjoymentRateCentsPerSec,
  getResourceDeficit,
  getTherapistSessionPolicy,
  getWornWatchEnjoymentMultiplier,
  getWatchModels,
  performTherapistSession,
} from "../src/game/state";

describe("rate breakdown selectors", () => {
  it("computes resource deficits with non-negative clamping", () => {
    expect(getResourceDeficit(10_000, 6_000)).toBe(4_000);
    expect(getResourceDeficit(10_000, 10_000)).toBe(0);
    expect(getResourceDeficit(10_000, 12_000)).toBe(0);
    expect(getResourceDeficit(Number.NaN, 1_000)).toBe(0);
  });

  it("computes affordability ETA with zero and unavailable rate handling", () => {
    expect(getAffordabilityEtaSecondsForDeficit(0, 250)).toBe(0);
    expect(getAffordabilityEtaSecondsForDeficit(1_000, 250)).toBe(4);
    expect(getAffordabilityEtaSecondsForDeficit(1_000, 0)).toBeNull();
    expect(getAffordabilityEtaSecondsForDeficit(999, 250)).toBe(4);
    expect(getAffordabilityEtaSecondsForDeficit(1_001, 250)).toBe(5);
  });

  it("omits worn-watch term when wear none", () => {
    const baseState = createInitialState();
    const breakdown = getEnjoymentRateBreakdown(baseState, 1);
    expect(breakdown.multiplierTerms.some((term) => term.id === "worn-watch")).toBe(false);
  });

  it("uses correct worn multipliers per bucket and reflects them in the breakdown", () => {
    const baseState = createInitialState();
    const watchModels = getWatchModels();

    const buckets = [
      { tierId: "quartz" as const, expectedMultiplier: 1.02 },
      { tierId: "automatic" as const, expectedMultiplier: 1.05 },
      { tierId: "manual" as const, expectedMultiplier: 1.08 },
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
    const starterModel = watchModels.find((entry) => entry.tierId === "quartz");
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
        quartz: 10,
        automatic: 3,
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
    const nowMs = 1_700_000_000_000;
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 25,
        automatic: 8,
        manual: 2,
      },
      upgrades: {
        ...baseState.upgrades,
        "polishing-tools": 2,
      },
      workshopPrestigeCount: 1,
      therapistCareer: {
        ...baseState.therapistCareer,
        careerStartId: "phd-program" as const,
        activeTrackId: "private-practice" as const,
        salaryActiveUntilMs: nowMs + 300_000,
        level: 3,
      },
    };

    const eventMultiplier = 1.25;
    const breakdown = getCashRateBreakdown(seededState, nowMs, eventMultiplier);

    expect(breakdown.totalCentsPerSec).toBeCloseTo(
      getEffectiveCashRateCentsPerSec(seededState, nowMs, eventMultiplier),
      6,
    );
    expect(breakdown.careerAddends.some((term) => term.id === "career-salary")).toBe(true);
    expect(breakdown.multiplierTerms.some((term) => term.id === "event")).toBe(true);
    const eventTerm = breakdown.multiplierTerms.find((term) => term.id === "event");
    expect(eventTerm?.multiplier).toBe(eventMultiplier);
    expect(breakdown.sessionCadence.supportsSessions).toBe(true);
    expect(breakdown.sessionCadence.cadenceCentsPerSec).toBeGreaterThan(0);
    expect(breakdown.sessionCadence.cooldownMs).toBeGreaterThan(0);
  });

  it("keeps premium decay semantics consistent across policy and breakdowns", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      enjoymentCents: 20_000,
      therapistCareer: {
        ...baseState.therapistCareer,
        careerStartId: "phd-program" as const,
        activeTrackId: "private-practice" as const,
        freeSessionAvailable: false,
        nextAvailableAtMs: 0,
      },
    };
    const firstNow = 0;
    const firstPolicy = getTherapistSessionPolicy(seededState, firstNow);
    const afterFirst = performTherapistSession(seededState, firstNow);
    const rushNow = firstNow + Math.max(1, Math.floor(firstPolicy.cooldownMs / 2));
    const rampPolicy = getTherapistSessionPolicy(afterFirst, rushNow);
    const rampBreakdown = getCashRateBreakdown(afterFirst, rushNow, 1);

    expect(rampPolicy.premiumCount).toBe(1);
    expect(rampPolicy.premiumLabel).toBe("Second session premium");
    expect(rampPolicy.premiumNote).toBe("Session cost drops one tier each cooldown interval.");
    expect(rampPolicy.cooldownRemainingMs).toBeGreaterThan(0);
    expect(rampPolicy.cooldownRushMultiplier).toBe(1);
    expect(rampPolicy.cooldownRushExtraCents).toBe(0);
    expect(rampPolicy.effectiveEnjoymentCostCents).toBe(
      rampPolicy.premiumEnjoymentCostCents + rampPolicy.cooldownRushExtraCents,
    );
    expect(rampBreakdown.sessionCadence.enjoymentCostCents).toBe(
      rampPolicy.effectiveEnjoymentCostCents,
    );
    expect(rampBreakdown.sessionCadence.cooldownRemainingMs).toBe(rampPolicy.cooldownRemainingMs);

    const readyNow = rushNow + firstPolicy.cooldownMs;
    const readyPolicy = getTherapistSessionPolicy(afterFirst, readyNow);
    const readyBreakdown = getCashRateBreakdown(afterFirst, readyNow, 1);

    expect(readyPolicy.premiumCount).toBe(0);
    expect(readyPolicy.cooldownRemainingMs).toBe(0);
    expect(readyPolicy.cooldownRushMultiplier).toBe(1);
    expect(readyPolicy.cooldownRushExtraCents).toBe(0);
    expect(readyPolicy.effectiveEnjoymentCostCents).toBe(readyPolicy.enjoymentCostCents);
    expect(readyBreakdown.sessionCadence.enjoymentCostCents).toBe(
      readyPolicy.effectiveEnjoymentCostCents,
    );
    expect(readyBreakdown.sessionCadence.cooldownRemainingMs).toBe(0);
  });
});
