import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import {
  CATALOG_ENTRIES,
  getCatalogFallbackImageUrl,
  getCatalogImageUrl,
} from "../src/game/catalog";

const cwd = (globalThis as { process?: { cwd?: () => string } }).process?.cwd?.();
if (!cwd) {
  throw new Error("Expected process.cwd to be available for catalog contract test.");
}
const CATALOG_FILE_PATH = `${cwd.replace(/\/$/, "")}/src/game/catalog.ts`;

describe("catalog image URL mapping contract", () => {
  it("keeps base-aware local catalog mapping", async () => {
    const text = await readFile(CATALOG_FILE_PATH, "utf8");

    expect(text).toMatch(/const\s+BASE_URL\s*=[\s\S]*?import\.meta\.env\.BASE_URL/);
    expect(text).toMatch(/const\s+LOCAL_CATALOG_ROOT\s*=\s*`[^`]*\$\{BASE_URL\}[^`]*catalog\//);
    expect(text).toMatch(/const\s+LOCAL_CATALOG_OVERRIDES[^=]*=/);
    expect(text).toMatch(/function\s+resolveCatalogAssetUrl\s*\([\s\S]*?\)\s*\{/);
    expect(text).toMatch(/function\s+getCatalogImageUrl\s*\([\s\S]*?\)\s*\{/);
    expect(text).toMatch(/return\s+resolveCatalogAssetUrl\(localPath\);/);
    expect(text).toMatch(/entry\.image\.url\.startsWith\("\/catalog\/"\)/);
    expect(text).toMatch(/entry\.image\.url\.startsWith\("catalog\/"\)/);
  });

  it("resolves image URLs and fallback placeholders through BASE_URL-safe catalog paths", () => {
    const baseUrl =
      typeof import.meta.env.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";
    const catalogRoot = `${baseUrl}catalog/`;

    for (const entry of CATALOG_ENTRIES) {
      const src = getCatalogImageUrl(entry);
      expect(src.startsWith(catalogRoot)).toBe(true);
      const fallback = getCatalogFallbackImageUrl(entry);
      expect(fallback.startsWith(catalogRoot)).toBe(true);

      if (entry.movementType === "quartz") {
        expect(fallback.endsWith("/catalog/placeholders/quartz-tier.svg")).toBe(true);
      } else if (entry.movementType === "tourbillon") {
        expect(fallback.endsWith("/catalog/placeholders/lux-tier.svg")).toBe(true);
      } else {
        expect(fallback.endsWith("/catalog/placeholders/mid-tier.svg")).toBe(true);
      }
    }
  });

  it("does not use placeholder assets as primary catalog card media", () => {
    for (const entry of CATALOG_ENTRIES) {
      expect(entry.image.url.includes("/catalog/placeholders/")).toBe(false);
      expect(getCatalogImageUrl(entry).includes("/catalog/placeholders/")).toBe(false);
    }
  });
});
