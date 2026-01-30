import { describe, expect, it } from "vitest";

import { decodeSaveString, encodeSaveString } from "../src/game/persistence";

import {
  createInitialState,
  applyEventState,
  getCollectionValueCents,
  getEventIncomeMultiplier,
  getEnjoymentRateCentsPerSec,
  getTherapistCashRateCentsPerSec,
  getTherapistSessionCashPayoutCents,
  getTherapistSessionEnjoymentCostCents,
  getTotalCashRateCentsPerSec,
  getTherapistXpRequiredForNextLevel,
  getWatchModels,
  performTherapistSession,
} from "../src/game/state";

import { step } from "../src/game/sim";

describe("therapist career", () => {
  it("starts with defaults on a fresh state", () => {
    const state = createInitialState();
    expect(state.therapistCareer.level).toBe(1);
    expect(state.therapistCareer.xp).toBe(0);
    expect(state.therapistCareer.nextAvailableAtMs).toBe(0);
  });

  it("spends enjoyment to earn cash + XP", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      enjoymentCents: 10_000,
      therapistCareer: {
        ...baseState.therapistCareer,
        activeTrackId: "private-practice" as const,
        freeSessionAvailable: false,
      },
    };

    const nowMs = 1_000;
    const payout = getTherapistSessionCashPayoutCents(
      seededState.therapistCareer.level,
      seededState.therapistCareer.activeTrackId,
    );
    const cost = getTherapistSessionEnjoymentCostCents(
      seededState.therapistCareer.level,
      seededState.therapistCareer.activeTrackId,
    );

    const nextState = performTherapistSession(seededState, nowMs);

    expect(nextState.currencyCents).toBe(seededState.currencyCents + payout);
    expect(nextState.enjoymentCents).toBe(seededState.enjoymentCents - cost);
    expect(nextState.therapistCareer.xp).toBeGreaterThan(0);
    expect(nextState.therapistCareer.nextAvailableAtMs).toBeGreaterThan(nowMs);
  });

  it("advances levels when crossing XP thresholds", () => {
    const baseState = createInitialState();
    const required = getTherapistXpRequiredForNextLevel(1);
    const seededState = {
      ...baseState,
      enjoymentCents: 10_000,
      therapistCareer: {
        ...baseState.therapistCareer,
        activeTrackId: "private-practice" as const,
        freeSessionAvailable: false,
        level: 1,
        xp: required,
        nextAvailableAtMs: 0,
      },
    };

    const nextState = performTherapistSession(seededState, 1_000);
    expect(nextState.therapistCareer.level).toBeGreaterThanOrEqual(2);
  });

  it("runs a free first session after reset", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      enjoymentCents: 2_000,
      therapistCareer: {
        ...baseState.therapistCareer,
        activeTrackId: "private-practice" as const,
        freeSessionAvailable: true,
      },
    };

    const nextState = performTherapistSession(seededState, 1_000);

    expect(nextState.enjoymentCents).toBe(seededState.enjoymentCents);
    expect(nextState.therapistCareer.freeSessionAvailable).toBe(false);
  });

  it("adds passive salary to cash rate and sim ticks", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      therapistCareer: {
        ...baseState.therapistCareer,
        level: 2,
      },
    };

    const therapistRate = getTherapistCashRateCentsPerSec(seededState);
    expect(therapistRate).toBeGreaterThan(0);

    const totalRate = getTotalCashRateCentsPerSec(seededState);
    const nextState = step(seededState, 1_000, 0);
    expect(nextState.currencyCents).toBe(seededState.currencyCents + totalRate);
  });

  it("applies event multiplier to cash accrual in sim", () => {
    const baseState = createInitialState();
    const nowMs = 1_700_000_000_000;
    const seededState = {
      ...baseState,
      therapistCareer: {
        ...baseState.therapistCareer,
        level: 2,
      },
      eventStates: {
        ...baseState.eventStates,
        "auction-weekend": {
          activeUntilMs: nowMs + 60_000,
          nextAvailableAtMs: 0,
          incomeMultiplier: 1.15,
        },
      },
    };

    const withEvents = applyEventState(seededState, nowMs, getCollectionValueCents(seededState));
    const eventMultiplier = getEventIncomeMultiplier(withEvents, nowMs);
    const expected = getTotalCashRateCentsPerSec(withEvents) * eventMultiplier;

    const nextState = step(seededState, 1_000, nowMs);
    const actualDelta = nextState.currencyCents - seededState.currencyCents;

    expect(actualDelta).toBeGreaterThanOrEqual(expected - 1);
    expect(actualDelta).toBeLessThanOrEqual(expected + 1);
  });

  it("matches enjoyment accrual with upgrades under events", () => {
    const baseState = createInitialState();
    const nowMs = 1_700_000_000_000;
    const [firstModel] = getWatchModels();

    expect(firstModel).toBeTruthy();
    if (!firstModel) {
      return;
    }

    const seededState = {
      ...baseState,
      watchModels: {
        ...baseState.watchModels,
        [firstModel.id]: 2,
      },
    };
    const eventStates = {
      ...baseState.eventStates,
      "auction-weekend": {
        activeUntilMs: nowMs + 60_000,
        nextAvailableAtMs: 0,
        incomeMultiplier: 1.15,
      },
    };

    const withoutUpgrade = {
      ...seededState,
      eventStates,
    };
    const withUpgrade = {
      ...seededState,
      upgrades: {
        ...seededState.upgrades,
        "polishing-tools": 1,
      },
      eventStates,
    };

    expect(getEnjoymentRateCentsPerSec(withUpgrade)).not.toBe(
      getEnjoymentRateCentsPerSec(withoutUpgrade),
    );

    const withEvents = applyEventState(withUpgrade, nowMs, getCollectionValueCents(withUpgrade));
    const eventMultiplier = getEventIncomeMultiplier(withEvents, nowMs);

    const nextState = step(withUpgrade, 1_000, nowMs);
    const actualDelta = nextState.enjoymentCents - withUpgrade.enjoymentCents;
    const expected = getEnjoymentRateCentsPerSec(withEvents) * eventMultiplier;

    expect(actualDelta).toBeGreaterThanOrEqual(expected - 1);
    expect(actualDelta).toBeLessThanOrEqual(expected + 1);
  });
});

