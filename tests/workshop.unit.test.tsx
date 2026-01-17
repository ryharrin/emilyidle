import { describe, expect, it } from "vitest";

import type { MilestoneId } from "../src/game/state";
import {
  buyWorkshopUpgrade,
  createInitialState,
  getUpgrades,
  getWatchItems,
  getWorkshopPrestigeGain,
  prestigeWorkshop,
} from "../src/game/state";

describe("workshop prestige", () => {
  it("calculates prestige gain from enjoyment", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      enjoymentCents: 3_200_000,
    };

    expect(getWorkshopPrestigeGain(baseState)).toBe(0);
    expect(getWorkshopPrestigeGain(seededState)).toBe(2);
  });

  it("resets items and upgrades but keeps milestones", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      currencyCents: 45_000,
      enjoymentCents: 120_000,
      items: {
        ...baseState.items,
        starter: 4,
        classic: 1,
      },
      upgrades: {
        ...baseState.upgrades,
        "polishing-tools": 2,
      },
      unlockedMilestones: ["collector-shelf"] as MilestoneId[],
      workshopBlueprints: 3,
      workshopPrestigeCount: 1,
    };

    const nextState = prestigeWorkshop(seededState, 2);

    expect(nextState.currencyCents).toBe(0);
    expect(nextState.enjoymentCents).toBe(0);
    expect(nextState.unlockedMilestones).toEqual(["collector-shelf"]);
    expect(nextState.workshopBlueprints).toBe(5);
    expect(nextState.workshopPrestigeCount).toBe(2);

    getWatchItems().forEach((item) => {
      expect(nextState.items[item.id]).toBe(0);
    });

    getUpgrades().forEach((upgrade) => {
      expect(nextState.upgrades[upgrade.id]).toBe(0);
    });
  });

  it("spends blueprints when buying workshop upgrades", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      workshopBlueprints: 4,
    };

    const nextState = buyWorkshopUpgrade(seededState, "vault-calibration");

    expect(nextState.workshopBlueprints).toBe(0);
    expect(nextState.workshopUpgrades["vault-calibration"]).toBe(true);
  });
});
