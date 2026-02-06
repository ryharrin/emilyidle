import { describe, expect, it } from "vitest";

import { applyAchievementUnlocks, createInitialState, getAchievements } from "../src/game/state";

describe("achievement category expansion", () => {
  it("covers collection, prestige, career, and mini-game categories", () => {
    const categories = new Set(getAchievements().map((achievement) => achievement.category));

    expect(categories.has("collection")).toBe(true);
    expect(categories.has("prestige")).toBe(true);
    expect(categories.has("career")).toBe(true);
    expect(categories.has("mini-game")).toBe(true);
  });

  it("unlocks newly added achievements from their deterministic requirement branches", () => {
    const base = createInitialState();
    const seeded = {
      ...base,
      therapistCareer: {
        ...base.therapistCareer,
        level: 10,
      },
      interactionPerfectRuns: 10,
      interactionBestPerfectStreak: 5,
      nostalgiaResets: 2,
    };

    const unlocked = applyAchievementUnlocks(seeded);

    expect(unlocked.achievementUnlocks).toContain("career-clinician");
    expect(unlocked.achievementUnlocks).toContain("session-maestro");
    expect(unlocked.achievementUnlocks).toContain("perfect-pulse");
    expect(unlocked.achievementUnlocks).toContain("nostalgia-returnee");
  });
});
