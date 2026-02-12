import { describe, expect, it } from "vitest";

import { CATALOG_ENTRIES } from "../src/game/catalog";
import { getWatchModels } from "../src/game/state";

const MIN_ENTRIES_PER_MOVEMENT = {
  quartz: 10,
  automatic: 10,
  manual: 10,
  tourbillon: 10,
} as const;

const REFERENCE_MOVEMENT_BY_ID = {
  "seiko-astron-gps-solar-ssj003": "quartz",
  "rolex-rolex-gmt-master-ii-ref-126713grnr": "automatic",
  "omega-speedmaster-moonwatch-professional-31030425001001": "manual",
  "breguet-classique-tourbillon-3357": "tourbillon",
} as const;

describe("catalog movement metadata", () => {
  it("populates movement metadata for every catalog entry", () => {
    for (const entry of CATALOG_ENTRIES) {
      expect(entry.movementType).toMatch(/^(quartz|automatic|manual|tourbillon)$/);
      expect(entry.caliberName.length).toBeGreaterThan(0);
      expect(entry.movementSourceType).toMatch(/^(primary|secondary)$/);
      expect(entry.movementSourceUrl.length).toBeGreaterThan(0);
      expect(entry.movementSourceLabel.length).toBeGreaterThan(0);
      expect(entry.windingSystem.length).toBeGreaterThan(0);

      if (entry.movementType === "quartz") {
        expect(entry.windingSystem).toBe("battery");
      }
      if (entry.movementType === "manual") {
        expect(entry.windingSystem).toBe("hand-wound");
      }
      if (entry.movementType === "tourbillon") {
        expect(entry.windingSystem.startsWith("tourbillon")).toBe(true);
      }
    }
  });

  it("keeps enough references per movement type", () => {
    const counts = CATALOG_ENTRIES.reduce(
      (acc, entry) => {
        acc[entry.movementType] += 1;
        return acc;
      },
      {
        quartz: 0,
        automatic: 0,
        manual: 0,
        tourbillon: 0,
      },
    );

    expect(counts.quartz).toBeGreaterThanOrEqual(MIN_ENTRIES_PER_MOVEMENT.quartz);
    expect(counts.automatic).toBeGreaterThanOrEqual(MIN_ENTRIES_PER_MOVEMENT.automatic);
    expect(counts.manual).toBeGreaterThanOrEqual(MIN_ENTRIES_PER_MOVEMENT.manual);
    expect(counts.tourbillon).toBeGreaterThanOrEqual(MIN_ENTRIES_PER_MOVEMENT.tourbillon);
  });

  it("maps known reference watches to their real movement types", () => {
    const movementById = new Map(CATALOG_ENTRIES.map((entry) => [entry.id, entry.movementType]));

    for (const [id, expectedMovement] of Object.entries(REFERENCE_MOVEMENT_BY_ID)) {
      expect(movementById.get(id)).toBe(expectedMovement);
    }
  });

  it("keeps watch model tier semantics aligned with catalog movement metadata", () => {
    const movementById = new Map(CATALOG_ENTRIES.map((entry) => [entry.id, entry.movementType]));
    for (const model of getWatchModels()) {
      const movementType = movementById.get(model.id);
      expect(movementType).toBeDefined();
      expect(model.tierId).toBe(movementType);
    }
  });

  it("keeps edge classifier references mapped to expected movement tiers", () => {
    const movementById = new Map(CATALOG_ENTRIES.map((entry) => [entry.id, entry.movementType]));
    const edgeExpectations = {
      "rolex-rolex-daytona-ref-6265-in-oro-primi-anni-settanta": "manual",
      "rolex-rolex-gmt-master-ii-ref-126713grnr": "automatic",
      "rolex-montre-laroche-posay-water-resistant-rolex-submariner": "automatic",
      "jaeger-lecoultre-reverso-tribute-monoface-q3978480": "manual",
      "audemars-piguet-royal-oak-automatic": "automatic",
      "audemars-piguet-royal-oak-selfwinding-flying-tourbillon-26730st": "tourbillon",
    } as const;

    for (const [entryId, expectedTier] of Object.entries(edgeExpectations)) {
      expect(movementById.get(entryId)).toBe(expectedTier);
    }
  });
});
