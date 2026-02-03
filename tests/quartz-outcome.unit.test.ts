import { describe, expect, it } from "vitest";
import { getOutcomeTier, getPerformance } from "../src/ui/components/QuartzMiniGameModal";

describe("Quartz outcome math", () => {
  it("rewards hits near the 12 o'clock target (progress 0 or 1.0)", () => {
    // Target is at 12 o'clock (progress 0 or 1.0)
    expect(getOutcomeTier(0)).toBe("perfect");
    expect(getOutcomeTier(0.02)).toBe("perfect");
    expect(getOutcomeTier(0.98)).toBe("perfect"); // wraps around, distance 0.02
    expect(getOutcomeTier(0.99)).toBe("perfect"); // wraps around, distance 0.01

    // Within good window
    expect(getOutcomeTier(0.15)).toBe("good");
    expect(getOutcomeTier(0.85)).toBe("good"); // wraps around, distance 0.15

    // Miss - opposite side of dial (6 o'clock = progress 0.5)
    expect(getOutcomeTier(0.5)).toBe("miss");
    expect(getOutcomeTier(0.4)).toBe("miss");
    expect(getOutcomeTier(0.6)).toBe("miss");
  });

  it("drops performance from 1 toward 0 as distance from target grows", () => {
    const atTarget = getPerformance(0);
    const closeToTarget = getPerformance(0.02);
    const insideGood = getPerformance(0.15);
    const oppositeSide = getPerformance(0.5);

    expect(atTarget).toBe(1);
    expect(closeToTarget).toBeLessThan(atTarget);
    expect(insideGood).toBeLessThan(closeToTarget);
    expect(oppositeSide).toBeLessThan(insideGood);
    expect(oppositeSide).toBe(0); // maximum distance
  });

  it("handles wraparound correctly near progress 1.0", () => {
    // Values near 1.0 should map to small distances (close to target)
    expect(getOutcomeTier(0.97)).toBe("good"); // distance 0.03
    expect(getOutcomeTier(0.98)).toBe("perfect"); // distance 0.02
    expect(getOutcomeTier(0.99)).toBe("perfect"); // distance 0.01
    expect(getOutcomeTier(1.0)).toBe("perfect"); // distance 0
  });
});
