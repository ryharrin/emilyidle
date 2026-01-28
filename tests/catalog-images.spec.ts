import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const CATALOG_FILE_URL = new URL("../src/game/catalog.ts", import.meta.url);
const WIKIMEDIA_PREFIX = "https://upload.wikimedia.org/wikipedia/commons/";
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

test("catalog images exist under public catalog", async ({ page }) => {
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

  await page.goto("http://127.0.0.1:5177/emilyidle/");
  const shouldReseed = await page.evaluate((starterCount) => {
    try {
      const raw = window.localStorage.getItem("emily-idle:save");
      if (!raw) {
        return true;
      }
      const parsed = JSON.parse(raw);
      return parsed?.state?.items?.starter !== starterCount;
    } catch {
      return true;
    }
  }, seededState.items.starter);
  if (shouldReseed) {
    await page.evaluate(
      ({ state, lastSimulatedAtMs, settings }) => {
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
    await page.reload();
  }
  let catalogRoot = "";
  const catalogTab = page.getByRole("tab", { name: "Catalog" });
  if ((await catalogTab.count()) > 0) {
    await catalogTab.click();
    await expect(page.getByTestId("catalog-grid")).toBeVisible();

    const firstImage = page.locator('img[src*="/catalog/"]').first();
    await expect(firstImage).toBeVisible();
    const src = await firstImage.getAttribute("src");
    if (!src) {
      throw new Error("Expected a catalog image src to derive catalog root.");
    }

    const [catalogPrefix] = src.split("/catalog/");
    catalogRoot = `${catalogPrefix}/catalog/`;
  } else {
    catalogRoot = new URL("catalog/", page.url()).toString();
  }
  if (!catalogRoot.startsWith("http")) {
    catalogRoot = new URL(catalogRoot, page.url()).toString();
  }
  const expectedRelatives = await getCatalogImageRelatives();
  const missing: string[] = [];

  for (const relative of expectedRelatives) {
    const localRelative = LOCAL_CATALOG_OVERRIDES[relative] ?? relative;
    const url = new URL(localRelative, catalogRoot).toString();
    const response = await page.request.get(url);
    const contentType = response.headers()["content-type"] ?? "";

    if (response.status() !== 200 || !contentType.startsWith("image/")) {
      missing.push(relative);
    }
  }

  if (missing.length > 0) {
    throw new Error(formatMissing(missing));
  }
});
