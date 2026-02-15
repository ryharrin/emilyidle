import { beforeEach, describe, expect, it } from "vitest";

import {
  decodeSaveString,
  encodeSaveString,
  loadSaveFromLocalStorage,
  persistSaveToLocalStorage,
} from "../src/game/persistence";
import { type MilestoneId, createInitialState } from "../src/game/state";

describe("persistence compatibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("encodeSaveString produces a v4 payload with required fields", () => {
    const state = createInitialState();
    const savedAt = new Date(0);
    localStorage.setItem("emily-idle:save-clear-epoch", "7");

    const raw = encodeSaveString(state, savedAt);
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    expect(parsed.version).toBe(4);
    expect(parsed.savedAt).toBe(savedAt.toISOString());
    expect(parsed.generation).toBe(7);
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

  it("loadSaveFromLocalStorage rejects stale generations and clears save keys", () => {
    localStorage.setItem("emily-idle:save-clear-epoch", "5");
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        generation: 4,
        state: { currencyCents: 100 },
      }),
    );

    const loaded = loadSaveFromLocalStorage();

    expect(loaded.ok).toBe(false);
    if (loaded.ok) {
      return;
    }
    expect("error" in loaded).toBe(true);
    if (!("error" in loaded)) {
      return;
    }

    expect(loaded.error).toContain("Stale save generation");
    expect(localStorage.getItem("emily-idle:save")).toBeNull();
    expect(localStorage.getItem("watch-idle:save")).toBeNull();
  });

  it("loadSaveFromLocalStorage accepts missing generation when clear epoch is 0", () => {
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        state: { currencyCents: 250 },
      }),
    );

    const loaded = loadSaveFromLocalStorage();

    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }

    expect(loaded.save.generation).toBe(0);
    const canonicalRaw = localStorage.getItem("emily-idle:save");
    expect(canonicalRaw).toBeTruthy();
    if (canonicalRaw) {
      const canonical = JSON.parse(canonicalRaw) as Record<string, unknown>;
      expect(canonical.generation).toBe(0);
    }
  });

  it("loadSaveFromLocalStorage rejects missing generation when clear epoch is greater than 0", () => {
    localStorage.setItem("emily-idle:save-clear-epoch", "9");
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        state: { currencyCents: 333 },
      }),
    );

    const loaded = loadSaveFromLocalStorage();

    expect(loaded.ok).toBe(false);
    if (loaded.ok) {
      return;
    }
    expect("error" in loaded).toBe(true);
    if (!("error" in loaded)) {
      return;
    }

    expect(loaded.error).toContain("Stale save generation");
    expect(localStorage.getItem("emily-idle:save")).toBeNull();
    expect(localStorage.getItem("watch-idle:save")).toBeNull();
  });

  it("persistSaveToLocalStorage writes generation metadata from clear epoch", () => {
    localStorage.setItem("emily-idle:save-clear-epoch", "42");

    const result = persistSaveToLocalStorage(createInitialState(), new Date(0));

    expect(result).toEqual({ ok: true });
    const raw = localStorage.getItem("emily-idle:save");
    expect(raw).toBeTruthy();
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.version).toBe(4);
    expect(parsed.generation).toBe(42);
  });
});
