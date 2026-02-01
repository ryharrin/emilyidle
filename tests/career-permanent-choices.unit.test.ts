import { describe, expect, it } from "vitest";

import {
  chooseCareerModality,
  createInitialState,
  createStateFromSave,
  getCareerChoicePreview,
  getTherapistCashRateCentsPerSec,
  selectPrimaryCareerTrack,
  type PersistedGameState,
} from "../src/game/state";

describe("career permanent choices", () => {
  it("migrates activeTrackId into primaryTrackId for older saves", () => {
    const persisted: PersistedGameState = {
      currencyCents: 0,
      therapistCareer: {
        level: 3,
        activeTrackId: "private-practice",
      },
    };

    const restored = createStateFromSave(persisted);
    expect(restored.therapistCareer.primaryTrackId).toBe("private-practice");
    expect(restored.therapistCareer.activeTrackId).toBe("private-practice");
  });

  it("enforces one-way track selection", () => {
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

    const withTrack = selectPrimaryCareerTrack(seeded, "va-hospital");
    expect(withTrack.therapistCareer.primaryTrackId).toBe("va-hospital");
    expect(withTrack.therapistCareer.activeTrackId).toBe("va-hospital");

    const attemptSwitch = selectPrimaryCareerTrack(withTrack, "private-practice");
    expect(attemptSwitch).toBe(withTrack);
    expect(attemptSwitch.therapistCareer.primaryTrackId).toBe("va-hospital");
  });

  it("enforces one-way modality selection and previews deltas", () => {
    const base = createInitialState();
    const nowMs = 0;
    const seeded = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        careerStartId: "phd-program" as const,
        salaryActiveUntilMs: 1_000_000,
        level: 60,
        primaryTrackId: null,
        activeTrackId: null,
        modalityId: null,
      },
    };

    const withTrack = selectPrimaryCareerTrack(seeded, "private-practice");
    const preview = getCareerChoicePreview(withTrack, {
      stageId: "specialist-certification",
      choiceId: "cbt",
    });
    const salaryDelta = preview.after.salaryCentsPerSec !== preview.before.salaryCentsPerSec;
    const cooldownDelta =
      preview.after.session?.cooldownMs !== null &&
      preview.before.session?.cooldownMs !== null &&
      preview.after.session?.cooldownMs !== preview.before.session?.cooldownMs;
    expect(salaryDelta || cooldownDelta).toBe(true);

    const beforeSalary = getTherapistCashRateCentsPerSec(withTrack, nowMs);
    const withModality = chooseCareerModality(withTrack, "cbt");
    expect(withModality.therapistCareer.modalityId).toBe("cbt");

    const afterSalary = getTherapistCashRateCentsPerSec(withModality, nowMs);
    expect(afterSalary).toBeGreaterThan(beforeSalary);

    const attemptSwitch = chooseCareerModality(withModality, "act");
    expect(attemptSwitch).toBe(withModality);
    expect(attemptSwitch.therapistCareer.modalityId).toBe("cbt");
  });
});
