import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { BASE_CATALOG_SEEDED_STATE } from "./catalog-fixtures";

const COMPARE_IDS = ["omega-aurora-frost", "jaeger-lecoultre-atmos-vsp"];

const compareState = {
  ...BASE_CATALOG_SEEDED_STATE,
  currencyCents: 1_000_000,
  enjoymentCents: 1_000_000,
  watchModels: {
    ...BASE_CATALOG_SEEDED_STATE.watchModels,
    [COMPARE_IDS[0]]: 0,
    [COMPARE_IDS[1]]: 0,
  },
};

test("catalog compare panel surfaces two watches with stats", async ({ page }) => {
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
    { state: compareState, lastSimulatedAtMs: Date.now() },
  );

  await page.setViewportSize({ width: 1280, height: 820 });
  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();

  await page.getByTestId(`catalog-compare-toggle-${COMPARE_IDS[0]}`).click();
  await page.getByTestId(`catalog-compare-toggle-${COMPARE_IDS[1]}`).click();

  const comparePanel = page.getByTestId("catalog-compare-panel");
  await expect(comparePanel.getByText("Aurora Frost")).toBeVisible();
  await expect(comparePanel.getByText("Atmos VSP")).toBeVisible();
  await expect(comparePanel.getByText("Ready to buy").first()).toBeVisible();
  await expect(comparePanel.getByText(/Enjoyment \/ sec/).first()).toBeVisible();
  await expect(comparePanel.getByText(/Cash \/ sec/).first()).toBeVisible();

  const slotA = page.getByTestId("compare-slot-A");
  const slotB = page.getByTestId("compare-slot-B");

  const headingText = async (slot: Locator) => {
    const heading = slot.getByRole("heading", { level: 4 });
    await expect(heading).toBeVisible();
    return heading.innerText();
  };

  const slotAName = await headingText(slotA);
  const slotBName = await headingText(slotB);

  await page.getByRole("button", { name: "Swap order" }).click();
  await expect(slotA.getByRole("heading", { level: 4 })).toHaveText(slotBName);
  await expect(slotB.getByRole("heading", { level: 4 })).toHaveText(slotAName);

  await page.getByLabel("Clear compare slot A").click();
  await expect(page.getByTestId(`catalog-compare-toggle-${COMPARE_IDS[1]}`)).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  await page.getByTestId("compare-clear-all").click();
  await expect(page.getByTestId("compare-slot-B-empty")).toBeVisible();
});
