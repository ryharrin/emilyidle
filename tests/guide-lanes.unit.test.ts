import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getGuideLanes,
  selectPrimaryCareerTrack,
  type GameState,
} from "../src/game/state";

describe("guide lanes", () => {
  it("maps a fresh save to a now-first onboarding lane", () => {
    const lanes = getGuideLanes(createInitialState(), 0);

    expect(lanes.primary.lane).toBe("now");
    expect(lanes.now.id).toBe("start-career");
    expect(lanes.next.id).toBe("build-first-watch-buffer");
    expect(lanes.later.lane).toBe("later");
  });

  it("keeps one primary action and routes follow-up lanes when a session is ready", () => {
    const base = createInitialState();
    const seeded: GameState = {
      ...base,
      currencyCents: 120_000,
      enjoymentCents: 120_000,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program",
        level: 6,
        modalityId: "cbt",
        freeSessionAvailable: true,
        nextAvailableAtMs: 0,
      },
    };
    const withTrack = selectPrimaryCareerTrack(seeded, "private-practice");

    const lanes = getGuideLanes(withTrack, 0);
    expect(lanes.now.id).toBe("run-career-session");
    expect(lanes.next.id).toBe("convert-cash-into-collection");
    expect(lanes.primary.id).toBe(lanes.now.id);
  });

  it("falls back gracefully when no immediate spend or session is available", () => {
    const base = createInitialState();
    const seeded: GameState = {
      ...base,
      currencyCents: 0,
      enjoymentCents: 0,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program",
        level: 3,
        modalityId: "cbt",
        freeSessionAvailable: false,
        nextAvailableAtMs: 99_999,
      },
    };
    const withTrack = selectPrimaryCareerTrack(seeded, "private-practice");

    const lanes = getGuideLanes(withTrack, 1_000);
    expect(lanes.next.id).toBe("stabilize-income-cycle");
    expect(lanes.later.id.length).toBeGreaterThan(0);
    expect(lanes.later.id).not.toBe(lanes.now.id);
    expect(lanes.later.id).not.toBe(lanes.next.id);
  });
});
