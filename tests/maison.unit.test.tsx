import { describe, expect, it } from "vitest";

import {
  applyAchievementUnlocks,
  applyEventState,
  buyMaisonUpgrade,
  createInitialState,
  getCollectionValueCents,
  getEventIncomeMultiplier,
  getEventStatusLabel,
  getMaisonCollectionBonusMultiplier,
  getMaisonIncomeMultiplier,
  getMaisonPrestigeGain,
  getUpgrades,
  getWatchItems,
  getWorkshopSoftcapValue,
  isEventActive,
  prestigeMaison,
} from "../src/game/state";

describe("maison prestige", () => {
  it("calculates prestige gain from collection value and blueprints", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      workshopBlueprints: 8,
      items: {
        ...baseState.items,
        tourbillon: 20,
      },
    };

    expect(getMaisonPrestigeGain(baseState)).toBe(0);
    expect(getMaisonPrestigeGain(seededState)).toBe(3);
  });

  it("unlocks achievements for collection value and prestige", () => {
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
      workshopPrestigeCount: 1,
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
    };

    const nextState = prestigeMaison(seededState);

    expect(nextState.currencyCents).toBe(0);
    expect(nextState.workshopBlueprints).toBe(0);
    expect(nextState.workshopPrestigeCount).toBe(0);
    expect(nextState.maisonHeritage).toBe(6);
    expect(nextState.maisonReputation).toBe(2);
    expect(nextState.maisonUpgrades["atelier-charter"]).toBe(true);

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
    };

    const heritageState = buyMaisonUpgrade(seededState, "atelier-charter");
    const reputationState = buyMaisonUpgrade(seededState, "global-vitrine");

    expect(heritageState.maisonHeritage).toBe(0);
    expect(heritageState.maisonUpgrades["atelier-charter"]).toBe(true);
    expect(reputationState.maisonReputation).toBe(0);
    expect(reputationState.maisonUpgrades["global-vitrine"]).toBe(true);
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
    };

    expect(getMaisonIncomeMultiplier(baseState)).toBe(1);
    expect(getMaisonCollectionBonusMultiplier(baseState)).toBe(1);
    expect(getWorkshopSoftcapValue(baseState)).toBe(60_000);

    expect(getMaisonIncomeMultiplier(upgradedState)).toBeCloseTo(1.12, 5);
    expect(getMaisonCollectionBonusMultiplier(upgradedState)).toBeCloseTo(1.2, 5);
    expect(getWorkshopSoftcapValue(upgradedState)).toBeCloseTo(72_000, 5);
  });
});
