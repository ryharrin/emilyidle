import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { seedStorage } from "./helpers/storageSeed";

const ARTIFACTS_DIR = "/tmp/emilyidle-ui-critique/realtime30m-v2";
const LOG_FILE = path.join(ARTIFACTS_DIR, "realtime-30m-log.txt");

interface StepLog {
  timestamp: string;
  elapsedMs: number;
  action: string;
  details?: Record<string, unknown>;
}

const logs: StepLog[] = [];
let startTime: number;

function logStep(action: string, details?: Record<string, unknown>) {
  const entry: StepLog = {
    timestamp: new Date().toISOString(),
    elapsedMs: Date.now() - startTime,
    action,
    details,
  };
  logs.push(entry);
  console.log(`[${entry.elapsedMs}ms] ${action}`, details ? JSON.stringify(details) : "");
}

async function takeScreenshot(page: Page, name: string) {
  const screenshotPath = path.join(ARTIFACTS_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  logStep("screenshot", { name, path: screenshotPath });
}

async function captureStateSnapshot(page: Page, minute: number) {
  // Extract currency info from page
  const cashText = await page
    .locator('dt:has-text("Cash") + dd')
    .textContent()
    .catch(() => null);
  const incomeText = await page
    .locator('dt:has-text("Cash / sec") + dd')
    .textContent()
    .catch(() => null);
  const enjoymentText = await page
    .locator('dt:has-text("Enjoyment") + dd')
    .textContent()
    .catch(() => null);

  // Check prestige tab visibility
  const workshopTab = page.getByRole("tab", { name: "Workshop" });
  const maisonTab = page.getByRole("tab", { name: "Maison" });
  const nostalgiaTab = page.getByRole("tab", { name: "Nostalgia" });

  const visibility = {
    workshop: await workshopTab.isVisible().catch(() => false),
    maison: await maisonTab.isVisible().catch(() => false),
    nostalgia: await nostalgiaTab.isVisible().catch(() => false),
  };

  // Check for reset review/confirm modals
  const workshopResetModal = page.locator('[data-testid="workshop-reset-modal"]').first();
  const maisonResetModal = page.locator('[data-testid="maison-reset-modal"]').first();
  const nostalgiaModal = page.locator('[data-testid="nostalgia-modal"]').first();

  const modals = {
    workshopReview: await workshopResetModal.isVisible().catch(() => false),
    maisonReview: await maisonResetModal.isVisible().catch(() => false),
    nostalgiaModal: await nostalgiaModal.isVisible().catch(() => false),
  };

  logStep(`checkpoint_minute_${minute}`, {
    cash: cashText,
    income: incomeText,
    enjoyment: enjoymentText,
    visibility,
    modals,
  });

  return { visibility, modals };
}

test.describe("Phase D: Real-Time 30-Minute Pass", () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  });

  test("30-minute real-time fresh profile progression @manual", async ({ page }) => {
    startTime = Date.now();
    logs.length = 0;

    logStep("test_start", {
      phase: "D",
      duration: "30_minutes",
      type: "realtime_strict",
      description: "No time skipping, wall-clock 30 minutes",
    });

    // Fresh profile only
    await seedStorage(page, {
      clearLocalStorage: true,
      clearSessionStorage: true,
    });
    logStep("storage_cleared_fresh_profile");

    await page.goto("/");
    await expect(page.getByRole("tablist", { name: "Primary navigation" })).toBeVisible({
      timeout: 10000,
    });
    logStep("page_loaded");
    await takeScreenshot(page, "01-start");

    // Initial checkpoint at minute 0
    await captureStateSnapshot(page, 0);

    // Run game loop for 30 minutes with per-minute checkpoints
    const totalMinutes = 30;
    let sessionsRun = 0;
    let purchases = 0;
    let upgradesBought = 0;
    let blockedCareer = 0;

    for (let minute = 1; minute <= totalMinutes; minute++) {
      const minuteStart = Date.now();
      logStep(`minute_${minute}_start`, { elapsedMs: Date.now() - startTime });

      // Perform gameplay actions for this minute
      // Navigate to Career and try to run sessions
      const careerTab = page.getByRole("tab", { name: "Career" });
      if (await careerTab.isVisible().catch(() => false)) {
        await careerTab.click();
        await page.waitForTimeout(200);

        // Check for available actions
        const runButton = page.locator('button:has-text("Run session")').first();
        const enterButton = page.locator('button:has-text("Enter program")').first();
        const chooseTrackButton = page
          .locator('button:has-text("Choose track"), button:has-text("Select track")')
          .first();

        if (
          (await runButton.isVisible().catch(() => false)) &&
          (await runButton.isEnabled().catch(() => false))
        ) {
          await runButton.click();
          sessionsRun++;
          logStep("session_run", { minute, total: sessionsRun });
          await page.waitForTimeout(500);
        } else if (
          (await enterButton.isVisible().catch(() => false)) &&
          (await enterButton.isEnabled().catch(() => false))
        ) {
          await enterButton.click();
          sessionsRun++;
          logStep("enter_program", { minute, total: sessionsRun });
          await page.waitForTimeout(500);
        } else if (await chooseTrackButton.isVisible().catch(() => false)) {
          blockedCareer++;
          logStep("blocked_career", {
            minute,
            total: blockedCareer,
            reason: "choose_track_required",
          });
        } else {
          blockedCareer++;
          logStep("blocked_career", {
            minute,
            total: blockedCareer,
            reason: "session_button_disabled",
          });
        }
      }

      // Navigate to Catalog and try purchases
      const catalogTab = page.getByRole("tab", { name: "Catalog" });
      if (await catalogTab.isVisible().catch(() => false)) {
        await catalogTab.click();
        await page.waitForTimeout(200);

        const buyButtons = page.locator('button:has-text("Buy")');
        const count = await buyButtons.count();

        for (let i = 0; i < Math.min(count, 2); i++) {
          const button = buyButtons.nth(i);
          if (await button.isEnabled().catch(() => false)) {
            await button.click();
            purchases++;
            logStep("purchase", { minute, total: purchases });
            await page.waitForTimeout(200);
          }
        }
      }

      // Navigate to Upgrades and try to buy
      const upgradesTab = page.getByRole("tab", { name: "Upgrades" });
      if (await upgradesTab.isVisible().catch(() => false)) {
        await upgradesTab.click();
        await page.waitForTimeout(200);

        const upgradeButtons = page.locator('button:has-text("Buy")');
        const count = await upgradeButtons.count();

        for (let i = 0; i < Math.min(count, 1); i++) {
          const button = upgradeButtons.nth(i);
          if (await button.isEnabled().catch(() => false)) {
            await button.click();
            upgradesBought++;
            logStep("upgrade_bought", { minute, total: upgradesBought });
            await page.waitForTimeout(200);
          }
        }
      }

      // Per-minute checkpoint
      const state = await captureStateSnapshot(page, minute);

      // Calculate remaining time for this minute
      const elapsedThisMinute = Date.now() - minuteStart;
      const remainingWait = Math.max(0, 60000 - elapsedThisMinute);

      if (remainingWait > 0) {
        logStep(`minute_${minute}_waiting`, { remainingMs: remainingWait });
        await page.waitForTimeout(remainingWait);
      }

      logStep(`minute_${minute}_complete`, {
        sessionsRun,
        purchases,
        upgradesBought,
        blockedCareer,
        state,
      });
    }

    // Final screenshot
    await takeScreenshot(page, "02-end");

    // Final state capture
    const finalVisibility = await captureStateSnapshot(page, 30);

    // Summary
    logStep("test_complete", {
      totalMinutes,
      sessionsRun,
      purchases,
      upgradesBought,
      blockedCareer,
    });

    // Trajectory verdict
    logStep("trajectory_verdict", {
      workshop: {
        seen: finalVisibility.visibility.workshop,
        reviewModalSeen: finalVisibility.modals.workshopReview,
      },
      maison: {
        seen: finalVisibility.visibility.maison,
        reviewModalSeen: finalVisibility.modals.maisonReview,
      },
      nostalgia: {
        seen: finalVisibility.visibility.nostalgia,
        modalSeen: finalVisibility.modals.nostalgiaModal,
      },
    });

    // Save logs
    fs.writeFileSync(LOG_FILE, logs.map((l) => JSON.stringify(l)).join("\n"));
  });
});
