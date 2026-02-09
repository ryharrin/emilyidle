import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { clickLocatorSafely } from "./helpers/interactions";
import { gotoAppWithNavigationReady } from "./helpers/navigation";

const tabs = [
  { name: "01-career", label: "Career" },
  { name: "02-vault", label: "Collection" },
  { name: "03-catalog", label: "Catalog" },
  { name: "04-upgrades", label: "Upgrades" },
  { name: "05-workshop", label: "Atelier" },
  { name: "06-maison", label: "Maison" },
  { name: "07-nostalgia", label: "Nostalgia" },
  { name: "08-stats", label: "Stats" },
  { name: "09-settings", label: "Settings" },
];

const capture = async (page: Page, testInfo: TestInfo, filename: string) => {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await page.screenshot({
        path: testInfo.outputPath(filename),
        fullPage: false,
        timeout: 12_000,
        animations: "disabled",
      });
      return;
    } catch (error) {
      if (attempt < 2) {
        await page.waitForTimeout(200);
        continue;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.warn(`! Skipped screenshot ${filename}: ${message}`);
      await testInfo.attach(`screenshot-skip-${filename}.txt`, {
        body: message,
        contentType: "text/plain",
      });
    }
  }
};

test.describe("UI Screenshots", () => {
  test("capture all tabs", async ({ page }, testInfo) => {
    await gotoAppWithNavigationReady(page);

    for (const tab of tabs) {
      const tabButton = page.getByRole("tab", { name: tab.label });
      const isVisible = await tabButton.isVisible().catch(() => false);
      if (!isVisible) {
        console.log(`- Skipped ${tab.label} (hidden)`);
        continue;
      }

      await clickLocatorSafely(tabButton);
      await expect(tabButton).toHaveAttribute("aria-selected", "true");
      await capture(page, testInfo, `${tab.name}.png`);
      console.log(`✓ Captured ${tab.label}`);
    }
  });

  test("capture mobile views", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoAppWithNavigationReady(page);

    // Mobile career
    await capture(page, testInfo, "10-mobile-career.png");

    // Mobile vault
    const collectionTab = page.getByRole("tab", { name: "Collection" });
    await clickLocatorSafely(collectionTab);
    await expect(collectionTab).toHaveAttribute("aria-selected", "true");
    await capture(page, testInfo, "11-mobile-vault.png");

    // Mobile catalog
    const catalogTab = page.getByRole("tab", { name: "Catalog" });
    await clickLocatorSafely(catalogTab);
    await expect(catalogTab).toHaveAttribute("aria-selected", "true");
    await capture(page, testInfo, "12-mobile-catalog.png");

    console.log("✓ Captured mobile views");
  });
});
