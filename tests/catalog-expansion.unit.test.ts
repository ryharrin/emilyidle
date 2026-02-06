import { describe, expect, it } from "vitest";

import { formatRateFromCentsPerSec } from "../src/game/format";
import { getWatchModels } from "../src/game/data/watchModels";
import { createInitialState } from "../src/game/state";
import { getPerWatchStatsRows } from "../src/game/selectors/perWatchStats";

import { NEW_WATCH_IDS } from "./catalog-fixtures";

const EXPECTED_TIER_BY_ID: Record<string, "starter" | "classic" | "chronograph" | "tourbillon"> = {
  "omega-aurora-frost": "starter",
  "omega-seashore-drift": "starter",
  "jaeger-lecoultre-atmos-vsp": "classic",
  "cartier-ballon-de-lumiere-chrono": "chronograph",
  "audemars-piguet-luminous-tourbillon": "tourbillon",
  "rolex-celestial-tourbillon": "tourbillon",
};

describe("catalog expansion guardrails", () => {
  it("keeps third-wave model metadata mapped to expected tiers", () => {
    const watchModelById = new Map(getWatchModels().map((model) => [model.id, model] as const));

    const tiers = new Set<string>();
    for (const modelId of NEW_WATCH_IDS) {
      const model = watchModelById.get(modelId);
      expect(model).toBeDefined();
      if (!model) {
        continue;
      }

      tiers.add(model.tierId);
      expect(model.catalogEntryIds.length).toBeGreaterThan(0);
      expect(model.tierId).toBe(EXPECTED_TIER_BY_ID[modelId]);
    }

    expect(tiers).toEqual(new Set(["starter", "classic", "chronograph", "tourbillon"]));
  });

  it("exposes readable enjoyment and cash rates for each third-wave model", () => {
    const rowsById = new Map(
      getPerWatchStatsRows(createInitialState(), 0, 1).map((row) => [row.modelId, row] as const),
    );

    for (const modelId of NEW_WATCH_IDS) {
      const row = rowsById.get(modelId);
      expect(row).toBeDefined();
      if (!row) {
        continue;
      }

      expect(row.catalogEntryIds.length).toBeGreaterThan(0);
      expect(row.enjoymentCentsPerSec).toBeGreaterThanOrEqual(0);
      expect(row.cashCentsPerSec).toBeGreaterThanOrEqual(0);
      expect(formatRateFromCentsPerSec(row.enjoymentCentsPerSec)).toContain("/");
      expect(formatRateFromCentsPerSec(row.cashCentsPerSec)).toContain("/");
    }
  });
});
