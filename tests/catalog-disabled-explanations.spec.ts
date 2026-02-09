import { test, expect } from "@playwright/test";

import { openCatalogFilters } from "./helpers/catalogFilters";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

test.describe("catalog disabled explanations", () => {
  test("shows explainer for gated catalog entries", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 5, classic: 0, chronograph: 0, tourbillon: 0 },
      upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
      unlockedMilestones: ["collector-shelf", "showcase"],
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
    await page.getByTestId("catalog-filters").getByTestId("catalog-search").fill("126713GRNR");

    const gate = page.getByTestId(`catalog-gate-${CLASSIC_MODEL_ID}`);
    await gate.scrollIntoViewIfNeeded();
    await expect(gate).toBeVisible();
    await expect(page.getByTestId(`catalog-buy-${CLASSIC_MODEL_ID}`)).toHaveCount(0);
    await expect(page.getByTestId(`catalog-lock-${CLASSIC_MODEL_ID}`)).toBeVisible();

    await page.getByTestId(`catalog-why-${CLASSIC_MODEL_ID}`).click();
    const explainer = page.getByTestId(`catalog-explain-${CLASSIC_MODEL_ID}`);
    await expect(explainer).toBeVisible();
    await expect(
      explainer.getByTestId(`catalog-reason-${CLASSIC_MODEL_ID}-undiscovered`),
    ).toBeVisible();
    await expect(explainer.getByTestId(`catalog-reason-${CLASSIC_MODEL_ID}-funds`)).toBeVisible();
    await expect(explainer).toContainText(/Funds|Enjoyment/);
    await expect(explainer).toContainText(/Next:/);
  });
});
