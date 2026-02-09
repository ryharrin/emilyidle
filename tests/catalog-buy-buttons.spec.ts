import { expect, test } from "@playwright/test";
import { clickLocatorSafely } from "./helpers/interactions";

test("fresh save shows catalog buy buttons in collection shop", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");
  await clickLocatorSafely(page.getByRole("tab", { name: "Collection" }));

  const nextUnlockCareerCta = page.getByTestId("next-unlock-cta-career");
  await nextUnlockCareerCta.scrollIntoViewIfNeeded();
  await clickLocatorSafely(nextUnlockCareerCta);

  await expect(page.getByTestId("catalog-collection-context")).toBeVisible();
  await expect(page.getByTestId("catalog-upgrade-context")).toBeVisible();

  const buyButtons = page.locator('[data-testid^="catalog-buy-"]');
  await expect(buyButtons.first()).toBeInViewport();
});
