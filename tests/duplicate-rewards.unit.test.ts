import { describe, expect, it } from "vitest";

import {
  DUPLICATE_REWARD_FLOOR,
  getDuplicateRewardMultiplierForCopy,
  getDuplicateRewardMultiplierForNextPurchase,
  getDuplicateRewardSum,
} from "../src/game/state";

describe("duplicate rewards", () => {
  it("returns 1.0x for the first copy", () => {
    expect(getDuplicateRewardMultiplierForCopy(0)).toBe(1);
    expect(getDuplicateRewardMultiplierForNextPurchase(0)).toBe(1);
  });

  it("returns ~0.70x for the second copy", () => {
    expect(getDuplicateRewardMultiplierForCopy(1)).toBeCloseTo(0.7, 8);
    expect(getDuplicateRewardMultiplierForNextPurchase(1)).toBeCloseTo(0.7, 8);
  });

  it("is monotonic non-increasing and floors at 0.10x", () => {
    const multipliers = Array.from({ length: 30 }, (_, index) =>
      getDuplicateRewardMultiplierForCopy(index),
    );

    for (let i = 0; i < multipliers.length; i += 1) {
      expect(Number.isFinite(multipliers[i])).toBe(true);
      expect(multipliers[i]).toBeGreaterThanOrEqual(DUPLICATE_REWARD_FLOOR);
      if (i > 0) {
        expect(multipliers[i]).toBeLessThanOrEqual(multipliers[i - 1]);
      }
    }

    expect(getDuplicateRewardMultiplierForCopy(7)).toBe(DUPLICATE_REWARD_FLOOR);
  });

  it("sums per-copy multipliers", () => {
    const secondCopy = getDuplicateRewardMultiplierForCopy(1);
    expect(getDuplicateRewardSum(0)).toBe(0);
    expect(getDuplicateRewardSum(1)).toBeCloseTo(1, 8);
    expect(getDuplicateRewardSum(2)).toBeCloseTo(1 + secondCopy, 8);
  });
});
