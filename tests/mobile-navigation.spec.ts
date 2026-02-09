import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { name: "iPhone 12", viewport: { width: 390, height: 844 } },
  { name: "Pixel 5", viewport: { width: 393, height: 851 } },
];

const gotoApp = async (page: Page) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("tablist", { name: "Primary navigation" })).toBeVisible();
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
      await gotoApp(page);
    });

    test("maintains horizontal scroll snap and sticky tabs", async ({ page }) => {
      const navTabs = page.locator(".page-tab-rail__scroll");
      await expect(navTabs).toBeVisible();
      const scrollState = await navTabs.evaluate((element) => {
        const before = element.scrollLeft;
        const hasOverflow = element.scrollWidth > element.clientWidth + 1;
        if (hasOverflow) {
          element.scrollLeft = before + Math.floor(element.clientWidth * 0.6);
        }
        return { before, after: element.scrollLeft, hasOverflow };
      });
      if (scrollState.hasOverflow) {
        expect(scrollState.after).toBeGreaterThan(scrollState.before);
      }

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

    test("tab switch skeleton shows and tabs keep keyboard focus", async ({ page }) => {
      const skeleton = page.getByTestId("tab-switch-skeleton");
      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      const collectionTab = tabList.getByRole("tab", { name: "Collection" });
      const careerTab = tabList.getByRole("tab", { name: "Career" });
      await expect(skeleton).toHaveAttribute("data-visible", "false");

      await careerTab.click();
      await expect(skeleton).toHaveAttribute("data-visible", "true");
      await page.waitForTimeout(320);
      await expect(skeleton).toHaveAttribute("data-visible", "false");

      const helpButton = page.getByTestId("help-open");
      await helpButton.focus();
      await page.keyboard.press("Tab");
      await expect(collectionTab).toBeFocused();
    });
  });
});
