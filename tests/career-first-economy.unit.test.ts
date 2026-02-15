import { describe, expect, it } from "vitest";

import { formatMoneyFromCents } from "../src/game/format";

import {
  canPerformTherapistSession,
  createInitialState,
  getCashRateBreakdown,
  getEffectiveCashRateCentsPerSec,
  getEventIncomeMultiplier,
  startCareerWithKickoffSession,
  getTherapistSessionCostLabel,
  getTherapistSessionPolicy,
  getTotalCashRateCentsPerSec,
  getWatchModels,
  performTherapistSession,
} from "../src/game/state";
import type { CareerTrackId } from "../src/game/model/types";
import { step } from "../src/game/sim";

describe("career-first economy", () => {
  it("kickstarts a fresh run with one free starter session", () => {
    const fresh = createInitialState();
    const nowMs = 1_000;

    const started = startCareerWithKickoffSession(fresh, nowMs);

    expect(started.therapistCareer.careerStartId).toBe("phd-program");
    expect(started.currencyCents).toBeGreaterThan(0);
    expect(started.therapistCareer.xp).toBeGreaterThan(0);
    expect(started.therapistCareer.nextAvailableAtMs).toBeGreaterThan(nowMs);
    expect(started.therapistCareer.freeSessionAvailable).toBe(false);
    expect(started.enjoymentCents).toBe(fresh.enjoymentCents);
  });

  it("starts with starter cash and keeps it unchanged before career start", () => {
    let state = createInitialState();
    const starterCashCents = state.currencyCents;
    expect(starterCashCents).toBeGreaterThan(0);
    expect(state.therapistCareer.careerStartId).toBeNull();
    expect(getTotalCashRateCentsPerSec(state, 0)).toBe(0);

    let nowMs = 0;
    for (let i = 0; i < 60; i += 1) {
      state = step(state, 1_000, nowMs);
      nowMs += 1_000;
    }

    expect(state.currencyCents).toBe(starterCashCents);
  });

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

  it("supports back-to-back sessions with escalating cost that decays over time", () => {
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
    const cooldownPolicy = getTherapistSessionPolicy(afterSession, cooldownNow);
    const readyNow = nowMs + policy.cooldownMs;
    const readyPolicy = getTherapistSessionPolicy(afterSession, readyNow);

    expect(afterSession.therapistCareer.freeSessionAvailable).toBe(false);
    expect(afterSession.enjoymentCents).toBe(sessionState.enjoymentCents);
    expect(cooldownPolicy.premiumCount).toBe(1);
    expect(cooldownPolicy.cooldownRemainingMs).toBeGreaterThan(0);
    expect(cooldownPolicy.cooldownRushExtraCents).toBe(0);
    expect(cooldownPolicy.effectiveEnjoymentCostCents).toBe(
      cooldownPolicy.premiumEnjoymentCostCents,
    );
    expect(readyPolicy.premiumCount).toBe(0);
    expect(readyPolicy.cooldownRemainingMs).toBe(0);
    expect(readyPolicy.cooldownRushExtraCents).toBe(0);
    expect(readyPolicy.effectiveEnjoymentCostCents).toBe(readyPolicy.premiumEnjoymentCostCents);
    expect(getTherapistSessionCostLabel(afterSession, cooldownNow)).toBe(
      `${formatMoneyFromCents(cooldownPolicy.effectiveEnjoymentCostCents)} enjoyment`,
    );
    expect(getTherapistSessionCostLabel(afterSession, readyNow)).toBe(
      `${formatMoneyFromCents(readyPolicy.effectiveEnjoymentCostCents)} enjoyment`,
    );

    const affordableDuringCooldown = {
      ...afterSession,
      enjoymentCents: cooldownPolicy.effectiveEnjoymentCostCents,
    };
    expect(canPerformTherapistSession(affordableDuringCooldown, cooldownNow)).toBe(true);

    const afterSecondSession = performTherapistSession(affordableDuringCooldown, cooldownNow);
    expect(afterSecondSession).not.toBe(affordableDuringCooldown);
    expect(afterSecondSession.enjoymentCents).toBe(0);
    expect(afterSecondSession.currencyCents).toBe(
      affordableDuringCooldown.currencyCents + cooldownPolicy.cashPayoutCents,
    );
    expect(afterSecondSession.therapistCareer.sessionPremiumCount).toBe(2);

    const decayNow = cooldownNow + policy.cooldownMs;
    const decayedPolicy = getTherapistSessionPolicy(afterSecondSession, decayNow);
    expect(decayedPolicy.premiumCount).toBe(1);
    expect(decayedPolicy.effectiveEnjoymentCostCents).toBeLessThan(
      getTherapistSessionPolicy(afterSecondSession, cooldownNow).effectiveEnjoymentCostCents,
    );
  });

  it("blocks sessions when the current premium-adjusted cost is not affordable", () => {
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
    const cooldownPolicy = getTherapistSessionPolicy(afterSession, cooldownNow);

    expect(cooldownPolicy.effectiveEnjoymentCostCents).toBeGreaterThan(0);

    const lowEnjoymentState = {
      ...afterSession,
      enjoymentCents: cooldownPolicy.effectiveEnjoymentCostCents - 1,
    };

    expect(canPerformTherapistSession(lowEnjoymentState, cooldownNow)).toBe(false);
    expect(getTherapistSessionCostLabel(lowEnjoymentState, cooldownNow)).toContain("enjoyment");
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
