import { describe, expect, it } from "vitest";
import { getOutcomeTier, getPerformance } from "../src/ui/components/QuartzMiniGameModal";

describe("Quartz outcome math", () => {
  it("keeps perfect reserved for the tightest hits and widens the good window", () => {
    expect(getOutcomeTier(0.5)).toBe("perfect");
    expect(getOutcomeTier(0.52)).toBe("perfect");
    expect(getOutcomeTier(0.54)).toBe("good");
    expect(getOutcomeTier(0.32)).toBe("good");
    expect(getOutcomeTier(0.31)).toBe("miss");
  });

  it("drops performance from 1 toward 0 as distance grows", () => {
    const nearCenter = getPerformance(0.5);
    const insideGood = getPerformance(0.54);
    const outsideGood = getPerformance(0.31);
    const extremeMiss = getPerformance(0);

    expect(nearCenter).toBe(1);
    expect(insideGood).toBeLessThan(nearCenter);
    expect(outsideGood).toBeLessThan(insideGood);
    expect(extremeMiss).toBeLessThan(outsideGood);
  });
});
