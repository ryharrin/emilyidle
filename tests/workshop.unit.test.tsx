import { describe, expect, it } from "vitest";

import type { MilestoneId } from "../src/game/state";
import {
  buyWorkshopUpgrade,
  craftBoost,
  createInitialState,
  createStateFromSave,
  dismantleItem,
  getCraftingParts,
  getUpgrades,
  getWatchItems,
  getWorkshopPrestigeGain,
  prestigeWorkshop,
} from "../src/game/state";
import { decodeSaveString } from "../src/game/persistence";

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
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
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

  it("converts watches into crafting parts", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        classic: 2,
      },
    };

    const nextState = dismantleItem(seededState, "classic", 2);
    expect(nextState.items.classic).toBe(0);
    expect(getCraftingParts(nextState)).toBe(4);
  });

  it("spends parts when crafting boosts", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      craftingParts: 20,
    };

    const nextState = craftBoost(seededState, "heritage-springs");
    expect(getCraftingParts(nextState)).toBe(2);
    expect(nextState.craftedBoosts["heritage-springs"]).toBe(1);
  });

  it("decodes legacy saves with catalog tiers", () => {
    const baseState = createInitialState();
    const legacySave = JSON.stringify({
      version: 1,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: 0,
      state: {
        ...baseState,
        catalogTierUnlocks: ["starter"],
      },
    });

    const decoded = decodeSaveString(legacySave);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.save.state.catalogTierUnlocks).toContain("starter");
    }
  });

  it("decodes crafting fields from saves", () => {
    const baseState = createInitialState();
    const save = JSON.stringify({
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: 0,
      state: {
        ...baseState,
        craftingParts: 7,
        craftedBoosts: {
          "polished-tools": 2,
          "heritage-springs": 1,
          "artisan-jig": 0,
        },
      },
    });

    const decoded = decodeSaveString(save);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      const restored = decoded.save.state;
      const withCrafting = createStateFromSave({
        ...restored,
        craftingParts: 7,
        craftedBoosts: {
          "polished-tools": 2,
          "heritage-springs": 1,
          "artisan-jig": 0,
        },
      });
      expect(withCrafting.craftingParts).toBe(7);
      expect(withCrafting.craftedBoosts["polished-tools"]).toBe(2);
      expect(withCrafting.craftedBoosts["heritage-springs"]).toBe(1);
    }
  });
});
