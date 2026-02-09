import { describe, expect, it } from "vitest";

import {
  buildMaisonPrestigeSummary,
  buildNostalgiaPrestigeSummary,
  buildWorkshopPrestigeSummary,
} from "../src/ui/prestigeSummary";

describe("prestige summary builders", () => {
  it("builds workshop summary with the correct tier and gain", () => {
    const summary = buildWorkshopPrestigeSummary(3);

    expect(summary.tier).toBe("workshop");
    expect(summary.delta.join(" ")).toContain("+3 Blueprints");
    expect(summary.next.join(" ")).toContain("Atelier upgrades");
    expect(summary.current.join(" ")).toContain("cash and enjoyment");
  });

  it("builds maison summary with the correct tier and gains", () => {
    const summary = buildMaisonPrestigeSummary(2, 1);

    expect(summary.tier).toBe("maison");
    expect(summary.delta.join(" ")).toContain("+2 Heritage");
    expect(summary.delta.join(" ")).toContain("+1 Reputation");
    expect(summary.next.join(" ")).toContain("Maison upgrades");
    expect(summary.delta.join(" ")).toContain("Atelier progress");
  });

  it("builds nostalgia summary with the correct tier and gain", () => {
    const summary = buildNostalgiaPrestigeSummary(4);

    expect(summary.tier).toBe("nostalgia");
    expect(summary.delta.join(" ")).toContain("+4 Nostalgia");
    expect(summary.next.join(" ")).toContain("Catalog discoveries");
    expect(summary.delta.join(" ")).toContain("Career");
  });
});
