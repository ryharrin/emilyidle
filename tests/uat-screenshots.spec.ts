import { test } from "@playwright/test";

const SCREENSHOT_DIR = "test-results/uat-screenshots";

test.describe("UAT Screenshot Inspection", () => {
  test("fresh save - primary nav and vault surface", async ({ page }) => {
    // Clear all storage
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Screenshot 1: Primary navigation (should NOT have Catalog tab)
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-primary-nav.png`,
      fullPage: false,
    });

    // Click Vault tab to ensure we're on collection
    const vaultTab = page.getByRole("tab", { name: /Vault/i });
    await vaultTab.click();
    await page.waitForTimeout(500);

    // Screenshot 2: Full Vault page
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-vault-full.png`,
      fullPage: true,
    });

    // Scroll to catalog shop section
    const catalogShop = page.locator("#catalog-shop");
    if (await catalogShop.isVisible().catch(() => false)) {
      await catalogShop.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Screenshot 3: Catalog shop panel
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/03-catalog-shop.png`,
        fullPage: false,
      });
    }

    // Screenshot 4: First catalog card close-up
    const firstCard = page.getByTestId("catalog-card").first();
    if (await firstCard.isVisible().catch(() => false)) {
      await firstCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await firstCard.screenshot({
        path: `${SCREENSHOT_DIR}/04-first-card.png`,
      });
    }

    // Check for buy buttons
    const buyButtons = page.getByTestId(/catalog-buy-/);
    const buyButtonCount = await buyButtons.count();
    console.log(`Found ${buyButtonCount} catalog-buy buttons`);

    // Check for gate chips
    const gateChips = page.getByTestId(/catalog-gate-/);
    const gateChipCount = await gateChips.count();
    console.log(`Found ${gateChipCount} catalog-gate chips`);

    // Screenshot 5: Buy button or gate chip visible
    if (buyButtonCount > 0) {
      const firstBuy = buyButtons.first();
      await firstBuy.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/05-buy-button.png`,
        fullPage: false,
      });
    } else if (gateChipCount > 0) {
      const firstGate = gateChips.first();
      await firstGate.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/05-gate-chip.png`,
        fullPage: false,
      });
    }
  });

  test("mobile viewport - responsive layout", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Clear storage
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Screenshot 6: Mobile primary nav
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/06-mobile-nav.png`,
      fullPage: false,
    });

    // Click Vault
    const vaultTab = page.getByRole("tab", { name: /Vault/i });
    await vaultTab.click();
    await page.waitForTimeout(500);

    // Screenshot 7: Mobile Vault full page
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-mobile-vault.png`,
      fullPage: true,
    });

    // Scroll to catalog cards
    const catalogShop = page.locator("#catalog-shop");
    if (await catalogShop.isVisible().catch(() => false)) {
      await catalogShop.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Screenshot 8: Mobile catalog cards
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/08-mobile-catalog.png`,
        fullPage: false,
      });
    }
  });

  test("buy flow - click and verify", async ({ page }) => {
    // Clear storage
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Click Vault
    const vaultTab = page.getByRole("tab", { name: /Vault/i });
    await vaultTab.click();
    await page.waitForTimeout(500);

    // Click "Buy watches" CTA if present
    const buyWatchesCta = page.getByTestId("next-unlock-cta-career");
    if (await buyWatchesCta.isVisible().catch(() => false)) {
      await buyWatchesCta.click();
      await page.waitForTimeout(500);

      // Screenshot 9: After clicking Buy watches CTA
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/09-after-cta-click.png`,
        fullPage: false,
      });
    }

    // Look for first buy button and try to click it
    const buyButtons = page.getByTestId(/catalog-buy-/);
    if (
      await buyButtons
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      const firstBuy = buyButtons.first();
      await firstBuy.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Screenshot 10: Before clicking buy
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/10-before-buy.png`,
        fullPage: false,
      });

      // Click buy
      await firstBuy.click();
      await page.waitForTimeout(500);

      // Screenshot 11: After clicking buy
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/11-after-buy.png`,
        fullPage: false,
      });
    }
  });

  test("help button - catalog help opens", async ({ page }) => {
    // Clear storage
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Click Vault
    const vaultTab = page.getByRole("tab", { name: /Vault/i });
    await vaultTab.click();
    await page.waitForTimeout(500);

    // Scroll to catalog shop
    const catalogShop = page.locator("#catalog-shop");
    if (await catalogShop.isVisible().catch(() => false)) {
      await catalogShop.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Click help button
      const helpButton = page.getByTestId("catalog-help").getByRole("button");
      if (await helpButton.isVisible().catch(() => false)) {
        await helpButton.click();
        await page.waitForTimeout(500);

        // Screenshot 12: Help modal open
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/12-help-modal.png`,
          fullPage: false,
        });

        // Check active section
        const activeSection = page.getByTestId("help-active-section");
        if (await activeSection.isVisible().catch(() => false)) {
          const text = await activeSection.textContent();
          console.log(`Help active section: ${text}`);
        }
      }
    }
  });
});
