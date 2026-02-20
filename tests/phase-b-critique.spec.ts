import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { seedStorage } from "./helpers/storageSeed";
import { createInitialState } from "../src/game/state";

const ARTIFACTS_DIR = "/tmp/emilyidle-ui-critique/deep-v2";

interface StepLog {
  timestamp: string;
  elapsedMs: number;
  action: string;
  details?: Record<string, unknown>;
}

function createLogger(testName: string) {
  const logs: StepLog[] = [];
  let startTime: number;
  const logFile = path.join(ARTIFACTS_DIR, `${testName}-log.txt`);

  return {
    start() {
      startTime = Date.now();
      logs.length = 0;
    },
    log(action: string, details?: Record<string, unknown>) {
      const entry: StepLog = {
        timestamp: new Date().toISOString(),
        elapsedMs: Date.now() - startTime,
        action,
        details,
      };
      logs.push(entry);
      console.log(`[${entry.elapsedMs}ms] ${action}`, details ? JSON.stringify(details) : "");
    },
    async screenshot(page: Page, name: string) {
      const screenshotPath = path.join(ARTIFACTS_DIR, `${testName}-${name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      this.log("screenshot", { name, path: screenshotPath });
    },
    save() {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
      fs.writeFileSync(logFile, logs.map((l) => JSON.stringify(l)).join("\n"));
    },
  };
}

test.describe("Phase B: Deep Multi-Session Pass", () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  });

  test("Session 1: Accelerated progression session @manual", async ({ page }) => {
    const logger = createLogger("session1-accelerated");
    logger.start();

    logger.log("session_start", {
      type: "accelerated_progression",
      description: "Fresh profile with heavy looping",
    });

    // Clear storage for fresh profile
    await seedStorage(page, {
      clearLocalStorage: true,
      clearSessionStorage: true,
    });

    await page.goto("/");
    await expect(page.getByRole("tablist", { name: "Primary navigation" })).toBeVisible({
      timeout: 10000,
    });
    logger.log("page_loaded");
    await logger.screenshot(page, "01-start");

    // Heavy looping to surface midgame flow issues
    // Run career sessions repeatedly
    const careerTab = page.getByRole("tab", { name: "Career" });
    await careerTab.click();
    logger.log("navigated_to_career");
    await logger.screenshot(page, "02-career-initial");

    // Attempt multiple earn-spend cycles
    let sessionsRun = 0;
    let purchasesMade = 0;
    const maxCycles = 10;

    for (let cycle = 0; cycle < maxCycles; cycle++) {
      logger.log("cycle_start", { cycle: cycle + 1, max: maxCycles });

      // Try to run a career session
      const runSessionButton = page
        .locator('button:has-text("Run session"), button:has-text("Enter program")')
        .first();
      if (await runSessionButton.isVisible().catch(() => false)) {
        const isEnabled = await runSessionButton.isEnabled().catch(() => false);
        if (isEnabled) {
          await runSessionButton.click();
          sessionsRun++;
          logger.log("session_run", { count: sessionsRun });
          await page.waitForTimeout(2000);
        } else {
          logger.log("session_button_disabled", { cycle: cycle + 1 });
        }
      }

      // Navigate to catalog and try to purchase
      const catalogTab = page.getByRole("tab", { name: "Catalog" });
      if (await catalogTab.isVisible().catch(() => false)) {
        await catalogTab.click();
        logger.log("navigated_to_catalog", { cycle: cycle + 1 });
        await page.waitForTimeout(500);

        const buyButtons = page.locator('button:has-text("Buy")');
        const enabledButtons = buyButtons.filter({ has: page.locator(":not([disabled])") });
        const count = await enabledButtons.count();
        if (count > 0) {
          await enabledButtons.first().click();
          purchasesMade++;
          logger.log("purchase_made", { count: purchasesMade, cycle: cycle + 1 });
          await page.waitForTimeout(1000);
        }
      }

      // Check for prestige tabs visibility
      const prestigeTabs = ["Workshop", "Maison", "Nostalgia"];
      for (const tabName of prestigeTabs) {
        const tab = page.getByRole("tab", { name: tabName });
        const visible = await tab.isVisible().catch(() => false);
        if (visible) {
          logger.log("prestige_tab_visible", { tab: tabName, cycle: cycle + 1 });
          await tab.click();
          await logger.screenshot(page, `03-prestige-${tabName.toLowerCase()}-cycle-${cycle + 1}`);
        }
      }

      // Return to career for next cycle
      if (await careerTab.isVisible().catch(() => false)) {
        await careerTab.click();
      }

      await page.waitForTimeout(1000);
    }

    logger.log("session_complete", {
      sessionsRun,
      purchasesMade,
      totalCycles: maxCycles,
    });
    await logger.screenshot(page, "04-end");
    logger.save();
  });

  test("Session 2: Seeded late-game session @manual", async ({ page }) => {
    const logger = createLogger("session2-lategame");
    logger.start();

    logger.log("session_start", {
      type: "seeded_lategame",
      description: "Late-game state for Workshop/Maison/Nostalgia",
    });

    // Create a seeded late-game state
    const seededState = createInitialState();
    seededState.currencyCents = 1_000_000_00; // 1 million dollars
    seededState.enjoymentCents = 500_000_00;
    seededState.items = { quartz: 50, automatic: 30, manual: 20, tourbillon: 10 };
    seededState.workshopPrestigeCount = 2;
    seededState.workshopBlueprints = 100;
    seededState.maisonReputation = 50;
    seededState.maisonHeritage = 1000;
    seededState.nostalgiaUnlockedItems = ["quartz", "automatic", "manual"];
    seededState.catalogTierUnlocks = ["quartz", "automatic", "manual", "tourbillon"];

    await seedStorage(page, {
      clearLocalStorage: true,
      save: { state: seededState },
    });

    await page.goto("/");
    await expect(page.getByRole("tablist", { name: "Primary navigation" })).toBeVisible({
      timeout: 10000,
    });
    logger.log("page_loaded", { seeded: true });
    await logger.screenshot(page, "01-start");

    // Check all prestige tabs
    const prestigeTabs = [
      { name: "Workshop", testid: "workshop-panel" },
      { name: "Maison", testid: "maison-panel" },
      { name: "Nostalgia", testid: "nostalgia-panel" },
    ];

    for (const { name, testid } of prestigeTabs) {
      const tab = page.getByRole("tab", { name });
      const visible = await tab.isVisible().catch(() => false);
      logger.log("prestige_tab_check", { tab: name, visible });

      if (visible) {
        await tab.click();
        logger.log("prestige_tab_clicked", { tab: name });
        await page.waitForTimeout(500);
        await logger.screenshot(page, `02-${name.toLowerCase()}-tab`);

        // Check for reset/review behaviors
        const resetButton = page.locator(`[data-testid*="${name.toLowerCase()}-reset"]`).first();
        if (await resetButton.isVisible().catch(() => false)) {
          logger.log("reset_button_visible", { tab: name });

          // Test cancel flow
          await resetButton.click();
          logger.log("reset_clicked", { tab: name });
          await page.waitForTimeout(500);
          await logger.screenshot(page, `03-${name.toLowerCase()}-reset-modal`);

          const cancelButton = page
            .locator('button:has-text("Cancel"), button:has-text("No")')
            .first();
          if (await cancelButton.isVisible().catch(() => false)) {
            await cancelButton.click();
            logger.log("reset_cancelled", { tab: name });
          }
        }
      }
    }

    // Full tab sweep
    const allTabs = ["Career", "Collection", "Catalog", "Upgrades"];
    for (const tabName of allTabs) {
      const tab = page.getByRole("tab", { name: tabName });
      if (await tab.isVisible().catch(() => false)) {
        await tab.click();
        logger.log("tab_swept", { tab: tabName });
        await page.waitForTimeout(300);
      }
    }

    logger.log("session_complete");
    await logger.screenshot(page, "04-end");
    logger.save();
  });

  test("Session 3: Mobile viewport session @manual", async ({ page }) => {
    const logger = createLogger("session3-mobile");
    logger.start();

    logger.log("session_start", {
      type: "mobile",
      viewport: "390x844",
      description: "iPhone 15 viewport",
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Clear storage for fresh profile
    await seedStorage(page, {
      clearLocalStorage: true,
      clearSessionStorage: true,
    });

    await page.goto("/");
    await page.waitForTimeout(3000);
    logger.log("page_loaded");
    await logger.screenshot(page, "01-start");

    // Check tab readability and overflow
    const tablist = page.getByRole("tablist", { name: "Primary navigation" });
    const tablistVisible = await tablist.isVisible().catch(() => false);
    logger.log("tablist_check", { visible: tablistVisible });

    // Count visible tabs
    const allTabs = page.getByRole("tab");
    const tabCount = await allTabs.count();
    logger.log("visible_tabs_count", { count: tabCount });

    // Check for scroll indicators
    const prevButton = page.locator('button:has-text("Prev")').first();
    const nextButton = page.locator('button:has-text("Next")').first();
    const prevVisible = await prevButton.isVisible().catch(() => false);
    const nextVisible = await nextButton.isVisible().catch(() => false);
    logger.log("scroll_indicators", { prevVisible, nextVisible });

    // Test navigation with swipe/scroll
    if (nextVisible) {
      await nextButton.click();
      logger.log("next_tabs_clicked");
      await page.waitForTimeout(500);
      await logger.screenshot(page, "02-tabs-scrolled");
    }

    // Test tab clickability
    const tabNames = ["Career", "Catalog", "Collection"];
    for (const tabName of tabNames) {
      const tab = page.getByRole("tab", { name: tabName });
      const visible = await tab.isVisible().catch(() => false);
      if (visible) {
        await tab.click();
        logger.log("mobile_tab_clicked", { tab: tabName });
        await page.waitForTimeout(300);
        await logger.screenshot(page, `03-tab-${tabName.toLowerCase()}`);
      } else {
        logger.log("mobile_tab_not_visible", { tab: tabName });
      }
    }

    // Test recovery actions (help modal)
    const helpButton = page.locator('[data-testid="help-open"]').first();
    if (await helpButton.isVisible().catch(() => false)) {
      await helpButton.click();
      logger.log("help_opened");
      await page.waitForTimeout(500);
      await logger.screenshot(page, "04-help-modal");

      const closeButton = page.locator('[data-testid="help-close"]').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
        logger.log("help_closed");
      }
    }

    // Check for overflow issues
    const bodyOverflow = await page.evaluate(() => {
      const body = document.body;
      return {
        scrollWidth: body.scrollWidth,
        clientWidth: body.clientWidth,
        overflowX: window.getComputedStyle(body).overflowX,
        overflowY: window.getComputedStyle(body).overflowY,
      };
    });
    logger.log("overflow_check", bodyOverflow);

    logger.log("session_complete");
    await logger.screenshot(page, "05-end");
    logger.save();
  });
});
