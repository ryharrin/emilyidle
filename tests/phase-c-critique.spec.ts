import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { seedStorage } from "./helpers/storageSeed";
import { createInitialState } from "../src/game/state";

const ARTIFACTS_DIR = "/tmp/emilyidle-ui-critique/extended";

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

test.describe("Phase C: Manual-Style Extended Pass", () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  });

  test("Extended manual pass - friction point revisit @manual", async ({ page }) => {
    const logger = createLogger("extended-manual");
    logger.start();

    logger.log("session_start", {
      type: "manual_extended",
      description: "Slower pacing, revisit friction points from Phases A/B",
    });

    // Start with a partially progressed profile to revisit friction points
    const seededState = createInitialState();
    seededState.currencyCents = 500_00; // $500
    seededState.items = { quartz: 3, automatic: 0, manual: 0, tourbillon: 0 };
    seededState.therapistCareer.level = 3;
    seededState.therapistCareer.xp = 150;

    await seedStorage(page, {
      clearLocalStorage: true,
      save: { state: seededState },
    });

    await page.goto("/");
    await expect(page.getByRole("tablist", { name: "Primary navigation" })).toBeVisible({
      timeout: 10000,
    });
    logger.log("page_loaded");
    await logger.screenshot(page, "01-start");

    // REVISIT 1: Career progression friction (SELECT A TRACK blocker)
    logger.log("friction_revisit", { point: "career_progression", issue: "SELECT_A_TRACK" });
    const careerTab = page.getByRole("tab", { name: "Career" });
    await careerTab.click();
    logger.log("navigated_to_career");
    await page.waitForTimeout(1000); // Slower pacing
    await logger.screenshot(page, "02-career-revisit");

    // Check for "Choose track" or "Select a track" messaging
    const pageText = (await page.locator("body").textContent()) || "";
    const hasChooseTrack = pageText.toLowerCase().includes("choose track");
    const hasSelectTrack = pageText.toLowerCase().includes("select a track");
    logger.log("career_text_analysis", { hasChooseTrack, hasSelectTrack });

    // Look for available actions
    const runSessionButton = page.locator('button:has-text("Run session")').first();
    const chooseTrackButton = page
      .locator('button:has-text("Choose track"), button:has-text("Select track")')
      .first();
    const enterProgramButton = page.locator('button:has-text("Enter program")').first();

    const actions = {
      runSession: await runSessionButton.isVisible().catch(() => false),
      chooseTrack: await chooseTrackButton.isVisible().catch(() => false),
      enterProgram: await enterProgramButton.isVisible().catch(() => false),
    };
    logger.log("available_actions", actions);

    // REVISIT 2: Navigation recovery (tab switching)
    logger.log("friction_revisit", { point: "navigation_recovery" });
    const tabs = ["Collection", "Catalog", "Upgrades", "Career"];
    for (let i = 0; i < 3; i++) {
      // Repeat 3 times to check repeatability
      logger.log("navigation_cycle", { iteration: i + 1 });
      for (const tabName of tabs) {
        const tab = page.getByRole("tab", { name: tabName });
        if (await tab.isVisible().catch(() => false)) {
          await tab.click();
          await page.waitForTimeout(500);
        }
      }
    }
    await logger.screenshot(page, "03-navigation-revisit");

    // REVISIT 3: Purchase flow with waiting
    logger.log("friction_revisit", { point: "purchase_flow" });
    const catalogTab = page.getByRole("tab", { name: "Catalog" });
    await catalogTab.click();
    await page.waitForTimeout(1000);
    await logger.screenshot(page, "04-catalog-revisit");

    // Check for affordable items
    const buyButtons = page.locator('button:has-text("Buy")');
    const buttonCount = await buyButtons.count();
    logger.log("catalog_analysis", { buyButtonCount: buttonCount });

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buyButtons.nth(i);
      const isEnabled = await button.isEnabled().catch(() => false);
      const text = await button.textContent();
      logger.log("buy_button_state", { index: i, enabled: isEnabled, text });
    }

    // REVISIT 4: Help system accessibility
    logger.log("friction_revisit", { point: "help_accessibility" });
    const helpButton = page.locator('[data-testid="help-open"]').first();
    if (await helpButton.isVisible().catch(() => false)) {
      await helpButton.click();
      await page.waitForTimeout(500);
      await logger.screenshot(page, "05-help-modal");

      // Check help sections
      const helpLinks = page.locator(
        '[data-testid="help-content"] a, [data-testid="help-content"] button',
      );
      const helpLinkCount = await helpLinks.count();
      logger.log("help_sections_available", { count: helpLinkCount });

      const closeButton = page.locator('[data-testid="help-close"]').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
        logger.log("help_closed");
      }
    }

    // REVISIT 5: Settings/cancel flows
    logger.log("friction_revisit", { point: "settings_cancel_flows" });
    const settingsTab = page.getByRole("tab", { name: "Settings" });
    await settingsTab.click();
    await page.waitForTimeout(1000);
    await logger.screenshot(page, "06-settings");

    // Check for settings options
    const settingsOptions = page.locator("input, button, select");
    const optionCount = await settingsOptions.count();
    logger.log("settings_options_count", { count: optionCount });

    // Return to career to end
    await careerTab.click();
    await page.waitForTimeout(500);

    logger.log("session_complete");
    await logger.screenshot(page, "07-end");
    logger.save();
  });
});
