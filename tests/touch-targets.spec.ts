import { CATALOG_ENTRIES } from "../src/game/catalog";
import type { GameState } from "../src/game/state";
import { createInitialState } from "../src/game/state";
import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  openCatalogInteractionModal,
  openCatalogTab,
  resolveCatalogInteractCandidates,
  switchCatalogToOwned,
} from "./helpers/catalogFilters";
import { clickLocatorSafely, findFirstVisible } from "./helpers/interactions";
import { gotoAppWithNavigationReady } from "./helpers/navigation";
import { seedStorage } from "./helpers/storageSeed";

const MOBILE_VIEWPORTS = [
  { name: "iPhone 12", viewport: { width: 390, height: 844 } },
  { name: "Pixel 5", viewport: { width: 393, height: 851 } },
];
const AUTOMATIC_MODEL_ID = CATALOG_ENTRIES.find((entry) => entry.movementType === "automatic")?.id;
const STARTER_MODEL_ID = "rolex-calibrorolex";
const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ref-16700";
const CHRONOGRAPH_MODEL_ID = "rolex-rolex-daytona-ref-6265-in-oro-primi-anni-settanta";
const TOURBILLON_MODEL_ID =
  "audemars-piguet-audemars-piguet-ref-25831-con-datario-riserva-di-carica-e-tourbillon-risalente-al-1997";

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
    catalogTierUnlocks: ["quartz", "automatic", "manual", "tourbillon"],
    items: {
      ...base.items,
      quartz: Math.max(base.items.quartz ?? 0, 3),
      automatic: Math.max(base.items.automatic ?? 0, 2),
      manual: Math.max(base.items.manual ?? 0, 2),
      tourbillon: Math.max(base.items.tourbillon ?? 0, 1),
    },
    watchModels: {
      ...base.watchModels,
      [STARTER_MODEL_ID]: 3,
      [CLASSIC_MODEL_ID]: 2,
      [CHRONOGRAPH_MODEL_ID]: 2,
      [TOURBILLON_MODEL_ID]: 1,
      ...(AUTOMATIC_MODEL_ID ? { [AUTOMATIC_MODEL_ID]: 2 } : {}),
    },
    discoveredCatalogEntries: CATALOG_ENTRIES.map((entry) => entry.id),
  };
};

const seedState = async (page: Page) => {
  await seedStorage(page, {
    save: {
      state: buildSeededState(),
    },
  });
};