describe("therapist persistence", () => {
  it("round-trips therapist state through save encode/decode", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      therapistCareer: {
        ...baseState.therapistCareer,
        level: 3,
        xp: 12,
        nextAvailableAtMs: 99_000,
        activeTrackId: "private-practice" as const,
        pointsAvailable: 2,
        spentNodes: {
          "core-foundation": true,
          "private-intake": true,
        },
        freeSessionAvailable: false,
      },
    };

    const encoded = encodeSaveString(seededState, 0, new Date(0));
    const decoded = decodeSaveString(encoded);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) {
      return;
    }

    expect(decoded.save.state.therapistCareer.level).toBe(3);
    expect(decoded.save.state.therapistCareer.xp).toBe(12);
    expect(decoded.save.state.therapistCareer.nextAvailableAtMs).toBe(99_000);
    expect(decoded.save.state.therapistCareer.activeTrackId).toBe("private-practice");
    expect(decoded.save.state.therapistCareer.pointsAvailable).toBe(2);
    expect(decoded.save.state.therapistCareer.spentNodes).toEqual({
      "core-foundation": true,
      "private-intake": true,
    });
    expect(decoded.save.state.therapistCareer.freeSessionAvailable).toBe(false);
  });

  it("defaults therapist fields when missing from payload", () => {
    const baseState = createInitialState();

    const { therapistCareer, ...stateWithoutTherapist } = baseState;
    void therapistCareer;

    const raw = JSON.stringify({
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: 0,
      state: stateWithoutTherapist,
    });

    const decoded = decodeSaveString(raw);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) {
      return;
    }

    expect(decoded.save.state.therapistCareer.level).toBe(1);
    expect(decoded.save.state.therapistCareer.xp).toBe(0);
    expect(decoded.save.state.therapistCareer.nextAvailableAtMs).toBe(0);
    expect(decoded.save.state.therapistCareer.activeTrackId).toBeNull();
    expect(decoded.save.state.therapistCareer.pointsAvailable).toBe(1);
    expect(decoded.save.state.therapistCareer.spentNodes).toEqual({});
    expect(decoded.save.state.therapistCareer.freeSessionAvailable).toBe(true);
  });
});
