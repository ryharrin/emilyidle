import { describe, expect, it } from "vitest";

import { decodeSaveString, encodeSaveString } from "../src/game/persistence";

import {
  createInitialState,
  getTherapistSessionCashPayoutCents,
  getTherapistSessionEnjoymentCostCents,
  getTherapistXpRequiredForNextLevel,
  performTherapistSession,
} from "../src/game/state";

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
    };

    const nowMs = 1_000;
    const payout = getTherapistSessionCashPayoutCents(seededState.therapistCareer.level);
    const cost = getTherapistSessionEnjoymentCostCents(seededState.therapistCareer.level);

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
        level: 1,
        xp: required,
        nextAvailableAtMs: 0,
      },
    };

    const nextState = performTherapistSession(seededState, 1_000);
    expect(nextState.therapistCareer.level).toBeGreaterThanOrEqual(2);
  });
});

describe("therapist persistence", () => {
  it("round-trips therapist state through save encode/decode", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      therapistCareer: {
        level: 3,
        xp: 12,
        nextAvailableAtMs: 99_000,
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
  });

  it("defaults therapist fields when missing from payload", () => {
    const baseState = createInitialState();

    const { therapistCareer: _therapistCareer, ...stateWithoutTherapist } = baseState;

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
  });
});
