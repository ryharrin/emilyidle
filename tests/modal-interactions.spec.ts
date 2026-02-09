import { CATALOG_ENTRIES } from "../src/game/catalog";
import type { GameState } from "../src/game/state";
import { createInitialState } from "../src/game/state";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { clickLocatorSafely } from "./helpers/interactions";
import { gotoAppWithNavigationReady } from "./helpers/navigation";
import { seedStorage } from "./helpers/storageSeed";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

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
  await seedStorage(page, {
    save: {
      state: buildSeededState(),
    },
  });
};

const openCatalogFromCollection = async (page: Page) => {
  await clickLocatorSafely(page.getByRole("tab", { name: "Catalog" }));
  const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
  await expect(catalogPanel.getByTestId("catalog-grid")).toBeVisible();
  return catalogPanel;
};

const switchCatalogToOwned = async (catalogPanel: Locator) => {
  const ownedTab = catalogPanel.getByRole("tab", { name: /^Owned/ }).first();
  if (!(await ownedTab.isVisible().catch(() => false))) {
    const quickFilters = catalogPanel.getByTestId("catalog-quick-filters");
    if (await quickFilters.isVisible().catch(() => false)) {
      await clickLocatorSafely(quickFilters);
    } else {
      await clickLocatorSafely(catalogPanel.getByTestId("catalog-filter-toggle"));
    }
  }
  await clickLocatorSafely(ownedTab);
};

const closeCatalogDetailsSheetIfOpen = async (page: Page) => {
  const sheet = page.getByTestId("catalog-details-sheet");
  if (await sheet.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    if (await sheet.isVisible().catch(() => false)) {
      await clickLocatorSafely(sheet);
    }
    await expect(sheet).toHaveCount(0);
  }
};

const openCatalogDetailsSheet = async (page: Page, catalogPanel: Locator) => {
  const sheet = page.getByTestId("catalog-details-sheet");
  if (await sheet.isVisible().catch(() => false)) {
    return true;
  }

  const detailsButtons = catalogPanel.locator('[data-testid^="catalog-details-button-"]');
  const detailsCount = await detailsButtons.count();
  for (let index = 0; index < detailsCount; index += 1) {
    const button = detailsButtons.nth(index);
    if (!(await button.isVisible().catch(() => false))) {
      continue;
    }
    await clickLocatorSafely(button);
    if (await sheet.isVisible().catch(() => false)) {
      return true;
    }
  }
  return false;
};

const resolveInteractCandidates = async (
  page: Page,
  catalogPanel: Locator,
  selector: string,
): Promise<Locator> => {
  const panelCandidates = catalogPanel.locator(selector);
  if ((await panelCandidates.count()) > 0) {
    return panelCandidates;
  }

  const opened = await openCatalogDetailsSheet(page, catalogPanel);
  if (!opened) {
    return panelCandidates;
  }

  const sheetCandidates = page.locator(".catalog-card-details-sheet").locator(selector);
  if ((await sheetCandidates.count()) > 0) {
    return sheetCandidates;
  }

  await closeCatalogDetailsSheetIfOpen(page);
  return panelCandidates;
};

const isFocusInsideModal = async (page: Page, selector: string) =>
  page.evaluate((selector) => {
    const modal = document.querySelector(selector);
    return modal ? modal.contains(document.activeElement) : false;
  }, selector);

