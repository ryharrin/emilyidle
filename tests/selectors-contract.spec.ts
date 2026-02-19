import { expect, test } from "@playwright/test";
import { createInitialState } from "../src/game/state";
import { openCatalogFilters } from "./helpers/catalogFilters";
import { clickLocatorSafely } from "./helpers/interactions";
import { seedStorage } from "./helpers/storageSeed";

const QUARTZ_MODEL_ID = "rolex-calibrorolex";

test("selector contract anchors remain reachable", async ({ page }) => {
  const seededState = createInitialState();
  seededState.items = {
    ...seededState.items,
    quartz: 1,
  };
  seededState.interactionNextAvailableAtMsByItem = {
    ...seededState.interactionNextAvailableAtMsByItem,
    quartz: 0,
  };

  await seedStorage(page, {
    clearLocalStorage: true,
    save: {
      state: seededState,
    },
    settings: {
      hiddenTabs: [],
    },
    navigation: {
      lastTabId: "collection",
    },
  });

  await page.goto("/");
  await expect(page.getByTestId("tab-ready-collection")).toBeVisible();

  await expect(page.getByTestId("help-open")).toBeVisible();
  await clickLocatorSafely(page.getByTestId("help-open"));
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await clickLocatorSafely(page.getByTestId("help-close"));
  await expect(page.locator('[data-testid="help-modal"]')).toHaveCount(0);

  await clickLocatorSafely(page.getByRole("tab", { name: "Collection" }));
  const callout = page.getByTestId("catalog-shop-callout");
  await expect(callout).toBeVisible();
  const openCatalog = callout.getByRole("button", { name: "Open Catalog" });
  await clickLocatorSafely(openCatalog);
  await expect(page.getByTestId("catalog-results-count")).toBeVisible();

  await clickLocatorSafely(page.getByRole("tab", { name: "Catalog" }));
  await openCatalogFilters(page);
  // Wait for filters to be ready before interacting with combobox
  await page.waitForTimeout(500);
  const quickPreset = page.getByRole("combobox", { name: "Quick preset" });
  await expect(quickPreset).toBeVisible();
  await quickPreset.selectOption("All references");
  await expect(page.getByTestId("catalog-grid")).toBeVisible();
  await expect(page.getByTestId("catalog-card").first()).toBeVisible();
  await expect(page.getByTestId("catalog-shop")).toHaveCount(1);
  await expect(page.getByTestId("catalog-filters")).toBeVisible();
  await expect(page.getByTestId("catalog-search")).toBeVisible();

  // Search for the quartz watch
  await page.getByTestId("catalog-search").fill("Calibrorolex");
  await expect(page.getByTestId(`catalog-gate-${QUARTZ_MODEL_ID}`)).toBeVisible();
  // Quartz tier is always unlocked, so no lock icon
  await expect(page.getByTestId(`catalog-why-${QUARTZ_MODEL_ID}`)).toBeVisible();
  await clickLocatorSafely(page.getByTestId(`catalog-why-${QUARTZ_MODEL_ID}`));
  await expect(page.getByTestId(`catalog-explain-${QUARTZ_MODEL_ID}`)).toBeVisible();

  await clickLocatorSafely(page.getByRole("tab", { name: "Settings" }));
  await expect(page.getByTestId("settings-clear-save")).toBeVisible();
  await clickLocatorSafely(page.getByTestId("settings-clear-save"));
  if (
    !(await page
      .getByTestId("settings-clear-save-confirm")
      .isVisible()
      .catch(() => false))
  ) {
    await clickLocatorSafely(page.getByTestId("settings-clear-save"));
  }
  await expect(page.getByTestId("settings-clear-save-confirm")).toBeVisible();
  await expect(page.getByTestId("settings-clear-save-cancel")).toBeVisible();
});

// Discovery system removed - catalog readiness no longer depends on discoveries

test("unowned entries expose catalog buy buttons in collection shop", async ({ page }) => {
  const seededState = createInitialState();
  seededState.currencyCents = 5_000_000_00;
  seededState.enjoymentCents = 5_000_000_00;
  seededState.therapistCareer = {
    ...seededState.therapistCareer,
    careerStartId: "phd-program",
  };
  seededState.catalogTierUnlocks = ["quartz", "automatic", "manual", "tourbillon"];
  seededState.items = {
    ...seededState.items,
    quartz: 5,
  };
  seededState.watchModels = {
    ...seededState.watchModels,
    [QUARTZ_MODEL_ID]: 0,
  };

  await seedStorage(page, {
    clearLocalStorage: true,
    save: {
      state: seededState,
    },
    settings: {
      hiddenTabs: [],
    },
    navigation: {
      lastTabId: "collection",
    },
  });

  await page.goto("/");
  await clickLocatorSafely(page.getByRole("tab", { name: "Collection" }));

  const callout = page.getByTestId("catalog-shop-callout");
  await callout.scrollIntoViewIfNeeded();
  const openCatalog = callout.getByRole("button", { name: "Open Catalog" });
  await clickLocatorSafely(openCatalog);

  await expect(page.getByTestId("catalog-results-count")).toBeVisible();
  // Search for the quartz watch
  await page.getByTestId("catalog-search").fill("Calibrorolex");
  await expect(page.getByTestId(`catalog-buy-${QUARTZ_MODEL_ID}`)).toBeVisible();
});
