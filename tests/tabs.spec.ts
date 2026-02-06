import { expect, test } from "@playwright/test";
import { createInitialState } from "../src/game/state";

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
  await expect(tabList.getByRole("tab", { name: "Collection" })).toBeVisible();
  await expect(tabList.getByRole("tab", { name: "Settings" })).toBeVisible();
  await expect(tabList.getByRole("tab", { name: "Catalog" })).toHaveCount(0);
});

test("tabs surface readiness badges and honor numeric shortcuts", async ({ page }) => {
  const seededState = createInitialState();
  seededState.items.starter = 2;
  seededState.interactionNextAvailableAtMsByItem = {
    ...seededState.interactionNextAvailableAtMsByItem,
    starter: 0,
  };

  const settings = {
    themeMode: "system",
    hideCompletedAchievements: false,
    hiddenTabs: [],
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

  await expect(page.getByTestId("tab-ready-collection")).toBeVisible();

  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  const careerTab = tabList.getByRole("tab", { name: "Career" });
  const collectionTab = tabList.getByRole("tab", { name: "Collection" });
  const catalogTab = tabList.getByRole("tab", { name: "Catalog" });

  await page.keyboard.press("Digit1");
  await expect(careerTab).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Digit2");
  await expect(collectionTab).toHaveAttribute("aria-selected", "true");

  await catalogTab.click();
  const searchInput = page.getByTestId("catalog-search");
  await expect(searchInput).toBeVisible();
  await searchInput.focus();
  await page.keyboard.press("Digit1");
  await expect(catalogTab).toHaveAttribute("aria-selected", "true");
});
