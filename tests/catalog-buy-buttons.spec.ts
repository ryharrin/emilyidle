import { expect, test } from "@playwright/test";
import { createInitialState } from "../src/game/state";
import { clickLocatorSafely } from "./helpers/interactions";
import { seedStorage } from "./helpers/storageSeed";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

test("discovered unowned entries expose catalog buy buttons in collection shop", async ({ page }) => {
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
  seededState.discoveredCatalogEntries = [CLASSIC_MODEL_ID];
  seededState.watchModels = {
    ...seededState.watchModels,
    [CLASSIC_MODEL_ID]: 0,
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
  await page.getByTestId("catalog-search").fill("126713GRNR");

  await expect(page.getByTestId(`catalog-buy-${CLASSIC_MODEL_ID}`)).toBeVisible();
});
