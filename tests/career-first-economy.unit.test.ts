import { describe, expect, it } from "vitest";

import { formatMoneyFromCents } from "../src/game/format";

import {
  canPerformTherapistSession,
  createInitialState,
  getCashRateBreakdown,
  getEffectiveCashRateCentsPerSec,
  getEventIncomeMultiplier,
  getTherapistSessionCostLabel,
  getTherapistSessionPolicy,
  getTotalCashRateCentsPerSec,
  getWatchModels,
  performTherapistSession,
} from "../src/game/state";
import type { CareerTrackId } from "../src/game/model/types";

describe("career-first economy", () => {
  it("keeps cash rate tied to career only, even with watches and events", () => {
    const nowMs = 1_700_000_000_000;
    const baseStateRaw = createInitialState();
    const baseState = {
      ...baseStateRaw,
      therapistCareer: {
        ...baseStateRaw.therapistCareer,
        careerStartId: "phd-program" as const,
        salaryActiveUntilMs: nowMs + 300_000,
      },
    };
    const [firstModel] = getWatchModels();
    const stateWithWatches = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 12,
        automatic: 4,
        manual: 2,
      },
      watchModels: firstModel
        ? { ...baseState.watchModels, [firstModel.id]: 2 }
        : baseState.watchModels,
      eventStates: {
        ...baseState.eventStates,
        "auction-weekend": {
          activeUntilMs: nowMs + 60_000,
          nextAvailableAtMs: 0,
          incomeMultiplier: 2.2,
        },
      },
    };

    const baseRate = getTotalCashRateCentsPerSec(baseState, nowMs);
    const watchRate = getTotalCashRateCentsPerSec(stateWithWatches, nowMs);

    expect(getEventIncomeMultiplier(baseState, nowMs)).toBe(1);
    expect(getEventIncomeMultiplier(stateWithWatches, nowMs)).toBeGreaterThan(1);
    expect(watchRate).toBeCloseTo(baseRate, 6);

    const eventMultiplier = getEventIncomeMultiplier(stateWithWatches, nowMs);
    const effectiveRate = getEffectiveCashRateCentsPerSec(stateWithWatches, nowMs, eventMultiplier);

    expect(effectiveRate).toBeCloseTo(baseRate * eventMultiplier, 6);

    const breakdown = getCashRateBreakdown(stateWithWatches, nowMs, eventMultiplier);
    expect(breakdown.totalCentsPerSec).toBeCloseTo(effectiveRate, 6);
  });

  it("runs sessions during cooldown when the rush-adjusted cost is affordable", () => {
    const baseState = createInitialState();
    const nowMs = 0;
    const sessionState = {
      ...baseState,
      enjoymentCents: 10_000,
      therapistCareer: {
        ...baseState.therapistCareer,
        careerStartId: "phd-program" as const,
        activeTrackId: "private-practice" as CareerTrackId,
        nextAvailableAtMs: 0,
        freeSessionAvailable: true,
      },
    };

    expect(canPerformTherapistSession(sessionState, nowMs)).toBe(true);

    const afterSession = performTherapistSession(sessionState, nowMs);
    const policy = getTherapistSessionPolicy(sessionState, nowMs);
    const cooldownNow = nowMs + Math.max(1, Math.floor(policy.cooldownMs / 2));
    const cooldownRushPolicy = getTherapistSessionPolicy(afterSession, cooldownNow);
    const readyNow = nowMs + policy.cooldownMs;
    const readyPolicy = getTherapistSessionPolicy(afterSession, readyNow);

    expect(afterSession.therapistCareer.freeSessionAvailable).toBe(false);
    expect(afterSession.enjoymentCents).toBe(sessionState.enjoymentCents);
    expect(cooldownRushPolicy.premiumCount).toBe(1);
    expect(cooldownRushPolicy.cooldownRemainingMs).toBeGreaterThan(0);
    expect(cooldownRushPolicy.cooldownRushExtraCents).toBeGreaterThan(0);
    expect(cooldownRushPolicy.effectiveEnjoymentCostCents).toBeGreaterThan(
      cooldownRushPolicy.premiumEnjoymentCostCents,
    );
    expect(readyPolicy.premiumCount).toBe(1);
    expect(readyPolicy.cooldownRemainingMs).toBe(0);
    expect(readyPolicy.cooldownRushExtraCents).toBe(0);
    expect(readyPolicy.effectiveEnjoymentCostCents).toBe(readyPolicy.premiumEnjoymentCostCents);
    expect(getTherapistSessionCostLabel(afterSession, cooldownNow)).toBe(
      `${formatMoneyFromCents(cooldownRushPolicy.effectiveEnjoymentCostCents)} enjoyment (includes cooldown rush fee)`,
    );
    expect(getTherapistSessionCostLabel(afterSession, readyNow)).toBe(
      `${formatMoneyFromCents(readyPolicy.effectiveEnjoymentCostCents)} enjoyment`,
    );

    const affordableDuringCooldown = {
      ...afterSession,
      enjoymentCents: cooldownRushPolicy.effectiveEnjoymentCostCents,
    };
    expect(canPerformTherapistSession(affordableDuringCooldown, cooldownNow)).toBe(true);

    const afterRushSession = performTherapistSession(affordableDuringCooldown, cooldownNow);
    expect(afterRushSession).not.toBe(affordableDuringCooldown);
    expect(afterRushSession.enjoymentCents).toBe(0);
    expect(afterRushSession.currencyCents).toBe(
      affordableDuringCooldown.currencyCents + cooldownRushPolicy.cashPayoutCents,
    );
    expect(afterRushSession.therapistCareer.sessionPremiumCount).toBe(2);
  });

  it("blocks cooldown rush when the rush-adjusted cost is not affordable", () => {
    const baseState = createInitialState();
    const nowMs = 0;
    const sessionState = {
      ...baseState,
      enjoymentCents: 10_000,
      therapistCareer: {
        ...baseState.therapistCareer,
        careerStartId: "phd-program" as const,
        activeTrackId: "private-practice" as CareerTrackId,
        nextAvailableAtMs: 0,
        freeSessionAvailable: true,
      },
    };

    const afterSession = performTherapistSession(sessionState, nowMs);
    const policy = getTherapistSessionPolicy(sessionState, nowMs);
    const cooldownNow = nowMs + Math.max(1, Math.floor(policy.cooldownMs / 2));
    const cooldownRushPolicy = getTherapistSessionPolicy(afterSession, cooldownNow);

    expect(cooldownRushPolicy.effectiveEnjoymentCostCents).toBeGreaterThan(0);

    const lowEnjoymentState = {
      ...afterSession,
      enjoymentCents: cooldownRushPolicy.effectiveEnjoymentCostCents - 1,
    };

    expect(canPerformTherapistSession(lowEnjoymentState, cooldownNow)).toBe(false);
    expect(getTherapistSessionCostLabel(lowEnjoymentState, cooldownNow)).toContain(
      "includes cooldown rush fee",
    );
    expect(performTherapistSession(lowEnjoymentState, cooldownNow)).toBe(lowEnjoymentState);
  });

  it("allows therapist sessions across tracks", () => {
    const baseState = createInitialState();
    const nowMs = 1_700_000_000_000;
    const sessionState = {
      ...baseState,
      enjoymentCents: 10_000,
      therapistCareer: {
        ...baseState.therapistCareer,
        careerStartId: "phd-program" as const,
        activeTrackId: "va-hospital" as CareerTrackId,
        nextAvailableAtMs: 0,
        freeSessionAvailable: true,
      },
    };

    expect(canPerformTherapistSession(sessionState, nowMs)).toBe(true);
    expect(performTherapistSession(sessionState, nowMs)).not.toBe(sessionState);
  });
});
