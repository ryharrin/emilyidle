import type { Page } from "@playwright/test";

export async function openCatalogFilters(page: Page) {
  const toggle = page.getByTestId("catalog-filter-toggle");
  const expanded = (await toggle.getAttribute("aria-expanded")) === "true";
  if (expanded) {
    return;
  }

  await toggle.click();
  await page.getByTestId("catalog-filter-panel").waitFor({ state: "visible" });
}
