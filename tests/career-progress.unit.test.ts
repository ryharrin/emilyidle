import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getCareerNextStageProgress,
  getCareerNextUnlock,
  selectPrimaryCareerTrack,
} from "../src/game/state";

describe("career progress", () => {
  it("surfaces the career start step before stage progression", () => {
    const base = createInitialState();
    const seeded = { ...base, therapistCareer: { ...base.therapistCareer, careerStartId: null } };

    const nextUnlock = getCareerNextUnlock(seeded);
    expect(nextUnlock).toEqual({ kind: "start", label: "Enter the PhD program" });
  });

  it("defaults next unlock to the next stage threshold", () => {
    const base = createInitialState();
    const seeded = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        level: 2,
        xp: 0,
      },
    };

    const nextUnlock = getCareerNextUnlock(seeded);
    expect(nextUnlock?.kind).toBe("stage");
    if (nextUnlock?.kind === "stage") {
      expect(nextUnlock.stageId).toBe("licensed-associate");
      expect(nextUnlock.unlockLevel).toBe(3);
    }

    const progress = getCareerNextStageProgress(seeded);
    expect(progress.progress01).toBeGreaterThanOrEqual(0);
    expect(progress.progress01).toBeLessThanOrEqual(1);
  });

  it("prefers an available permanent choice as the next unlock", () => {
    const base = createInitialState();
    const seeded = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        level: 3,
        primaryTrackId: null,
        activeTrackId: null,
      },
    };

    const nextUnlock = getCareerNextUnlock(seeded);
    expect(nextUnlock).toEqual({
      kind: "choice",
      stageId: "licensed-associate",
      label: "Choose your primary track",
    });

    const progress = getCareerNextStageProgress(seeded);
    expect(progress.progress01).toBe(1);
    expect(progress.levelsRemaining).toBe(0);
  });

  it("advances next unlock after a permanent choice is taken", () => {
    const base = createInitialState();
    const seeded = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        level: 5,
        primaryTrackId: null,
        activeTrackId: null,
      },
    };
    const withTrack = selectPrimaryCareerTrack(seeded, "private-practice");

    const nextUnlock = getCareerNextUnlock(withTrack);
    expect(nextUnlock?.kind).toBe("stage");
    if (nextUnlock?.kind === "stage") {
      expect(nextUnlock.stageId).toBe("specialist-certification");
      expect(nextUnlock.unlockLevel).toBe(6);
    }
  });
});
