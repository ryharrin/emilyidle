import { describe, expect, it } from "vitest";

import {
  INTERACTION_BASE_COOLDOWN_MS,
  applyAutomaticReward,
  applyQuartzReward,
  applyWindingReward,
  createInitialState,
  getEnjoymentRateCentsPerSec,
  getInteractionCooldownRemainingMs,
  getInteractionStreakDetail,
  getPowerReserveForItem,
  getWatchItems,
  isInteractionAvailable,
} from "../src/game/state";
import type { GameState } from "../src/game/state";
import { step } from "../src/game/sim";

const MODEL_IDS = {
  classic: "rolex-rolex-gmt-master-ii-ref-126713grnr",
} as const;

describe("interactions", () => {
  it("defines movement for each watch item", () => {
    const movementById = new Map(getWatchItems().map((item) => [item.id, item.movement] as const));

    expect(movementById.get("starter")).toBe("quartz");
    expect(movementById.get("classic")).toBe("automatic");
    expect(movementById.get("chronograph")).toBe("manual");
    expect(movementById.get("tourbillon")).toBe("manual");
  });

  it("computes cooldown remaining and availability (owned + cooldown)", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 1,
      },
      interactionNextAvailableAtMsByItem: {
        ...baseState.interactionNextAvailableAtMsByItem,
        starter: 50_000,
      },
    };

    expect(getInteractionCooldownRemainingMs(seededState, "starter", 40_000)).toBe(10_000);
    expect(isInteractionAvailable(seededState, "starter", 40_000)).toBe(false);
    expect(isInteractionAvailable(seededState, "starter", 50_000)).toBe(true);

    const notOwned = {
      ...seededState,
      items: {
        ...seededState.items,
        starter: 0,
      },
      interactionNextAvailableAtMsByItem: {
        ...seededState.interactionNextAvailableAtMsByItem,
        starter: 0,
      },
    };

    expect(isInteractionAvailable(notOwned, "starter", 0)).toBe(false);
  });

  it("applies winding rewards as enjoyment bursts and starts a cooldown", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 1,
      },
    };

    const nowMs = 1_000;
    const missState = applyWindingReward(seededState, "chronograph", nowMs, "miss");
    const goodState = applyWindingReward(seededState, "chronograph", nowMs, "good");
    const perfectState = applyWindingReward(seededState, "chronograph", nowMs, "perfect");

    expect(missState.enjoymentCents).toBeLessThan(goodState.enjoymentCents);
    expect(goodState.enjoymentCents).toBeLessThan(perfectState.enjoymentCents);
    expect(getInteractionCooldownRemainingMs(perfectState, "chronograph", nowMs)).toBe(
      INTERACTION_BASE_COOLDOWN_MS,
    );
  });

  it("applies automatic rewards by charging power reserve (clamped) and increasing enjoyment rate", () => {
    const baseState = createInitialState();
    const seededState: GameState = {
      ...baseState,
      items: {
        ...baseState.items,
        classic: 1,
      },
      watchModels: {
        ...baseState.watchModels,
        [MODEL_IDS.classic]: 1,
      },
    };

    const baselineRate = getEnjoymentRateCentsPerSec(seededState);
    const nowMs = 5_000;
    const rewardedState = applyAutomaticReward(seededState, "classic", nowMs, "perfect");

    expect(getPowerReserveForItem(rewardedState, "classic")).toBeGreaterThan(0);
    expect(getEnjoymentRateCentsPerSec(rewardedState)).toBeGreaterThan(baselineRate);

    let charged: GameState = seededState;
    for (let i = 0; i < 10; i += 1) {
      charged = applyAutomaticReward(
        charged,
        "classic",
        nowMs + i * INTERACTION_BASE_COOLDOWN_MS,
        "perfect",
      );
    }

    expect(getPowerReserveForItem(charged, "classic")).toBe(1);
  });

  it("decays power reserve over simulation steps", () => {
    const baseState = createInitialState();
    const seededState: GameState = {
      ...baseState,
      items: {
        ...baseState.items,
        classic: 1,
      },
    };

    const charged = applyAutomaticReward(seededState, "classic", 0, "perfect");
    const startingReserve = getPowerReserveForItem(charged, "classic");
    expect(startingReserve).toBeGreaterThan(0);

    let next = charged;
    for (let i = 0; i < 10; i += 1) {
      next = step(next, 1_000, i * 1_000);
    }

    expect(getPowerReserveForItem(next, "classic")).toBeLessThan(startingReserve);
  });

  it("applies quartz rewards as a cash payout and starts a cooldown", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 1,
      },
    };

    const nowMs = 2_500;
    const rewarded = applyQuartzReward(seededState, "starter", nowMs, "perfect");

    expect(rewarded.currencyCents).toBeGreaterThan(seededState.currencyCents);
    expect(getInteractionCooldownRemainingMs(rewarded, "starter", nowMs)).toBe(
      INTERACTION_BASE_COOLDOWN_MS,
    );
  });

  it("supports practice mode without rewards or cooldown", () => {
    const baseState = createInitialState();
    const seededState: GameState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 1,
      },
      currencyCents: 250_000,
      enjoymentCents: 25_000,
    };

    const nowMs = 12_000;
    const practiced = applyQuartzReward(seededState, "starter", nowMs, "perfect", {
      mode: "practice",
    });

    expect(practiced.currencyCents).toBe(seededState.currencyCents);
    expect(getInteractionCooldownRemainingMs(practiced, "starter", nowMs)).toBe(0);
    expect(getInteractionStreakDetail(practiced).currentStreak).toBe(0);
  });

  it("applies capped perfect streak bonuses in normal mode and resets on miss", () => {
    const baseState = createInitialState();
    const seededState: GameState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 1,
      },
    };

    const first = applyWindingReward(seededState, "chronograph", 0, "perfect");
    expect(first.enjoymentCents).toBe(150);
    expect(getInteractionStreakDetail(first).currentStreak).toBe(1);

    const second = applyWindingReward(
      first,
      "chronograph",
      INTERACTION_BASE_COOLDOWN_MS,
      "perfect",
    );
    expect(second.enjoymentCents).toBe(315);
    expect(getInteractionStreakDetail(second).currentStreak).toBe(2);

    const third = applyWindingReward(
      second,
      "chronograph",
      INTERACTION_BASE_COOLDOWN_MS * 2,
      "miss",
    );
    expect(getInteractionStreakDetail(third).currentStreak).toBe(0);

    const afterReset = applyWindingReward(
      third,
      "chronograph",
      INTERACTION_BASE_COOLDOWN_MS * 3,
      "perfect",
    );
    expect(afterReset.enjoymentCents - third.enjoymentCents).toBe(150);
    expect(getInteractionStreakDetail(afterReset).currentStreak).toBe(1);
  });
});
