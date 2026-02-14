import { expect, test, type Page } from "@playwright/test";
import { clickLocatorSafely } from "./helpers/interactions";
import { gotoAppWithNavigationReady } from "./helpers/navigation";

const seededState = {
  currencyCents: 1000,
  enjoymentCents: 500,
  items: { quartz: 15, automatic: 5, manual: 1, tourbillon: 0 },
  upgrades: { "polishing-tools": 1, "assembly-jigs": 0, "guild-contracts": 0 },
  unlockedMilestones: ["showcase", "first-drawer"],
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

async function seedExistingSave(page: Page, lastTabId: string = "save") {
  await page.addInitScript(
    (args: { state: typeof seededState; lastSimulatedAtMs: number; navigationTab: string }) => {
      window.localStorage.clear();
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs: args.lastSimulatedAtMs,
          state: args.state,
        }),
      );
      window.localStorage.setItem(
        "emily-idle:navigation",
        JSON.stringify({ lastTabId: args.navigationTab }),
      );
    },
    { state: seededState, lastSimulatedAtMs: Date.now(), navigationTab: lastTabId },
  );
}

async function expectTabSelected(page: Page, name: string) {
  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  const tab = tabList.getByRole("tab", { name });
  const panel = page.getByRole("tabpanel", { name });

  await expect(tab).toBeVisible();
  await expect
    .poll(
      async () => {
        const selected = await tab.getAttribute("aria-selected");
        if (selected === "true") {
          return true;
        }
        return panel.isVisible().catch(() => false);
      },
      { timeout: 20_000 },
    )
    .toBe(true);
}

async function gotoApp(page: Page, path: string = "/") {
  await gotoAppWithNavigationReady(page, {
    path,
    navigationVisibleTimeoutMs: 20_000,
  });
}

async function captureBestEffort(page: Page, path: string) {
  await page
    .screenshot({
      path,
      fullPage: false,
      timeout: 8_000,
    })
    .catch(() => {});
}

test.describe("Phase 32 UAT: Landing + Navigation Rules", () => {
  test.describe("Desktop", () => {
    test("1. Fresh save: visiting / lands on Career; tabs usable", async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear();
      });

      await gotoApp(page);

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const careerTab = tabList.getByRole("tab", { name: "Career" });
      const vaultTab = tabList.getByRole("tab", { name: "Collection" });
      const upgradesTab = tabList.getByRole("tab", { name: "Upgrades" });
      const saveTab = tabList.getByRole("tab", { name: "Settings" });

      // Verify Career is selected
      await expectTabSelected(page, "Career");
      await expect(page.getByTestId("career-panel")).toBeVisible();

      // Verify tabs are usable
      await expect(vaultTab).toBeVisible();
      await expect(upgradesTab).toBeVisible();
      await expect(saveTab).toBeVisible();
      await expect(careerTab).toBeVisible();

      // Test tab switching works
      await clickLocatorSafely(vaultTab);
      await expectTabSelected(page, "Collection");

      await clickLocatorSafely(careerTab);
      await expectTabSelected(page, "Career");
    });

    test("2. Existing save: still lands on Career first", async ({
      page,
    }) => {
      await seedExistingSave(page, "save");

      await gotoApp(page);

      await expectTabSelected(page, "Career");
    });

    test("3. Deep links are ignored for first landing and Career remains default", async ({
      page,
    }) => {
      await seedExistingSave(page, "save");

      // First visit - should land on Career
      await gotoApp(page);

      await expectTabSelected(page, "Career");

      // Deep link to Career
      await gotoApp(page, "/?tab=career");
      await expectTabSelected(page, "Career");

      // Verify navigation localStorage is still "save"
      const stored = await page.evaluate(() =>
        window.localStorage.getItem("emily-idle:navigation"),
      );
      expect(stored ? JSON.parse(stored) : null).toEqual({ lastTabId: "save" });

      // Visit / again - should remain Career
      await gotoApp(page);
      await expectTabSelected(page, "Career");

      // Final verification: navigation still shows "save"
      const storedFinal = await page.evaluate(() =>
        window.localStorage.getItem("emily-idle:navigation"),
      );
      expect(storedFinal ? JSON.parse(storedFinal) : null).toEqual({ lastTabId: "save" });
    });

    test("4. Deep link alias: ?tab=catalog still lands on Career", async ({ page }) => {
      await seedExistingSave(page, "save");

      await gotoApp(page, "/?tab=catalog");

      await expectTabSelected(page, "Career");
    });
  });

  test.describe("Mobile/Responsive", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("1. Fresh save mobile: visiting / lands on Career; tabs usable", async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear();
      });

      await gotoApp(page);

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const careerTab = tabList.getByRole("tab", { name: "Career" });

      // Verify Career is selected
      await expectTabSelected(page, "Career");

      // Take screenshot for visual verification
      await captureBestEffort(page, "test-results/uat-mobile-fresh-save.png");

      // Verify tabs are visible and usable in mobile viewport
      const vaultTab = tabList.getByRole("tab", { name: "Collection" });
      const upgradesTab = tabList.getByRole("tab", { name: "Upgrades" });
      const saveTab = tabList.getByRole("tab", { name: "Settings" });

      await expect(vaultTab).toBeVisible();
      await expect(upgradesTab).toBeVisible();
      await expect(saveTab).toBeVisible();

      // Test tab switching works on mobile
      await clickLocatorSafely(vaultTab);
      await expectTabSelected(page, "Collection");

      await clickLocatorSafely(careerTab);
      await expectTabSelected(page, "Career");
    });

    test("3. Deep links are ignored on mobile and Career remains default", async ({
      page,
    }) => {
      await seedExistingSave(page, "save");

      // First visit - should land on Career
      await gotoApp(page);

      await expectTabSelected(page, "Career");

      // Deep link to Career
      await gotoApp(page, "/?tab=career");
      await expectTabSelected(page, "Career");

      // Take screenshot of Career tab on mobile
      await captureBestEffort(page, "test-results/uat-mobile-career-deep-link.png");

      // Verify navigation localStorage is still "save"
      const stored = await page.evaluate(() =>
        window.localStorage.getItem("emily-idle:navigation"),
      );
      expect(stored ? JSON.parse(stored) : null).toEqual({ lastTabId: "save" });

      // Visit / again - should remain Career
      await gotoApp(page);
      await expectTabSelected(page, "Career");
    });

    test("Mobile layout: tablist does not break at small viewport", async ({ page }) => {
      await seedExistingSave(page, "career");

      await gotoApp(page);

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });

      // Verify tablist is visible and has reasonable layout
      await expect(tabList).toBeVisible();

      // Check that tabs are accessible
      const tabs = await tabList.getByRole("tab").all();
      expect(tabs.length).toBeGreaterThan(0);

      // Verify each tab is visible
      for (const tab of tabs) {
        await expect(tab).toBeVisible();
      }

      // Take screenshot for visual verification
      await captureBestEffort(page, "test-results/uat-mobile-tablist-layout.png");
    });
  });
});
