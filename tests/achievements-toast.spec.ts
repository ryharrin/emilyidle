import { expect, test, type Locator } from "@playwright/test";

import {
  buildAchievementToastSeed,
  buildAchievementToastSettings,
} from "./helpers/achievementToastSeed";
import { openCatalogFilters } from "./helpers/catalogFilters";
import { clickLocatorSafely } from "./helpers/interactions";

async function seedPage(page: import("@playwright/test").Page, achievementsEnabled: boolean) {
  // Canonical buy-button preconditions are centralized in tests/helpers/achievementToastSeed.ts.
  const { state } = buildAchievementToastSeed();
  const settings = buildAchievementToastSettings(achievementsEnabled);
  await page.addInitScript(
    ({ seededState, settings }) => {
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs: Date.now(),
          state: seededState,
        }),
      );
      window.localStorage.setItem("emily-idle:settings", JSON.stringify(settings));
    },
    { seededState: state, settings },
  );
}

type Box = NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>;

function hasOverlap(first: Box, second: Box) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

async function expectNoOverlap(first: Locator, second: Locator) {
  await first.scrollIntoViewIfNeeded();
  await second.scrollIntoViewIfNeeded();
  const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()]);
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  if (!firstBox || !secondBox) {
    return;
  }
  expect(hasOverlap(firstBox, secondBox)).toBe(false);
}

async function buyStarterWatch(
  page: import("@playwright/test").Page,
  starterModelId: string,
): Promise<Locator> {
  const catalogTab = page.getByRole("tab", { name: /^Catalog/i }).first();
  await clickLocatorSafely(catalogTab);
  await expect(catalogTab).toHaveAttribute("aria-selected", "true");

  const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
  await expect(catalogPanel).toBeVisible();
  const ownedTab = catalogPanel.locator("#catalog-owned-tab").first();
  if (!(await ownedTab.isVisible().catch(() => false))) {
    await openCatalogFilters(page);
  }

  await expect(ownedTab).toBeVisible();
  await clickLocatorSafely(ownedTab);
  await expect(ownedTab).toHaveAttribute("aria-selected", "true");

  const buyButton = catalogPanel.getByTestId(`catalog-buy-${starterModelId}`).first();
  await clickLocatorSafely(buyButton);
  return buyButton;
}

test.describe("achievement toasts", () => {
  test("shows unlock toast when achievement notifications are enabled", async ({ page }) => {
    const { starterModelId } = buildAchievementToastSeed();
    await seedPage(page, true);

    await page.goto("/");
    const buyButton = await buyStarterWatch(page, starterModelId);

    const toastStack = page.getByTestId("toast-stack");
    await expect(toastStack).toContainText(/Achievement unlocked/i);
    await expect(toastStack).toContainText(/First drawer/i);
    await expect(toastStack).toHaveAttribute("data-overlay-kind", "non-blocking");
    await expect(toastStack).toHaveAttribute("data-overlay-queue-depth", /[1-9][0-9]*/);
    await expect(page.getByTestId("toast-item")).toHaveCount(1);
    await expectNoOverlap(toastStack, buyButton);
  });

  test("does not show unlock toast when achievement notifications are disabled", async ({
    page,
  }) => {
    const { starterModelId } = buildAchievementToastSeed();
    await seedPage(page, false);

    await page.goto("/");
    await buyStarterWatch(page, starterModelId);

    await page.waitForTimeout(350);
    const toastStack = page.getByTestId("toast-stack");
    if ((await toastStack.count()) > 0) {
      await expect(toastStack).not.toContainText(/Achievement unlocked/i);
    }
  });
});
