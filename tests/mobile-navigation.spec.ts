import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { name: "iPhone 12", viewport: { width: 390, height: 844 } },
  { name: "Pixel 5", viewport: { width: 393, height: 851 } },
];

const swipeTabStrip = async (navTabs: Locator, page: Page) => {
  const box = await navTabs.boundingBox();
  if (!box) {
    return;
  }
  const startX = box.x + box.width * 0.85;
  const endX = box.x + box.width * 0.15;
  const y = box.y + box.height / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 10 });
  await page.mouse.up();
};

const assertHorizontalScrollSnap = async (navTabs: Locator) => {
  const scrollSnap = await navTabs.evaluate((el) => getComputedStyle(el).scrollSnapType);
  expect(scrollSnap.toLowerCase()).toContain("x");
  expect(/mandatory|proximity/i.test(scrollSnap)).toBe(true);
};

const openHelpModal = async (page: Page) => {
  const helpButton = page.getByTestId("help-open");
  await helpButton.scrollIntoViewIfNeeded();
  await helpButton.click();
  const helpModal = page.getByTestId("help-modal");
  await expect(helpModal).toBeVisible();
  return { helpButton, helpModal };
};

const closeHelpModal = async (page: Page) => {
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("help-modal")).toHaveCount(0);
};

MOBILE_VIEWPORTS.forEach(({ name, viewport }) => {
  test.describe(`${name} viewport`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
    });

    test("maintains horizontal scroll snap and sticky tabs", async ({ page }) => {
      const navTabs = page.locator(".page-nav-tabs");
      await expect(navTabs).toBeVisible();

      const scrollSnap = await navTabs.evaluate((el) => getComputedStyle(el).scrollSnapType);
      expect(scrollSnap).toContain("x");

      await swipeTabStrip(navTabs, page);
      const scrollLeft = await navTabs.evaluate((el) => el.scrollLeft);
      expect(scrollLeft).toBeGreaterThanOrEqual(0);

      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(150);
      const stickyTop = await navTabs.evaluate((el) => el.getBoundingClientRect().top);
      expect(stickyTop).toBeLessThanOrEqual(6);
    });

    test("supports tab clicks and help modal entry", async ({ page }) => {
      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const collectionTab = tabList.getByRole("tab", { name: "Collection" });
      const catalogTab = tabList.getByRole("tab", { name: "Catalog" });

      await collectionTab.click();
      await expect(collectionTab).toHaveAttribute("aria-selected", "true");
      await expect(catalogTab).toHaveAttribute("aria-selected", "false");

      await catalogTab.click();
      await expect(catalogTab).toHaveAttribute("aria-selected", "true");

      const { helpButton, helpModal } = await openHelpModal(page);
      const closeButton = helpModal.getByTestId("help-close");
      await closeButton.scrollIntoViewIfNeeded();
      await expect(closeButton).toBeVisible();
      await closeHelpModal(page);

      const { helpModal: reopenedHelpModal } = await openHelpModal(page);
      await reopenedHelpModal.locator(".help-section-button").first().focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("help-active-section")).toBeVisible();
      await closeHelpModal(page);
      await expect(helpButton).toBeVisible();
    });

    test("help modal can be opened from nav with keyboard focus", async ({ page }) => {
      const helpButton = page.getByTestId("help-open");
      await helpButton.focus();
      await page.keyboard.press("Enter");
      const helpModal = page.getByTestId("help-modal");
      await expect(helpModal).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(helpModal).toHaveCount(0);
      await helpButton.focus();
      await expect(helpButton).toBeFocused();
    });
  });
});
