import { describe, expect, it } from "vitest";

import {
  createInitialState,
  enterPhdProgram,
  getEffectiveCashRateCentsPerSec,
  getTherapistSalaryActiveWindowMs,
  performTherapistSession,
} from "../src/game/state";

describe("career salary window", () => {
  it("starts at 0 until career is started, then expires and refreshes via sessions", () => {
    const fresh = createInitialState();
    const t0 = 1_700_000_000_000;

    expect(getEffectiveCashRateCentsPerSec(fresh, t0, 1)).toBe(0);

    const started = enterPhdProgram(fresh, t0);
    expect(getEffectiveCashRateCentsPerSec(started, t0, 1)).toBeGreaterThan(0);

    const expiredAt = started.therapistCareer.salaryActiveUntilMs;
    expect(getEffectiveCashRateCentsPerSec(started, expiredAt + 1, 1)).toBe(0);

    const preTrack = {
      ...started,
      therapistCareer: {
        ...started.therapistCareer,
        activeTrackId: null,
        primaryTrackId: null,
        nextAvailableAtMs: 0,
        freeSessionAvailable: true,
      },
    };

    const refreshed = performTherapistSession(preTrack, expiredAt + 1);
    expect(refreshed.therapistCareer.salaryActiveUntilMs).toBeGreaterThan(expiredAt + 1);
    expect(getEffectiveCashRateCentsPerSec(refreshed, expiredAt + 1, 1)).toBeGreaterThan(0);
  });

  it("extends the salary window as career points are spent", () => {
    const base = createInitialState();
    const t0 = 0;
    const started = enterPhdProgram(base, t0);

    const baseline = getTherapistSalaryActiveWindowMs(started);
    const withPointsSpent = {
      ...started,
      therapistCareer: {
        ...started.therapistCareer,
        spentNodes: {
          ...started.therapistCareer.spentNodes,
          "core-foundation": true,
        },
      },
    };

    expect(getTherapistSalaryActiveWindowMs(withPointsSpent)).toBeGreaterThan(baseline);
  });
});
