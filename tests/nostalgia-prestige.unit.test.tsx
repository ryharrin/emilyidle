import { describe, expect, it } from "vitest";

import {
  canNostalgiaPrestige,
  createInitialState,
  getNostalgiaPrestigeGain,
  getNostalgiaPrestigeThresholdCents,
  prestigeNostalgia,
} from "../src/game/state";

describe("nostalgia prestige", () => {
  it("gates nostalgia gain at the threshold", () => {
    const baseState = createInitialState();
    const threshold = getNostalgiaPrestigeThresholdCents();

    const belowThreshold = {
      ...baseState,
      nostalgiaEnjoymentEarnedCents: threshold - 1,
    };
    const atThreshold = {
      ...baseState,
      nostalgiaEnjoymentEarnedCents: threshold,
    };

    expect(getNostalgiaPrestigeGain(belowThreshold)).toBe(0);
    expect(canNostalgiaPrestige(belowThreshold)).toBe(false);

    const gainAtThreshold = getNostalgiaPrestigeGain(atThreshold);
    expect(gainAtThreshold).toBeGreaterThanOrEqual(1);
    expect(canNostalgiaPrestige(atThreshold)).toBe(true);
  });

  it("keeps nostalgia gain monotonic above the threshold", () => {
    const baseState = createInitialState();
    const threshold = getNostalgiaPrestigeThresholdCents();

    const smallerEarned = threshold + 2_000_000;
    const largerEarned = threshold + 8_000_000;

    const smallerState = {
      ...baseState,
      nostalgiaEnjoymentEarnedCents: smallerEarned,
    };
    const largerState = {
      ...baseState,
      nostalgiaEnjoymentEarnedCents: largerEarned,
    };

    const smallerGain = getNostalgiaPrestigeGain(smallerState);
    const largerGain = getNostalgiaPrestigeGain(largerState);

    expect(largerGain).toBeGreaterThanOrEqual(smallerGain);
  });

  it("resets progression while keeping owned watches", () => {
    const baseState = createInitialState();
    const threshold = getNostalgiaPrestigeThresholdCents();

    const seededState = {
      ...baseState,
      currencyCents: 52_000,
      enjoymentCents: 8_800,
      nostalgiaEnjoymentEarnedCents: threshold,
      items: {
        ...baseState.items,
        starter: 6,
        classic: 2,
      },
      upgrades: {
        ...baseState.upgrades,
        "polishing-tools": 2,
      },
      workshopBlueprints: 4,
      workshopPrestigeCount: 2,
      workshopUpgrades: {
        ...baseState.workshopUpgrades,
        "etched-ledgers": true,
      },
      maisonHeritage: 3,
      maisonReputation: 2,
      maisonUpgrades: {
        ...baseState.maisonUpgrades,
        "atelier-charter": true,
      },
      maisonLines: {
        ...baseState.maisonLines,
        "atelier-line": true,
      },
      therapistCareer: {
        level: 4,
        xp: 120,
        nextAvailableAtMs: 12_000,
      },
      craftingParts: 9,
      craftedBoosts: {
        ...baseState.craftedBoosts,
        "polished-tools": 2,
      },
    };

    const gain = getNostalgiaPrestigeGain(seededState);
    const nowMs = 123_456;
    const resetState = prestigeNostalgia(seededState, nowMs);

    expect(resetState.nostalgiaPoints).toBe(seededState.nostalgiaPoints + gain);
    expect(resetState.nostalgiaResets).toBe(seededState.nostalgiaResets + 1);
    expect(resetState.nostalgiaLastGain).toBe(gain);
    expect(resetState.nostalgiaLastPrestigedAtMs).toBe(nowMs);

    expect(resetState.currencyCents).toBe(0);
    expect(resetState.enjoymentCents).toBe(0);
    expect(resetState.nostalgiaEnjoymentEarnedCents).toBe(0);

    expect(resetState.items).toEqual(seededState.items);
    expect(resetState.therapistCareer).toEqual(baseState.therapistCareer);
    expect(resetState.upgrades).toEqual(baseState.upgrades);
    expect(resetState.workshopBlueprints).toBe(0);
    expect(resetState.workshopPrestigeCount).toBe(0);
    expect(resetState.workshopUpgrades).toEqual(baseState.workshopUpgrades);
    expect(resetState.maisonHeritage).toBe(0);
    expect(resetState.maisonReputation).toBe(0);
    expect(resetState.maisonUpgrades).toEqual(baseState.maisonUpgrades);
    expect(resetState.maisonLines).toEqual(baseState.maisonLines);
    expect(resetState.eventStates).toEqual(baseState.eventStates);
    expect(resetState.craftingParts).toBe(0);
    expect(resetState.craftedBoosts).toEqual(baseState.craftedBoosts);
  });
});
