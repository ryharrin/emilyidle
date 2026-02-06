import { test, expect } from "@playwright/test";

const selectors = {
  currency: "#currency",
  income: "#income",
  collectionValue: "#collection-value",
  softcap: "#softcap",
  catalogCards: '[data-testid="catalog-grid"] [data-testid="catalog-card"]',
  upgradesCallout: '[data-testid="upgrades-callout"]',
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
  statsMetrics: '[data-testid="stats-metrics"]',
  eventMultiplier: '[data-testid="stats-event-multiplier"]',
};

const STARTER_MODEL_ID = "rolex-calibrorolex";
const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";
const TOURBILLON_MODEL_ID =
  "audemars-piguet-audemars-piguet-ref-25831-con-datario-riserva-di-carica-e-tourbillon-risalente-al-1997";
const WATCH_MODEL_COUNT = 59;

test.describe("collection loop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("autosave writes fresh localStorage payload", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.goto("/");

    await page.waitForFunction(
      () => window.localStorage.getItem("emily-idle:save") !== null,
      null,
      { timeout: 3000 },
    );

    const { raw, parsed } = await page.evaluate(() => {
      const saved = window.localStorage.getItem("emily-idle:save");
      return {
        raw: saved,
        parsed: saved ? JSON.parse(saved) : null,
      };
    });

    expect(raw).not.toBeNull();
    expect(parsed).not.toBeNull();
    if (!raw || !parsed) {
      throw new Error("Expected autosave payload after initial load");
    }
    expect(parsed.version).toBe(2);
    expect(typeof parsed.state.currencyCents).toBe("number");

    await page.evaluate(() => {
      const saved = window.localStorage.getItem("emily-idle:save");
      if (!saved) {
        return;
      }
      const nextPayload = JSON.parse(saved);
      nextPayload.state.currencyCents = 500;
      nextPayload.state.enjoymentCents = 0;
      window.localStorage.setItem("emily-idle:save", JSON.stringify(nextPayload));
    });

    await page.reload();

    await page.getByRole("tab", { name: "Catalog" }).click();
    await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
    const buyButton = page.getByTestId(`catalog-buy-${STARTER_MODEL_ID}`);
    await buyButton.scrollIntoViewIfNeeded();
    await expect(buyButton).toBeEnabled({ timeout: 15000 });
    await buyButton.click();

    await page.waitForFunction(
      (modelId) => {
        const saved = window.localStorage.getItem("emily-idle:save");
        if (!saved) {
          return false;
        }
        const nextPayload = JSON.parse(saved);
        const ownedModel = nextPayload.state?.watchModels?.[modelId] ?? 0;
        const ownedStarter = nextPayload.state?.items?.starter ?? 0;
        return ownedModel >= 1 && ownedStarter >= 1;
      },
      STARTER_MODEL_ID,
      { timeout: 3000 },
    );

    const updatedSave = await page.evaluate(() => window.localStorage.getItem("emily-idle:save"));
    expect(updatedSave).not.toBeNull();
    expect(updatedSave).not.toBe(raw);
  });

  test("renders collection structure and stats", async ({ page }) => {
    await page.getByRole("tab", { name: "Collection" }).click();
    await expect(page.locator(selectors.currency)).toHaveText(/\$/);
    await expect(page.locator(selectors.income)).toHaveText(/\$/);
    await expect(page.locator(selectors.collectionValue)).toHaveText(/\$/);
    await expect(page.locator(selectors.statsMetrics)).toBeVisible();
    await expect(page.locator(selectors.eventMultiplier)).toContainText("x");
    await expect(page.locator(selectors.softcap)).toHaveText(/% efficiency/);
    await expect(page.locator("#enjoyment")).toHaveText(/\$/);
    await expect(page.locator("#enjoyment-rate")).toHaveText(/\$/);
    await expect(page.locator(selectors.upgradesCallout)).toBeVisible();
    await expect(page.locator(selectors.milestoneCards)).toHaveCount(4);
    await expect(page.locator(selectors.setBonusCards)).toHaveCount(9);

    await page.getByRole("tab", { name: "Catalog" }).click();
    const catalogCardCount = await page.locator(selectors.catalogCards).count();
    expect(catalogCardCount).toBeGreaterThanOrEqual(WATCH_MODEL_COUNT);
  });

  test("buy button disabled when unaffordable", async ({ page }) => {
    await page.getByRole("tab", { name: "Catalog" }).click();
    await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
    const catalogFilters = page.getByTestId("catalog-filters");
    await catalogFilters.getByTestId("catalog-search").fill("126713GRNR");
    const gate = page.getByTestId(`catalog-gate-${CLASSIC_MODEL_ID}`);
    await gate.scrollIntoViewIfNeeded();
    await expect(gate).toBeVisible();
    await expect(page.getByTestId(`catalog-buy-${CLASSIC_MODEL_ID}`)).toHaveCount(0);
  });

  test("enjoyment gate locks classic purchase", async ({ page }) => {
    const seededState = {
      currencyCents: 1_000_000,
      enjoymentCents: 0,
      items: { starter: 5, classic: 0, chronograph: 0, tourbillon: 0 },
      upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
      unlockedMilestones: ["collector-shelf"],
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
    await page.getByTestId("catalog-filters").getByTestId("catalog-search").fill("126713GRNR");

    const gate = page.getByTestId(`catalog-gate-${CLASSIC_MODEL_ID}`);
    await gate.scrollIntoViewIfNeeded();
    await expect(gate).toBeVisible();
    await expect(gate).toContainText("Requires");
  });

  test("export and import save round trip", async ({ page }) => {
    await page.getByRole("tab", { name: "Settings" }).click();
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

  test("audio toggles render and respond", async ({ page }) => {
    await page.getByRole("tab", { name: "Settings" }).click();

    const sfxToggle = page.getByTestId("audio-sfx-toggle");
    const bgmToggle = page.getByTestId("audio-bgm-toggle");

    await expect(sfxToggle).toBeVisible();
    await expect(bgmToggle).toBeVisible();

    await sfxToggle.click();
    await bgmToggle.click();

    await expect(sfxToggle).toBeChecked();
    await expect(bgmToggle).toBeChecked();
  });

  test("tabs respect hidden preferences", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 15, classic: 0, chronograph: 1, tourbillon: 0 },
      watchModels: { [TOURBILLON_MODEL_ID]: 1 },
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

    const settings = {
      themeMode: "system",
      hideCompletedAchievements: false,
      hiddenTabs: ["catalog"],
      coachmarksDismissed: {},
    };

    await page.addInitScript(
      ({ state, lastSimulatedAtMs, nextSettings }) => {
        const payload = {
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs,
          state,
        };
        window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
        window.localStorage.setItem("emily-idle:settings", JSON.stringify(nextSettings));
      },
      { state: seededState, lastSimulatedAtMs: Date.now(), nextSettings: settings },
    );

    await page.goto("/");

    const tabList = page.getByRole("tablist", { name: "Primary navigation" });
    await expect(tabList.getByRole("tab", { name: "Collection" })).toBeVisible();
    await expect(tabList.getByRole("tab", { name: "Settings" })).toBeVisible();
    await expect(tabList.getByRole("tab", { name: "Catalog" })).toHaveCount(0);
  });

  test("catalog filters and sources", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 15, classic: 0, chronograph: 1, tourbillon: 0 },
      watchModels: { [TOURBILLON_MODEL_ID]: 1 },
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

    await expect(page.getByTestId("catalog-help")).toBeVisible();
  });

  test("catalog image assets load", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 15, classic: 0, chronograph: 1, tourbillon: 0 },
      watchModels: { [TOURBILLON_MODEL_ID]: 1 },
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

    const imageFilename = "Rolex_GMT-Master_II_ref._126713GRNR.jpg";

    await page.goto("/emilyidle/");
    await page.getByRole("tab", { name: "Catalog" }).click();
    await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();

    await page.getByTestId("catalog-search").fill("126713GRNR");

    const card = page.getByTestId("catalog-grid").getByTestId("catalog-card").first();
    const image = card.locator("img");
    await expect(image).toHaveCount(1);
    await image.scrollIntoViewIfNeeded();

    const src = await image.getAttribute("src");
    expect(src).not.toBeNull();
    if (!src) {
      throw new Error("Expected catalog card image src");
    }

    expect(src).toContain("/emilyidle/catalog/");
    expect(src).toContain(imageFilename);
    expect(src.startsWith("data:image")).toBe(false);

    await expect
      .poll(
        () =>
          image.evaluate((node) => {
            const img = node as HTMLImageElement;
            return img.complete && img.naturalWidth > 0 && !img.src.startsWith("data:image");
          }),
        { timeout: 15_000 },
      )
      .toBe(true);
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
    await page.getByRole("tab", { name: "Atelier" }).click();
    await expect(page.locator(selectors.workshopPanel)).toBeVisible();
    await expect(page.locator(selectors.workshopGain).nth(1)).toContainText("+1 Blueprints");
    await expect(page.locator(selectors.workshopResetButton)).toBeEnabled();
  });

  test("automation toggle appears after automation upgrade", async ({ page }) => {
    await page.getByRole("tab", { name: "Collection" }).click();
    const automationToggle = page.locator(selectors.automationToggle);
    await expect(automationToggle).toContainText("Unlock automation with Atelier blueprints.");

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
        "showcase-week": { activeUntilMs: 0, nextAvailableAtMs: 0 },
        "heritage-gala": { activeUntilMs: 0, nextAvailableAtMs: 0 },
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
    await page.getByRole("tab", { name: "Collection" }).click();
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
    await page.getByRole("tab", { name: "Maison" }).click();
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
        "showcase-week": { activeUntilMs: 0, nextAvailableAtMs: 0 },
        "heritage-gala": { activeUntilMs: 0, nextAvailableAtMs: 0 },
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
    await page.getByRole("tab", { name: "Collection" }).click();
    await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    await expect(page.getByText(/Auction weekend/)).toBeVisible();
    await expect(page.getByText(/Income x/).first()).toBeVisible();
  });

  test("winding interaction completes and applies rewards", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { chronograph: 1 },
      eventStates: {
        "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 },
      },
    };

    await page.addInitScript(
      ({ state, lastSimulatedAtMs }) => {
        (window as unknown as { __EMILY_IDLE_TEST_MODE__?: boolean }).__EMILY_IDLE_TEST_MODE__ =
          true;

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
    await page
      .getByTestId("catalog-owned-tabs")
      .getByRole("tab", { name: /^Owned$/ })
      .click();

    const before = await page.evaluate(() => {
      const saved = window.localStorage.getItem("emily-idle:save");
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.state?.enjoymentCents ?? 0;
    });

    const interactButton = page
      .locator('[data-testid="vault-interact-chronograph"]:not([disabled])')
      .first();
    await interactButton.scrollIntoViewIfNeeded();
    await expect(interactButton).toBeEnabled();
    await interactButton.click();

    await expect(page.getByTestId("winding-modal")).toBeVisible();
    const surface = page.getByTestId("winding-surface");
    await surface.focus();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("winding-outcome")).toBeVisible();
    await page.getByTestId("winding-done").click();
    await expect(page.getByTestId("winding-modal")).toHaveCount(0);

    const after = await page.evaluate(() => {
      const saved = window.localStorage.getItem("emily-idle:save");
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.state?.enjoymentCents ?? 0;
    });

    expect(after).toBeGreaterThan(before);
    await expect(
      page.locator('[data-testid="vault-interact-chronograph"]:not([disabled])'),
    ).toHaveCount(0);
    await expect(page.getByText(/Cooldown \d+s/i).first()).toBeVisible();
  });

  test("automatic interaction increases power reserve and enjoyment rate", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { classic: 50 },
      watchModels: { [CLASSIC_MODEL_ID]: 1 },
      eventStates: {
        "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 },
      },
    };

    await page.addInitScript(
      ({ state, lastSimulatedAtMs }) => {
        (window as unknown as { __EMILY_IDLE_TEST_MODE__?: boolean }).__EMILY_IDLE_TEST_MODE__ =
          true;

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
    await page
      .getByTestId("catalog-owned-tabs")
      .getByRole("tab", { name: /^Owned$/ })
      .click();

    const parseRate = (text: string): number => {
      const match = text.replace(/,/g, "").match(/\$(\d+(?:\.\d+)?)/);
      return match ? Number(match[1]) : 0;
    };

    const beforeRateText = await page.locator("#enjoyment-rate").innerText();
    const beforeRate = parseRate(beforeRateText);

    const interactButton = page
      .locator('[data-testid="vault-interact-classic"]:not([disabled])')
      .first();
    await interactButton.scrollIntoViewIfNeeded();
    await expect(interactButton).toBeEnabled();
    await interactButton.click();

    await expect(page.getByTestId("automatic-modal")).toBeVisible();
    await expect(page.getByTestId("automatic-outcome")).toBeVisible({ timeout: 5000 });
    await page.getByTestId("automatic-done").click();
    await expect(page.getByTestId("automatic-modal")).toHaveCount(0);

    const reserve = await page.evaluate(() => {
      const saved = window.localStorage.getItem("emily-idle:save");
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.state?.powerReserveByItem?.classic ?? 0;
    });
    expect(reserve).toBeGreaterThan(0);

    const afterRateText = await page.locator("#enjoyment-rate").innerText();
    const afterRate = parseRate(afterRateText);
    expect(afterRate).toBeGreaterThanOrEqual(beforeRate);

    await expect(
      page.locator('[data-testid="vault-interact-classic"]:not([disabled])'),
    ).toHaveCount(0);
    await expect(page.getByText(/Cooldown \d+s/i).first()).toBeVisible();
  });

  test("craft: dismantle watches and craft a boost", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 800_000,
      items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 3 },
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
      craftingParts: 0,
      craftedBoosts: {
        "polished-tools": 0,
        "heritage-springs": 0,
        "artisan-jig": 0,
      },
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
    await page.getByRole("tab", { name: "Atelier" }).click();

    const parts = page.getByTestId("workshop-crafting-parts");
    await expect(parts).toContainText("0 parts");

    const dismantleList = page.getByTestId("workshop-dismantle-list");
    const tourbillonCard = dismantleList.locator('[data-item-id="tourbillon"]');
    await tourbillonCard.getByRole("button", { name: "Dismantle" }).click();
    await tourbillonCard.getByRole("button", { name: "Dismantle" }).click();

    await expect(parts).toContainText("16 parts");

    const recipes = page.getByTestId("workshop-crafting-recipes");
    const polishedCard = recipes.locator(".card", { hasText: "Polished tools" }).first();
    await expect(polishedCard.getByRole("button", { name: "Craft" })).toBeEnabled();
    await polishedCard.getByRole("button", { name: "Craft" }).click();

    await expect(parts).toContainText("4 parts");
    await expect(page.getByTestId("workshop-crafting-boosts")).toContainText("Income x1.05");
  });
});
