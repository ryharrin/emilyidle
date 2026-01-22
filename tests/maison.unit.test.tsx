import { describe, expect, it } from "vitest";

import { decodeSaveString, encodeSaveString } from "../src/game/persistence";

import {
  applyAchievementUnlocks,
  applyEventState,
  buyMaisonLine,
  buyMaisonUpgrade,
  createInitialState,
  getCollectionBonusMultiplier,
  getCollectionValueCents,
  getCraftedBoostIncomeMultiplier,
  getEffectiveIncomeRateCentsPerSec,
  getEnjoymentRateCentsPerSec,
  getEventIncomeMultiplier,
  getCatalogTierIncomeMultiplier,
  getWatchAbilityIncomeMultiplier,
  getEventStatusLabel,
  getAchievementProgressRatio,
  getMaisonCollectionBonusMultiplier,
  getMaisonIncomeMultiplier,
  getMaisonLineBlueprintBonus,
  getMaisonLines,
  getMaisonPrestigeGain,
  getMaisonReputationGain,
  getMaisonPrestigeThresholdCents,
  getMilestones,
  getPrestigeLegacyMultiplier,
  getRawIncomeRateCentsPerSec,
  getUpgrades,
  getWatchItemEnjoymentRateCentsPerSec,
  getWatchItems,
  getWorkshopIncomeMultiplier,
  getWorkshopPrestigeGain,
  getWorkshopPrestigeThresholdCents,
  getWorkshopSoftcapValue,
  getActiveSetBonuses,
  isEventActive,
  isMaisonRevealReady,
  isWorkshopRevealReady,
  prestigeMaison,
  shouldShowUnlockTag,
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

  it("activates set bonuses at thresholds", () => {
    const baseState = createInitialState();
    const baseIncome = getRawIncomeRateCentsPerSec(baseState);

    const cases: Array<[string, Partial<typeof baseState.items>]> = [
      ["oyster-society", { starter: 12, classic: 4 }],
      ["crown-chronicle", { chronograph: 4, tourbillon: 1 }],
      ["seamaster-society", { classic: 8, chronograph: 3 }],
      ["dress-circle", { starter: 10, classic: 2 }],
      ["diver-crew", { classic: 6, chronograph: 2 }],
      ["collector-quartet", { starter: 18, classic: 4, chronograph: 2, tourbillon: 1 }],
    ];

    const watchItems = getWatchItems();

    for (const [bonusId, requiredItems] of cases) {
      const seededState = {
        ...baseState,
        items: {
          ...baseState.items,
          ...requiredItems,
        },
      };

      const activeBonuses = getActiveSetBonuses(seededState);
      expect(activeBonuses.map((bonus) => bonus.id)).toContain(bonusId);

      const setBonusMultiplier = activeBonuses.reduce(
        (multiplier, bonus) => multiplier * bonus.incomeMultiplier,
        1,
      );

      const itemIncome = watchItems.reduce(
        (total, item) => total + (seededState.items[item.id] ?? 0) * item.incomeCentsPerSec,
        0,
      );

      const expected =
        (baseIncome + itemIncome) *
        setBonusMultiplier *
        getCollectionBonusMultiplier(seededState) *
        getWorkshopIncomeMultiplier(seededState) *
        getMaisonIncomeMultiplier(seededState) *
        getCatalogTierIncomeMultiplier(seededState) *
        getWatchAbilityIncomeMultiplier(seededState) *
        getCraftedBoostIncomeMultiplier(seededState) *
        getPrestigeLegacyMultiplier(seededState);

      const actual = getRawIncomeRateCentsPerSec(seededState);
      expect(actual).toBeCloseTo(expected, 6);

      const matched = activeBonuses.find((bonus) => bonus.id === bonusId);
      expect(matched).toBeTruthy();
      const withoutTarget = expected / (matched?.incomeMultiplier ?? 1);
      expect(actual).not.toBeCloseTo(withoutTarget, 6);
    }
  });

  it("applies prestige legacy multiplier to cash and enjoyment rates", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 10,
      },
      discoveredCatalogEntries: [],
      catalogTierUnlocks: [],
    };

    const baseIncome = getRawIncomeRateCentsPerSec(seededState);
    const baseEnjoyment = getEnjoymentRateCentsPerSec(seededState);

    const withWorkshopPrestige = {
      ...seededState,
      workshopPrestigeCount: 1,
    };
    expect(getPrestigeLegacyMultiplier(withWorkshopPrestige)).toBeCloseTo(1.05, 8);
    expect(getRawIncomeRateCentsPerSec(withWorkshopPrestige)).toBeCloseTo(baseIncome * 1.05, 6);
    expect(getEnjoymentRateCentsPerSec(withWorkshopPrestige)).toBeCloseTo(baseEnjoyment * 1.05, 6);

    const withHeritage = {
      ...seededState,
      maisonHeritage: 2,
    };
    expect(getPrestigeLegacyMultiplier(withHeritage)).toBeCloseTo(Math.pow(1.03, 2), 8);
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
        "archive-guides": 0,
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

    const enjoymentRates = new Map(
      getWatchItems().map((item) => [item.id, getWatchItemEnjoymentRateCentsPerSec(item)]),
    );
    const expectedEnjoyment =
      (enjoymentRates.get("starter") ?? 0) * 10 +
      (enjoymentRates.get("chronograph") ?? 0) * 5;
    expect(getEnjoymentRateCentsPerSec(stackedHigh)).toBe(expectedEnjoyment);
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

  it("reveals workshop, maison, milestone, and achievement unlocks at 80%", () => {
    const baseState = createInitialState();
    const workshopThreshold = getWorkshopPrestigeThresholdCents();
    const maisonThreshold = getMaisonPrestigeThresholdCents();

    const belowWorkshop = {
      ...baseState,
      enjoymentCents: workshopThreshold * 0.79,
    };
    const atWorkshop = {
      ...baseState,
      enjoymentCents: workshopThreshold * 0.8,
    };

    expect(isWorkshopRevealReady(belowWorkshop)).toBe(false);
    expect(isWorkshopRevealReady(atWorkshop)).toBe(true);

    const belowMaison = {
      ...baseState,
      enjoymentCents: maisonThreshold * 0.79,
    };
    const atMaison = {
      ...baseState,
      enjoymentCents: maisonThreshold * 0.8,
    };

    expect(isMaisonRevealReady(belowMaison)).toBe(false);
    expect(isMaisonRevealReady(atMaison)).toBe(true);

    const showcaseMilestone = getMilestones().find((milestone) => milestone.id === "showcase");
    if (!showcaseMilestone || showcaseMilestone.requirement.type !== "collectionValue") {
      throw new Error("Expected showcase milestone with collection value requirement");
    }

    const belowMilestone = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 1,
      },
    };

    const threshold = showcaseMilestone.requirement.thresholdCents;
    const atMilestone = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: Math.ceil((threshold * 0.8) / 18_000),
      },
    };

    expect(shouldShowUnlockTag(belowMilestone, "showcase")).toBe(false);
    expect(shouldShowUnlockTag(atMilestone, "showcase")).toBe(true);

    const belowAchievement = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 9,
      },
    };
    const atAchievement = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 10,
      },
    };

    expect(getAchievementProgressRatio(belowAchievement, "first-drawer")).toBeLessThan(0.8);
    expect(getAchievementProgressRatio(atAchievement, "first-drawer")).toBeGreaterThanOrEqual(0.8);
  });
});

