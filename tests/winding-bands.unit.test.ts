import { describe, expect, it } from "vitest";
import {
  getOutcomeTierFromBand,
  getWindingBand,
  getWindingBandLabel,
  getWindingPenaltyFlags,
  getWindingTension,
  getWindingVelocity,
} from "../src/ui/components/winding/windingMath";
import { formatMoneyFromCents } from "../src/game/format";
import {
  ENJOYMENT_BY_TIER_CENTS,
  getWindingLiveMessage,
  getWindingRewardCopy,
} from "../src/ui/components/WindingMiniGameModal";

describe("winding band rules", () => {
  it("maps progress to the correct bands", () => {
    expect(getWindingBand(0)).toBe("under");
    expect(getWindingBand(0.299)).toBe("under");
    expect(getWindingBand(0.3)).toBe("good");
    expect(getWindingBand(0.69)).toBe("good");
    expect(getWindingBand(0.7)).toBe("perfect");
    expect(getWindingBand(0.969)).toBe("perfect");
    expect(getWindingBand(0.984)).toBe("perfect");
    expect(getWindingBand(0.985)).toBe("over");
    expect(getWindingBand(1)).toBe("over");
  });

  it("flags the soft and hard penalty bands", () => {
    expect(getWindingPenaltyFlags(0.96)).toEqual({ softPenalty: false, strictPenalty: false });
    expect(getWindingPenaltyFlags(0.97)).toEqual({ softPenalty: true, strictPenalty: false });
    expect(getWindingPenaltyFlags(0.985)).toEqual({ softPenalty: true, strictPenalty: true });
  });

  it("maps bands to outcome tiers", () => {
    expect(getOutcomeTierFromBand("under")).toBe("miss");
    expect(getOutcomeTierFromBand("good")).toBe("good");
    expect(getOutcomeTierFromBand("perfect")).toBe("perfect");
    expect(getOutcomeTierFromBand("over")).toBe("miss");
  });

  it("exposes the legend copy used by the modal", () => {
    expect(getWindingBandLabel("under")).toBe("Under-wound");
    expect(getWindingBandLabel("good")).toBe("Good wind");
    expect(getWindingBandLabel("perfect")).toBe("Perfect tension");
    expect(getWindingBandLabel("over")).toBe("Over-wound!");
  });

  it("shows tension growing through perfect and surges in the penalty band", () => {
    expect(getWindingTension(0)).toBe(0);
    expect(getWindingTension(0.3)).toBeGreaterThanOrEqual(0);
    expect(getWindingTension(0.5)).toBeGreaterThan(0);
    expect(getWindingTension(0.75)).toBeGreaterThan(getWindingTension(0.4));
    expect(getWindingTension(0.96)).toBeGreaterThan(getWindingTension(0.9));
  });

  it("keeps velocity non-negative and accelerating toward over-wind", () => {
    const baseSpeed = getWindingVelocity(0.3);
    const perfectVelocity = getWindingVelocity(0.7);
    const overVelocity = getWindingVelocity(0.96);

    expect(baseSpeed).toBeGreaterThanOrEqual(0);
    expect(perfectVelocity).toBeGreaterThan(baseSpeed);
    expect(overVelocity).toBeGreaterThanOrEqual(perfectVelocity);
    expect(getWindingVelocity(1)).toBeLessThanOrEqual(1);
  });
});

describe("winding mini-game messaging", () => {
  it("reports running versus stopped live-region copy", () => {
    const runningCopy = getWindingLiveMessage({
      result: null,
      progressPercent: 40,
      bandLabel: "Good wind",
      tensionPercent: 60,
      softWarningActive: true,
    });

    expect(runningCopy).toMatch(/Keep winding/i);
    expect(runningCopy).toMatch(/Tension 60%/i);
    expect(runningCopy).toMatch(/red glow/i);

    const outcome = { tier: "perfect", performance: 0.98 };
    const stoppedCopy = getWindingLiveMessage({
      result: outcome,
      progressPercent: 92,
      bandLabel: "Perfect tension",
      tensionPercent: 95,
      softWarningActive: false,
    });

    expect(stoppedCopy).toContain("Stopped at 92%");
    expect(stoppedCopy).toMatch(/Perfect tension/i);
  });

  it("builds tier reward copy with the right values", () => {
    const perfectCopy = getWindingRewardCopy("perfect");
    const perfectMoney = formatMoneyFromCents(ENJOYMENT_BY_TIER_CENTS.perfect);
    expect(perfectCopy.headline).toContain(perfectMoney);
    expect(perfectCopy.headline).toMatch(/Perfect timing pays 2×/i);
    expect(perfectCopy.detail).toMatch(/double/i);

    const missCopy = getWindingRewardCopy("miss");
    const missMoney = formatMoneyFromCents(ENJOYMENT_BY_TIER_CENTS.miss);
    expect(missCopy.headline).toContain(missMoney);
    expect(missCopy.headline).toMatch(/Miss hits/i);
  });
});
