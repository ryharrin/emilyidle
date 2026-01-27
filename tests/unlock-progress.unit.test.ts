import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getAchievementUnlockProgressDetail,
  getCollectionValueCents,
  getMilestoneUnlockProgressDetail,
  getPrestigeUnlockProgressDetail,
  getUnlockRevealProgressRatio,
  getWorkshopPrestigeThresholdCents,
  getMaisonPrestigeThresholdCents,
  getNostalgiaPrestigeThresholdCents,
} from "../src/game/state";

describe("unlock progress detail helpers", () => {
  it("computes milestone progress details for totalItems milestone collector-shelf", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 3,
      },
    };

    const detail = getMilestoneUnlockProgressDetail(seededState, "collector-shelf");

    expect(detail.threshold).toBe(5);
    expect(detail.current).toBe(3);
    expect(detail.ratio).toBeCloseTo(3 / 5, 8);
    expect(detail.label).toMatch(/Own 5 total items/);
  });

  it("computes milestone progress details for collectionValue milestone showcase", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 12,
      },
    };

    const detail = getMilestoneUnlockProgressDetail(seededState, "showcase");
    const expectedCurrent = getCollectionValueCents(seededState);

    expect(detail.threshold).toBe(25_000);
    expect(detail.current).toBe(expectedCurrent);
    expect(detail.ratio).toBeCloseTo(Math.min(1, expectedCurrent / 25_000), 8);
    expect(detail.label).toMatch(/Reach/);
  });

  it("computes milestone progress details for catalogDiscovery milestone archive-curator", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      discoveredCatalogEntries: ["one", "two", "three"],
    };

    const detail = getMilestoneUnlockProgressDetail(seededState, "archive-curator");

    expect(detail.threshold).toBe(12);
    expect(detail.current).toBe(3);
    expect(detail.ratio).toBeCloseTo(3 / 12, 8);
    expect(detail.label).toMatch(/Discover 12 catalog/);
  });

  it("computes achievement progress details for totalItems achievement first-drawer", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 10,
      },
    };

    const detail = getAchievementUnlockProgressDetail(seededState, "first-drawer");

    expect(detail.threshold).toBe(12);
    expect(detail.current).toBe(10);
    expect(detail.ratio).toBeCloseTo(10 / 12, 8);
    expect(detail.label).toMatch(/Hold 12 watches/);
  });

  it("computes reveal progress ratio normalized to the 80% reveal threshold", () => {
    expect(getUnlockRevealProgressRatio(0)).toBe(0);
    expect(getUnlockRevealProgressRatio(0.4)).toBeCloseTo(0.5, 8);
    expect(getUnlockRevealProgressRatio(0.8)).toBe(1);
    expect(getUnlockRevealProgressRatio(1.2)).toBe(1);
  });

  it("computes prestige unlock progress details with correct thresholds", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      enjoymentCents: 1_000,
    };

    const workshop = getPrestigeUnlockProgressDetail(seededState, "workshop");
    expect(workshop.threshold).toBe(getWorkshopPrestigeThresholdCents());
    expect(workshop.current).toBe(Math.min(seededState.enjoymentCents, workshop.threshold));
    expect(workshop.ratio).toBeGreaterThanOrEqual(0);
    expect(workshop.ratio).toBeLessThanOrEqual(1);

    const maison = getPrestigeUnlockProgressDetail(seededState, "maison");
    expect(maison.threshold).toBe(getMaisonPrestigeThresholdCents());

    const nostalgia = getPrestigeUnlockProgressDetail(seededState, "nostalgia");
    expect(nostalgia.threshold).toBe(getNostalgiaPrestigeThresholdCents());
  });
});
