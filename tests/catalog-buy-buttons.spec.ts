import { expect, test } from "@playwright/test";

test("fresh save shows catalog buy buttons in collection shop", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");
  await page.getByRole("tab", { name: "Vault" }).click();

  await page.getByTestId("next-unlock-cta-career").click();

  const buyButtons = page.locator('[data-testid^="catalog-buy-"]');
  await expect(buyButtons.first()).toBeInViewport();
});