describe("crafting persistence", () => {
  it("round-trips crafting state through save encode/decode", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      craftingParts: 42,
      craftedBoosts: {
        ...baseState.craftedBoosts,
        "polished-tools": 2,
        "artisan-jig": 1,
      },
    };

    const encoded = encodeSaveString(seededState, Date.now(), new Date(0));
    const decoded = decodeSaveString(encoded);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) {
      return;
    }

    expect(decoded.save.state.craftingParts).toBe(42);
    expect(decoded.save.state.craftedBoosts["polished-tools"]).toBe(2);
    expect(decoded.save.state.craftedBoosts["artisan-jig"]).toBe(1);
  });

  it("defaults crafting fields when missing from payload", () => {
    const baseState = createInitialState();

    const { craftingParts: _craftingParts, craftedBoosts: _craftedBoosts, ...stateWithoutCrafting } =
      baseState;

    const raw = JSON.stringify({
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: 0,
      state: stateWithoutCrafting,
    });

    const decoded = decodeSaveString(raw);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) {
      return;
    }

    expect(decoded.save.state.craftingParts).toBe(0);
    expect(decoded.save.state.craftedBoosts["polished-tools"]).toBe(0);
    expect(decoded.save.state.craftedBoosts["heritage-springs"]).toBe(0);
    expect(decoded.save.state.craftedBoosts["artisan-jig"]).toBe(0);
  });

  it("clamps and ignores invalid crafting data", () => {
    const baseState = createInitialState();

    const encoded = encodeSaveString(baseState, 0, new Date(0));
    const parsed = JSON.parse(encoded) as {
      version: number;
      savedAt: string;
      lastSimulatedAtMs: number;
      state: Record<string, unknown>;
    };

    parsed.state.craftingParts = -5;
    parsed.state.craftedBoosts = {
      "polished-tools": "nope",
      "artisan-jig": 3,
      "unknown-boost": 99,
    };

    const raw = JSON.stringify(parsed);

    const decoded = decodeSaveString(raw);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) {
      return;
    }

    expect(decoded.save.state.craftingParts).toBe(0);
    expect(decoded.save.state.craftedBoosts["polished-tools"]).toBe(0);
    expect(decoded.save.state.craftedBoosts["artisan-jig"]).toBe(3);
  });
});
