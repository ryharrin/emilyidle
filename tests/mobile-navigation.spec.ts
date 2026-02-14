import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { gotoAppWithNavigationReady } from "./helpers/navigation";

const MOBILE_VIEWPORTS = [
  { name: "iPhone 12", viewport: { width: 390, height: 844 } },
  { name: "Pixel 5", viewport: { width: 393, height: 851 } },
];

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

const expectCollectionSectionActive = async (page: Page, sectionId: string) => {
  const sectionNav = page.getByTestId("collection-section-nav");
  const sectionButton = page.locator(`[data-section-nav-id="${sectionId}"]`).first();
  await expect(sectionNav).toHaveAttribute("data-active-section", sectionId);
  await expect(sectionButton).toHaveAttribute("aria-current", "location");
};

MOBILE_VIEWPORTS.forEach(({ name, viewport }) => {
  test.describe(`${name} viewport`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoAppWithNavigationReady(page);
    });

    test("maintains horizontal scroll snap and sticky tabs", async ({ page }) => {
      const tabList = page.getByRole("tablist", { name: "Primary navigation" });
      await expect(tabList).toBeVisible();
      await expect(tabList.getByRole("group", { name: "Vault tabs" })).toBeVisible();
      await expect(tabList.getByRole("group", { name: "Atelier tabs" })).toBeVisible();
      await expect(tabList.getByRole("group", { name: "Ledger tabs" })).toBeVisible();

      const navTabs = page.locator(".page-tab-rail__scroll");
      await expect(navTabs).toBeVisible();
      const pageNav = page.locator(".page-nav");
      await expect(pageNav).toBeVisible();
      const initialTop = await pageNav.evaluate((element) => element.getBoundingClientRect().top);
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
      if (initialTop > 48) {
        await expect
          .poll(async () => pageNav.evaluate((el) => el.getBoundingClientRect().top), {
            timeout: 2_000,
          })
          .toBeLessThan(initialTop - 20);
      } else {
        await expect
          .poll(async () => pageNav.evaluate((el) => el.getBoundingClientRect().top), {
            timeout: 2_000,
          })
          .toBeLessThanOrEqual(initialTop + 4);
      }
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
      await expect(skeleton).toHaveAttribute("data-visible", "false");

      const helpButton = page.getByTestId("help-open");
      await helpButton.focus();
      await page.keyboard.press("Tab");
      await expect(collectionTab).toBeFocused();
    });

    test("collection section nav keeps overflow affordance and updates active section in reduced motion", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await gotoAppWithNavigationReady(page);

      await page.getByRole("tab", { name: "Collection" }).click();
      const sectionNav = page.getByTestId("collection-section-nav");
      await expect(sectionNav).toBeVisible();
      const defaultActiveSection = await sectionNav.getAttribute("data-active-section");
      expect(defaultActiveSection).toBeTruthy();
      if (!defaultActiveSection) {
        throw new Error("Expected collection section nav to set a default active section");
      }
      await expectCollectionSectionActive(page, defaultActiveSection);

      const navOverflow = await sectionNav.evaluate((element) => {
        const scroller = element.querySelector(".collection-section-nav__scroller");
        if (!(scroller instanceof HTMLElement)) {
          return false;
        }
        return scroller.scrollWidth > scroller.clientWidth + 1;
      });

      if (navOverflow) {
        const scroller = sectionNav.locator(".collection-section-nav__scroller");
        await scroller.evaluate((element) => {
          element.scrollLeft = 0;
          element.dispatchEvent(new Event("scroll"));
        });
        await expect
          .poll(async () => sectionNav.getAttribute("data-overflow-start"), { timeout: 2_000 })
          .toBe("false");
        await scroller.evaluate((element) => {
          element.scrollLeft = element.scrollWidth;
          element.dispatchEvent(new Event("scroll"));
        });
        await expect
          .poll(async () => sectionNav.getAttribute("data-overflow-start"), { timeout: 2_000 })
          .toBe("true");
      }

      const eventsLink = page
        .getByTestId("collection-section-nav-item-collection-events")
        .getByRole("button");
      await eventsLink.click();
      await expectCollectionSectionActive(page, "collection-events");
    });
  });
});
