import { describe, it, expect } from "vitest";
import { createInitialState } from "../src/game/model/state";
import { performTherapistSession, applyAchievementUnlocks } from "../src/game/actions";
import type { GameState } from "../src/game/model/types";

describe("career achievements", () => {
  it("unlocks career-first-session after first session", () => {
    // Setup: Create state with career started
    let state = createInitialState();
    state = {
      ...state,
      therapistCareer: {
        ...state.therapistCareer,
        careerStartId: "phd-program",
        freeSessionAvailable: true,
        totalSessions: 0,
      },
    };

    // Action: Perform a session
    const nowMs = Date.now();
    state = performTherapistSession(state, nowMs);

    // Apply achievement unlocks
    state = applyAchievementUnlocks(state);

    // Assert: First session achievement unlocked
    expect(state.achievementUnlocks).toContain("career-first-session");
    expect(state.therapistCareer.totalSessions).toBe(1);
  });

  it("tracks total sessions correctly", () => {
    let state = createInitialState();
    state = {
      ...state,
      enjoymentCents: 1000, // Ensure enough enjoyment for multiple sessions
      therapistCareer: {
        ...state.therapistCareer,
        careerStartId: "phd-program",
        freeSessionAvailable: true,
        totalSessions: 0,
        nextAvailableAtMs: 0, // Allow immediate sessions
      },
    };

    const nowMs = Date.now();

    // Perform 5 sessions
    for (let i = 0; i < 5; i++) {
      state = {
        ...state,
        therapistCareer: {
          ...state.therapistCareer,
          nextAvailableAtMs: 0, // Reset cooldown each time
        },
      };
      state = performTherapistSession(state, nowMs + i * 1000);
    }

    expect(state.therapistCareer.totalSessions).toBe(5);
  });

  it("unlocks career-10-sessions after 10 sessions", () => {
    let state = createInitialState();
    state = {
      ...state,
      therapistCareer: {
        ...state.therapistCareer,
        careerStartId: "phd-program",
        freeSessionAvailable: true,
        totalSessions: 9, // Already has 9 sessions
        nextAvailableAtMs: 0,
      },
    };

    // Perform 1 more session to reach 10
    const nowMs = Date.now();
    state = performTherapistSession(state, nowMs);
    state = applyAchievementUnlocks(state);

    expect(state.therapistCareer.totalSessions).toBe(10);
    expect(state.achievementUnlocks).toContain("career-10-sessions");
  });
});
