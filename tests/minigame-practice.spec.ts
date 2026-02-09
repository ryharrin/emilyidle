import { expect, test } from "@playwright/test";
import {
  openCatalogTab,
  resolveCatalogInteractCandidates,
  switchCatalogToOwned,
} from "./helpers/catalogFilters";
import { clickLocatorSafely, findFirstVisible } from "./helpers/interactions";

import { CATALOG_ENTRIES } from "../src/game/catalog";
import type { GameState } from "../src/game/state";
import { createInitialState } from "../src/game/state";

const buildSeededState = (): GameState => {
  const base = createInitialState();
  return {
    ...base,
    currencyCents: Math.max(base.currencyCents, 1_000_000),
    enjoymentCents: Math.max(base.enjoymentCents, 200_000),
    unlockedMilestones: Array.from(
      new Set([...base.unlockedMilestones, "collector-shelf", "showcase", "atelier"]),
    ),
    items: {
      ...base.items,
      starter: Math.max(base.items.starter ?? 0, 3),
      classic: Math.max(base.items.classic ?? 0, 2),
      chronograph: Math.max(base.items.chronograph ?? 0, 2),
      tourbillon: Math.max(base.items.tourbillon ?? 0, 1),
    },
    discoveredCatalogEntries: CATALOG_ENTRIES.map((entry) => entry.id),
  };
};

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

  const manualCandidates = await resolveCatalogInteractCandidates(
    page,
    '[data-testid^="vault-interact-chronograph"]:not([disabled]), [data-testid^="vault-interact-tourbillon"]:not([disabled])',
  );
  const manualButton = await findFirstVisible(manualCandidates);
  expect(manualButton).not.toBeNull();
  if (manualButton === null) {
    throw new Error("Expected a visible manual interaction button");
  }

  await clickLocatorSafely(manualButton);
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

  const manualCandidatesAfterRun = await resolveCatalogInteractCandidates(
    page,
    '[data-testid^="vault-interact-chronograph"]:not([disabled]), [data-testid^="vault-interact-tourbillon"]:not([disabled])',
  );
  const manualButtonAfterRun = await findFirstVisible(manualCandidatesAfterRun);
  expect(manualButtonAfterRun).not.toBeNull();
  if (manualButtonAfterRun === null) {
    throw new Error("Expected manual interaction button after practice run");
  }

  await clickLocatorSafely(manualButtonAfterRun);
  await expect(page.getByTestId("winding-streak-label")).toContainText(/Perfect streak: 0/i);
  await page.getByTestId("winding-close").click();
});
