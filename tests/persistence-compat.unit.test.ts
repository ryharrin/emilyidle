import { describe, expect, it } from "vitest";

import {
  decodeSaveString,
  encodeSaveString,
  loadSaveFromLocalStorage,
} from "../src/game/persistence";
import { type MilestoneId, createInitialState } from "../src/game/state";

describe("persistence compatibility", () => {
  it("encodeSaveString produces a v2 payload with required fields", () => {
    const state = createInitialState();
    const lastSimulatedAtMs = 42_000;
    const savedAt = new Date(0);

    const raw = encodeSaveString(state, lastSimulatedAtMs, savedAt);
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    expect(parsed.version).toBe(2);
    expect(parsed.savedAt).toBe(savedAt.toISOString());
    expect(parsed.lastSimulatedAtMs).toBe(lastSimulatedAtMs);
    expect(parsed.state).toBeTruthy();
    expect(typeof parsed.state).toBe("object");
  });

  it("decodeSaveString accepts v1 payloads and normalizes them to v2", () => {
    const raw = JSON.stringify({
      version: 1,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: 123,
      state: { currencyCents: 123 },
    });

    const decoded = decodeSaveString(raw);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) {
      return;
    }

    expect(decoded.save.version).toBe(2);
  });

  it("loadSaveFromLocalStorage migrates legacy watch-idle:save to emily-idle:save", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      currencyCents: 12_345,
      enjoymentCents: 6_789,
      items: {
        ...baseState.items,
        starter: 5,
        classic: 1,
      },
      upgrades: {
        ...baseState.upgrades,
        "polishing-tools": 1,
      },
      unlockedMilestones: ["collector-shelf" as MilestoneId],
      discoveredCatalogEntries: [],
    };

    const rawV2 = encodeSaveString(seededState, 456, new Date(0));

    localStorage.clear();
    localStorage.setItem("watch-idle:save", rawV2);

    const loaded = loadSaveFromLocalStorage();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }

    expect(localStorage.getItem("emily-idle:save")).toBe(rawV2);
    expect(localStorage.getItem("watch-idle:save")).toBeNull();

    expect(loaded.save.state.currencyCents).toBe(12_345);
    expect(loaded.save.state.enjoymentCents).toBe(6_789);
    expect(loaded.save.state.items.starter).toBe(5);
    expect(loaded.save.state.items.classic).toBe(1);
    expect(loaded.save.state.upgrades["polishing-tools"]).toBe(1);
    expect(loaded.save.state.unlockedMilestones).toContain("collector-shelf");
  });
});
