import { describe, expect, it } from "vitest";

import { WATCH_MODELS } from "../src/game/data/watchModels";
import {
  createInitialState,
  getCollectionAnalyticsSnapshot,
  getNextPrestigePreview,
  getSetBonusProgressRows,
} from "../src/game/state";

function requireModelIdForTier(
  tierId: "quartz" | "automatic" | "manual" | "tourbillon",
): string {
  const model = WATCH_MODELS.find((entry) => entry.tierId === tierId);
  if (!model) {
    throw new Error(`Expected watch model for tier: ${tierId}`);
  }
  return model.id;
}

describe("collection insight selectors", () => {
  it("computes set bonus progress counts and active transitions", () => {
    const baseState = createInitialState();
    const starterSetId = "quartz-set";

    const partialState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 4,
        automatic: 1,
      },
    };

    const partialRow = getSetBonusProgressRows(partialState).find((row) => row.id === starterSetId);
    if (!partialRow) {
      throw new Error("Expected quartz-set row");
    }

    expect(partialRow.requiredCount).toBe(6);
    expect(partialRow.metCount).toBe(5);
    expect(partialRow.remainingCount).toBe(1);
    expect(partialRow.ratio).toBeCloseTo(5 / 6, 8);
    expect(partialRow.active).toBe(false);

    const activeState = {
      ...partialState,
      items: {
        ...partialState.items,
        quartz: 5,
      },
    };

    const activeRow = getSetBonusProgressRows(activeState).find((row) => row.id === starterSetId);
    if (!activeRow) {
      throw new Error("Expected quartz-set row");
    }

    expect(activeRow.remainingCount).toBe(0);
    expect(activeRow.ratio).toBe(1);
    expect(activeRow.active).toBe(true);
    expect(activeRow.nextNeedLabel).toBe("Complete");
  });

  it("selects the nearest locked prestige target and computes remaining gap", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      enjoymentCents: 900_000,
    };

    const preview = getNextPrestigePreview(seededState);

    expect(preview).not.toBeNull();
    expect(preview?.id).toBe("maison");
    expect(preview?.threshold).toBe(4_000_000);
    expect(preview?.remaining).toBe(3_100_000);
    expect(preview?.ratio).toBeCloseTo(900_000 / 4_000_000, 8);

    const completedState = {
      ...baseState,
      enjoymentCents: 12_000_000,
    };

    expect(getNextPrestigePreview(completedState)).toBeNull();
  });

  it("produces deterministic analytics breakdowns and most valuable model", () => {
    const baseState = createInitialState();
    const starterModelId = requireModelIdForTier("quartz");
    const chronographModelId = requireModelIdForTier("manual");
    const tourbillonModelId = requireModelIdForTier("tourbillon");

    const seededState = {
      ...baseState,
      watchModels: {
        [starterModelId]: 10,
        [chronographModelId]: 3,
        [tourbillonModelId]: 1,
      },
    };

    const snapshot = getCollectionAnalyticsSnapshot(seededState);

    expect(snapshot.totalOwnedCount).toBe(14);
    expect(snapshot.mostValuableModel?.modelId).toBe(tourbillonModelId);
    expect(snapshot.mostValuableModel?.tierId).toBe("tourbillon");

    const starterTier = snapshot.tierDistribution.find((row) => row.id === "quartz");
    const chronoTier = snapshot.tierDistribution.find((row) => row.id === "manual");
    const tourbillonTier = snapshot.tierDistribution.find((row) => row.id === "tourbillon");

    expect(starterTier?.count).toBe(10);
    expect(chronoTier?.count).toBe(3);
    expect(tourbillonTier?.count).toBe(1);

    expect(snapshot.brandDistribution.reduce((total, row) => total + row.count, 0)).toBe(14);
    expect(snapshot.eraDistribution.reduce((total, row) => total + row.count, 0)).toBe(14);
    expect(snapshot.brandDistribution[0]?.count).toBeGreaterThanOrEqual(
      snapshot.brandDistribution[1]?.count ?? 0,
    );
  });
});
