import { describe, expect, it } from "vitest";

import {
  applyAchievementUnlocks,
  applyEventState,
  buyMaisonLine,
  buyMaisonUpgrade,
  createInitialState,
  getCollectionValueCents,
  getEventIncomeMultiplier,
  getEventStatusLabel,
  getMaisonCollectionBonusMultiplier,
  getMaisonIncomeMultiplier,
  getMaisonLineBlueprintBonus,
  getMaisonLines,
  getMaisonPrestigeGain,
  getMaisonReputationGain,
  getUpgrades,
  getWatchItems,
  getWorkshopPrestigeGain,
  getWorkshopSoftcapValue,
  isEventActive,
  prestigeMaison,
} from "../src/game/state";

describe("maison prestige", () => {
  it("calculates prestige gain from enjoyment and blueprints", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      workshopBlueprints: 8,
      enjoymentCents: 4_000_000,
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };

    expect(getMaisonPrestigeGain(baseState)).toBe(0);
    expect(getMaisonPrestigeGain(seededState)).toBe(3);
  });

  it("lists maison line definitions", () => {
    const lines = getMaisonLines();
    expect(lines).toHaveLength(3);
    expect(lines.map((line) => line.id)).toContain("atelier-line");
    expect(lines.map((line) => line.id)).toContain("complication-line");
  });

  it("unlocks achievements for Sentimental value and prestige", () => {
    const baseState = createInitialState();
    const upgradedState = applyAchievementUnlocks({
      ...baseState,
      workshopPrestigeCount: 1,
      items: {
        ...baseState.items,
        tourbillon: 8,
      },
    });

    expect(getCollectionValueCents(baseState)).toBe(0);
    expect(upgradedState.achievementUnlocks).toContain("workshop-reforged");
    expect(upgradedState.achievementUnlocks).toContain("six-figure-vault");
  });

  it("activates and cools down events", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        tourbillon: 5,
      },
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };
    const collectionValue = getCollectionValueCents(seededState);
    const nowMs = 1_000;

    const activated = applyEventState(seededState, nowMs, collectionValue);
    expect(isEventActive(activated, "auction-weekend", nowMs)).toBe(true);
    expect(getEventIncomeMultiplier(activated, nowMs)).toBeGreaterThan(1);
    expect(getEventStatusLabel(activated, "auction-weekend", nowMs)).toContain("Active");

    const laterMs = nowMs + 200_000;
    const cooled = applyEventState(activated, laterMs, collectionValue);
    expect(isEventActive(cooled, "auction-weekend", laterMs)).toBe(false);
    expect(getEventStatusLabel(cooled, "auction-weekend", laterMs)).toContain("Cooldown");
  });

  it("resets workshop progress but keeps maison upgrades", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      currencyCents: 125_000,
      enjoymentCents: 240_000,
      items: {
        ...baseState.items,
        starter: 5,
        classic: 2,
      },
      upgrades: {
        ...baseState.upgrades,
        "polishing-tools": 3,
      },
      workshopBlueprints: 6,
      workshopPrestigeCount: 3,
      workshopUpgrades: {
        ...baseState.workshopUpgrades,
        "vault-calibration": true,
      },
      maisonHeritage: 4,
      maisonReputation: 2,
      maisonUpgrades: {
        ...baseState.maisonUpgrades,
        "atelier-charter": true,
      },
      maisonLines: {
        ...baseState.maisonLines,
        "atelier-line": true,
      },
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };

    const nextState = prestigeMaison(seededState);

    expect(nextState.currencyCents).toBe(0);
    expect(nextState.enjoymentCents).toBe(0);
    expect(nextState.workshopBlueprints).toBe(0);
    expect(nextState.workshopPrestigeCount).toBe(0);
    expect(nextState.maisonHeritage).toBe(6);
    expect(nextState.maisonReputation).toBe(3);
    expect(nextState.maisonUpgrades["atelier-charter"]).toBe(true);
    expect(nextState.maisonLines["atelier-line"]).toBe(true);

    getWatchItems().forEach((item) => {
      expect(nextState.items[item.id]).toBe(0);
    });

    getUpgrades().forEach((upgrade) => {
      expect(nextState.upgrades[upgrade.id]).toBe(0);
    });

    expect(nextState.workshopUpgrades["vault-calibration"]).toBe(false);
  });

  it("spends currency when buying maison upgrades", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      maisonHeritage: 3,
      maisonReputation: 4,
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };

    const heritageState = buyMaisonUpgrade(seededState, "atelier-charter");
    const reputationState = buyMaisonUpgrade(seededState, "global-vitrine");

    expect(heritageState.maisonHeritage).toBe(0);
    expect(heritageState.maisonUpgrades["atelier-charter"]).toBe(true);
    expect(reputationState.maisonReputation).toBe(0);
    expect(reputationState.maisonUpgrades["global-vitrine"]).toBe(true);
  });

  it("spends currency when activating maison lines", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      maisonHeritage: 6,
      maisonReputation: 6,
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };

    const heritageState = buyMaisonLine(seededState, "atelier-line");
    const reputationState = buyMaisonLine(seededState, "complication-line");

    expect(heritageState.maisonHeritage).toBe(1);
    expect(heritageState.maisonLines["atelier-line"]).toBe(true);
    expect(reputationState.maisonReputation).toBe(0);
    expect(reputationState.maisonLines["complication-line"]).toBe(true);
  });

  it("adds prestige bonuses from maison lines", () => {
    const baseState = createInitialState();
    const lineState = {
      ...baseState,
      workshopPrestigeCount: 4,
      workshopBlueprints: 0,
      enjoymentCents: 800_000,
      maisonLines: {
        ...baseState.maisonLines,
        "complication-line": true,
      },
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };

    expect(getMaisonReputationGain(baseState)).toBe(0);
    expect(getMaisonLineBlueprintBonus(baseState)).toBe(0);
    expect(getWorkshopPrestigeGain(baseState)).toBe(0);

    expect(getMaisonReputationGain(lineState)).toBe(2);
    expect(getMaisonLineBlueprintBonus(lineState)).toBe(1);
    expect(getWorkshopPrestigeGain(lineState)).toBe(2);
  });

  it("applies maison upgrade effects", () => {
    const baseState = createInitialState();
    const upgradedState = {
      ...baseState,
      maisonUpgrades: {
        ...baseState.maisonUpgrades,
        "atelier-charter": true,
        "heritage-loom": true,
        "global-vitrine": true,
      },
      maisonLines: {
        ...baseState.maisonLines,
        "atelier-line": true,
        "heritage-line": true,
      },
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };

    expect(getMaisonIncomeMultiplier(baseState)).toBe(1);
    expect(getMaisonCollectionBonusMultiplier(baseState)).toBe(1);
    expect(getWorkshopSoftcapValue(baseState)).toBe(60_000);

    expect(getMaisonIncomeMultiplier(upgradedState)).toBeCloseTo(1.232, 5);
    expect(getMaisonCollectionBonusMultiplier(upgradedState)).toBeCloseTo(1.32, 5);
    expect(getWorkshopSoftcapValue(upgradedState)).toBeCloseTo(72_000, 5);
  });
});
