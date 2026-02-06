import { expect, test } from "@playwright/test";
import { BASE_CATALOG_SEEDED_STATE } from "./catalog-fixtures";

const seededState = BASE_CATALOG_SEEDED_STATE;

test("catalog tier lanes highlight the low/mid/lux wave", async ({ page }) => {
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

  const lowLane = page.getByTestId("catalog-tier-low");
  const midLane = page.getByTestId("catalog-tier-mid");
  const luxLane = page.getByTestId("catalog-tier-lux");

  await expect(lowLane).toBeVisible();
  await expect(lowLane.getByText("Aurora Frost")).toBeVisible();
  await expect(lowLane.locator(".catalog-lane-title")).toHaveText("Starter lane");

  await expect(midLane).toBeVisible();
  await expect(midLane.locator(".catalog-lane-title")).toHaveText("Mid-tier lane");
  await expect(midLane.getByText("Ballon de Lumière Chrono")).toBeVisible();

  await expect(luxLane).toBeVisible();
  await expect(luxLane.locator(".catalog-lane-title")).toHaveText("Luxury lane");
  await expect(luxLane.getByText("Luminous Tourbillon")).toBeVisible();

  await page.evaluate(() => window.scrollBy(0, 400));
  await expect(filters).toBeVisible();
});

test("catalog ownership tabs surface readiness badges", async ({ page }) => {
  const readinessState = {
    ...seededState,
    currencyCents: 1_000_000_000_000,
    enjoymentCents: 1_000_000_000_000,
    interactionNextAvailableAtMsByItem: {
      starter: 0,
      classic: 0,
      chronograph: 0,
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
