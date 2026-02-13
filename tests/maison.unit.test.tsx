import { describe, expect, it } from "vitest";

import { decodeSaveString, encodeSaveString } from "../src/game/persistence";

import {
  applyAchievementUnlocks,
  applyEventState,
  createInitialState,
  createStateFromSave,
  getAchievementProgressRatio,
  getActiveSetBonuses,
  getCatalogTierIncomeMultiplier,
  getCollectionBonusMultiplier,
  getCollectionValueCents,
  getCraftedBoostIncomeMultiplier,
  getEffectiveIncomeRateCentsPerSec,
  getEnjoymentRateCentsPerSec,
  getEventIncomeMultiplier,
  getEventStatusLabel,
  getMilestones,
  getPrestigeLegacyMultiplier,
  getRawIncomeRateCentsPerSec,
  getWatchAbilityIncomeMultiplier,
  getWatchItemEnjoymentRateCentsPerSec,
  getWatchItems,
  getWorkshopIncomeMultiplier,
  getWorkshopPrestigeThresholdCents,
  getWorkshopSoftcapValue,
  isEventActive,
  isWorkshopRevealReady,
  shouldShowUnlockTag,
} from "../src/game/state";

describe("post-maison progression", () => {
  it("does not expose maison runtime state in the initial model", () => {
    const baseState = createInitialState();
    expect("maisonHeritage" in baseState).toBe(false);
    expect("maisonReputation" in baseState).toBe(false);
    expect("maisonUpgrades" in baseState).toBe(false);
    expect("maisonLines" in baseState).toBe(false);
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
    expect(getPrestigeLegacyMultiplier(withWorkshopPrestige)).toBeCloseTo(1.06, 8);
    expect(getRawIncomeRateCentsPerSec(withWorkshopPrestige)).toBeCloseTo(baseIncome * 1.06, 6);
    expect(getEnjoymentRateCentsPerSec(withWorkshopPrestige)).toBeCloseTo(baseEnjoyment * 1.06, 6);
  });

  it("migrates legacy maison progress into workshop progression on load", () => {
    const baseState = createInitialState();
    const restored = createStateFromSave({
      ...baseState,
      workshopBlueprints: 2,
      workshopPrestigeCount: 1,
      maisonHeritage: 4,
      maisonReputation: 3,
      maisonUpgrades: {
        "atelier-charter": true,
        "heritage-loom": false,
        "global-vitrine": true,
      },
      maisonLines: {
        "atelier-line": false,
        "heritage-line": true,
        "complication-line": false,
      },
    });

    expect(restored.workshopBlueprints).toBe(10);
    expect(restored.workshopPrestigeCount).toBe(4);
    expect("maisonHeritage" in restored).toBe(false);
    expect("maisonReputation" in restored).toBe(false);
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

  it("applies watch ability multipliers to cash only", () => {
    const baseState = createInitialState();
    expect(getCollectionBonusMultiplier(baseState)).toBe(1);
    expect(getWorkshopSoftcapValue(baseState)).toBe(60_000);

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
      (enjoymentRates.get("starter") ?? 0) * 10 + (enjoymentRates.get("chronograph") ?? 0) * 5;
    expect(getEnjoymentRateCentsPerSec(stackedHigh)).toBe(expectedEnjoyment);
  });

  it("reveals workshop, milestone, and achievement unlocks at 80%", () => {
    const baseState = createInitialState();
    const workshopThreshold = getWorkshopPrestigeThresholdCents();

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

    const { craftingParts, craftedBoosts, ...stateWithoutCrafting } = baseState;
    void craftingParts;
    void craftedBoosts;

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
