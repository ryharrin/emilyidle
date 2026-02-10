import { expect, test } from "vitest";

import { createInitialState } from "../src/game/state";
import { getPerWatchStatsRows } from "../src/game/selectors/perWatchStats";

const MOVEMENT_REFERENCE_IDS = [
  "grand-seiko-sbgx261",
  "seiko-astron-gps-solar-ssj003",
  "rolex-rolex-gmt-master-ii-ref-126713grnr",
  "omega-speedmaster-moonwatch-professional-31030425001001",
  "breguet-classique-tourbillon-3357",
  "tag-heuer-carrera-tourbillon-heuer-02t-cbu2050-fc8316",
];

test("per-watch stats cover movement reference watches with tier context", () => {
  const rows = getPerWatchStatsRows(createInitialState(), 0, 1);
  const rowIds = rows.map((row) => row.modelId);

  for (const id of MOVEMENT_REFERENCE_IDS) {
    expect(rowIds).toContain(id);
    const row = rows.find((entry) => entry.modelId === id);
    expect(row).toBeTruthy();
    expect(row?.catalogEntryIds.length).toBeGreaterThan(0);
    expect(row?.enjoymentCentsPerSec).toBeGreaterThanOrEqual(0);
    expect(row?.cashCentsPerSec).toBeGreaterThanOrEqual(0);
  }
});
