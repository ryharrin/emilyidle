import { expect, test } from "@playwright/test";
import { createInitialState } from "../src/game/state";
import { openCatalogFilters } from "./helpers/catalogFilters";
import { seedStorage } from "./helpers/storageSeed";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

test("tabs respect hidden preferences", async ({ page }) => {
  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { quartz: 15, automatic: 0, manual: 1, tourbillon: 0 },
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

  const settings = {
    themeMode: "system",
    hideCompletedAchievements: false,
    hiddenTabs: ["catalog"],
    coachmarksDismissed: {},
  };

  await seedStorage(page, {
    save: {
      state: seededState,
    },
    settings,
  });

  await page.goto("/");

  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  await expect(tabList.getByRole("tab", { name: "Collection" })).toBeVisible();
  await expect(tabList.getByRole("tab", { name: "Settings" })).toBeVisible();
  await expect(tabList.getByRole("tab", { name: "Catalog" })).toHaveCount(0);
});

test("tabs surface readiness badges and honor numeric shortcuts", async ({ page }) => {
  const seededState = createInitialState();
  seededState.items.quartz = 2;
  seededState.currencyCents = 5_000_000_00;
  seededState.enjoymentCents = 5_000_000_00;
  seededState.catalogTierUnlocks = ["quartz", "automatic", "manual", "tourbillon"];
  seededState.watchModels = {
    ...seededState.watchModels,
    [CLASSIC_MODEL_ID]: 0,
  };
  seededState.interactionNextAvailableAtMsByItem = {
    ...seededState.interactionNextAvailableAtMsByItem,
    quartz: 0,
  };

  const settings = {
    themeMode: "system",
    hideCompletedAchievements: false,
    hiddenTabs: [],
    coachmarksDismissed: {},
  };

  await seedStorage(page, {
    save: {
      state: seededState,
    },
    settings,
  });

  await page.goto("/");

  await expect(page.getByTestId("tab-ready-collection")).toBeVisible();
  await expect(page.getByTestId("tab-ready-catalog")).toBeVisible();

  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  const careerTab = tabList.getByRole("tab", { name: "Career" });
  const collectionTab = tabList.getByRole("tab", { name: "Collection" });
  const catalogTab = tabList.getByRole("tab", { name: "Catalog" });

  await page.keyboard.press("Digit1");
  await expect(careerTab).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Digit2");
  await expect(catalogTab).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Digit3");
  await expect(collectionTab).toHaveAttribute("aria-selected", "true");

  await catalogTab.click();
  await openCatalogFilters(page);
  const searchInput = page.getByTestId("catalog-search");
  await expect(searchInput).toBeVisible();
  await searchInput.focus();
  await page.keyboard.press("Digit1");
  await expect(catalogTab).toHaveAttribute("aria-selected", "true");
});
