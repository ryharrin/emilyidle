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
    expect(summary.gain.join(" ")).toContain("+3 Blueprints");
    expect(summary.keep.join(" ")).toContain("Workshop upgrades");
    expect(summary.lose.join(" ")).toContain("Vault cash");
  });

  it("builds maison summary with the correct tier and gains", () => {
    const summary = buildMaisonPrestigeSummary(2, 1);

    expect(summary.tier).toBe("maison");
    expect(summary.gain.join(" ")).toContain("+2 Heritage");
    expect(summary.gain.join(" ")).toContain("+1 Reputation");
    expect(summary.keep.join(" ")).toContain("Legacy upgrades");
    expect(summary.lose.join(" ")).toContain("Workshop progress");
  });

  it("builds nostalgia summary with the correct tier and gain", () => {
    const summary = buildNostalgiaPrestigeSummary(4);

    expect(summary.tier).toBe("nostalgia");
    expect(summary.gain.join(" ")).toContain("+4 Nostalgia");
    expect(summary.keep.join(" ")).toContain("Catalog discoveries");
    expect(summary.lose.join(" ")).toContain("Career");
  });
});
