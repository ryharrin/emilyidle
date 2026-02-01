import { expect, test } from "@playwright/test";

const seededState = {
  currencyCents: 1000,
  enjoymentCents: 500,
  items: { starter: 15, classic: 5, chronograph: 1, tourbillon: 0 },
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

async function seedExistingSave(page: any, lastTabId: string = "save") {
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

test.describe("Phase 32 UAT: Landing + Navigation Rules", () => {
  test.describe("Desktop", () => {
    test("1. Fresh save: visiting / lands on Career; tabs usable", async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear();
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const careerTab = tabList.getByRole("tab", { name: "Career" });
      const vaultTab = tabList.getByRole("tab", { name: "Vault" });
      const upgradesTab = tabList.getByRole("tab", { name: "Upgrades" });
      const saveTab = tabList.getByRole("tab", { name: "Settings" });

      // Verify Career is selected
      await expect(careerTab).toHaveAttribute("aria-selected", "true");
      await expect(page.getByTestId("career-panel")).toBeVisible();

      // Verify tabs are usable
      await expect(vaultTab).toBeVisible();
      await expect(upgradesTab).toBeVisible();
      await expect(saveTab).toBeVisible();
      await expect(careerTab).toBeVisible();

      // Test tab switching works
      await vaultTab.click();
      await expect(vaultTab).toHaveAttribute("aria-selected", "true");

      await careerTab.click();
      await expect(careerTab).toHaveAttribute("aria-selected", "true");
    });

    test("2. Existing save + last-tab persistence: lands on Settings when lastTabId=save", async ({
      page,
    }) => {
      await seedExistingSave(page, "save");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const saveTab = tabList.getByRole("tab", { name: "Settings" });

      await expect(saveTab).toHaveAttribute("aria-selected", "true");
    });

    test("3. Deep link non-persistence: ?tab=career opens Career, then / returns to Settings", async ({
      page,
    }) => {
      await seedExistingSave(page, "save");

      // First visit - should land on Settings
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const saveTab = tabList.getByRole("tab", { name: "Settings" });
      const careerTab = tabList.getByRole("tab", { name: "Career" });

      await expect(saveTab).toHaveAttribute("aria-selected", "true");

      // Deep link to Career
      await page.goto("/?tab=career");
      await page.waitForLoadState("networkidle");
      await expect(careerTab).toHaveAttribute("aria-selected", "true");

      // Verify navigation localStorage is still "save"
      const stored = await page.evaluate(() =>
        window.localStorage.getItem("emily-idle:navigation"),
      );
      expect(stored ? JSON.parse(stored) : null).toEqual({ lastTabId: "save" });

      // Visit / again - should return to Settings
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(saveTab).toHaveAttribute("aria-selected", "true");

      // Final verification: navigation still shows "save"
      const storedFinal = await page.evaluate(() =>
        window.localStorage.getItem("emily-idle:navigation"),
      );
      expect(storedFinal ? JSON.parse(storedFinal) : null).toEqual({ lastTabId: "save" });
    });

    test("4. Deep link alias: ?tab=catalog lands on Vault", async ({ page }) => {
      await seedExistingSave(page, "save");

      await page.goto("/?tab=catalog");
      await page.waitForLoadState("networkidle");

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const vaultTab = tabList.getByRole("tab", { name: "Vault" });

      await expect(vaultTab).toHaveAttribute("aria-selected", "true");
    });
  });

  test.describe("Mobile/Responsive", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("1. Fresh save mobile: visiting / lands on Career; tabs usable", async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear();
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const careerTab = tabList.getByRole("tab", { name: "Career" });

      // Verify Career is selected
      await expect(careerTab).toHaveAttribute("aria-selected", "true");

      // Take screenshot for visual verification
      await page.screenshot({
        path: "test-results/uat-mobile-fresh-save.png",
        fullPage: false,
      });

      // Verify tabs are visible and usable in mobile viewport
      const vaultTab = tabList.getByRole("tab", { name: "Vault" });
      const upgradesTab = tabList.getByRole("tab", { name: "Upgrades" });
      const saveTab = tabList.getByRole("tab", { name: "Settings" });

      await expect(vaultTab).toBeVisible();
      await expect(upgradesTab).toBeVisible();
      await expect(saveTab).toBeVisible();

      // Test tab switching works on mobile
      await vaultTab.click();
      await expect(vaultTab).toHaveAttribute("aria-selected", "true");

      await careerTab.click();
      await expect(careerTab).toHaveAttribute("aria-selected", "true");
    });

    test("3. Deep link non-persistence mobile: ?tab=career opens Career, then / returns to Settings", async ({
      page,
    }) => {
      await seedExistingSave(page, "save");

      // First visit - should land on Settings
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const saveTab = tabList.getByRole("tab", { name: "Settings" });
      const careerTab = tabList.getByRole("tab", { name: "Career" });

      await expect(saveTab).toHaveAttribute("aria-selected", "true");

      // Take screenshot of Settings tab on mobile
      await page.screenshot({
        path: "test-results/uat-mobile-save-tab.png",
        fullPage: false,
      });

      // Deep link to Career
      await page.goto("/?tab=career");
      await page.waitForLoadState("networkidle");
      await expect(careerTab).toHaveAttribute("aria-selected", "true");

      // Take screenshot of Career tab on mobile
      await page.screenshot({
        path: "test-results/uat-mobile-career-deep-link.png",
        fullPage: false,
      });

      // Verify navigation localStorage is still "save"
      const stored = await page.evaluate(() =>
        window.localStorage.getItem("emily-idle:navigation"),
      );
      expect(stored ? JSON.parse(stored) : null).toEqual({ lastTabId: "save" });

      // Visit / again - should return to Settings
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(saveTab).toHaveAttribute("aria-selected", "true");
    });

    test("Mobile layout: tablist does not break at small viewport", async ({ page }) => {
      await seedExistingSave(page, "career");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

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
      await page.screenshot({
        path: "test-results/uat-mobile-tablist-layout.png",
        fullPage: false,
      });
    });
  });
});
