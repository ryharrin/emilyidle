import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadSaveFromLocalStorage } from "../src/game/persistence";
import { step } from "../src/game/sim";
import { createInitialState } from "../src/game/state";

describe("offline and session-only progression guards", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("pauses timer-based progression while the app is closed", () => {
    const base = createInitialState();
    const anchorMs = 10_000;
    const nowMs = 50_000;
    const elapsedMs = nowMs - anchorMs;
    const seededState = {
      ...base,
      currencyCents: 12_345,
      enjoymentCents: 6_789,
      interactionNextAvailableAtMsByItem: {
        ...base.interactionNextAvailableAtMsByItem,
        quartz: 12_000,
      },
      eventStates: {
        ...base.eventStates,
        "auction-weekend": {
          activeUntilMs: 26_000,
          nextAvailableAtMs: 31_000,
          incomeMultiplier: 1.15,
        },
      },
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        salaryActiveUntilMs: 20_000,
        nextAvailableAtMs: 15_000,
        lastSessionAtMs: 9_000,
        level: 4,
        xp: 12,
        freeSessionAvailable: false,
      },
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(anchorMs).toISOString(),
        lastSimulatedAtMs: anchorMs,
        state: seededState,
      }),
    );
    vi.spyOn(Date, "now").mockReturnValue(nowMs);

    const loaded = loadSaveFromLocalStorage();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }

    expect(loaded.save.state.currencyCents).toBe(seededState.currencyCents);
    expect(loaded.save.state.enjoymentCents).toBe(seededState.enjoymentCents);
    expect(loaded.save.lastSimulatedAtMs).toBe(nowMs);
    expect(loaded.save.state.therapistCareer.level).toBe(seededState.therapistCareer.level);
    expect(loaded.save.state.therapistCareer.xp).toBe(seededState.therapistCareer.xp);
    expect(loaded.save.state.therapistCareer.salaryActiveUntilMs).toBe(20_000 + elapsedMs);
    expect(loaded.save.state.therapistCareer.nextAvailableAtMs).toBe(15_000 + elapsedMs);
    expect(loaded.save.state.therapistCareer.lastSessionAtMs).toBe(9_000 + elapsedMs);
    expect(loaded.save.state.interactionNextAvailableAtMsByItem.quartz).toBe(12_000 + elapsedMs);
    expect(loaded.save.state.eventStates["auction-weekend"]?.activeUntilMs).toBe(26_000 + elapsedMs);
    expect(loaded.save.state.eventStates["auction-weekend"]?.nextAvailableAtMs).toBe(31_000 + elapsedMs);

    const secondNowMs = 70_000;
    vi.spyOn(Date, "now").mockReturnValue(secondNowMs);

    const secondLoad = loadSaveFromLocalStorage();
    expect(secondLoad.ok).toBe(true);
    if (!secondLoad.ok) {
      return;
    }

    const secondElapsedMs = secondNowMs - nowMs;
    expect(secondLoad.save.lastSimulatedAtMs).toBe(secondNowMs);
    expect(secondLoad.save.state.currencyCents).toBe(seededState.currencyCents);
    expect(secondLoad.save.state.enjoymentCents).toBe(seededState.enjoymentCents);
    expect(secondLoad.save.state.interactionNextAvailableAtMsByItem.quartz).toBe(
      12_000 + elapsedMs + secondElapsedMs,
    );
    expect(secondLoad.save.state.eventStates["auction-weekend"]?.activeUntilMs).toBe(
      26_000 + elapsedMs + secondElapsedMs,
    );
    expect(secondLoad.save.state.eventStates["auction-weekend"]?.nextAvailableAtMs).toBe(
      31_000 + elapsedMs + secondElapsedMs,
    );
  });

  it("only changes career XP/level when sessions run, not from sim ticks", () => {
    const base = createInitialState();
    const seededState = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        salaryActiveUntilMs: 1_000_000,
        level: 3,
        xp: 17,
      },
    };

    const nextState = step(seededState, 30_000, 30_000);

    expect(nextState.therapistCareer.level).toBe(seededState.therapistCareer.level);
    expect(nextState.therapistCareer.xp).toBe(seededState.therapistCareer.xp);
  });
});
