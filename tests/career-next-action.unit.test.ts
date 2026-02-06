import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getCareerNextActionCue,
  selectPrimaryCareerTrack,
  type GameState,
} from "../src/game/state";

describe("career next action", () => {
  it("defaults to entering the program on a fresh save", () => {
    const cue = getCareerNextActionCue(createInitialState(), 0);
    expect(cue.id).toBe("start-career");
    expect(cue.label).toContain("PhD");
  });

  it("recommends choosing a track when stage 2 choice is available", () => {
    const base = createInitialState();
    const seeded: GameState = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        level: 3,
        primaryTrackId: null,
        activeTrackId: null,
      },
    };

    const cue = getCareerNextActionCue(seeded, 0);
    expect(cue.id).toBe("choose-track");
  });

  it("recommends running a session when available", () => {
    const base = createInitialState();
    const seeded: GameState = {
      ...base,
      enjoymentCents: 1_000_000,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        level: 6,
        primaryTrackId: null,
        activeTrackId: null,
        modalityId: "cbt",
        nextAvailableAtMs: 0,
        freeSessionAvailable: true,
      },
    };
    const withTrack = selectPrimaryCareerTrack(seeded, "private-practice");

    const cue = getCareerNextActionCue(withTrack, 0);
    expect(cue.id).toBe("perform-session");
    expect(cue.label.toLowerCase()).toContain("session");
  });
});
