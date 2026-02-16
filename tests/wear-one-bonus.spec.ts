import { expect, test, type Page } from "@playwright/test";
import { CATALOG_ENTRIES } from "../src/game/catalog";
import type { GameState } from "../src/game/state";
import { createInitialState } from "../src/game/state";
import { clickLocatorSafely } from "./helpers/interactions";

type SeededSave = {
  state: GameState;
  lastSimulatedAtMs: number;
};

async function seedSave(page: Page, seeded: SeededSave) {
  await page.addInitScript(({ state, lastSimulatedAtMs }: SeededSave) => {
    const settings = {
      themeMode: "system",
      hideCompletedAchievements: false,
      hiddenTabs: [],
      coachmarksDismissed: {},
      confirmNostalgiaUnlocks: true,
      notificationPreferences: {
        sessionsReady: true,
        prestigeReady: true,
        achievements: true,
        events: true,
      },
    };

    const payload = {
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs,
      state,
    };
    window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
    window.localStorage.setItem("emily-idle:settings", JSON.stringify(settings));
  }, seeded);
}

async function openPrimaryTab(page: Page, name: string) {
  const tab = page.getByRole("tab", { name: new RegExp(name, "i") }).first();
  await clickLocatorSafely(tab);
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: new RegExp(name, "i") })).toBeVisible();
}

async function activateCollectionOverview(page: Page) {
  const sectionNav = page.getByTestId("collection-section-nav");
  await expect(sectionNav).toBeVisible();

  const overviewButton = page.locator('[data-section-nav-id="collection-overview"]').first();
  await expect(overviewButton).toBeVisible();
  await clickLocatorSafely(overviewButton);
  await expect(sectionNav).toHaveAttribute("data-active-section", "collection-overview");
}

async function ensureCollectionEquipmentSectionOpen(page: Page) {
  const equipmentDetails = page.getByTestId("collection-equipment-details");
  if ((await equipmentDetails.count()) === 0) {
    return;
  }

  const isOpen = await equipmentDetails.first().evaluate(
    (node) => (node as HTMLDetailsElement).open,
  );
  if (isOpen) {
    return;
  }

  await clickLocatorSafely(page.getByTestId("collection-equipment-toggle"));
  await expect(equipmentDetails.first()).toHaveAttribute("open", "");
}

test("wear one watch, switch, clear, and verify Stats + help", async ({ page }) => {
  test.slow();

  const base = createInitialState();
  const [firstSeedId, secondSeedId, thirdSeedId] = CATALOG_ENTRIES.slice(0, 3).map(
    (entry) => entry.id,
  );
  const seededState: GameState = {
    ...base,
    currencyCents: 10_000,
    enjoymentCents: 10_000,
    wornWatchId: null,
    watchModels: {
      ...base.watchModels,
      [firstSeedId]: 5,
      [secondSeedId]: 5,
      [thirdSeedId]: 5,
    },
    items: { ...base.items, quartz: 12, automatic: 4, manual: 4, tourbillon: 1 },
    unlockedMilestones: Array.from(new Set([...base.unlockedMilestones, "collector-shelf", "showcase"])),
    discoveredCatalogEntries: CATALOG_ENTRIES.map((entry) => entry.id),
    achievementUnlocks: Array.from(new Set([...base.achievementUnlocks, "first-drawer"])),
  };

  await seedSave(page, { state: seededState, lastSimulatedAtMs: Date.now() });

  await page.goto("/");
  await openPrimaryTab(page, "Collection");
  await activateCollectionOverview(page);
  await ensureCollectionEquipmentSectionOpen(page);
  const wornSummary = page.locator('[data-testid="worn-watch-summary"]:visible').first();
  const wornWatchChange = page.locator('[data-testid="worn-watch-change"]:visible').first();
  await expect(wornSummary).toBeVisible();

  await clickLocatorSafely(wornWatchChange);
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeVisible();
  const firstWatchOptions = page.locator('[data-testid^="worn-watch-option-"]');
  const firstWatchOptionCount = await firstWatchOptions.count();
  let firstWatchId: string | null = null;
  for (let index = 0; index < firstWatchOptionCount; index += 1) {
    const option = firstWatchOptions.nth(index);
    const optionId = await option.getAttribute("data-testid");
    if (!optionId || optionId === "worn-watch-option-none") {
      continue;
    }
    firstWatchId = optionId.replace(/^worn-watch-option-/, "");
    await clickLocatorSafely(option);
    break;
  }
  if (!firstWatchId) {
    throw new Error("Expected at least one wearable watch option.");
  }
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeHidden();
  await expect(wornSummary).not.toContainText("None");

  await clickLocatorSafely(wornWatchChange);
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeVisible();
  const secondWatchOption = page.locator('[data-testid^="worn-watch-option-"]');
  const secondWatchOptionCount = await secondWatchOption.count();
  let switchedWatchId: string | null = null;
  for (let index = 0; index < secondWatchOptionCount; index += 1) {
    const option = secondWatchOption.nth(index);
    const optionId = await option.getAttribute("data-testid");
    if (
      !optionId ||
      optionId === "worn-watch-option-none" ||
      optionId === `worn-watch-option-${firstWatchId}`
    ) {
      continue;
    }
    switchedWatchId = optionId.replace(/^worn-watch-option-/, "");
    await clickLocatorSafely(option);
    break;
  }
  if (!switchedWatchId) {
    throw new Error("Expected a second wearable watch option for switching.");
  }
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeHidden();
  await expect(wornSummary).not.toContainText("None");

  await openPrimaryTab(page, "Stats");
  const enjoymentBreakdown = page.getByTestId("enjoyment-rate-breakdown");
  await expect(enjoymentBreakdown).toContainText("Worn watch ×");

  await clickLocatorSafely(page.getByRole("button", { name: "Explain rates" }).first());
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Rates/i);
  await clickLocatorSafely(page.getByTestId("help-close"));
  await expect(page.getByTestId("help-modal")).toBeHidden();

  await openPrimaryTab(page, "Collection");
  await activateCollectionOverview(page);
  await ensureCollectionEquipmentSectionOpen(page);
  await clickLocatorSafely(wornWatchChange);
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeVisible();
  await clickLocatorSafely(page.getByTestId("worn-watch-option-none"));
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeHidden();
  await expect(wornSummary).toContainText("None");

  await openPrimaryTab(page, "Stats");
  await expect(page.getByTestId("enjoyment-rate-breakdown")).not.toContainText("Worn watch");
});