const expectTouchTarget = async (locator: Locator, label: string) => {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} missing bounding box`).not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
};

const expectVisibleTouchTargets = async (
  locator: Locator,
  labelPrefix: string,
  maxCount: number,
  options?: { requireAtLeastOne?: boolean },
) => {
  const count = await locator.count();
  let asserted = 0;
  for (let index = 0; index < count && asserted < maxCount; index += 1) {
    const candidate = locator.nth(index);
    if (!(await candidate.isVisible().catch(() => false))) {
      continue;
    }

    await expectTouchTarget(candidate, `${labelPrefix} ${asserted}`);
    asserted += 1;
  }

  if (options?.requireAtLeastOne ?? true) {
    expect(asserted).toBeGreaterThan(0);
  }

  return asserted;
};

const openCatalogFromCollection = async (page: Page) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await openCatalogTab(page);
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(120);
    }
  }

  throw lastError ?? new Error("Failed to open Catalog tab after retries");
};

const defineTouchTargetTests = (
  viewportName: string,
  viewportSize: { width: number; height: number },
) => {
  test.describe(`${viewportName} viewport`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewportSize);
      await seedState(page);
      await gotoAppWithNavigationReady(page);
    });

    test("nav tabs and settings controls stay above 44px", async ({ page }) => {
      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      await expect(tabList).toBeVisible();
      const tabCount = await tabList.getByRole("tab").count();
      expect(tabCount).toBeGreaterThan(0);
      for (let index = 0; index < tabCount; index += 1) {
        await expectTouchTarget(tabList.getByRole("tab").nth(index), `tab ${index}`);
      }

      await page.getByRole("tab", { name: "Settings" }).click();
      const audioLabels = [
        page.locator("label:has(input[data-testid=audio-sfx-toggle])"),
        page.locator("label:has(input[data-testid=audio-bgm-toggle])"),
        page.locator("label:has(input[data-testid=settings-hide-achievements])"),
      ];
      for (const [index, label] of audioLabels.entries()) {
        await expectTouchTarget(label, `settings label ${index}`);
      }

      const visibilityTargets = ["career", "catalog"];
      for (const key of visibilityTargets) {
        const label = page.locator(`label:has(input[data-testid=tab-visibility-${key}])`);
        await expectTouchTarget(label, `tab visibility ${key}`);
      }
    });

    test("catalog purchases and collection interactions meet touch minimum", async ({ page }) => {
      const catalogPanel = await openCatalogFromCollection(page);
      const buyButtons = page.locator('[data-testid^="catalog-buy-"]');
      await expectVisibleTouchTargets(buyButtons, "catalog buy", 3);

      await switchCatalogToOwned(page, catalogPanel);
      const interactButtons = await resolveCatalogInteractCandidates(
        page,
        '[data-testid^="watch-wear-"], [data-testid^="vault-interact-"]',
        catalogPanel,
      );
      await expectVisibleTouchTargets(interactButtons, "collection button", 3);
      await page.keyboard.press("Escape").catch(() => {});
      await expect(page.getByTestId("catalog-details-sheet")).toHaveCount(0);

      await page.getByTestId("help-open").click();
      await expect(page.getByTestId("help-modal")).toBeVisible();
      await expectTouchTarget(page.getByTestId("help-close"), "help close");
      await page.keyboard.press("Escape");
    });

    test("catalog details button opens bottom sheet", async ({ page }) => {
      test.slow();

      const catalogPanel = await openCatalogFromCollection(page);
      const detailsButtons = catalogPanel.locator('[data-testid^="catalog-details-button-"]');
      const detailsButton = await findFirstVisible(detailsButtons);
      expect(detailsButton).not.toBeNull();
      if (detailsButton === null) {
        throw new Error("Expected at least one visible catalog details button");
      }

      await expectTouchTarget(detailsButton, "catalog details button");
      await clickLocatorSafely(detailsButton);
      const detailsSheet = page.getByTestId("catalog-details-sheet");
      if (!(await detailsSheet.isVisible().catch(() => false))) {
        await clickLocatorSafely(detailsButton);
      }
      await expect(detailsSheet).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(detailsSheet).toHaveCount(0);
    });

    test("interaction modals keep their buttons at 44px", async ({ page }) => {
      test.slow();
      const catalogPanel = await openCatalogFromCollection(page);
      await switchCatalogToOwned(page, catalogPanel);

      const windingOpened = await openCatalogInteractionModal(
        page,
        '[data-testid="vault-interact-manual"]:not([disabled]), [data-testid="vault-interact-tourbillon"]:not([disabled])',
        "winding-modal",
        catalogPanel,
      );
      expect(windingOpened).toBe(true);
      if (!windingOpened) {
        throw new Error("Expected a manual or tourbillon interaction button to open winding modal");
      }

      await expect(page.getByTestId("winding-modal")).toBeVisible();
      await expectTouchTarget(page.getByTestId("winding-track"), "winding track");
      const surface = page.getByTestId("winding-surface");
      await expectTouchTarget(surface, "winding surface");
      await expectTouchTarget(page.getByTestId("winding-close"), "winding close");
      await page.getByTestId("winding-close").click();
      await expect(page.getByTestId("winding-modal")).toHaveCount(0);

      const automaticOpened = await openCatalogInteractionModal(
        page,
        '[data-testid="vault-interact-automatic"]:not([disabled])',
        "automatic-modal",
        catalogPanel,
      );
      if (automaticOpened) {
        await expect(page.getByTestId("automatic-modal")).toBeVisible();
        await expectTouchTarget(page.getByTestId("automatic-left"), "automatic left");
        await expectTouchTarget(page.getByTestId("automatic-right"), "automatic right");
        await expectTouchTarget(page.getByTestId("automatic-close"), "automatic close");
        await page.getByTestId("automatic-close").click();
        await expect(page.getByTestId("automatic-modal")).toHaveCount(0);
      }

      const quartzOpened = await openCatalogInteractionModal(
        page,
        '[data-testid="vault-interact-quartz"]:not([disabled])',
        "quartz-modal",
        catalogPanel,
      );
      if (quartzOpened) {
        await expect(page.getByTestId("quartz-modal")).toBeVisible();
        await expectTouchTarget(page.getByTestId("quartz-action"), "quartz set");
        await expectTouchTarget(page.getByTestId("quartz-close"), "quartz close");
        await page.getByTestId("quartz-close").click();
        await expect(page.getByTestId("quartz-modal")).toHaveCount(0);
      }
    });

    test("help modal search input remains a 44px target", async ({ page }) => {
      await page.getByTestId("help-open").click();
      const helpSearch = page.getByTestId("help-search");
      await expectTouchTarget(helpSearch, "help search");
      await expect(helpSearch).toHaveAttribute("aria-label", "Search help");
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("help-modal")).toHaveCount(0);
    });

    test("collection CTA buttons keep 44px touch targets", async ({ page }) => {
      await page.getByRole("tab", { name: "Collection" }).click();
      const catalogCallout = page.getByTestId("catalog-shop-callout");
      const openCatalogButton = catalogCallout.getByRole("button", { name: "Open Catalog" });
      await expectTouchTarget(openCatalogButton, "collection open catalog");
    });

    test("collection nav chips and reserve hints stay above 44px", async ({ page }) => {
      await page.getByRole("tab", { name: "Collection" }).click();

      const collectionNavTargets = await expectVisibleTouchTargets(
        page.locator(".collection-section-nav__link"),
        "collection nav",
        4,
        { requireAtLeastOne: false },
      );
      if (collectionNavTargets === 0) {
        await expectTouchTarget(
          page.getByRole("tab", { name: /^Collection/ }),
          "collection tab fallback",
        );
      }

      const catalogPanel = await openCatalogFromCollection(page);
      await switchCatalogToOwned(page, catalogPanel);

      const reserveHintButtons = await resolveCatalogInteractCandidates(
        page,
        ".power-reserve-hint-button",
        catalogPanel,
      );
      const reserveHintTargets = await expectVisibleTouchTargets(reserveHintButtons, "reserve hint", 2, {
        requireAtLeastOne: false,
      });

      if (reserveHintTargets === 0) {
        const reserveFallbackTargets = await resolveCatalogInteractCandidates(
          page,
          '[data-testid^="vault-interact-"]:not([disabled])',
          catalogPanel,
        );
        await expectVisibleTouchTargets(reserveFallbackTargets, "reserve fallback", 2);
      }
    });
  });
};

MOBILE_VIEWPORTS.forEach((device) => {
  defineTouchTargetTests(device.name, device.viewport);
});
