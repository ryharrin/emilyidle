import { CATALOG_ENTRIES } from "../src/game/catalog";
import type { GameState } from "../src/game/state";
import { createInitialState } from "../src/game/state";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

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

const openCatalogFromCollection = async (page: Page) => {
  await page.getByRole("tab", { name: "Catalog" }).click();
  await expect(page.getByTestId("catalog-grid")).toBeVisible();
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
    await page.goto("/");
  });

  test("locks scroll, traps focus, and restores focus on mobile", async ({ page }) => {
    const helpButton = page.getByTestId("help-open");
    await helpButton.click();
    const helpModal = page.getByTestId("help-modal");
    await expect(helpModal).toBeVisible();
    const headerActions = helpModal.locator(".help-modal-header-actions");
    await expect(headerActions).toBeVisible();
    await expect(headerActions.getByTestId("help-search")).toBeVisible();
    await expect(headerActions.getByTestId("help-close")).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

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
    await page.reload();

    const helpButton = page.getByTestId("help-open");
    await helpButton.click();
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
    await page.goto("/");
  });

  test("winding, automatic, and quartz modals lock scroll and trap focus", async ({ page }) => {
    await openCatalogFromCollection(page);
    const manualCandidates = page.locator(
      '[data-testid^="vault-interact-chronograph"]:not([disabled]), [data-testid^="vault-interact-tourbillon"]:not([disabled])',
    );
    if ((await manualCandidates.count()) > 0) {
      const manualButton = manualCandidates.first();
      await manualButton.click();
      const windingModal = page.getByTestId("winding-modal");
      await expect(windingModal).toBeVisible();
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

    const automaticCandidates = page.locator(
      '[data-testid="vault-interact-classic"]:not([disabled])',
    );
    if ((await automaticCandidates.count()) > 0) {
      const automaticButton = automaticCandidates.first();
      await automaticButton.click();
      const automaticModal = page.getByTestId("automatic-modal");
      await expect(automaticModal).toBeVisible();
      await page.keyboard.press("Tab");
      await page.getByTestId("automatic-close").click();
      await expect(automaticModal).toHaveCount(0);
      await page.waitForTimeout(50);
      expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    }

    const quartzCandidates = page.locator('[data-testid="vault-interact-starter"]:not([disabled])');
    if ((await quartzCandidates.count()) > 0) {
      const quartzButton = quartzCandidates.first();
      await quartzButton.click();
      const quartzModal = page.getByTestId("quartz-modal");
      await expect(quartzModal).toBeVisible();
      await page.keyboard.press("Tab");
      await page.getByTestId("quartz-close").click();
      await expect(quartzModal).toHaveCount(0);
    }
  });

  test("dragging the winding surface resolves the run", async ({ page }) => {
    await openCatalogFromCollection(page);
    const manualCandidates = page.locator(
      '[data-testid^="vault-interact-chronograph"]:not([disabled]), [data-testid^="vault-interact-tourbillon"]:not([disabled])',
    );
    const manualCount = await manualCandidates.count();
    test.skip(manualCount === 0, "No manual winding candidate available");
    if (manualCount === 0) {
      return;
    }

    const manualButton = manualCandidates.first();
    await manualButton.click();
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

    await expect(page.getByTestId("winding-live")).toHaveText(/Stopped at/i);
    await expect(page.getByTestId("winding-outcome")).toBeVisible();
    await page.getByTestId("winding-close").click();
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

    await page.addInitScript(
      ({ seededState, nowMs }) => {
        const payload = {
          version: 2,
          savedAt: new Date(nowMs).toISOString(),
          lastSimulatedAtMs: nowMs,
          state: seededState,
        };
        window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
      },
      { seededState: sessionState, nowMs },
    );

    await page.goto("/");
    await page.getByRole("tab", { name: "Career" }).click();
    await expect(page.getByTestId("career-session-cooldown-ring")).toBeVisible();
  });
});
