import { expect, test } from "vitest";

import { createInitialState } from "../src/game/state";
import { getPerWatchStatsRows } from "../src/game/selectors/perWatchStats";

const THIRD_WAVE_IDS = [
  "omega-aurora-frost",
  "omega-seashore-drift",
  "jaeger-lecoultre-atmos-vsp",
  "cartier-ballon-de-lumiere-chrono",
  "audemars-piguet-luminous-tourbillon",
  "rolex-celestial-tourbillon",
];

test("per-watch stats cover the third catalog wave with tier context", () => {
  const rows = getPerWatchStatsRows(createInitialState(), 0, 1);
  const rowIds = rows.map((row) => row.modelId);

  for (const id of THIRD_WAVE_IDS) {
    expect(rowIds).toContain(id);
    const row = rows.find((entry) => entry.modelId === id);
    expect(row).toBeTruthy();
    expect(row?.catalogEntryIds.length).toBeGreaterThan(0);
    expect(row?.enjoymentCentsPerSec).toBeGreaterThanOrEqual(0);
    expect(row?.cashCentsPerSec).toBeGreaterThanOrEqual(0);
  }
});
