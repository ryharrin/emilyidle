import { test, expect } from "@playwright/test";

const selectors = {
  currency: "#currency",
  income: "#income",
  collectionValue: "#collection-value",
  softcap: "#softcap",
  collectionCards: "#collection-list .card",
  upgradeCards: "#upgrade-list .card",
  milestoneCards: "#milestone-list .card",
  setBonusCards: "#set-bonus-list .card",
  workshopPanel: '[data-testid="workshop-panel"]',
  workshopGain: '[data-testid="workshop-reset"] .workshop-value',
  workshopResetButton: '[data-testid="workshop-panel"] .workshop-cta button',
  maisonPanel: '[data-testid="maison-panel"]',
  maisonGain: '[data-testid="maison-reset"] .workshop-value',
  maisonResetButton: '[data-testid="maison-panel"] .workshop-cta button',
  maisonUpgradeCards: '[data-testid="maison-upgrade-card"]',
  maisonLines: '[data-testid="maison-lines"]',
  maisonLineCards: '[data-testid="maison-line-card"]',
  automationToggle: '[data-testid="automation-controls"]',
  exportSave: "#export-save",
  importSave: "#import-save",
  importText: "#import-save-text",
  saveStatus: "#save-status",
};

test.describe("collection loop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders collection structure and stats", async ({ page }) => {
    await expect(page.locator(selectors.currency)).toHaveText(/\$/);
    await expect(page.locator(selectors.income)).toHaveText(/\$/);
    await expect(page.locator(selectors.collectionValue)).toHaveText(/\$/);
    await expect(page.locator(selectors.softcap)).toHaveText(/% efficiency/);
    await expect(page.locator("#enjoyment")).toHaveText(/\$/);
    await expect(page.locator("#enjoyment-rate")).toHaveText(/\$/);

    await expect(page.locator(selectors.collectionCards)).toHaveCount(4);
    await expect(page.locator(selectors.upgradeCards)).toHaveCount(3);
    await expect(page.locator(selectors.milestoneCards)).toHaveCount(3);
    await expect(page.locator(selectors.setBonusCards)).toHaveCount(3);
  });

  test("buy button disabled when unaffordable", async ({ page }) => {
    const firstCard = page.locator(selectors.collectionCards).first();
    const buyButton = firstCard.getByRole("button", { name: /Buy \(/ });
    await expect(buyButton).toBeDisabled();
  });

  test("export and import save round trip", async ({ page }) => {
    await page.getByRole("button", { name: "Export" }).click();
    const saveText = await page.inputValue(selectors.importText);
    expect(saveText.length).toBeGreaterThan(0);

    await page.fill(selectors.importText, "");
    await page.getByRole("button", { name: "Import" }).click();
    await expect(page.locator(selectors.saveStatus)).toContainText("Paste an exported save string");

    await page.fill(selectors.importText, saveText);
    await page.getByRole("button", { name: "Import" }).click();
    await expect(page.locator(selectors.saveStatus)).toContainText("Imported save from");
  });

  test("catalog filters and sources", async ({ page }) => {
    const catalogFilters = page.getByTestId("catalog-filters");
    const catalogCards = page.getByTestId("catalog-grid").getByTestId("catalog-card");
    const resultsCount = page.getByTestId("catalog-results-count");

    const initialCount = await catalogCards.count();
    await expect(resultsCount).toContainText(`${initialCount} results`);

    await catalogFilters.getByTestId("catalog-brand").selectOption("Rolex");
    const rolexCount = await catalogCards.count();
    expect(rolexCount).toBeGreaterThan(0);
    expect(rolexCount).toBeLessThan(initialCount);
    await expect(resultsCount).toContainText(`${rolexCount} results`);

    await catalogFilters.getByTestId("catalog-search").fill("gmt");
    const filteredCount = await catalogCards.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(rolexCount);
    await expect(resultsCount).toContainText(`${filteredCount} results`);

    const sourcesList = page.getByTestId("sources-list");
    await expect(sourcesList.getByTestId("source-item")).toHaveCount(initialCount);
    await expect(
      sourcesList.getByTestId("source-links").first().getByRole("link", { name: "Source" }),
    ).toBeVisible();
  });

  test("workshop panel shows gain and reset state", async ({ page }) => {
    const workshopPanel = page.locator(selectors.workshopPanel);
    await expect(workshopPanel).toHaveCount(0);

    const seededState = {
      currencyCents: 0,
      enjoymentCents: 800_000,
      items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 6 },
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
    await expect(page.locator(selectors.workshopPanel)).toBeVisible();
    await expect(page.locator(selectors.workshopGain).last()).toContainText("+1 Blueprints");
    await expect(page.locator(selectors.workshopResetButton)).toBeEnabled();
  });

  test("automation toggle appears after automation upgrade", async ({ page }) => {
    const automationToggle = page.locator(selectors.automationToggle);
    await expect(automationToggle).toContainText("Unlock automation with Workshop blueprints.");

    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 0 },
      upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
      unlockedMilestones: [],
      workshopBlueprints: 0,
      workshopPrestigeCount: 1,
      workshopUpgrades: {
        "etched-ledgers": false,
        "vault-calibration": false,
        "heritage-templates": false,
        "automation-blueprints": true,
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
    await expect(page.locator(selectors.automationToggle).getByRole("button")).toHaveText(
      /Auto-buy (on|off)/,
    );
  });

  test("maison panel shows gain and upgrades", async ({ page }) => {
    const maisonPanel = page.locator(selectors.maisonPanel);
    await expect(maisonPanel).toHaveCount(0);

    const seededState = {
      currencyCents: 0,
      enjoymentCents: 4_000_000,
      items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 6 },
      upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
      unlockedMilestones: [],
      workshopBlueprints: 3,
      workshopPrestigeCount: 1,
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
    await expect(page.locator(selectors.maisonPanel)).toBeVisible();
    await expect(page.locator(selectors.maisonGain).nth(1)).toContainText("+2 Heritage");
    await expect(page.locator(selectors.maisonGain).nth(2)).toContainText("+0 Reputation");
    await expect(page.locator(selectors.maisonResetButton).first()).toBeEnabled();
    await expect(page.locator(selectors.maisonUpgradeCards)).toHaveCount(3);
  });

  test("achievements and events panels render", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 8 },
      upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
      unlockedMilestones: [],
      workshopBlueprints: 0,
      workshopPrestigeCount: 1,
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
    await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    await expect(page.getByText("Workshop reforged")).toBeVisible();
    await expect(page.getByText(/Auction weekend/)).toBeVisible();
    await expect(page.getByText(/Income x/).first()).toBeVisible();
  });
});
