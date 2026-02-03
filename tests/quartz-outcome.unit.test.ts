import { describe, expect, it } from "vitest";
import {
  getOutcomeTier,
  getPerformance,
  timeToPosition,
} from "../src/ui/components/QuartzMiniGameModal";

describe("Quartz outcome math", () => {
  it("rewards hits near the target position", () => {
    const target = 0; // 12 o'clock position

    // Direct hit on target
    expect(getOutcomeTier(0, target)).toBe("perfect");
    expect(getOutcomeTier(0.02, target)).toBe("perfect");
    expect(getOutcomeTier(0.98, target)).toBe("perfect"); // wraps around

    // Within good window
    expect(getOutcomeTier(0.15, target)).toBe("good");
    expect(getOutcomeTier(0.85, target)).toBe("good"); // wraps around

    // Miss - too far
    expect(getOutcomeTier(0.5, target)).toBe("miss");
    expect(getOutcomeTier(0.4, target)).toBe("miss");
  });

  it("works with different target positions", () => {
    // Target at 3 o'clock (0.25 = 3/12)
    const target3 = 0.25;
    expect(getOutcomeTier(0.25, target3)).toBe("perfect");
    expect(getOutcomeTier(0.27, target3)).toBe("perfect");
    expect(getOutcomeTier(0.23, target3)).toBe("perfect");
    // Distance from 0.1 to 0.25 is 0.15, which is within good window (0.18)
    expect(getOutcomeTier(0.1, target3)).toBe("good");
    // Distance from 0.05 to 0.25 is 0.20, which is outside good window
    expect(getOutcomeTier(0.05, target3)).toBe("miss");

    // Target at 6 o'clock (0.5 = 6/12)
    const target6 = 0.5;
    expect(getOutcomeTier(0.5, target6)).toBe("perfect");
    expect(getOutcomeTier(0.52, target6)).toBe("perfect");
    expect(getOutcomeTier(0.48, target6)).toBe("perfect");
    // Distance from 0 to 0.5 is 0.5, which is a miss
    expect(getOutcomeTier(0, target6)).toBe("miss");
  });

  it("drops performance from 1 toward 0 as distance from target grows", () => {
    const target = 0;

    const atTarget = getPerformance(0, target);
    const closeToTarget = getPerformance(0.02, target);
    const insideGood = getPerformance(0.15, target);
    const oppositeSide = getPerformance(0.5, target);

    expect(atTarget).toBe(1);
    expect(closeToTarget).toBeLessThan(atTarget);
    expect(insideGood).toBeLessThan(closeToTarget);
    expect(oppositeSide).toBeLessThan(insideGood);
    expect(oppositeSide).toBe(0); // maximum distance
  });
});

describe("time to position conversion", () => {
  it("converts times to correct positions", () => {
    // 12:00 = 0 (or 1.0)
    expect(timeToPosition(12, 0)).toBe(0);

    // 3:00 = 0.25
    expect(timeToPosition(3, 0)).toBe(0.25);

    // 6:00 = 0.5
    expect(timeToPosition(6, 0)).toBe(0.5);

    // 9:00 = 0.75
    expect(timeToPosition(9, 0)).toBe(0.75);

    // 12:30 = ~0.042 (30 minutes = 1/24 of a rotation)
    expect(timeToPosition(12, 30)).toBeCloseTo(0.042, 3);

    // 1:00 = ~0.083 (1/12)
    expect(timeToPosition(1, 0)).toBeCloseTo(0.083, 3);
  });
});
