import { describe, expect, it } from "vitest";

import {
  createInitialState,
  enterPhdProgram,
  getTherapistNearTermUnlockImpact,
  getTherapistSalaryWindowSummary,
  getTherapistSessionValueDeltaSummary,
  performTherapistSession,
  type GameState,
} from "../src/game/state";

describe("therapist economy summary selectors", () => {
  it("returns locked session summary before the career starts", () => {
    const summary = getTherapistSessionValueDeltaSummary(createInitialState(), 0);

    expect(summary.supportsSessions).toBe(false);
    expect(summary.cashPayoutCents).toBe(0);
    expect(summary.enjoymentCostCents).toBe(0);
  });

  it("reports free first session and post-session premium costs", () => {
    const nowMs = 1_000;
    const started = enterPhdProgram(createInitialState(), nowMs);
    const freeSummary = getTherapistSessionValueDeltaSummary(started, nowMs);

    expect(freeSummary.supportsSessions).toBe(true);
    expect(freeSummary.isFreeSession).toBe(true);
    expect(freeSummary.enjoymentCostCents).toBe(0);
    expect(freeSummary.cashPayoutCents).toBeGreaterThan(0);

    const afterFirstSession = performTherapistSession(started, nowMs);
    const premiumSummary = getTherapistSessionValueDeltaSummary(afterFirstSession, nowMs);

    expect(premiumSummary.supportsSessions).toBe(true);
    expect(premiumSummary.isFreeSession).toBe(false);
    expect(premiumSummary.enjoymentCostCents).toBeGreaterThan(0);
    expect(premiumSummary.premiumCount).toBeGreaterThanOrEqual(1);
  });

  it("summarizes salary window timing and near-term unlock cues", () => {
    const nowMs = 12_000;
    const started = enterPhdProgram(createInitialState(), nowMs);
    const salaryWindow = getTherapistSalaryWindowSummary(started, nowMs);

    expect(salaryWindow.isActive).toBe(true);
    expect(salaryWindow.remainingMs).toBeGreaterThan(0);
    expect(salaryWindow.windowMs).toBeGreaterThan(0);

    const expired = getTherapistSalaryWindowSummary(
      started,
      started.therapistCareer.salaryActiveUntilMs + 1,
    );
    expect(expired.isActive).toBe(false);
    expect(expired.remainingMs).toBe(0);

    const choiceReady: GameState = {
      ...started,
      therapistCareer: {
        ...started.therapistCareer,
        level: 3,
        primaryTrackId: null,
        activeTrackId: null,
      },
    };
    const unlockImpact = getTherapistNearTermUnlockImpact(choiceReady);

    expect(unlockImpact.kind).toBe("choice");
    expect(unlockImpact.detail.toLowerCase()).toContain("choose");
  });
});
