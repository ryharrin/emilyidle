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

    await page.getByRole("tab", { name: "Vault" }).click();
    const firstCard = page.locator(selectors.collectionCards).first();
    const buyButton = firstCard.getByRole("button", { name: /Buy \(/ });
    await expect(buyButton).toBeEnabled({ timeout: 15000 });
    await buyButton.click();

    await page.waitForFunction(
      () => {
        const saved = window.localStorage.getItem("emily-idle:save");
        if (!saved) {
          return false;
        }
        const nextPayload = JSON.parse(saved);
        return (nextPayload.state?.items?.starter ?? 0) >= 1;
      },
      null,
      { timeout: 3000 },
    );

    const updatedSave = await page.evaluate(() => window.localStorage.getItem("emily-idle:save"));
    expect(updatedSave).not.toBeNull();
    expect(updatedSave).not.toBe(raw);
  });

  test("renders collection structure and stats", async ({ page }) => {
    await page.getByRole("tab", { name: "Vault" }).click();
    await expect(page.locator(selectors.currency)).toHaveText(/\$/);
    await expect(page.locator(selectors.income)).toHaveText(/\$/);
    await expect(page.locator(selectors.collectionValue)).toHaveText(/\$/);
    await expect(page.locator(selectors.softcap)).toHaveText(/% efficiency/);
    await expect(page.locator("#enjoyment")).toHaveText(/\$/);
    await expect(page.locator("#enjoyment-rate")).toHaveText(/\$/);

    await expect(page.locator(selectors.collectionCards)).toHaveCount(4);
    await expect(page.locator(selectors.upgradeCards)).toHaveCount(4);
    await expect(page.locator(selectors.milestoneCards)).toHaveCount(4);
    await expect(page.locator(selectors.setBonusCards)).toHaveCount(9);
  });

  test("buy button disabled when unaffordable", async ({ page }) => {
    await page.getByRole("tab", { name: "Vault" }).click();
    const firstCard = page.locator(selectors.collectionCards).first();
    const buyButton = firstCard.getByRole("button", { name: /Buy \(/ });
    await expect(buyButton).toBeDisabled();
  });

  test("export and import save round trip", async ({ page }) => {
    await page.getByRole("tab", { name: "Save" }).click();
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
    await page.getByRole("tab", { name: "Save" }).click();

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
    await expect(tabList.getByRole("tab", { name: "Vault" })).toBeVisible();
    await expect(tabList.getByRole("tab", { name: "Save" })).toBeVisible();
    await expect(tabList.getByRole("tab", { name: "Catalog" })).toHaveCount(0);
  });

  test("catalog filters and sources", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 15, classic: 0, chronograph: 1, tourbillon: 0 },
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

    const catalogTab = page.getByRole("tab", { name: "Catalog" });
    await catalogTab.click();

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
    await expect(sourcesList.getByTestId("source-item")).toHaveCount(59);
    await expect(
      sourcesList.getByTestId("source-links").first().getByRole("link", { name: "Source" }),
    ).toBeVisible();
  });

  test("catalog image assets load", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 15, classic: 0, chronograph: 1, tourbillon: 0 },
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
    const imageResponse = page.waitForResponse((response) => {
      if (!response.url().includes(imageFilename)) {
        return false;
      }
      return response.status() === 200;
    });

    await page.goto("/emilyidle/");
    await page.getByRole("tab", { name: "Catalog" }).click();

    await page.getByTestId("catalog-search").fill("126713GRNR");

    const card = page.getByTestId("catalog-grid").getByTestId("catalog-card").first();
    const image = card.locator("img");
    await expect(image).toHaveCount(1);

    const src = await image.getAttribute("src");
    expect(src).not.toBeNull();
    if (!src) {
      throw new Error("Expected catalog card image src");
    }

    expect(src).toContain("/emilyidle/catalog/");
    expect(src).toContain(imageFilename);
    expect(src.startsWith("data:image")).toBe(false);

    await imageResponse;
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
    await expect(page.locator(selectors.workshopGain).last()).toContainText("+1 Blueprints");
    await expect(page.locator(selectors.workshopResetButton)).toBeEnabled();
  });

  test("automation toggle appears after automation upgrade", async ({ page }) => {
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
    await page.getByRole("tab", { name: "Vault" }).click();
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
    await page.getByRole("tab", { name: "Vault" }).click();
    await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    await expect(page.getByText(/Auction weekend/)).toBeVisible();
    await expect(page.getByText(/Income x/).first()).toBeVisible();
  });

  test("wind session completes and applies rewards (wind)", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      items: { starter: 1 },
      eventStates: {
        "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 },
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
    await page.getByRole("tab", { name: "Vault" }).click();

    const interactButtons = page.getByRole("button", { name: "Interact" });
    const interactButton = interactButtons.first();
    await expect(interactButton).toBeEnabled();
    await interactButton.click();

    await expect(page.getByRole("dialog")).toBeVisible();

    const steady = page.getByTestId("wind-steady");
    for (let i = 0; i < 5; i += 1) {
      await steady.click();
    }

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(/Current multiplier x1\.15\./i)).toBeVisible();

    const result = await page.evaluate(() => {
      const saved = window.localStorage.getItem("emily-idle:save");
      const parsed = saved ? JSON.parse(saved) : null;
      const windState = parsed?.state?.eventStates?.["wind-up"];
      return {
        currencyCents: parsed?.state?.currencyCents,
        windUpMultiplier: windState?.incomeMultiplier,
        windUpActiveUntilMs: windState?.activeUntilMs,
      };
    });

    expect(typeof result.currencyCents).toBe("number");
    expect((result.currencyCents ?? 0) > 0).toBe(true);
    expect(result.windUpMultiplier).toBeCloseTo(1.15, 5);
    expect(typeof result.windUpActiveUntilMs).toBe("number");
  });

  test("craft: dismantle watches and craft a boost", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 800_000,
      items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 2 },
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
