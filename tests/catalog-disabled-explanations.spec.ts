import { test, expect } from "@playwright/test";

import { openCatalogFilters } from "./helpers/catalogFilters";

const QUARTZ_MODEL_ID = "rolex-calibrorolex";

test.describe("catalog disabled explanations", () => {
  test("shows explainer for gated catalog entries", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { quartz: 5, automatic: 0, manual: 0, tourbillon: 0 },
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
      catalogTierUnlocks: [],
    };

    await page.addInitScript(
      ({ state, lastSimulatedAtMs }) => {
        const payload = {
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs,
          state,
        };
        window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
      },
      { state: seededState, lastSimulatedAtMs: Date.now() },
    );

    await page.goto("/");
    await page.getByRole("tab", { name: "Catalog" }).click();
    await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
    await openCatalogFilters(page);
    await page.getByTestId("catalog-filters").getByTestId("catalog-search").fill("Calibrorolex");

    const gate = page.getByTestId(`catalog-gate-${QUARTZ_MODEL_ID}`);
    await gate.scrollIntoViewIfNeeded();
    await expect(gate).toBeVisible();
    await expect(page.getByTestId(`catalog-buy-${QUARTZ_MODEL_ID}`)).toHaveCount(0);
    // Quartz tier is always unlocked (no milestone requirement), so no lock icon

    await page.getByTestId(`catalog-why-${QUARTZ_MODEL_ID}`).click();
    const explainer = page.getByTestId(`catalog-explain-${QUARTZ_MODEL_ID}`);
    await expect(explainer).toBeVisible();
    // Discovery system removed - no "undiscovered" reason
    await expect(explainer.getByTestId(`catalog-reason-${QUARTZ_MODEL_ID}-funds`)).toBeVisible();
    await expect(explainer).toContainText(/Funds|Enjoyment/);
    await expect(explainer).toContainText(/Next:/);
  });
});
