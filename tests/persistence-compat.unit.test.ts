import { describe, expect, it } from "vitest";

import {
  decodeSaveString,
  encodeSaveString,
  loadSaveFromLocalStorage,
} from "../src/game/persistence";
import { type MilestoneId, createInitialState } from "../src/game/state";

describe("persistence compatibility", () => {
  it("encodeSaveString produces a v4 payload with required fields", () => {
    const state = createInitialState();
    const savedAt = new Date(0);

    const raw = encodeSaveString(state, savedAt);
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    expect(parsed.version).toBe(4);
    expect(parsed.savedAt).toBe(savedAt.toISOString());
    expect(parsed.state).toBeTruthy();
    expect(typeof parsed.state).toBe("object");
  });

  it("decodeSaveString accepts v1 payloads and normalizes them to v4", () => {
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

    expect(decoded.save.version).toBe(4);
    expect(decoded.migratedFromVersion).toBe(1);
  });

  it("decodeSaveString accepts v2 payloads and normalizes them to v4", () => {
    const raw = JSON.stringify({
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: 456,
      state: { currencyCents: 456 },
    });

    const decoded = decodeSaveString(raw);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) {
      return;
    }

    expect(decoded.save.version).toBe(4);
    expect(decoded.migratedFromVersion).toBe(2);
  });

  it("decodeSaveString accepts v3 payloads and normalizes them to v4", () => {
    const raw = JSON.stringify({
      version: 3,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: 789,
      state: { currencyCents: 789 },
    });

    const decoded = decodeSaveString(raw);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) {
      return;
    }

    expect(decoded.save.version).toBe(4);
    expect(decoded.migratedFromVersion).toBe(3);
  });

  it("loadSaveFromLocalStorage migrates legacy watch-idle:save to canonical v4 emily-idle:save", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      currencyCents: 12_345,
      enjoymentCents: 6_789,
      therapistCareer: {
        ...baseState.therapistCareer,
        careerStartId: "phd-program" as const,
      },
      items: {
        ...baseState.items,
        quartz: 5,
        automatic: 1,
      },
      upgrades: {
        ...baseState.upgrades,
        "polishing-tools": 1,
      },
      unlockedMilestones: ["collector-shelf" as MilestoneId],
      discoveredCatalogEntries: [],
    };

    const rawV2 = JSON.stringify({
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: 456,
      state: seededState,
    });

    localStorage.clear();
    localStorage.setItem("watch-idle:save", rawV2);

    const loaded = loadSaveFromLocalStorage();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }

    expect(loaded.save.version).toBe(4);
    expect(loaded.migratedFromVersion).toBe(2);

    const canonicalRaw = localStorage.getItem("emily-idle:save");
    expect(canonicalRaw).toBeTruthy();
    expect(localStorage.getItem("watch-idle:save")).toBeNull();
    if (canonicalRaw) {
      const canonicalParsed = JSON.parse(canonicalRaw) as { version: number };
      expect(canonicalParsed.version).toBe(4);
    }

    expect(loaded.save.state.currencyCents).toBe(12_345);
    expect(loaded.save.state.enjoymentCents).toBe(6_789);
    expect(loaded.save.state.items.quartz).toBe(5);
    expect(loaded.save.state.items.automatic).toBe(1);
    expect(loaded.save.state.upgrades["polishing-tools"]).toBe(1);
    expect(loaded.save.state.unlockedMilestones).toContain("collector-shelf");
  });
});
