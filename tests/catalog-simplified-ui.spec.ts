import { expect, test } from "@playwright/test";

test("catalog no longer renders compare controls or compare panel", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();

  await expect(page.locator('[data-testid^="catalog-compare-toggle-"]')).toHaveCount(0);
  await expect(page.getByTestId("catalog-compare-panel")).toHaveCount(0);
});

test("catalog no longer renders per-watch stats section", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();

  await expect(page.getByTestId("per-watch-stats-section")).toHaveCount(0);
  await expect(page.getByTestId("per-watch-stats")).toHaveCount(0);
});

test("catalog filters are collapsed by default", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 820 });
  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();

  const filterToggle = page.getByTestId("catalog-filter-toggle");
  await expect(filterToggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("catalog-filter-panel")).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByTestId("catalog-filter-panel")).toHaveAttribute("hidden", "");
});
