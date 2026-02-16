import { expect, test, type Page } from "@playwright/test";
import { openCatalogTab, switchCatalogToOwned } from "./helpers/catalogFilters";
import { clickLocatorSafely } from "./helpers/interactions";

import { CATALOG_ENTRIES } from "../src/game/catalog";
import type { GameState } from "../src/game/state";
import { createInitialState } from "../src/game/state";

const QUARTZ_MODEL_ID = CATALOG_ENTRIES.find((entry) => entry.movementType === "quartz")?.id;
const AUTOMATIC_MODEL_ID = CATALOG_ENTRIES.find((entry) => entry.movementType === "automatic")?.id;
const MANUAL_MODEL_ID = CATALOG_ENTRIES.find((entry) => entry.movementType === "manual")?.id;
const TOURBILLON_MODEL_ID = CATALOG_ENTRIES.find((entry) => entry.movementType === "tourbillon")?.id;

const buildSeededState = (): GameState => {
  const base = createInitialState();
  return {
    ...base,
    currencyCents: Math.max(base.currencyCents, 1_000_000),
    enjoymentCents: Math.max(base.enjoymentCents, 200_000),
    therapistCareer: {
      ...base.therapistCareer,
      careerStartId: base.therapistCareer.careerStartId ?? "phd-program",
    },
    unlockedMilestones: Array.from(
      new Set([...base.unlockedMilestones, "collector-shelf", "showcase", "atelier"]),
    ),
    items: {
      ...base.items,
      quartz: Math.max(base.items.quartz ?? 0, 3),
      automatic: Math.max(base.items.automatic ?? 0, 2),
      manual: Math.max(base.items.manual ?? 0, 2),
      tourbillon: Math.max(base.items.tourbillon ?? 0, 1),
    },
    watchModels: {
      ...base.watchModels,
      ...(QUARTZ_MODEL_ID ? { [QUARTZ_MODEL_ID]: 2 } : {}),
      ...(AUTOMATIC_MODEL_ID ? { [AUTOMATIC_MODEL_ID]: 2 } : {}),
      ...(MANUAL_MODEL_ID ? { [MANUAL_MODEL_ID]: 2 } : {}),
      ...(TOURBILLON_MODEL_ID ? { [TOURBILLON_MODEL_ID]: 1 } : {}),
    },
    discoveredCatalogEntries: CATALOG_ENTRIES.map((entry) => entry.id),
  };
};

async function ensureCompactCatalogDensity(page: Page) {
  const detailsButtons = page.locator('button[data-testid^="catalog-details-button-"]');
  if ((await detailsButtons.first().isVisible().catch(() => false)) === true) {
    return;
  }

  await clickLocatorSafely(page.getByTestId("catalog-density-toggle"));
  await expect(detailsButtons.first()).toBeVisible();
}

async function openWindingModalFromCatalog(page: Page) {
  const windingModal = page.getByTestId("winding-modal");
  if (await windingModal.isVisible().catch(() => false)) {
    return;
  }

  await ensureCompactCatalogDensity(page);
  const detailsButtons = page.locator('button[data-testid^="catalog-details-button-"]');
  const detailsCount = await detailsButtons.count();
  for (let index = 0; index < detailsCount; index += 1) {
    const detailsButton = detailsButtons.nth(index);
    if (!(await detailsButton.isVisible().catch(() => false))) {
      continue;
    }

    await clickLocatorSafely(detailsButton);
    const detailsDialog = page.locator(".catalog-card-details-sheet");
    if (!(await detailsDialog.isVisible().catch(() => false))) {
      continue;
    }

    const windingTrigger = detailsDialog
      .locator(
        'button[data-testid="vault-interact-manual"]:not([disabled]), button[data-testid="vault-interact-tourbillon"]:not([disabled])',
      )
      .first();
    if (await windingTrigger.isVisible().catch(() => false)) {
      await clickLocatorSafely(windingTrigger);
      if (!(await windingModal.isVisible().catch(() => false))) {
        await windingTrigger
          .evaluate((element) => {
            (element as HTMLButtonElement).click();
          })
          .catch(() => {});
      }
      await expect(windingModal).toBeVisible({ timeout: 10_000 });
      return;
    }

    const closeDetails = page.getByTestId("catalog-details-sheet-close");
    if (await closeDetails.isVisible().catch(() => false)) {
      await clickLocatorSafely(closeDetails);
    } else {
      await page.keyboard.press("Escape").catch(() => {});
    }
  }

  throw new Error("Expected a manual or tourbillon winding trigger from catalog details.");
}

test("practice runs stay reward-free and keep streak state unchanged", async ({ page }) => {
  const seededState = buildSeededState();
  await page.addInitScript(
    ({ seededState }) => {
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs: Date.now(),
          state: seededState,
        }),
      );
    },
    { seededState },
  );

  await page.goto("/");
  await openCatalogTab(page);
  await switchCatalogToOwned(page);
  await openWindingModalFromCatalog(page);
  await expect(page.getByTestId("winding-modal")).toBeVisible();
  await page.getByTestId("winding-practice-toggle").check();

  const surface = page.getByTestId("winding-surface");
  const box = await surface.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + Math.max(60, box.width * 0.6), centerY);
  await page.mouse.up();

  await expect(page.getByTestId("winding-outcome")).toContainText(/Practice run complete/i);
  await page.getByTestId("winding-close").click();
  await expect(page.getByTestId("winding-modal")).toHaveCount(0);

  await openWindingModalFromCatalog(page);
  await expect(page.getByTestId("winding-streak-label")).toContainText(/Perfect streak: 0/i);
  await page.getByTestId("winding-close").click();
});
