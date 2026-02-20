import { test, expect } from "@playwright/test";
import { seedStorage } from "./helpers/storageSeed";

test("debug page structure", async ({ page }) => {
  await seedStorage(page, {
    clearLocalStorage: true,
    clearSessionStorage: true,
  });
  
  await page.goto("/");
  await page.waitForTimeout(3000);
  
  // Check if body has content
  const bodyText = await page.locator("body").textContent();
  console.log("Body text length:", bodyText?.length);
  console.log("Body text preview:", bodyText?.substring(0, 500));
  
  // Check for specific elements
  const tablist = page.getByRole("tablist", { name: "Primary navigation" });
  const tablistVisible = await tablist.isVisible().catch(() => false);
  console.log("Tablist visible:", tablistVisible);
  
  // Get all tab roles
  const allTabs = page.getByRole("tab");
  const tabCount = await allTabs.count();
  console.log("Total tabs found:", tabCount);
  
  for (let i = 0; i < Math.min(tabCount, 10); i++) {
    const text = await allTabs.nth(i).textContent();
    const accessibleName = await allTabs.nth(i).getAttribute("aria-label");
    console.log(`Tab ${i}: text="${text}", aria-label="${accessibleName}"`);
  }
  
  // Take screenshot
  await page.screenshot({ path: "/tmp/emilyidle-ui-critique/debug.png", fullPage: true });
});
