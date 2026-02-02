import { chromium, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "http://127.0.0.1:5180/emilyidle/";
const OUTPUT_DIR = "./ui-screenshots";

async function takeScreenshot(page: Page, name: string, tabId?: string) {
  if (tabId) {
    const tabExists = (await page.locator(`[id="${tabId}-tab"]`).count()) > 0;
    if (!tabExists) {
      console.log(`Skipping ${name} - tab not visible`);
      return null;
    }
    await page.click(`[id="${tabId}-tab"]`);
    await page.waitForTimeout(500);
  }

  const filepath = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({
    path: filepath,
    fullPage: true,
  });
  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
}

async function captureUI() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000); // Wait for app to load

    // Capture main tabs
    await takeScreenshot(page, "01-initial-load");
    await takeScreenshot(page, "02-career-tab", "career");
    await takeScreenshot(page, "03-vault-tab", "collection");
    await takeScreenshot(page, "04-upgrades-tab", "upgrades");
    await takeScreenshot(page, "05-atelier-tab", "workshop");
    await takeScreenshot(page, "06-maison-tab", "maison");
    await takeScreenshot(page, "07-nostalgia-tab", "nostalgia");
    await takeScreenshot(page, "08-stats-tab", "stats");
    await takeScreenshot(page, "09-settings-tab", "save");

    // Capture mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await takeScreenshot(page, "10-mobile-career");
    await takeScreenshot(page, "11-mobile-vault", "collection");

    // Capture help modal
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.click('[data-testid="help-open"]');
    await page.waitForTimeout(500);
    await takeScreenshot(page, "12-help-modal");
    await page.keyboard.press("Escape");

    console.log("\nAll screenshots captured successfully!");
    console.log(`Output directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error("Error capturing screenshots:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureUI().catch(console.error);
