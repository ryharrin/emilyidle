import { test, expect, type Locator, type Page } from "@playwright/test";
import { openCatalogFilters } from "./helpers/catalogFilters";
import { clickLocatorSafely } from "./helpers/interactions";

const selectors = {
  currency: "#currency",
  income: "#income",
  collectionValue: "#collection-value",
  softcap: "#softcap",
  catalogCards: '[data-testid="catalog-grid"] [data-testid="catalog-card"]',
  sectionNav: '[data-testid="collection-section-nav"]',
  insightsPanel: '[data-testid="collection-insights-panel"]',
  navOverview: '[data-testid="collection-section-nav-item-collection-overview"] button',
  onboardingCoachmark: '[data-testid="collection-onboarding-coachmark-collection-overview"]',
  navMilestones: '[data-testid="collection-section-nav-item-collection-milestones"] button',
  navSetBonuses: '[data-testid="collection-section-nav-item-collection-set-bonuses"] button',
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
const PRIMARY_TAB_IDS_BY_LABEL: Record<string, string> = {
  Career: "career",
  Catalog: "catalog",
  Collection: "collection",
  Upgrades: "upgrades",
  Atelier: "workshop",
  Maison: "maison",
  Stats: "stats",
  Settings: "save",
};

async function clickPrimaryTab(page: Page, name: string) {
  const mappedTabId = PRIMARY_TAB_IDS_BY_LABEL[name];
  const tab = mappedTabId
    ? page.locator(`#${mappedTabId}-tab`)
    : page.getByRole("tab", { name: new RegExp(`^${name}`, "i") });
  await expect(tab).toBeVisible();
  await clickLocatorSafely(tab);
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

async function activateCollectionSection(page: Page, sectionId: string) {
  const sectionNav = page.locator(selectors.sectionNav);
  const sectionButton = page.locator(`[data-section-nav-id="${sectionId}"]`).first();
  await expect(sectionButton).toBeVisible();
  await clickLocatorSafely(sectionButton);
  await expect(sectionNav).toHaveAttribute("data-active-section", sectionId);
  await expect(sectionButton).toHaveAttribute("aria-current", "location");

  // Mobile collection sections render as collapsed accordions and need an explicit expand.
  const sectionDetails = page.locator(`details#${sectionId}`).first();
  if ((await sectionDetails.count()) > 0) {
    const isOpen = await sectionDetails
      .evaluate((node) => (node as HTMLDetailsElement).open)
      .catch(() => false);
    if (!isOpen) {
      const sectionToggle = sectionDetails.locator("summary").first();
      await expect(sectionToggle).toBeVisible();
      await clickLocatorSafely(sectionToggle);
      await expect(sectionDetails).toHaveJSProperty("open", true);
    }
  }
}

async function hasCollectionSection(page: Page, sectionId: string) {
  return (await page.locator(`[data-section-nav-id="${sectionId}"]`).count()) > 0;
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
        timeout: 1_200,
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
    try {
      await clickLocatorSafely(candidate);
    } catch {
      continue;
    }
    if (await waitForModalVisible()) {
      return true;
    }
  }

  const detailsSheet = page.getByTestId("catalog-details-sheet");
  if (await detailsSheet.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape").catch(() => {});
    await detailsSheet.waitFor({ state: "hidden", timeout: 1_000 }).catch(() => {});
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
      await expect(page.locator(selectors.eventMultiplier)).toHaveCount(0);
      await expect(page.locator(selectors.softcap)).toHaveText(/% efficiency/);
      await expect(page.locator("#enjoyment")).toHaveText(/\$/);
      await expect(page.locator("#enjoyment-rate")).toHaveText(/\$/);
      await expect(page.locator("#currency .value-ticker")).toBeVisible();
      await expect(page.locator("#income .value-ticker")).toBeVisible();
      await expect(page.locator("#enjoyment .value-ticker")).toBeVisible();
      await expect(page.locator("#enjoyment-rate .value-ticker")).toBeVisible();
      await expect(page.getByRole("region", { name: "Recommended actions" })).toBeVisible();
      await expect(page.locator(selectors.sectionNav)).toBeVisible();
      if (await hasCollectionSection(page, "collection-milestones")) {
        await activateCollectionSection(page, "collection-milestones");
        await expect(page.locator(selectors.milestoneCards)).toHaveCount(4);
      }
      if (await hasCollectionSection(page, "collection-set-bonuses")) {
        await activateCollectionSection(page, "collection-set-bonuses");
        await expect(page.locator(selectors.setBonusCards)).toHaveCount(9);
        await expect(page.getByTestId("collection-prestige-preview-cta")).toBeVisible();

        const firstFindInCatalog = page
          .getByTestId("collection-set-bonus-grid")
          .getByRole("button", { name: "Find in Catalog" })
          .first();
        await expect(firstFindInCatalog).toBeVisible();
        await clickLocatorSafely(firstFindInCatalog);
      } else {
        await clickLocatorSafely(page.getByRole("button", { name: "Open Catalog" }).first());
      }
      await expect(page.getByRole("tab", { name: "Catalog" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(page.getByTestId("catalog-shop")).toBeVisible();

      await clickPrimaryTab(page, "Catalog");
      const catalogCardCount = await page.locator(selectors.catalogCards).count();
      expect(catalogCardCount).toBeGreaterThanOrEqual(WATCH_MODEL_COUNT);
    });

    test("collection section nav activates sections and coachmark dismisses", async ({ page }) => {
      await clickPrimaryTab(page, "Collection");
      await expect(page.locator(selectors.sectionNav)).toBeVisible({ timeout: 10_000 });

      const coachmark = page.locator(selectors.onboardingCoachmark);
      await expect(coachmark).toBeVisible();

      if (await hasCollectionSection(page, "collection-milestones")) {
        await activateCollectionSection(page, "collection-milestones");
        await expect(page.locator(selectors.milestoneCards).first()).toBeVisible();
      } else {
        await activateCollectionSection(page, "collection-overview");
        await expect(page.locator("#collection-overview")).toBeVisible();
      }

      await clickLocatorSafely(coachmark.getByRole("button", { name: "Got it" }));

      await page.reload();
      await clickPrimaryTab(page, "Collection");
    });

    test("collection nav reaches insights panel and key sections", async ({ page }) => {
      await clickPrimaryTab(page, "Collection");

      if (await hasCollectionSection(page, "collection-set-bonuses")) {
        await activateCollectionSection(page, "collection-set-bonuses");
        await expect(page.locator(selectors.insightsPanel)).toBeVisible();
      }

      const navTargets = ["collection-overview", "collection-set-bonuses", "collection-milestones"];

      for (const sectionId of navTargets) {
        if (!(await hasCollectionSection(page, sectionId))) {
          continue;
        }
        await activateCollectionSection(page, sectionId);
      }
    });

    test("buy button disabled when unaffordable", async ({ page }) => {
      await clickPrimaryTab(page, "Catalog");
      await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
      await openCatalogFilters(page);
      const catalogFilters = page.getByTestId("catalog-filters");
      // Search for a quartz watch (unlocked tier) but with 0 cash
      await catalogFilters.getByTestId("catalog-search").fill("Calibrorolex");
      const gate = page.getByTestId(`catalog-gate-${STARTER_MODEL_ID}`);
      await gate.scrollIntoViewIfNeeded();
      await expect(gate).toBeVisible();
      await expect(page.getByTestId(`catalog-buy-${STARTER_MODEL_ID}`)).toHaveCount(0);
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
      await expect(runSessionButton).toBeVisible();
      const canRunSession = await runSessionButton.isEnabled();
      if (canRunSession) {
        await runSessionButton.click();
        await expect(careerPanel.getByTestId("career-status")).toContainText(
          /Cost tier recovers|Need more enjoyment|Ready/,
        );
        await expect(careerPanel.getByTestId("career-session-run-now-cost")).toContainText(
          /Run now/,
        );
      }

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
      expect(parsed.version).toBe(4);
      expect(typeof parsed.state.currencyCents).toBe("number");
      expect(typeof parsed.generation).toBe("number");

      await page.evaluate(() => {
        const saved = window.localStorage.getItem("emily-idle:save");
        if (!saved) {
          return;
        }
        const nextPayload = JSON.parse(saved);
        nextPayload.state.currencyCents = 1_000_000;
        nextPayload.state.enjoymentCents = 0;
        nextPayload.state.therapistCareer = {
          ...(nextPayload.state.therapistCareer ?? {}),
          careerStartId: nextPayload.state.therapistCareer?.careerStartId ?? "phd-program",
        };
        nextPayload.state.items = {
          ...(nextPayload.state.items ?? {}),
          quartz: Math.max(1, nextPayload.state.items?.quartz ?? 0),
        };
        nextPayload.state.watchModels = {
          ...(nextPayload.state.watchModels ?? {}),
          ["rolex-calibrorolex"]: Math.max(
            1,
            nextPayload.state.watchModels?.["rolex-calibrorolex"] ?? 0,
          ),
        };
        window.localStorage.setItem("emily-idle:save", JSON.stringify(nextPayload));
      });

      await page.reload();

      await clickPrimaryTab(page, "Career");
      const careerPanel = page.getByRole("tabpanel", { name: "Career" });
      const startCareerButton = careerPanel.getByTestId("career-next-action-start");
      if ((await startCareerButton.count()) > 0) {
        await startCareerButton.click();
      }

      const runSessionButton = careerPanel.getByTestId("career-action");
      await expect(runSessionButton).toBeVisible();
      if (await runSessionButton.isEnabled()) {
        await runSessionButton.click();
      }

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
      if (await hasCollectionSection(page, "collection-achievements")) {
        await activateCollectionSection(page, "collection-achievements");
      }
      await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();

      if (await hasCollectionSection(page, "collection-events")) {
        await activateCollectionSection(page, "collection-events");
        await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
        await expect(page.locator("#collection-events")).toContainText(/Income x/);
        return;
      }

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
      const dismantleButton = tourbillonCard.getByRole("button", { name: "Dismantle" });
      await clickLocatorSafely(dismantleButton);
      await clickLocatorSafely(dismantleButton);

      await expect(parts).toContainText("16 parts");

      const recipes = page.getByTestId("workshop-crafting-recipes");
      const polishedCard = recipes.locator(".card", { hasText: "Polished tools" }).first();
      const craftButton = polishedCard.getByRole("button", { name: "Craft" });
      await expect(craftButton).toBeEnabled();
      await clickLocatorSafely(craftButton);

      await expect(parts).toContainText("4 parts");
      await expect(page.getByTestId("workshop-crafting-boosts")).toContainText("Income x1.05");
    });
  });
});
