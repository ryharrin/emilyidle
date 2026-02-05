import { CATALOG_ENTRIES } from "../src/game/catalog";
import type { GameState } from "../src/game/state";
import { createInitialState } from "../src/game/state";
import { expect, type Locator, type Page, test } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { name: "iPhone 12", viewport: { width: 390, height: 844 } },
  { name: "Pixel 5", viewport: { width: 393, height: 851 } },
];

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

const seedState = async (page: Page) => {
  const seededState = buildSeededState();
  await page.addInitScript(
    ({ seededState }) => {
      const payload = {
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      };
      window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
    },
    { seededState },
  );
};

const expectTouchTarget = async (locator: Locator, label: string) => {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} missing bounding box`).not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
};

const openCatalogFromCollection = async (page: Page) => {
  await page.getByRole("tab", { name: "Catalog" }).click();
  await expect(page.getByTestId("catalog-grid")).toBeVisible();
};

const defineTouchTargetTests = (
  viewportName: string,
  viewportSize: { width: number; height: number },
) => {
  test.describe(`${viewportName} viewport`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewportSize);
      await seedState(page);
      await page.goto("/");
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
      await openCatalogFromCollection(page);
      const buyButtons = page.locator('[data-testid^="catalog-buy-"]');
      const buyCount = await buyButtons.count();
      expect(buyCount).toBeGreaterThan(0);
      for (let index = 0; index < Math.min(buyCount, 3); index += 1) {
        await expectTouchTarget(buyButtons.nth(index), `catalog buy ${index}`);
      }

      const interactButtons = page.locator(
        '[data-testid^="watch-wear-"], [data-testid^="vault-interact-"]',
      );
      const interactCount = await interactButtons.count();
      expect(interactCount).toBeGreaterThan(0);
      for (let index = 0; index < Math.min(interactCount, 3); index += 1) {
        await expectTouchTarget(interactButtons.nth(index), `collection button ${index}`);
      }

      await page.getByTestId("help-open").click();
      await expect(page.getByTestId("help-modal")).toBeVisible();
      await expectTouchTarget(page.getByTestId("help-close"), "help close");
      await page.keyboard.press("Escape");
    });

    test("interaction modals keep their buttons at 44px", async ({ page }) => {
      await openCatalogFromCollection(page);

      const manualButton = page
        .locator(
          'button[data-testid^="vault-interact-chronograph"]:not([disabled]), button[data-testid^="vault-interact-tourbillon"]:not([disabled])',
        )
        .first();
      await manualButton.click();
      await expectTouchTarget(page.getByTestId("winding-track"), "winding track");
      const surface = page.getByTestId("winding-surface");
      await expectTouchTarget(surface, "winding surface");
      await expectTouchTarget(page.getByTestId("winding-close"), "winding close");
      await page.getByTestId("winding-close").click();
      await expect(page.getByTestId("winding-modal")).toHaveCount(0);
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
  });
};

MOBILE_VIEWPORTS.forEach((device) => {
  defineTouchTargetTests(device.name, device.viewport);
});