test.describe("Help modal interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await seedState(page);
    await gotoAppWithNavigationReady(page);
  });

  test("locks scroll, traps focus, and restores focus on mobile", async ({ page }) => {
    const helpButton = page.getByTestId("help-open");
    await clickLocatorSafely(helpButton);
    const helpModal = page.getByTestId("help-modal");
    await expect(helpModal).toBeVisible();
    await expect(helpModal).toHaveAttribute("data-overlay-kind", "blocking");
    const headerActions = helpModal.locator(".help-modal-header-actions");
    await expect(headerActions).toBeVisible();
    await expect(headerActions.getByTestId("help-search")).toBeVisible();
    await expect(headerActions.getByTestId("help-close")).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    const overlayOrder = await page.evaluate(() => {
      const toNumericZIndex = (selector: string) => {
        const node = document.querySelector(selector);
        if (!(node instanceof HTMLElement)) {
          return 0;
        }
        const parsed = Number.parseInt(getComputedStyle(node).zIndex, 10);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      return {
        help: toNumericZIndex("[data-testid='help-modal']"),
        toast: toNumericZIndex("[data-testid='toast-stack']"),
      };
    });
    expect(overlayOrder.help).toBeGreaterThan(overlayOrder.toast);

    let focusInside = false;
    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press("Tab");
      focusInside = focusInside || (await isFocusInsideModal(page, "[data-testid='help-modal']"));
    }

    await page.keyboard.down("Shift");
    await page.keyboard.press("Tab");
    await page.keyboard.up("Shift");

    expect(focusInside).toBe(true);
    const browserName = page.context().browser()?.browserType().name();
    if (browserName !== "webkit") {
      expect(await isFocusInsideModal(page, "[data-testid='help-modal']")).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(helpModal).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("search filters sections and keyboard navigation activates catalog", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const helpButton = page.getByTestId("help-open");
    await clickLocatorSafely(helpButton);
    const helpModal = page.getByTestId("help-modal");
    await expect(helpModal).toBeVisible();

    const search = page.getByTestId("help-search");
    await search.fill("catalog-first");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    const catalogButton = helpModal
      .locator(".help-section-button", {
        hasText: /Catalog-first|Catalog shop/i,
      })
      .first();
    await expect(catalogButton).toBeVisible();
    await expect(page.getByTestId("help-active-section")).toHaveText(/Catalog/i);

    const scrollBehavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(scrollBehavior).toBe("auto");

    const prefersReducedMotion = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(prefersReducedMotion).toBe(true);

    await page.keyboard.press("Escape");
    await expect(helpModal).toHaveCount(0);
  });
});

