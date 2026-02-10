import { expect, test } from "@playwright/test";
import { BASE_CATALOG_SEEDED_STATE } from "./catalog-fixtures";

const seededState = BASE_CATALOG_SEEDED_STATE;

test("catalog movement sections highlight quartz, automatic, manual, and tourbillon groups", async ({
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
    { state: seededState, lastSimulatedAtMs: Date.now() },
  );

  await page.setViewportSize({ width: 1280, height: 820 });
  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();

  await page.getByTestId("catalog-sort").selectOption("tier");

  const filters = page.getByTestId("catalog-filters");
  await expect(filters).toBeVisible();

  const quartzLane = page.getByTestId("catalog-tier-quartz");
  const automaticLane = page.getByTestId("catalog-tier-automatic");
  const manualLane = page.getByTestId("catalog-tier-manual");
  const tourbillonLane = page.getByTestId("catalog-tier-tourbillon");

  await expect(quartzLane).toBeVisible();
  await expect(quartzLane.getByRole("heading", { name: "SBGX261" })).toBeVisible();
  await expect(quartzLane.locator(".catalog-lane-title")).toHaveText("Quartz movement");

  await expect(automaticLane).toBeVisible();
  await expect(automaticLane.locator(".catalog-lane-title")).toHaveText("Automatic movement");
  await expect(
    automaticLane.getByRole("heading", { name: /GMT-Master II ref\. 126713GRNR/ }),
  ).toBeVisible();

  await expect(manualLane).toBeVisible();
  await expect(manualLane.locator(".catalog-lane-title")).toHaveText("Manual movement");
  await expect(
    manualLane.getByRole("heading", { name: /Speedmaster Moonwatch Professional/ }),
  ).toBeVisible();

  await expect(tourbillonLane).toBeVisible();
  await expect(tourbillonLane.locator(".catalog-lane-title")).toHaveText("Tourbillon movement");
  await expect(
    tourbillonLane.getByRole("heading", { name: "Classique Tourbillon 3357" }),
  ).toBeVisible();

  await page.evaluate(() => window.scrollBy(0, 400));
  await expect(filters).toBeVisible();
});

test("catalog ownership tabs surface readiness badges", async ({ page }) => {
  const readinessState = {
    ...seededState,
    currencyCents: 1_000_000_000_000,
    enjoymentCents: 1_000_000_000_000,
    interactionNextAvailableAtMsByItem: {
      quartz: 0,
      automatic: 0,
      manual: 0,
      tourbillon: 0,
    },
  };

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
    { state: readinessState, lastSimulatedAtMs: Date.now() },
  );

  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();

  await expect(page.getByTestId("catalog-tab-ready-unowned")).toBeVisible();
  await expect(page.getByTestId("catalog-tab-ready-owned")).toBeVisible();
});
