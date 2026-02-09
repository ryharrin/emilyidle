import { expect, test } from "@playwright/test";
import { createInitialState } from "../src/game/state";
import { openCatalogFilters } from "./helpers/catalogFilters";
import { clickLocatorSafely } from "./helpers/interactions";
import { seedStorage } from "./helpers/storageSeed";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

test("selector contract anchors remain reachable", async ({ page }) => {
  const seededState = createInitialState();
  seededState.items = {
    ...seededState.items,
    starter: 1,
  };
  seededState.interactionNextAvailableAtMsByItem = {
    ...seededState.interactionNextAvailableAtMsByItem,
    starter: 0,
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
  await expect(page.getByTestId("next-unlock-preview")).toBeVisible();
  await expect(page.getByTestId("next-unlock-lead")).toBeVisible();
  await expect(page.getByTestId("next-unlock-cta-career")).toBeVisible();
  await clickLocatorSafely(page.getByTestId("next-unlock-cta-career"));
  await expect(page.getByTestId("catalog-collection-context")).toBeVisible();
  await expect(page.getByTestId("catalog-upgrade-context")).toBeVisible();

  await clickLocatorSafely(page.getByRole("tab", { name: "Catalog" }));
  await openCatalogFilters(page);
  await expect(page.getByTestId("catalog-grid")).toBeVisible();
  await expect(page.getByTestId("catalog-card").first()).toBeVisible();
  await expect(page.getByTestId("catalog-shop")).toHaveCount(1);
  await expect(page.getByTestId("catalog-filters")).toBeVisible();
  await expect(page.getByTestId("catalog-search")).toBeVisible();

  await page.getByTestId("catalog-search").fill("126713GRNR");
  await expect(page.getByTestId(`catalog-gate-${CLASSIC_MODEL_ID}`)).toBeVisible();
  await expect(page.getByTestId(`catalog-lock-${CLASSIC_MODEL_ID}`)).toBeVisible();
  await expect(page.getByTestId(`catalog-why-${CLASSIC_MODEL_ID}`)).toBeVisible();
  await clickLocatorSafely(page.getByTestId(`catalog-why-${CLASSIC_MODEL_ID}`));
  await expect(page.getByTestId(`catalog-explain-${CLASSIC_MODEL_ID}`)).toBeVisible();

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
