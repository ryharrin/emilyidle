import { describe, expect, it } from "vitest";

import { CATALOG_ENTRIES, getCatalogPassportMetadata } from "../src/game/catalog";

describe("catalog passport metadata", () => {
  it("attaches passport metadata to every catalog entry", () => {
    for (const entry of CATALOG_ENTRIES) {
      expect(entry.passport.referenceFamily.value.length).toBeGreaterThan(0);
      expect(entry.passport.referenceFamily.provenance).toMatch(
        /^(primary|secondary|inferred|unknown)$/,
      );
      expect(entry.passport.productionEra.value.length).toBeGreaterThan(0);
      expect(entry.passport.caseMaterial.value.length).toBeGreaterThan(0);
      expect(entry.passport.movementOrigin.value.length).toBeGreaterThan(0);
      expect(entry.passport.sourceSummary.length).toBeGreaterThan(0);
    }
  });

  it("keeps provenance-aware real-world fields for known references", () => {
    const rolexGmt = getCatalogPassportMetadata("rolex-rolex-gmt-master-ii-ref-126713grnr");
    expect(rolexGmt.referenceFamily.value).toContain("GMT-Master II");
    expect(rolexGmt.productionEra.provenance).toBe("secondary");

    const seikoAstron = getCatalogPassportMetadata("seiko-astron-gps-solar-ssj003");
    expect(seikoAstron.referenceFamily.value).toContain("Astron GPS Solar");
    expect(seikoAstron.movementOrigin.value).toBe("Japanese");
  });

  it("uses explicit unknown fallbacks when data is unavailable", () => {
    const fallbackEntry = getCatalogPassportMetadata("rolex-calibrorolex");
    expect(fallbackEntry.productionEra.value).toBe("Unknown era");
    expect(fallbackEntry.productionEra.provenance).toBe("unknown");

    const missingEntry = getCatalogPassportMetadata("does-not-exist");
    expect(missingEntry.referenceFamily.value).toBe("Unknown reference family");
    expect(missingEntry.sourceSummary).toContain("No catalog entry found");
  });
});
