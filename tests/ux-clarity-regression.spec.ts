import { expect, test, type Page } from "@playwright/test";

import { createInitialState } from "../src/game/state";
import { BASE_CATALOG_SEEDED_STATE } from "./catalog-fixtures";
import { openCatalogTab, switchCatalogToOwned } from "./helpers/catalogFilters";
import { clickLocatorSafely } from "./helpers/interactions";
import { gotoAppWithNavigationReady } from "./helpers/navigation";
import { seedStorage } from "./helpers/storageSeed";

async function seedAndOpen(page: Page, state: unknown, disableAnimationFrame = false) {
  await seedStorage(page, {
    clearLocalStorage: true,
    save: { state },
    settings: { hiddenTabs: [] },
    disableAnimationFrame,
  });

  await gotoAppWithNavigationReady(page, {
    maxAttempts: 3,
    navigationVisibleTimeoutMs: 20_000,
    retryDelayMs: (attempt) => attempt * 150,
  });
}

test.describe("ux clarity regressions", () => {
  test("catalog supports novice empty-owned flow and expert ready-state flow", async ({ page }) => {
    const noviceState = createInitialState();
    await seedAndOpen(page, noviceState);

    const noviceCatalogPanel = await openCatalogTab(page);
    await switchCatalogToOwned(page, noviceCatalogPanel);

    const noviceOwnedTab = noviceCatalogPanel.locator("#catalog-owned-tab");
    await expect(noviceOwnedTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("catalog-owned-empty")).toBeVisible();
    await expect(page.getByRole("button", { name: "Build collection" })).toBeVisible();

    await clickLocatorSafely(page.getByRole("tab", { name: "Collection" }));
    const callout = page.getByTestId("catalog-shop-callout");
    await expect(callout).toBeVisible();
    await expect(callout.getByRole("button", { name: "Open Catalog" })).toBeVisible();

    const expertState = {
      ...BASE_CATALOG_SEEDED_STATE,
      currencyCents: 1_000_000_000_000,
      enjoymentCents: 1_000_000_000_000,
      therapistCareer: {
        ...BASE_CATALOG_SEEDED_STATE.therapistCareer,
        careerStartId: "phd-program",
      },
      interactionNextAvailableAtMsByItem: {
        quartz: 0,
        automatic: 0,
        manual: 0,
        tourbillon: 0,
      },
    };

    await seedAndOpen(page, expertState);
    const expertCatalogPanel = await openCatalogTab(page);

    const unownedTab = expertCatalogPanel.locator("#catalog-unowned-tab");
    const ownedTab = expertCatalogPanel.locator("#catalog-owned-tab");
    await expect(unownedTab).toBeVisible();
    await expect(ownedTab).toBeVisible();

    const ownershipTablist = expertCatalogPanel.locator('[role="tablist"][aria-label="Catalog ownership"]');
    await expect(ownershipTablist).toBeVisible();

    await expect(expertCatalogPanel.getByTestId("catalog-tab-ready-unowned")).toBeVisible();
    await expect(expertCatalogPanel.getByTestId("catalog-tab-ready-owned")).toBeVisible();

    await clickLocatorSafely(ownedTab);
    await expect(ownedTab).toHaveAttribute("aria-selected", "true");
    await expect(unownedTab).toHaveAttribute("aria-selected", "false");
  });

  test("reset review matrix is visible with Current/Next/Delta structure", async ({ page }) => {
    const workshopReadyState = {
      currencyCents: 12_345,
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

    await seedAndOpen(page, workshopReadyState, true);

    await clickLocatorSafely(page.locator("#workshop-tab"));
    await clickLocatorSafely(page.getByRole("button", { name: "Review reset" }));

    const workshopSummary = page.getByTestId("workshop-prestige-summary");
    await expect(workshopSummary).toBeVisible();
    await expect(page.getByTestId("workshop-prestige-summary-current")).toBeVisible();
    await expect(page.getByTestId("workshop-prestige-summary-next")).toBeVisible();
    await expect(page.getByTestId("workshop-prestige-summary-delta")).toBeVisible();

    await expect
      .poll(async () => page.getByTestId("workshop-prestige-summary-current").locator("li").count())
      .toBeGreaterThan(0);
    await expect
      .poll(async () => page.getByTestId("workshop-prestige-summary-next").locator("li").count())
      .toBeGreaterThan(0);
    await expect
      .poll(async () => page.getByTestId("workshop-prestige-summary-delta").locator("li").count())
      .toBeGreaterThan(0);

    await expect(page.getByText(/Review Current run, Next run keeps, and Delta/i)).toBeVisible();

    await clickLocatorSafely(page.getByRole("button", { name: "Keep current run" }));
    await expect(workshopSummary).toHaveCount(0);

    const maisonReadyState = {
      ...workshopReadyState,
      enjoymentCents: 4_000_000,
      workshopBlueprints: 3,
      workshopPrestigeCount: 1,
    };

    await seedAndOpen(page, maisonReadyState, true);

    await clickLocatorSafely(page.locator("#maison-tab"));
    await clickLocatorSafely(page.getByRole("button", { name: "Review reset" }));

    const maisonSummary = page.getByTestId("maison-prestige-summary");
    await expect(maisonSummary).toBeVisible();
    await expect(page.getByTestId("maison-prestige-summary-current")).toBeVisible();
    await expect(page.getByTestId("maison-prestige-summary-next")).toBeVisible();
    await expect(page.getByTestId("maison-prestige-summary-delta")).toBeVisible();

    await expect
      .poll(async () => page.getByTestId("maison-prestige-summary-current").locator("li").count())
      .toBeGreaterThan(0);
    await expect
      .poll(async () => page.getByTestId("maison-prestige-summary-next").locator("li").count())
      .toBeGreaterThan(0);
    await expect
      .poll(async () => page.getByTestId("maison-prestige-summary-delta").locator("li").count())
      .toBeGreaterThan(0);
  });

  test("terminology stays aligned across collection callout, catalog header, and help", async ({ page }) => {
    await seedAndOpen(page, BASE_CATALOG_SEEDED_STATE);

    await clickLocatorSafely(page.getByRole("tab", { name: "Collection" }));
    const callout = page.getByTestId("catalog-shop-callout");
    await expect(callout).toBeVisible();
    await expect(callout.getByRole("heading", { name: "Shop in Catalog" })).toBeVisible();

    await clickLocatorSafely(callout.getByRole("button", { name: "Open Catalog" }));
    await expect(page.getByRole("tab", { name: "Catalog" })).toHaveAttribute("aria-selected", "true");

    const catalogPanel = page.getByRole("tabpanel", { name: "Catalog" });
    await expect(catalogPanel.getByRole("heading", { name: "Catalog" })).toBeVisible();
    await expect(catalogPanel).toContainText("Buy watches and track discovered references.");

    await clickLocatorSafely(catalogPanel.getByTestId("explain-catalog-shop"));
    await expect(page.getByTestId("help-modal")).toBeVisible();
    await expect(page.getByTestId("help-active-section")).toHaveText("Catalog shopping");
    await expect(page.getByTestId("help-modal")).toContainText("Catalog is the purchase surface");
  });

  test("career next-action card exposes stable guidance structure", async ({ page }) => {
    const state = createInitialState();
    await seedAndOpen(page, state);

    await clickLocatorSafely(page.getByRole("tab", { name: "Career" }));

    const nextActionCard = page.getByTestId("career-next-action");
    await expect(nextActionCard).toBeVisible();
    await expect(page.getByTestId("career-next-action-status")).toBeVisible();
    await expect(page.getByTestId("career-next-action-start")).toBeVisible();
    await expect(page.getByTestId("explain-career-start")).toBeVisible();

    await expect(nextActionCard.locator("h4")).toHaveText(/.+/);
    await expect(nextActionCard.locator(".career-next-action-detail")).toHaveText(/.+/);
  });

  test("disclosure and dialog accessibility semantics remain intact", async ({ page }) => {
    const state = createInitialState();
    await seedAndOpen(page, state);

    await clickLocatorSafely(page.locator("#upgrades-tab"));

    const collectionDisclosure = page.getByTestId("upgrades-group-collection");
    const workshopDisclosure = page.getByTestId("upgrades-group-workshop");
    const maisonDisclosure = page.getByTestId("upgrades-group-maison");

    await expect(collectionDisclosure).toBeVisible();
    await expect(workshopDisclosure).toBeVisible();
    await expect(maisonDisclosure).toBeVisible();

    await expect(collectionDisclosure.locator(":scope > summary")).toBeVisible();
    await expect(workshopDisclosure.locator(":scope > summary")).toBeVisible();
    await expect(maisonDisclosure.locator(":scope > summary")).toBeVisible();

    const workshopBefore = await workshopDisclosure.evaluate((element) =>
      (element as HTMLDetailsElement).hasAttribute("open"),
    );
    await clickLocatorSafely(workshopDisclosure.locator(":scope > summary"));
    const workshopAfter = await workshopDisclosure.evaluate((element) =>
      (element as HTMLDetailsElement).hasAttribute("open"),
    );
    expect(workshopAfter).toBe(!workshopBefore);

    await page.setViewportSize({ width: 390, height: 844 });
    await clickLocatorSafely(page.getByRole("tab", { name: "Catalog" }));

    const filterToggle = page.getByTestId("catalog-filter-toggle");
    await expect(filterToggle).toBeVisible();
    await expect(filterToggle).toHaveAttribute("aria-controls", "catalog-filter-panel");
    await expect(filterToggle).toHaveAttribute("aria-expanded", "false");

    await clickLocatorSafely(filterToggle);
    await expect(filterToggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("catalog-filter-panel")).toBeVisible();

    await clickLocatorSafely(page.getByTestId("help-open"));
    const helpModal = page.getByTestId("help-modal");
    await expect(helpModal).toBeVisible();
    await expect(helpModal).toHaveAttribute("role", "dialog");
    await expect(helpModal).toHaveAttribute("aria-modal", "true");

    const labelledBy = await helpModal.getAttribute("aria-labelledby");
    const describedBy = await helpModal.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();

    if (labelledBy) {
      await expect(page.locator(`[id="${labelledBy}"]`)).toHaveCount(1);
    }
    if (describedBy) {
      await expect(page.locator(`[id="${describedBy}"]`)).toHaveCount(1);
    }

    const inertAppRoot = page.locator("#app-shell[inert], #app[inert], #root[inert]");
    const hiddenAppRoot = page.locator('#app-shell[aria-hidden="true"], #app[aria-hidden="true"], #root[aria-hidden="true"]');

    await expect(inertAppRoot).toHaveCount(1);
    await expect(hiddenAppRoot).toHaveCount(1);

    await clickLocatorSafely(page.getByTestId("help-close"));
    await expect(helpModal).toHaveCount(0);
    await expect(page.locator("#app-shell[inert], #app[inert], #root[inert]")).toHaveCount(0);
    await expect(
      page.locator('#app-shell[aria-hidden="true"], #app[aria-hidden="true"], #root[aria-hidden="true"]'),
    ).toHaveCount(0);
  });
});
