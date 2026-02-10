import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { clickLocatorSafely } from "./helpers/interactions";

const CATALOG_FILE_URL = new URL("../src/game/catalog.ts", import.meta.url);
const WIKIMEDIA_PREFIX = "https://upload.wikimedia.org/wikipedia/commons/";
const CATALOG_SRC_PATH = "/emilyidle/catalog/";
const DECODE_SAMPLE_SIZE = 3;
const DECODE_POLL_TIMEOUT_MS = 20_000;
const URL_CHECK_CONCURRENCY = 8;
const LOCAL_CATALOG_OVERRIDES: Record<string, string> = {
  "0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo%2C_met%C3%A0_anni_Novanta.jpg":
    "0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo,_meta_anni_Novanta.jpg",
  "b/b1/Rolex_Datejust_ref._16013%2C_seconda_met%C3%A0_anni_%2770-primi_%2780.jpg":
    "b/b1/Rolex_Datejust_ref._16013,_seconda_meta_anni_'70-primi_'80.jpg",
};

const getCatalogImageRelatives = async () => {
  const text = await readFile(CATALOG_FILE_URL, "utf8");
  const matches: string[] = [];
  for (const match of text.matchAll(new RegExp(`${WIKIMEDIA_PREFIX}([^"']+)`, "g"))) {
    matches.push(match[1] ?? "");
  }
  return Array.from(new Set(matches.filter(Boolean))).sort();
};

const formatMissing = (missing: string[]) => {
  const display = missing.slice(0, 10);
  const lines = display.map((relative) => `- ${relative}`).join("\n");
  const suffix =
    missing.length > display.length ? `\n...and ${missing.length - display.length} more` : "";
  return `Missing catalog images (${missing.length}):\n${lines}${suffix}`;
};

const pickDeterministicSubset = (
  values: readonly string[],
  targetCount: number,
): ReadonlyArray<string> => {
  if (values.length <= targetCount) {
    return [...values].sort();
  }

  const sorted = [...values].sort();
  const picks = new Set<string>();
  const denominator = Math.max(targetCount - 1, 1);
  for (let i = 0; i < targetCount; i += 1) {
    const index = Math.floor((i * (sorted.length - 1)) / denominator);
    const value = sorted[index];
    if (value) {
      picks.add(value);
    }
  }

  return [...picks];
};

const resolveCatalogImageUrl = (catalogRoot: string, relative: string): string => {
  const localRelative = LOCAL_CATALOG_OVERRIDES[relative] ?? relative;
  return new URL(localRelative, catalogRoot).toString();
};

test("catalog images exist under public catalog", async ({ page }) => {
  test.slow();

  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { quartz: 150, automatic: 0, manual: 0, tourbillon: 0 },
    upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
    unlockedMilestones: [],
    workshopBlueprints: 0,
    workshopPrestigeCount: 0,
    workshopUpgrades: {
      "etched-ledgers": false,
      "vault-calibration": false,
      "heritage-templates": false,
      "automation-blueprints": false,
    },
    maisonHeritage: 0,
    maisonReputation: 0,
    maisonUpgrades: {
      "atelier-charter": false,
      "heritage-loom": false,
      "global-vitrine": false,
    },
    maisonLines: {
      "atelier-line": false,
      "heritage-line": false,
      "complication-line": false,
    },
    achievementUnlocks: [],
    eventStates: {
      "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 },
    },
    discoveredCatalogEntries: [],
    catalogTierUnlocks: [],
  };
  const seededSettings = {
    themeMode: "system",
    hideCompletedAchievements: false,
    hiddenTabs: [],
    coachmarksDismissed: {},
    confirmNostalgiaUnlocks: true,
  };

  await page.addInitScript(
    ({ state, lastSimulatedAtMs, settings }) => {
      window.requestAnimationFrame = (() => 0) as unknown as typeof window.requestAnimationFrame;
      window.cancelAnimationFrame = (() => {}) as unknown as typeof window.cancelAnimationFrame;

      window.localStorage.clear();

      const payload = {
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs,
        state,
      };
      window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
      window.localStorage.setItem("emily-idle:settings", JSON.stringify(settings));
    },
    { state: seededState, lastSimulatedAtMs: Date.now(), settings: seededSettings },
  );

  await page.goto("http://127.0.0.1:5177/emilyidle/");
  const catalogTab = page.getByRole("tab", { name: "Catalog" });
  await expect(catalogTab).toHaveCount(1);
  await clickLocatorSafely(catalogTab);
  await expect(page.getByTestId("catalog-grid")).toBeVisible();

  const firstImage = page.locator('img[src*="/catalog/"]').first();
  await expect(firstImage).toBeVisible();
  await expect(firstImage).toHaveAttribute("src", /\/emilyidle\/catalog\//);

  const catalogRoot = new URL(CATALOG_SRC_PATH, page.url()).toString();
  expect(catalogRoot).toContain(CATALOG_SRC_PATH);

  const expectedRelatives = await getCatalogImageRelatives();
  const missing: string[] = [];

  for (let index = 0; index < expectedRelatives.length; index += URL_CHECK_CONCURRENCY) {
    const batch = expectedRelatives.slice(index, index + URL_CHECK_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (relative) => {
        const url = resolveCatalogImageUrl(catalogRoot, relative);
        expect(url).toContain(CATALOG_SRC_PATH);

        try {
          const response = await page.request.get(url, { timeout: 5_000 });
          const contentType = response.headers()["content-type"] ?? "";
          return response.status() === 200 && contentType.startsWith("image/");
        } catch {
          return false;
        }
      }),
    );

    for (const [batchIndex, found] of batchResults.entries()) {
      if (!found) {
        const relative = batch[batchIndex];
        if (relative) {
          missing.push(relative);
        }
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(formatMissing(missing));
  }

  const decodeRelatives = pickDeterministicSubset(expectedRelatives, DECODE_SAMPLE_SIZE);
  for (const relative of decodeRelatives) {
    const url = resolveCatalogImageUrl(catalogRoot, relative);
    await expect
      .poll(
        () =>
          page.evaluate(async (imageUrl) => {
            const image = new Image();
            image.src = imageUrl;

            try {
              if (typeof image.decode === "function") {
                await image.decode();
              } else {
                await new Promise<void>((resolve, reject) => {
                  image.onload = () => resolve();
                  image.onerror = () => reject(new Error("Image load failed."));
                });
              }
            } catch {
              return false;
            }

            return image.naturalWidth > 0 && !image.src.startsWith("data:image");
          }, url),
        { timeout: DECODE_POLL_TIMEOUT_MS },
      )
      .toBe(true);
  }
});
