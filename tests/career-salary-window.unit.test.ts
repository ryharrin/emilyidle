import { describe, expect, it } from "vitest";

import {
  createInitialState,
  enterPhdProgram,
  getEffectiveCashRateCentsPerSec,
  getTherapistSalaryActiveWindowMs,
  getTherapistSalaryExpirationAlert,
  getTherapistSalaryRemainingMs,
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

describe("salary expiration alert", () => {
  it("stays empty when salary is inactive", () => {
    const fresh = createInitialState();
    const alert = getTherapistSalaryExpirationAlert(fresh, 0);

    expect(alert.level).toBe("none");
    expect(alert.remainingMs).toBe(0);
    expect(getTherapistSalaryRemainingMs(fresh, 0)).toBe(0);
  });

  it("reports soon and urgent levels with the remaining window", () => {
    const base = createInitialState();
    const started = enterPhdProgram(base, 1_000);
    const soonNow = started.therapistCareer.salaryActiveUntilMs - 90_000;
    const soonAlert = getTherapistSalaryExpirationAlert(started, soonNow);

    expect(soonAlert.level).toBe("soon");
    expect(soonAlert.remainingMs).toBe(started.therapistCareer.salaryActiveUntilMs - soonNow);

    const urgentNow = started.therapistCareer.salaryActiveUntilMs - 10_000;
    const urgentAlert = getTherapistSalaryExpirationAlert(started, urgentNow);

    expect(urgentAlert.level).toBe("urgent");
    expect(urgentAlert.remainingMs).toBe(started.therapistCareer.salaryActiveUntilMs - urgentNow);
  });
});
