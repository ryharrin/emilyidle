import { describe, expect, it } from "vitest";

import {
  applyAchievementUnlocks,
  applyEventState,
  buyMaisonLine,
  buyMaisonUpgrade,
  createInitialState,
  getCollectionBonusMultiplier,
  getCollectionValueCents,
  getEffectiveIncomeRateCentsPerSec,
  getEnjoymentRateCentsPerSec,
  getEventIncomeMultiplier,
  getWatchAbilityIncomeMultiplier,
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

  it("unlocks achievements for Memories and prestige", () => {
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

    const centuryState = applyAchievementUnlocks({
      ...baseState,
      items: {
        ...baseState.items,
        starter: 100,
      },
    });
    expect(centuryState.achievementUnlocks).toContain("vault-century");

    const millionState = applyAchievementUnlocks({
      ...baseState,
      items: {
        ...baseState.items,
        tourbillon: 500,
      },
    });
    expect(millionState.achievementUnlocks).toContain("million-memories");

    const decadeState = applyAchievementUnlocks({
      ...baseState,
      workshopPrestigeCount: 10,
    });
    expect(decadeState.achievementUnlocks).toContain("workshop-decade");
  });

  it("activates, cools down, and respects calendar-date events", () => {
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

    const birthdayState = {
      ...baseState,
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };

    const onBirthdayMs = new Date(2026, 3, 27, 12, 0, 0).getTime();
    const onBirthday = applyEventState(birthdayState, onBirthdayMs, 0);
    expect(isEventActive(onBirthday, "emily-birthday", onBirthdayMs)).toBe(true);
    expect(getEventIncomeMultiplier(onBirthday, onBirthdayMs)).toBeCloseTo(1.27, 8);
    expect(getEventStatusLabel(onBirthday, "emily-birthday", onBirthdayMs)).toContain("Active");

    const dayAfterMs = new Date(2026, 3, 28, 12, 0, 0).getTime();
    const dayAfter = applyEventState(birthdayState, dayAfterMs, 0);
    const expectedNextAvailableMs = new Date(2027, 3, 27, 0, 0, 0).getTime();
    expect(dayAfter.eventStates["emily-birthday"].nextAvailableAtMs).toBe(expectedNextAvailableMs);
    expect(getEventStatusLabel(dayAfter, "emily-birthday", dayAfterMs)).toContain("Cooldown");

    const beforeBirthdayMs = new Date(2026, 3, 26, 12, 0, 0).getTime();
    const beforeBirthday = applyEventState(birthdayState, beforeBirthdayMs, 0);
    expect(getEventStatusLabel(beforeBirthday, "emily-birthday", beforeBirthdayMs)).toBe("Ready");
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

  it("applies watch ability multipliers to cash only", () => {
    const baseState = createInitialState();
    expect(getCollectionBonusMultiplier(baseState)).toBe(1);

    const baseRate = getEffectiveIncomeRateCentsPerSec(baseState, 1);

    const starterIncome =
      getWatchItems().find((item) => item.id === "starter")?.incomeCentsPerSec ?? 0;
    const chronographIncome =
      getWatchItems().find((item) => item.id === "chronograph")?.incomeCentsPerSec ?? 0;

    const starter10 = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 10,
      },
    };

    expect(getWatchAbilityIncomeMultiplier(starter10)).toBeCloseTo(1.02, 8);

    const starter10Expected =
      (baseRate + starterIncome * 10) *
      getCollectionBonusMultiplier(starter10) *
      getWatchAbilityIncomeMultiplier(starter10);
    expect(getEffectiveIncomeRateCentsPerSec(starter10, 1)).toBeCloseTo(starter10Expected, 6);

    const chrono5 = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 5,
      },
    };

    const chrono5Expected =
      (baseRate + chronographIncome * 5) *
      getCollectionBonusMultiplier(chrono5) *
      getWatchAbilityIncomeMultiplier(chrono5);
    expect(getEffectiveIncomeRateCentsPerSec(chrono5, 1)).toBeCloseTo(chrono5Expected, 6);

    const stackedHigh = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 10,
        chronograph: 5,
      },
    };

    const stackedExpected =
      (baseRate + starterIncome * 10 + chronographIncome * 5) *
      getCollectionBonusMultiplier(stackedHigh) *
      getWatchAbilityIncomeMultiplier(stackedHigh);
    expect(getEffectiveIncomeRateCentsPerSec(stackedHigh, 1)).toBeCloseTo(stackedExpected, 6);

    expect(getEnjoymentRateCentsPerSec(stackedHigh)).toBe(
      getCollectionValueCents(stackedHigh) / 100,
    );
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
