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

    test("collection section nav keeps overflow affordance and reduced-motion jump behavior", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await gotoAppWithNavigationReady(page);

      await page.evaluate(() => {
        const win = window as Window & {
          __collectionScrollBehaviors?: string[];
          __collectionScrollCaptureReady?: boolean;
        };
        if (win.__collectionScrollCaptureReady) {
          return;
        }

        win.__collectionScrollBehaviors = [];
        const scrollPrototype = HTMLElement.prototype as unknown as {
          scrollTo: (...args: unknown[]) => void;
        };
        const originalScrollTo = scrollPrototype.scrollTo;
        scrollPrototype.scrollTo = function scrollToPatched(...args: unknown[]) {
          const firstArg = args[0];
          const options =
            typeof firstArg === "object" && firstArg !== null
              ? (firstArg as ScrollToOptions)
              : ({ left: args[0], top: args[1] } as ScrollToOptions);
          const behavior = options.behavior === "smooth" ? "smooth" : "auto";
          win.__collectionScrollBehaviors?.push(behavior);
          return originalScrollTo.apply(this, args);
        };
        win.__collectionScrollCaptureReady = true;
      });

      await page.getByRole("tab", { name: "Collection" }).click();
      const sectionNav = page.getByTestId("collection-section-nav");
      await expect(sectionNav).toBeVisible();

      const navOverflow = await sectionNav.evaluate((element) => {
        const scroller = element.querySelector(".collection-section-nav__scroller");
        if (!(scroller instanceof HTMLElement)) {
          return false;
        }
        return scroller.scrollWidth > scroller.clientWidth + 1;
      });

      if (navOverflow) {
        await expect(sectionNav).toHaveAttribute("data-overflow-end", "true");
        const scroller = sectionNav.locator(".collection-section-nav__scroller");
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

      await expect
        .poll(
          async () =>
            page.evaluate(() => {
              const win = window as Window & {
                __collectionScrollBehaviors?: string[];
              };
              return win.__collectionScrollBehaviors ?? [];
            }),
          { timeout: 2_000 },
        )
        .toContain("auto");

      const hasSmoothScroll = await page.evaluate(() => {
        const win = window as Window & {
          __collectionScrollBehaviors?: string[];
        };
        return (win.__collectionScrollBehaviors ?? []).includes("smooth");
      });
      expect(hasSmoothScroll).toBe(false);
    });
  });
});
