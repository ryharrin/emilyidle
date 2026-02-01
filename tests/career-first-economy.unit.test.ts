import { describe, expect, it } from "vitest";

import {
  canPerformTherapistSession,
  createInitialState,
  getCashRateBreakdown,
  getEffectiveCashRateCentsPerSec,
  getEventIncomeMultiplier,
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
        starter: 12,
        classic: 4,
        chronograph: 2,
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

  it("honors free-first sessions and cooldown timing", () => {
    const baseState = createInitialState();
    const nowMs = 1_700_000_000_000;
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
    const policy = getTherapistSessionPolicy(sessionState);

    expect(afterSession.therapistCareer.freeSessionAvailable).toBe(false);
    expect(afterSession.enjoymentCents).toBe(sessionState.enjoymentCents);
    expect(canPerformTherapistSession(afterSession, nowMs + policy.cooldownMs - 1)).toBe(false);
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
