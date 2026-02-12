import { describe, expect, it } from "vitest";

import {
  createInitialState,
  getNextPrestigePreview,
  getPrestigeUnlockProgressDetail,
} from "../src/game/state";

describe("prestige progress preview", () => {
  it("starts with workshop progress based on enjoyment", () => {
    const base = createInitialState();
    const state = {
      ...base,
      enjoymentCents: 240_000,
    };

    const preview = getNextPrestigePreview(state);
    expect(preview).not.toBeNull();
    expect(preview?.id).toBe("workshop");
    expect(preview?.current).toBe(240_000);
    expect(preview?.remaining).toBe(560_000);
  });

  it("uses blueprint-equivalent progress for maison preview and unlock detail", () => {
    const base = createInitialState();
    const state = {
      ...base,
      enjoymentCents: 250_000,
      workshopPrestigeCount: 1,
      workshopBlueprints: 1,
    };

    const preview = getNextPrestigePreview(state);
    expect(preview).not.toBeNull();
    expect(preview?.id).toBe("maison");
    expect(preview?.threshold).toBe(4_000_000);
    expect(preview?.current).toBe(4_000_000);
    expect(preview?.remaining).toBe(0);
    expect(preview?.ratio).toBe(1);

    const detail = getPrestigeUnlockProgressDetail(state, "maison");
    expect(detail.current).toBe(4_000_000);
    expect(detail.ratio).toBe(1);
  });

  it("uses nostalgia-earned progress for nostalgia preview/detail instead of live enjoyment", () => {
    const base = createInitialState();
    const state = {
      ...base,
      enjoymentCents: 9_000_000,
      nostalgiaEnjoymentEarnedCents: 2_000_000,
      workshopPrestigeCount: 1,
      workshopBlueprints: 1,
      maisonHeritage: 1,
    };

    const preview = getNextPrestigePreview(state);
    expect(preview).not.toBeNull();
    expect(preview?.id).toBe("nostalgia");
    expect(preview?.threshold).toBe(12_000_000);
    expect(preview?.current).toBe(2_000_000);
    expect(preview?.remaining).toBe(10_000_000);
    expect(preview?.ratio).toBeCloseTo(2_000_000 / 12_000_000, 8);

    const detail = getPrestigeUnlockProgressDetail(state, "nostalgia");
    expect(detail.current).toBe(2_000_000);
    expect(detail.threshold).toBe(12_000_000);
    expect(detail.ratio).toBeCloseTo(2_000_000 / 12_000_000, 8);
  });
});
