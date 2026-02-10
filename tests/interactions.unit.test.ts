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
  automatic: "rolex-rolex-gmt-master-ii-ref-126713grnr",
} as const;

describe("interactions", () => {
  it("defines movement for each watch item", () => {
    const movementById = new Map(getWatchItems().map((item) => [item.id, item.movement] as const));

    expect(movementById.get("quartz")).toBe("quartz");
    expect(movementById.get("automatic")).toBe("automatic");
    expect(movementById.get("manual")).toBe("manual");
    expect(movementById.get("tourbillon")).toBe("tourbillon");
  });

  it("computes cooldown remaining and availability (owned + cooldown)", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 1,
      },
      interactionNextAvailableAtMsByItem: {
        ...baseState.interactionNextAvailableAtMsByItem,
        quartz: 50_000,
      },
    };

    expect(getInteractionCooldownRemainingMs(seededState, "quartz", 40_000)).toBe(10_000);
    expect(isInteractionAvailable(seededState, "quartz", 40_000)).toBe(false);
    expect(isInteractionAvailable(seededState, "quartz", 50_000)).toBe(true);

    const notOwned = {
      ...seededState,
      items: {
        ...seededState.items,
        quartz: 0,
      },
      interactionNextAvailableAtMsByItem: {
        ...seededState.interactionNextAvailableAtMsByItem,
        quartz: 0,
      },
    };

    expect(isInteractionAvailable(notOwned, "quartz", 0)).toBe(false);
  });

  it("applies winding rewards as enjoyment bursts and starts a cooldown", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        manual: 1,
      },
    };

    const nowMs = 1_000;
    const missState = applyWindingReward(seededState, "manual", nowMs, "miss");
    const goodState = applyWindingReward(seededState, "manual", nowMs, "good");
    const perfectState = applyWindingReward(seededState, "manual", nowMs, "perfect");

    expect(missState.enjoymentCents).toBeLessThan(goodState.enjoymentCents);
    expect(goodState.enjoymentCents).toBeLessThan(perfectState.enjoymentCents);
    expect(getInteractionCooldownRemainingMs(perfectState, "manual", nowMs)).toBe(
      INTERACTION_BASE_COOLDOWN_MS,
    );
  });

  it("applies automatic rewards by charging power reserve (clamped) and increasing enjoyment rate", () => {
    const baseState = createInitialState();
    const seededState: GameState = {
      ...baseState,
      items: {
        ...baseState.items,
        automatic: 1,
      },
      watchModels: {
        ...baseState.watchModels,
        [MODEL_IDS.automatic]: 1,
      },
    };

    const baselineRate = getEnjoymentRateCentsPerSec(seededState);
    const nowMs = 5_000;
    const rewardedState = applyAutomaticReward(seededState, "automatic", nowMs, "perfect");

    expect(getPowerReserveForItem(rewardedState, "automatic")).toBeGreaterThan(0);
    expect(getEnjoymentRateCentsPerSec(rewardedState)).toBeGreaterThan(baselineRate);

    let charged: GameState = seededState;
    for (let i = 0; i < 10; i += 1) {
      charged = applyAutomaticReward(
        charged,
        "automatic",
        nowMs + i * INTERACTION_BASE_COOLDOWN_MS,
        "perfect",
      );
    }

    expect(getPowerReserveForItem(charged, "automatic")).toBe(1);
  });

  it("decays power reserve over simulation steps", () => {
    const baseState = createInitialState();
    const seededState: GameState = {
      ...baseState,
      items: {
        ...baseState.items,
        automatic: 1,
      },
    };

    const charged = applyAutomaticReward(seededState, "automatic", 0, "perfect");
    const startingReserve = getPowerReserveForItem(charged, "automatic");
    expect(startingReserve).toBeGreaterThan(0);

    let next = charged;
    for (let i = 0; i < 10; i += 1) {
      next = step(next, 1_000, i * 1_000);
    }

    expect(getPowerReserveForItem(next, "automatic")).toBeLessThan(startingReserve);
  });

  it("applies quartz rewards as a cash payout and starts a cooldown", () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 1,
      },
    };

    const nowMs = 2_500;
    const rewarded = applyQuartzReward(seededState, "quartz", nowMs, "perfect");

    expect(rewarded.currencyCents).toBeGreaterThan(seededState.currencyCents);
    expect(getInteractionCooldownRemainingMs(rewarded, "quartz", nowMs)).toBe(
      INTERACTION_BASE_COOLDOWN_MS,
    );
  });

  it("supports practice mode without rewards or cooldown", () => {
    const baseState = createInitialState();
    const seededState: GameState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 1,
      },
      currencyCents: 250_000,
      enjoymentCents: 25_000,
    };

    const nowMs = 12_000;
    const practiced = applyQuartzReward(seededState, "quartz", nowMs, "perfect", {
      mode: "practice",
    });

    expect(practiced.currencyCents).toBe(seededState.currencyCents);
    expect(getInteractionCooldownRemainingMs(practiced, "quartz", nowMs)).toBe(0);
    expect(getInteractionStreakDetail(practiced).currentStreak).toBe(0);
  });

  it("applies capped perfect streak bonuses in normal mode and resets on miss", () => {
    const baseState = createInitialState();
    const seededState: GameState = {
      ...baseState,
      items: {
        ...baseState.items,
        manual: 1,
      },
    };

    const first = applyWindingReward(seededState, "manual", 0, "perfect");
    expect(first.enjoymentCents).toBe(150);
    expect(getInteractionStreakDetail(first).currentStreak).toBe(1);

    const second = applyWindingReward(
      first,
      "manual",
      INTERACTION_BASE_COOLDOWN_MS,
      "perfect",
    );
    expect(second.enjoymentCents).toBe(315);
    expect(getInteractionStreakDetail(second).currentStreak).toBe(2);

    const third = applyWindingReward(
      second,
      "manual",
      INTERACTION_BASE_COOLDOWN_MS * 2,
      "miss",
    );
    expect(getInteractionStreakDetail(third).currentStreak).toBe(0);

    const afterReset = applyWindingReward(
      third,
      "manual",
      INTERACTION_BASE_COOLDOWN_MS * 3,
      "perfect",
    );
    expect(afterReset.enjoymentCents - third.enjoymentCents).toBe(150);
    expect(getInteractionStreakDetail(afterReset).currentStreak).toBe(1);
  });
});
