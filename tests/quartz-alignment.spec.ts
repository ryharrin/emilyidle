import { expect, test, type Page } from "@playwright/test";
import {
  openCatalogInteractionModal,
  openCatalogTab,
  switchCatalogToOwned,
} from "./helpers/catalogFilters";
import { createInitialState } from "../src/game/state";

const QUARTZ_MODEL_ID = "rolex-calibrorolex";

type SeedArgs = {
  lastSimulatedAtMs: number;
};

async function seedQuartzSave(page: Page, args: SeedArgs) {
  const base = createInitialState();
  const state = {
    ...base,
    currencyCents: Math.max(base.currencyCents, 5_000),
    enjoymentCents: Math.max(base.enjoymentCents, 500),
    therapistCareer: {
      ...base.therapistCareer,
      careerStartId: base.therapistCareer.careerStartId ?? "phd-program",
    },
    items: {
      ...base.items,
      quartz: Math.max(base.items.quartz ?? 0, 1),
    },
    watchModels: {
      ...base.watchModels,
      [QUARTZ_MODEL_ID]: Math.max(base.watchModels[QUARTZ_MODEL_ID] ?? 0, 1),
    },
    discoveredCatalogEntries: Array.from(
      new Set([...(base.discoveredCatalogEntries ?? []), QUARTZ_MODEL_ID]),
    ),
    interactionNextAvailableAtMsByItem: {
      ...base.interactionNextAvailableAtMsByItem,
      quartz: 0,
    },
  };

  await page.addInitScript(({ seedState, lastSimulatedAtMs }: { seedState: unknown } & SeedArgs) => {
    (window as unknown as { __EMILY_IDLE_TEST_MODE__?: boolean }).__EMILY_IDLE_TEST_MODE__ = true;
    const payload = {
      version: 4,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs,
      generation: 0,
      state: seedState,
    };
    window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
  }, { ...args, seedState: state });
}

async function openQuartzModal(page: Page) {
  await page.goto("/");
  const catalogPanel = await openCatalogTab(page);
  await switchCatalogToOwned(page, catalogPanel);

  const quartzOpened = await openCatalogInteractionModal(
    page,
    '[data-testid="vault-interact-quartz"]:not([disabled])',
    "quartz-modal",
    catalogPanel,
  );
  expect(quartzOpened).toBeTruthy();

  await expect(page.getByTestId("quartz-modal")).toBeVisible();
}

async function expectQuartzAnchorCentered(page: Page) {
  const result = await page.evaluate(() => {
    const dial = document.querySelector('[data-testid="quartz-dial"]');
    const anchor = document.querySelector('[data-testid="quartz-anchor"]');
    if (!dial || !anchor) {
      return null;
    }
    const d = dial.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    return {
      dial: { left: d.left, top: d.top, width: d.width, height: d.height },
      anchor: { left: a.left, top: a.top },
    };
  });

  expect(result).not.toBeNull();
  if (!result) {
    return;
  }

  const dialCenterX = result.dial.left + result.dial.width / 2;
  const dialCenterY = result.dial.top + result.dial.height / 2;
  expect(Math.abs(result.anchor.left - dialCenterX)).toBeLessThan(2);
  expect(Math.abs(result.anchor.top - dialCenterY)).toBeLessThan(2);
}

test.describe("quartz modal alignment", () => {
  test("quartz hand anchor stays centered (desktop)", async ({ page }) => {
    await seedQuartzSave(page, { lastSimulatedAtMs: Date.now() });
    await openQuartzModal(page);
    await expectQuartzAnchorCentered(page);
  });

  test("quartz hand anchor stays centered (mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await seedQuartzSave(page, { lastSimulatedAtMs: Date.now() });
    await openQuartzModal(page);
    await expectQuartzAnchorCentered(page);
  });
});
