import { expect, test } from "@playwright/test";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

test("selector contract anchors remain reachable", async ({ page }) => {
  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 0 },
    upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
    unlockedMilestones: ["showcase"],
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

  await page.addInitScript(
    ({ state, lastSimulatedAtMs }) => {
      window.localStorage.clear();
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs,
          state,
        }),
      );
      window.localStorage.setItem("emily-idle:settings", JSON.stringify({ hiddenTabs: [] }));
      window.localStorage.setItem(
        "emily-idle:navigation",
        JSON.stringify({ lastTabId: "collection" }),
      );
    },
    { state: seededState, lastSimulatedAtMs: Date.now() },
  );

  await page.goto("/");

  await expect(page.getByTestId("help-open")).toBeVisible();
  await page.getByTestId("help-open").click();
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await page.getByTestId("help-close").click();
  await expect(page.locator('[data-testid="help-modal"]')).toHaveCount(0);

  await page.getByRole("tab", { name: "Collection" }).click();
  await expect(page.getByTestId("next-unlock-cta-career")).toBeVisible();
  await page.getByTestId("next-unlock-cta-career").click();
  await expect(page.getByTestId("catalog-collection-context")).toBeVisible();
  await expect(page.getByTestId("catalog-upgrade-context")).toBeVisible();

  await page.getByRole("tab", { name: "Catalog" }).click();
  await expect(page.getByTestId("catalog-grid")).toBeVisible();
  await expect(page.getByTestId("catalog-card").first()).toBeVisible();
  await expect(page.getByTestId("catalog-shop")).toHaveCount(1);
  await expect(page.getByTestId("catalog-filters")).toBeVisible();
  await expect(page.getByTestId("catalog-search")).toBeVisible();

  await page.getByTestId("catalog-search").fill("126713GRNR");
  await expect(page.getByTestId(`catalog-gate-${CLASSIC_MODEL_ID}`)).toBeVisible();
  await expect(page.getByTestId(`catalog-lock-${CLASSIC_MODEL_ID}`)).toBeVisible();
  await expect(page.getByTestId(`catalog-why-${CLASSIC_MODEL_ID}`)).toBeVisible();
  await page.getByTestId(`catalog-why-${CLASSIC_MODEL_ID}`).click();
  await expect(page.getByTestId(`catalog-explain-${CLASSIC_MODEL_ID}`)).toBeVisible();

  await page.getByRole("tab", { name: "Settings" }).click();
  await expect(page.getByTestId("settings-clear-save")).toBeVisible();
  await page.getByTestId("settings-clear-save").click();
  await expect(page.getByTestId("settings-clear-save-confirm")).toBeVisible();
  await expect(page.getByTestId("settings-clear-save-cancel")).toBeVisible();
});
