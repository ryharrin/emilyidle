import { expect, test } from "@playwright/test";
import { clickLocatorSafely } from "./helpers/interactions";

test("fresh save shows catalog buy buttons in collection shop", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");
  await clickLocatorSafely(page.getByRole("tab", { name: "Collection" }));

  const callout = page.getByTestId("catalog-shop-callout");
  await callout.scrollIntoViewIfNeeded();
  const openCatalog = callout.getByRole("button", { name: "Open Catalog" });
  await clickLocatorSafely(openCatalog);

  await expect(page.getByTestId("catalog-results-count")).toBeVisible();

  const buyButtons = page.locator('[data-testid^="catalog-buy-"]');
  await expect(buyButtons.first()).toBeInViewport();
});
