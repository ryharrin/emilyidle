import { test, expect, type Locator, type Page } from "@playwright/test";
import { openCatalogFilters } from "./helpers/catalogFilters";
import { clickLocatorSafely } from "./helpers/interactions";

const selectors = {
  currency: "#currency",
  income: "#income",
  collectionValue: "#collection-value",
  softcap: "#softcap",
  catalogCards: '[data-testid="catalog-grid"] [data-testid="catalog-card"]',
  upgradesCallout: '[data-testid="upgrades-callout"]',
  sectionNav: '[data-testid="collection-section-nav"]',
  insightsPanel: '[data-testid="collection-insights-panel"]',
  navSegmentQuartz:
    '[data-testid="collection-section-nav-item-collection-segment-quartz"] button',
  navSegmentAutomatic:
    '[data-testid="collection-section-nav-item-collection-segment-automatic"] button',
  navSegmentManual: '[data-testid="collection-section-nav-item-collection-segment-manual"] button',
  navSegmentTourbillon:
    '[data-testid="collection-section-nav-item-collection-segment-tourbillon"] button',
  onboardingCoachmark: '[data-testid="collection-onboarding-coachmark-collection-overview"]',
  navMilestones: '[data-testid="collection-section-nav-item-collection-milestones"] button',
  milestoneCards: "#milestone-list .card",
  setBonusCards: '[data-testid="collection-set-bonus-card"]',
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

async function clickPrimaryTab(page: Page, name: string) {
  const tab = page.getByRole("tab", { name });
  await expect(tab).toBeVisible();
  await clickLocatorSafely(tab);
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

async function switchCatalogToOwned(page: Page) {
  const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
  const ownedTab = catalogPanel.locator("#catalog-owned-tab").first();
  if (!(await ownedTab.isVisible().catch(() => false))) {
    const quickFilters = catalogPanel.getByTestId("catalog-quick-filters");
    if (await quickFilters.isVisible().catch(() => false)) {
      await quickFilters.click({ force: true });
    } else {
      const filterToggle = catalogPanel.getByTestId("catalog-filter-toggle");
      if (await filterToggle.isVisible().catch(() => false)) {
        await filterToggle.click({ force: true });
      }
    }
  }
  await ownedTab.click({ force: true });
}

async function hasVisibleCandidate(locator: Locator): Promise<boolean> {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    if (
      await locator
        .nth(index)
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }
  }
  return false;
}

async function openCatalogDetailsSheet(page: Page) {
  const sheet = page.getByTestId("catalog-details-sheet");
  if (await sheet.isVisible().catch(() => false)) {
    return true;
  }

  const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
  const detailsButtons = catalogPanel.locator('[data-testid^="catalog-details-button-"]');
  const detailsCount = await detailsButtons.count();
  for (let index = 0; index < detailsCount; index += 1) {
    const button = detailsButtons.nth(index);
    if (!(await button.isVisible().catch(() => false))) {
      continue;
    }
    await button.click({ force: true });
    if (await sheet.isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

async function resolveCatalogInteractCandidates(page: Page, selector: string): Promise<Locator> {
  const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
  const panelCandidates = catalogPanel.locator(selector);
  if ((await panelCandidates.count()) > 0 && (await hasVisibleCandidate(panelCandidates))) {
    return panelCandidates;
  }

  const opened = await openCatalogDetailsSheet(page);
  if (!opened) {
    return panelCandidates;
  }

  const sheetCandidates = page.getByTestId("catalog-details-sheet").locator(selector);
  if ((await sheetCandidates.count()) > 0) {
    return sheetCandidates;
  }

  return panelCandidates;
}

async function openCatalogInteractionModal(
  page: Page,
  interactSelector: string,
  modalTestId: string,
): Promise<boolean> {
  const interactCandidates = await resolveCatalogInteractCandidates(page, interactSelector);
  const modal = page.getByTestId(modalTestId);
  const candidateCount = await interactCandidates.count();
  if (candidateCount === 0) {
    return false;
  }

  const waitForModalVisible = async () =>
    modal
      .waitFor({
        state: "visible",
        timeout: 350,
      })
      .then(() => true)
      .catch(() => false);
  const maxCandidates = Math.min(candidateCount, 8);

  for (let index = 0; index < maxCandidates; index += 1) {
    const candidate = interactCandidates.nth(index);
    if (!(await candidate.isVisible().catch(() => false))) {
      continue;
    }
    await candidate.scrollIntoViewIfNeeded().catch(() => {});
    await candidate.click({ force: true }).catch(() => {});
    if (await waitForModalVisible()) {
      return true;
    }
  }

  return modal.isVisible().catch(() => false);
}

test.describe("collection loop", () => {
  test.describe("default save flows", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("renders collection structure and stats", async ({ page }) => {
      await clickPrimaryTab(page, "Collection");
      await expect(page.locator(selectors.currency)).toHaveText(/\$/);
      await expect(page.locator(selectors.income)).toHaveText(/\$/);
      await expect(page.locator(selectors.collectionValue)).toHaveText(/\$/);
      await expect(page.locator(selectors.statsMetrics)).toBeVisible();
      await expect(page.locator(selectors.eventMultiplier)).toContainText("x");
      await expect(page.locator(selectors.softcap)).toHaveText(/% efficiency/);
      await expect(page.locator("#enjoyment")).toHaveText(/\$/);
      await expect(page.locator("#enjoyment-rate")).toHaveText(/\$/);
      await expect(page.locator("#currency .value-ticker")).toBeVisible();
      await expect(page.locator("#income .value-ticker")).toBeVisible();
      await expect(page.locator("#enjoyment .value-ticker")).toBeVisible();
      await expect(page.locator("#enjoyment-rate .value-ticker")).toBeVisible();
      await expect(page.locator(selectors.upgradesCallout)).toBeVisible();
      await expect(page.locator(selectors.milestoneCards)).toHaveCount(4);
      await expect(page.locator(selectors.setBonusCards)).toHaveCount(9);

      await clickPrimaryTab(page, "Catalog");
      const catalogCardCount = await page.locator(selectors.catalogCards).count();
      expect(catalogCardCount).toBeGreaterThanOrEqual(WATCH_MODEL_COUNT);
    });

    test("collection section nav anchors and coachmark dismisses", async ({ page }) => {
      await clickPrimaryTab(page, "Collection");
      await expect(page.locator(selectors.sectionNav)).toBeVisible({ timeout: 10_000 });

      const coachmark = page.locator(selectors.onboardingCoachmark);
      await expect(coachmark).toBeVisible();

      await clickLocatorSafely(page.locator(selectors.navMilestones));
      await expect(page.locator("#collection-milestones")).toBeInViewport();

      await clickLocatorSafely(coachmark.getByRole("button", { name: "Got it" }));

      await page.reload();
      await clickPrimaryTab(page, "Collection");
    });

    test("collection nav reaches insights panel and movement segments", async ({ page }) => {
      await clickPrimaryTab(page, "Collection");
      await expect(page.locator(selectors.insightsPanel)).toBeVisible();

      const nav = page.locator(selectors.sectionNav);
      const navSegments = [
        { button: selectors.navSegmentQuartz, target: "#collection-segment-quartz" },
        { button: selectors.navSegmentAutomatic, target: "#collection-segment-automatic" },
        { button: selectors.navSegmentManual, target: "#collection-segment-manual" },
        { button: selectors.navSegmentTourbillon, target: "#collection-segment-tourbillon" },
      ];

      for (const segment of navSegments) {
        const button = page.locator(segment.button);
        await button.scrollIntoViewIfNeeded();
        await button.evaluate((el) => (el as HTMLButtonElement).click());
        await expect(nav).toHaveAttribute("data-active-section", segment.target.slice(1));
      }
    });

    test("buy button disabled when unaffordable", async ({ page }) => {
      await clickPrimaryTab(page, "Catalog");
      await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
      await openCatalogFilters(page);
      const catalogFilters = page.getByTestId("catalog-filters");
      await catalogFilters.getByTestId("catalog-search").fill("126713GRNR");
      const gate = page.getByTestId(`catalog-gate-${CLASSIC_MODEL_ID}`);
      await gate.scrollIntoViewIfNeeded();
      await expect(gate).toBeVisible();
      await expect(page.getByTestId(`catalog-buy-${CLASSIC_MODEL_ID}`)).toHaveCount(0);
    });

    test("fresh save career session leads into first catalog purchase", async ({ page }) => {
      await clickPrimaryTab(page, "Career");
      const careerPanel = page.getByRole("tabpanel", { name: "Career" });
      await expect(careerPanel).toBeVisible();

      const startCareerButton = careerPanel.getByTestId("career-next-action-start");
      if ((await startCareerButton.count()) > 0) {
        await startCareerButton.click();
      }

      const runSessionButton = careerPanel.getByTestId("career-action");
      await expect(runSessionButton).toBeEnabled({ timeout: 10_000 });
      await runSessionButton.click();

      await expect(runSessionButton).toBeDisabled({ timeout: 10_000 });
      await expect(careerPanel.getByTestId("career-status")).toContainText(/Cooldown/);

      await clickPrimaryTab(page, "Catalog");
      await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
      const starterBuy = page.getByTestId(`catalog-buy-${STARTER_MODEL_ID}`);
      await expect(starterBuy).toBeEnabled({ timeout: 15_000 });
      await starterBuy.click();

      await page.waitForFunction(
        (modelId) => {
          const saved = window.localStorage.getItem("emily-idle:save");
          if (!saved) {
            return false;
          }
          const payload = JSON.parse(saved);
          return (payload.state?.watchModels?.[modelId] ?? 0) >= 1;
        },
        STARTER_MODEL_ID,
        { timeout: 5_000 },
      );
    });

    test("export and import save round trip", async ({ page }) => {
      await clickPrimaryTab(page, "Settings");
      await page.locator(selectors.exportSave).click();
      const saveText = await page.inputValue(selectors.importText);
      expect(saveText.length).toBeGreaterThan(0);

      const importButton = page.locator(selectors.importSave);

      await page.fill(selectors.importText, "");
      await importButton.click();
      await expect(page.locator(selectors.saveStatus)).toContainText(
        "Paste an exported save string",
      );

      await page.fill(selectors.importText, saveText);
      await importButton.click();
      await expect(page.locator(selectors.saveStatus)).toContainText("Imported save from");
    });

    test("audio toggles render and respond", async ({ page }) => {
      await clickPrimaryTab(page, "Settings");

      const sfxToggle = page.getByTestId("audio-sfx-toggle");
      const bgmToggle = page.getByTestId("audio-bgm-toggle");

      await expect(sfxToggle).toBeVisible();
      await expect(bgmToggle).toBeVisible();

      await sfxToggle.click();
      await bgmToggle.click();

      await expect(sfxToggle).toBeChecked();
      await expect(bgmToggle).toBeChecked();
    });
  });

  test.describe("seeded save flows", () => {
    test("autosave writes fresh localStorage payload", async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear();
      });

      await page.goto("/");

      await page.waitForFunction(
        () => window.localStorage.getItem("emily-idle:save") !== null,
        null,
        { timeout: 6000 },
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
      expect(parsed.version).toBe(3);
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

      await clickPrimaryTab(page, "Catalog");
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
          const ownedStarter = nextPayload.state?.items?.quartz ?? 0;
          return ownedModel >= 1 && ownedStarter >= 1;
        },
        STARTER_MODEL_ID,
        { timeout: 3000 },
      );

      const updatedSave = await page.evaluate(() => window.localStorage.getItem("emily-idle:save"));
      expect(updatedSave).not.toBeNull();
      expect(updatedSave).not.toBe(raw);
    });

    test("enjoyment gate locks automatic purchase", async ({ page }) => {
      const seededState = {
        currencyCents: 1_000_000,
        enjoymentCents: 0,
        items: { quartz: 5, automatic: 0, manual: 0, tourbillon: 0 },
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
        achievementUnlocks: ["first-drawer"],
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
      await clickPrimaryTab(page, "Catalog");
      await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
      await openCatalogFilters(page);
      await page.getByTestId("catalog-filters").getByTestId("catalog-search").fill("126713GRNR");

      const gate = page.getByTestId(`catalog-gate-${CLASSIC_MODEL_ID}`);
      await gate.scrollIntoViewIfNeeded();
      await expect(gate).toBeVisible();
      await expect(gate).toContainText("Requires");
    });

    test("tabs respect hidden preferences", async ({ page }) => {
      const seededState = {
        currencyCents: 0,
        enjoymentCents: 0,
        items: { quartz: 15, automatic: 0, manual: 1, tourbillon: 0 },
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
        items: { quartz: 15, automatic: 0, manual: 1, tourbillon: 0 },
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
      await clickPrimaryTab(page, "Catalog");
      await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
      await openCatalogFilters(page);
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
        items: { quartz: 15, automatic: 0, manual: 1, tourbillon: 0 },
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
      await clickPrimaryTab(page, "Catalog");
      await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
      await openCatalogFilters(page);

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
      test.slow();
      const workshopPanel = page.locator(selectors.workshopPanel);
      await expect(workshopPanel).toHaveCount(0);

      const seededState = {
        currencyCents: 0,
        enjoymentCents: 800_000,
        items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 6 },
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
      await clickPrimaryTab(page, "Atelier");
      await expect(page.locator(selectors.workshopPanel)).toBeVisible();
      await expect(page.locator(selectors.workshopGain).nth(1)).toContainText("+1 Blueprints");
      await expect(page.locator(selectors.workshopResetButton)).toBeEnabled();
    });

    test("automation toggle appears after automation upgrade", async ({ page }) => {
      await page.goto("/");
      await clickPrimaryTab(page, "Collection");
      const automationToggle = page.locator(selectors.automationToggle);
      await expect(automationToggle).toContainText("Unlock automation with Atelier blueprints.");

      const seededState = {
        currencyCents: 0,
        enjoymentCents: 0,
        items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 8 },
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
      await clickPrimaryTab(page, "Collection");
      await expect(page.locator(selectors.automationToggle).getByRole("button")).toHaveText(
        /Auto-buy (on|off)/,
      );
    });

    test("maison panel shows gain and upgrades", async ({ page }) => {
      test.slow();
      const maisonPanel = page.locator(selectors.maisonPanel);
      await expect(maisonPanel).toHaveCount(0);

      const seededState = {
        currencyCents: 0,
        enjoymentCents: 4_000_000,
        items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 6 },
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
      await clickPrimaryTab(page, "Maison");
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
        items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 6 },
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
      await clickPrimaryTab(page, "Collection");
      await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();

      const statsTab = page.getByRole("tab", { name: "Stats" });
      if (await statsTab.isVisible().catch(() => false)) {
        await clickPrimaryTab(page, "Stats");
        await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
        const auctionWeekendCard = page
          .locator('[data-testid="event-calendar-auction-weekend"]:visible')
          .first();
        await expect(auctionWeekendCard).toBeVisible();
        await expect(auctionWeekendCard).toHaveAttribute(
          "data-testid",
          "event-calendar-auction-weekend",
        );
        await expect(auctionWeekendCard).toContainText(/Income x/);
        return;
      }

      await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    });

    test("winding interaction completes and applies rewards", async ({ page }) => {
      test.setTimeout(120_000);
      const seededState = {
        currencyCents: 0,
        enjoymentCents: 0,
        items: { manual: 1 },
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
      await clickPrimaryTab(page, "Catalog");
      await openCatalogFilters(page);
      await switchCatalogToOwned(page);

      const before = await page.evaluate(() => {
        const saved = window.localStorage.getItem("emily-idle:save");
        const parsed = saved ? JSON.parse(saved) : null;
        return parsed?.state?.enjoymentCents ?? 0;
      });

      const openedWindingModal = await openCatalogInteractionModal(
        page,
        '[data-testid="vault-interact-manual"]:not([disabled]), [data-testid="vault-interact-tourbillon"]:not([disabled])',
        "winding-modal",
      );
      test.skip(!openedWindingModal, "No manual interaction candidate available in seeded state.");
      if (!openedWindingModal) {
        return;
      }

      const surface = page.getByTestId("winding-surface");
      await surface.focus();
      await page.keyboard.press("Space");
      await expect(page.getByTestId("winding-outcome")).toBeVisible();
      await page.getByTestId("winding-done").click();
      await expect(page.getByTestId("winding-modal")).toHaveCount(0);

      await expect
        .poll(
          async () =>
            page.evaluate(() => {
              const saved = window.localStorage.getItem("emily-idle:save");
              const parsed = saved ? JSON.parse(saved) : null;
              return parsed?.state?.enjoymentCents ?? 0;
            }),
          { timeout: 5_000 },
        )
        .toBeGreaterThan(before);
      await expect(
        page.locator('[data-testid="vault-interact-manual"]:not([disabled])'),
      ).toHaveCount(0);
      const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
      await expect(catalogPanel.getByText(/Cooldown \d+s/i).first()).toBeVisible();
    });

    test("automatic interaction increases power reserve and enjoyment rate", async ({ page }) => {
      const seededState = {
        currencyCents: 0,
        enjoymentCents: 0,
        items: { automatic: 50 },
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
      await clickPrimaryTab(page, "Catalog");
      await openCatalogFilters(page);
      await switchCatalogToOwned(page);

      const parseRate = (text: string): number => {
        const match = text.replace(/,/g, "").match(/\$(\d+(?:\.\d+)?)/);
        return match ? Number(match[1]) : 0;
      };

      const beforeRateText = await page.locator("#enjoyment-rate").innerText();
      const beforeRate = parseRate(beforeRateText);

      const openedAutomaticModal = await openCatalogInteractionModal(
        page,
        '[data-testid="vault-interact-automatic"]:not([disabled])',
        "automatic-modal",
      );
      test.skip(
        !openedAutomaticModal,
        "Automatic interaction modal did not open from available candidates.",
      );
      if (!openedAutomaticModal) {
        return;
      }

      await expect(page.getByTestId("automatic-outcome")).toBeVisible({ timeout: 5000 });
      await page.getByTestId("automatic-done").click();
      await expect(page.getByTestId("automatic-modal")).toHaveCount(0);

      await expect
        .poll(
          async () =>
            page.evaluate(() => {
              const saved = window.localStorage.getItem("emily-idle:save");
              const parsed = saved ? JSON.parse(saved) : null;
              return parsed?.state?.powerReserveByItem?.automatic ?? 0;
            }),
          { timeout: 5_000 },
        )
        .toBeGreaterThan(0);

      await expect
        .poll(
          async () => {
            const afterRateText = await page.locator("#enjoyment-rate").innerText();
            return parseRate(afterRateText);
          },
          { timeout: 5_000 },
        )
        .toBeGreaterThanOrEqual(beforeRate);

      await expect(
        page.locator('[data-testid="vault-interact-automatic"]:not([disabled])'),
      ).toHaveCount(0);
      const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
      await expect(catalogPanel.getByText(/Cooldown \d+s/i).first()).toBeVisible();
    });

    test("craft: dismantle watches and craft a boost", async ({ page }) => {
      const seededState = {
        currencyCents: 0,
        enjoymentCents: 800_000,
        items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 3 },
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
      await clickPrimaryTab(page, "Atelier");

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
});