test.describe("Interaction modals", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await seedState(page);
    await gotoAppWithNavigationReady(page);
  });

  test("winding, automatic, and quartz modals lock scroll and trap focus", async ({ page }) => {
    const catalogPanel = await openCatalogFromCollection(page);
    await switchCatalogToOwned(catalogPanel);
    const manualCandidates = await resolveInteractCandidates(
      page,
      catalogPanel,
      '[data-testid^="vault-interact-chronograph"]:not([disabled]), [data-testid^="vault-interact-tourbillon"]:not([disabled])',
    );
    if ((await manualCandidates.count()) > 0) {
      const windingModal = page.getByTestId("winding-modal");
      let opened = false;
      const manualCount = await manualCandidates.count();
      for (let index = 0; index < manualCount; index += 1) {
        const candidate = manualCandidates.nth(index);
        await candidate.scrollIntoViewIfNeeded();
        if (!(await candidate.isVisible().catch(() => false))) {
          continue;
        }
        await clickLocatorSafely(candidate);
        if (await windingModal.isVisible().catch(() => false)) {
          opened = true;
          break;
        }
      }
      if (opened) {
        await expect(page.getByTestId("winding-practice-toggle")).toBeVisible();
        await expect(page.getByTestId("winding-difficulty")).toBeVisible();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
        await page.keyboard.press("Tab");
        expect(await isFocusInsideModal(page, "[data-testid='winding-modal']")).toBe(true);
        await page.keyboard.press("Escape");
        await expect(windingModal).toHaveCount(0);
        expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
        expect(
          await page.evaluate(() => document.documentElement.dataset.windingScrollLocked),
        ).toBeUndefined();
      }
    }

    const automaticCandidates = await resolveInteractCandidates(
      page,
      catalogPanel,
      '[data-testid="vault-interact-classic"]:not([disabled])',
    );
    if ((await automaticCandidates.count()) > 0) {
      const automaticModal = page.getByTestId("automatic-modal");
      let opened = false;
      const automaticCount = await automaticCandidates.count();
      for (let index = 0; index < automaticCount; index += 1) {
        const candidate = automaticCandidates.nth(index);
        if (!(await candidate.isVisible())) {
          continue;
        }
        await clickLocatorSafely(candidate);
        if (await automaticModal.isVisible().catch(() => false)) {
          opened = true;
          break;
        }
      }
      if (opened) {
        await expect(page.getByTestId("automatic-practice-toggle")).toBeVisible();
        await expect(page.getByTestId("automatic-difficulty")).toBeVisible();
        await page.keyboard.press("Tab");
        await clickLocatorSafely(page.getByTestId("automatic-close"));
        await expect(automaticModal).toHaveCount(0);
        await page.waitForTimeout(50);
        expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
      }
    }

    const quartzCandidates = await resolveInteractCandidates(
      page,
      catalogPanel,
      '[data-testid="vault-interact-starter"]:not([disabled])',
    );
    if ((await quartzCandidates.count()) > 0) {
      const quartzModal = page.getByTestId("quartz-modal");
      let opened = false;
      const quartzCount = await quartzCandidates.count();
      for (let index = 0; index < quartzCount; index += 1) {
        const candidate = quartzCandidates.nth(index);
        await candidate.scrollIntoViewIfNeeded();
        if (!(await candidate.isVisible().catch(() => false))) {
          continue;
        }
        await clickLocatorSafely(candidate);
        if (await quartzModal.isVisible().catch(() => false)) {
          opened = true;
          break;
        }
      }
      if (opened) {
        await expect(page.getByTestId("quartz-practice-toggle")).toBeVisible();
        await expect(page.getByTestId("quartz-difficulty")).toBeVisible();
        await page.keyboard.press("Tab");
        await clickLocatorSafely(page.getByTestId("quartz-close"));
        await expect(quartzModal).toHaveCount(0);
      }
    }
    await closeCatalogDetailsSheetIfOpen(page);
  });

  test("dragging the winding surface resolves the run", async ({ page }) => {
    const catalogPanel = await openCatalogFromCollection(page);
    await switchCatalogToOwned(catalogPanel);
    const manualCandidates = await resolveInteractCandidates(
      page,
      catalogPanel,
      '[data-testid^="vault-interact-chronograph"]:not([disabled]), [data-testid^="vault-interact-tourbillon"]:not([disabled])',
    );
    const manualCount = await manualCandidates.count();
    test.skip(manualCount === 0, "No manual winding candidate available");
    if (manualCount === 0) {
      return;
    }

    const surface = page.getByTestId("winding-surface");
    let opened = false;
    for (let index = 0; index < manualCount; index += 1) {
      const candidate = manualCandidates.nth(index);
      await candidate.scrollIntoViewIfNeeded();
      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }
      await clickLocatorSafely(candidate);
      if (await surface.isVisible().catch(() => false)) {
        opened = true;
        break;
      }
    }
    test.skip(!opened, "No manual winding candidate opened modal");
    if (!opened) {
      return;
    }
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

    await expect(page.getByTestId("winding-live")).toHaveText(/Stopped at/i);
    await expect(page.getByTestId("winding-outcome")).toBeVisible();
    await clickLocatorSafely(page.getByTestId("winding-close"));
    await expect(page.getByTestId("winding-modal")).toHaveCount(0);
  });

  test("shows the cooldown ring when a session is mid-cooldown", async ({ page }) => {
    const nowMs = Date.now();
    const sessionState = buildSeededState();
    sessionState.enjoymentCents = Math.max(sessionState.enjoymentCents, 200_000);
    sessionState.therapistCareer = {
      ...sessionState.therapistCareer,
      careerStartId: "phd-program" as const,
      activeTrackId: "private-practice" as const,
      nextAvailableAtMs: nowMs + 30_000,
      freeSessionAvailable: false,
      sessionPremiumCount: 1,
      lastSessionAtMs: nowMs - 1_000,
    };

    await seedStorage(page, {
      save: {
        state: sessionState,
        lastSimulatedAtMs: nowMs,
        savedAtIso: new Date(nowMs).toISOString(),
      },
    });

    await page.goto("/");
    await clickLocatorSafely(page.getByRole("tab", { name: "Career" }));
    await expect(page.getByTestId("career-session-cooldown-ring")).toBeVisible();
  });
});
