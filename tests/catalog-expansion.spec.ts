import { expect, test } from "@playwright/test";

import { BASE_CATALOG_SEEDED_STATE } from "./catalog-fixtures";

test("catalog movement sections stay discoverable and filters stay sticky on mobile", async ({
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

  const quartzLane = page.getByTestId("catalog-tier-quartz");
  const automaticLane = page.getByTestId("catalog-tier-automatic");
  const manualLane = page.getByTestId("catalog-tier-manual");
  const tourbillonLane = page.getByTestId("catalog-tier-tourbillon");

  await expect(quartzLane).toBeVisible();
  await expect(quartzLane.getByText("SBGX261")).toBeVisible();

  await expect(automaticLane).toBeVisible();
  await expect(automaticLane.getByText("GMT-Master II ref. 126713GRNR")).toBeVisible();

  await expect(manualLane).toBeVisible();
  await expect(manualLane.getByText("Speedmaster Moonwatch Professional")).toBeVisible();

  await expect(tourbillonLane).toBeVisible();
  await expect(tourbillonLane.getByText("Classique Tourbillon 3357")).toBeVisible();

  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  await expect(filters).toBeVisible();
});
