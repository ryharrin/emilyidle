import { expect, test } from "@playwright/test";

import { BASE_CATALOG_SEEDED_STATE } from "./catalog-fixtures";

test("catalog expansion lanes stay discoverable and filters stay sticky on mobile", async ({
  page,
}) => {
  await page.addInitScript(
    ({ state, lastSimulatedAtMs }) => {
      window.localStorage.clear();
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs,
          state,
        }),
      );
      window.localStorage.setItem("emily-idle:settings", JSON.stringify({ hiddenTabs: [] }));
      window.localStorage.setItem("emily-idle:help", JSON.stringify({ collapsed: false }));
    },
    { state: BASE_CATALOG_SEEDED_STATE, lastSimulatedAtMs: Date.now() },
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("tab", { name: /Catalog/i }).click();
  await page.getByTestId("catalog-sort").selectOption("tier");

  const filters = page.getByTestId("catalog-filters");
  await expect(filters).toBeVisible();

  const lowLane = page.getByTestId("catalog-tier-low");
  const midLane = page.getByTestId("catalog-tier-mid");
  const luxLane = page.getByTestId("catalog-tier-lux");

  await expect(lowLane).toBeVisible();
  await expect(lowLane.getByText("Aurora Frost")).toBeVisible();

  await expect(midLane).toBeVisible();
  await expect(midLane.getByText("Ballon de Lumière Chrono")).toBeVisible();

  await expect(luxLane).toBeVisible();
  await expect(luxLane.getByText("Luminous Tourbillon")).toBeVisible();

  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  await expect(filters).toBeVisible();
});
