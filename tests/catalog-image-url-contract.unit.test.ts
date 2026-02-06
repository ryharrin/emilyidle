import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

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
    expect(text).toMatch(/entry\.image\.url\.startsWith\(\"\/catalog\/\"\)/);
    expect(text).toMatch(/entry\.image\.url\.startsWith\(\"catalog\/\"\)/);
  });
});
