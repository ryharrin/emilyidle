import { expect, test } from "@playwright/test";
import { clickLocatorSafely } from "./helpers/interactions";

const CATALOG_SRC_PATH = "/emilyidle/catalog/";
const DECODE_SAMPLE_SIZE = 3;
const DECODE_POLL_TIMEOUT_MS = 20_000;

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

test("catalog images render under the /emilyidle base path", async ({ page }) => {
  test.slow();
  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { starter: 150, classic: 0, chronograph: 0, tourbillon: 0 },
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

  await page.goto("/emilyidle/");

  const catalogTab = page.getByRole("tab", { name: "Catalog" });
  if ((await catalogTab.count()) > 0) {
    await clickLocatorSafely(catalogTab);
    await expect(page.getByTestId("catalog-grid")).toBeVisible();
  }

  const images = page.locator('img[src*="/catalog/"]');
  const imageCount = await images.count();
  expect(imageCount).toBeGreaterThan(0);

  await expect(images.first()).toBeVisible();
  const renderedSources = await images.evaluateAll((nodes) =>
    Array.from(
      new Set(
        nodes
          .map((node) => (node as HTMLImageElement).getAttribute("src") ?? "")
          .filter((src) => src.includes("/catalog/")),
      ),
    ),
  );

  expect(renderedSources.length).toBeGreaterThan(0);
  for (const src of renderedSources) {
    expect(src).toContain(CATALOG_SRC_PATH);
  }

  const decodeSourcePool = renderedSources.filter((src) => !/\.svg(?:$|\?)/i.test(src));
  const decodeCandidates = pickDeterministicSubset(
    decodeSourcePool.length > 0 ? decodeSourcePool : renderedSources,
    DECODE_SAMPLE_SIZE,
  );
  expect(decodeCandidates.length).toBeGreaterThan(0);
  for (const candidateSrc of decodeCandidates) {
    await expect
      .poll(
        () =>
          page.evaluate(async (src) => {
            const image = new Image();
            image.src = src;

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
          }, candidateSrc),
        { timeout: DECODE_POLL_TIMEOUT_MS },
      )
      .toBe(true);
  }
});
