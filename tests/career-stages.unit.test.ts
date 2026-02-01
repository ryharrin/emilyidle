import { describe, expect, it } from "vitest";

import { getTherapistCareerStageId } from "../src/game/state";

describe("career stages", () => {
  it("maps therapist career levels to stage ids", () => {
    expect(getTherapistCareerStageId(1)).toBe("grad-student");
    expect(getTherapistCareerStageId(2)).toBe("grad-student");

    expect(getTherapistCareerStageId(3)).toBe("licensed-associate");
    expect(getTherapistCareerStageId(5)).toBe("licensed-associate");

    expect(getTherapistCareerStageId(6)).toBe("specialist-certification");
    expect(getTherapistCareerStageId(9)).toBe("specialist-certification");

    expect(getTherapistCareerStageId(10)).toBe("practice-builder");
    expect(getTherapistCareerStageId(14)).toBe("practice-builder");

    expect(getTherapistCareerStageId(15)).toBe("private-practice-owner");
    expect(getTherapistCareerStageId(19)).toBe("private-practice-owner");

    expect(getTherapistCareerStageId(20)).toBe("retirement");
    expect(getTherapistCareerStageId(99)).toBe("retirement");
  });
});
