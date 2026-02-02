import { test, expect } from "@playwright/test";

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

test.describe("UI Screenshots", () => {
  test("capture all tabs", async ({ page }) => {
    await page.goto("/emilyidle/");
    await page.waitForTimeout(2000);

    for (const tab of tabs) {
      const tabButton = page.getByRole("tab", { name: tab.label });
      const isVisible = await tabButton.isVisible().catch(() => false);
      if (!isVisible) {
        console.log(`- Skipped ${tab.label} (hidden)`);
        continue;
      }

      await tabButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `/tmp/ui-screenshots/${tab.name}.png`,
        fullPage: false,
      });
      console.log(`✓ Captured ${tab.label}`);
    }
  });

  test("capture mobile views", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/emilyidle/");
    await page.waitForTimeout(2000);

    // Mobile career
    await page.screenshot({
      path: `/tmp/ui-screenshots/10-mobile-career.png`,
      fullPage: false,
    });

    // Mobile vault
    await page.getByRole("tab", { name: "Collection" }).click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `/tmp/ui-screenshots/11-mobile-vault.png`,
      fullPage: false,
    });

    // Mobile catalog
    await page.getByRole("tab", { name: "Catalog" }).click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `/tmp/ui-screenshots/12-mobile-catalog.png`,
      fullPage: false,
    });

    console.log("✓ Captured mobile views");
  });
});
