import { describe, expect, it } from "vitest";
import {
  getOutcomeTierFromBand,
  getWindingBand,
  getWindingBandLabel,
  getWindingTension,
  getWindingVelocity,
} from "../src/ui/components/winding/windingMath";

describe("winding band rules", () => {
  it("maps progress to the correct bands", () => {
    expect(getWindingBand(0)).toBe("under");
    expect(getWindingBand(0.299)).toBe("under");
    expect(getWindingBand(0.3)).toBe("good");
    expect(getWindingBand(0.69)).toBe("good");
    expect(getWindingBand(0.7)).toBe("perfect");
    expect(getWindingBand(0.95)).toBe("perfect");
    expect(getWindingBand(0.951)).toBe("over");
    expect(getWindingBand(1)).toBe("over");
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
