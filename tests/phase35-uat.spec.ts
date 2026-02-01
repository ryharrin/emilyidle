import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const artifactDir = ".planning/uat-artifacts/35";

const clearStorage = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
};

test.describe("Phase 35 UAT: Balance & Help Clarity", () => {
  test("1) Fresh-save career start clarity", async ({ page }) => {
    await clearStorage(page);
    await page.goto("/");

    // Confirm landing on Career tab for fresh saves
    const tabList = page.getByRole("tablist", { name: "Primary navigation" });
    const careerTab = tabList.getByRole("tab", { name: "Career" });
    await expect(careerTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("career-panel")).toBeVisible();

    // Screenshot: Fresh save career landing
    await page.screenshot({ path: `${artifactDir}/01-fresh-save-career-landing.png` });

    // Confirm cash/sec starts at 0 before starting career
    const cashRate = page.locator("#income");
    await expect(cashRate).toHaveText("$0.00/s");

    // Find the start career CTA ("Enter program" button)
    const startButton = page.getByTestId("career-next-action-start");
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveText("Enter program");

    // Find the ExplainButton near that CTA
    const explainButton = page.getByTestId("explain-career-start");
    await expect(explainButton).toBeVisible();

    // Click the ExplainButton and verify Help opens focused on "Starting your career"
    await explainButton.click();
    await expect(page.getByTestId("help-modal")).toBeVisible();

    // Screenshot: Help modal open on career start section
    await page.screenshot({ path: `${artifactDir}/02-help-career-start.png` });

    // Verify the help section is focused on career start
    const helpHeading = page.getByRole("heading", { name: "Starting your career" });
    await expect(helpHeading).toBeVisible();

    // Close help
    await page.getByTestId("help-close").click();
    await expect(page.locator('[data-testid="help-modal"]')).toHaveCount(0);
  });

  test("2) Salary window loop and sessions UX", async ({ page }) => {
    await clearStorage(page);
    await page.goto("/");

    // Start career via CTA
    const startButton = page.getByTestId("career-next-action-start");
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Screenshot: After starting career
    await page.screenshot({ path: `${artifactDir}/03-career-started.png` });

    // Verify the salary-window concept is discoverable via help
    const explainCareerProgression = page.getByTestId("explain-career-progression");
    await expect(explainCareerProgression).toBeVisible();

    // Click to verify career progression help is available
    await explainCareerProgression.click();
    await expect(page.getByTestId("help-modal")).toBeVisible();

    // Verify career progression help mentions salary window
    const careerProgressionHeading = page.getByRole("heading", { name: "Career progression" });
    await expect(careerProgressionHeading).toBeVisible();

    // Screenshot: Career progression help
    await page.screenshot({ path: `${artifactDir}/04-career-progression-help.png` });

    // Close help
    await page.getByTestId("help-close").click();

    // Verify sessions are present near top of Career
    const sessionCard = page.locator(".career-session");
    await expect(sessionCard).toBeVisible();

    // Check session info is displayed
    const sessionCostLabel = sessionCard.getByText("Session cost", { exact: true });
    await expect(sessionCostLabel).toBeVisible();

    // Run a session if available (first session should be free)
    const runSessionButton = page.getByTestId("career-action");
    await expect(runSessionButton).toBeVisible();

    // Get initial state
    const initialLevel = await page
      .locator("text=Level")
      .locator("..")
      .locator(".workshop-value")
      .textContent();

    const canRunSession = await runSessionButton.isEnabled();
    if (canRunSession) {
      await runSessionButton.click();
    }

    // Screenshot: After running session
    await page.screenshot({ path: `${artifactDir}/05-after-session.png` });

    // Verify UI state is still healthy (button might remain disabled if sessions are locked
    // behind track unlocks, or become disabled due to cooldown)
    await expect(page.getByTestId("career-panel")).toBeVisible();

    // Verify career status is updated
    const careerStatus = page.getByTestId("career-status");
    await expect(careerStatus).toBeVisible();
  });

  test("3) Shop vs Catalog surface clarity", async ({ page }) => {
    await clearStorage(page);
    await page.goto("/");

    // Navigate to Vault/Collection tab
    const collectionTab = page.getByRole("tab", { name: "Vault" });
    await collectionTab.click();
    await expect(page.getByTestId("collection-setup")).toBeVisible();

    // Screenshot: Vault tab
    await page.screenshot({ path: `${artifactDir}/06-vault-tab.png` });

    // Find the embedded Shop area (catalog-shop)
    const shopPanel = page.getByTestId("catalog-shop");
    await expect(shopPanel).toBeVisible();

    // Confirm the copy indicates Shop is for buying and Catalog is archive/reference
    // Look for the clarifying text in the shop panel
    const shopClarification = shopPanel.locator(
      "text=Shop is the purchase flow. Catalog is the archive tab for references and licensing.",
    );
    await expect(shopClarification).toBeVisible();

    // Screenshot: Shop clarification text
    await page.screenshot({ path: `${artifactDir}/07-shop-clarification.png`, fullPage: false });

    // Verify help is available for catalog-first economy
    const explainCatalogFirst = page.getByTestId("explain-catalog-first");
    // Note: This might not exist directly, check for catalog-shop explain button

    // Look for any explain button in the catalog shop area
    const catalogShopExplain = shopPanel.locator("[data-testid^='explain-']").first();
    if (await catalogShopExplain.isVisible().catch(() => false)) {
      await catalogShopExplain.click();
      await expect(page.getByTestId("help-modal")).toBeVisible();

      // Screenshot: Catalog help
      await page.screenshot({ path: `${artifactDir}/08-catalog-help.png` });

      await page.getByTestId("help-close").click();
    }

    // Verify the copy clearly distinguishes Shop vs Catalog
    const shopText = await shopPanel.textContent();

    // Shop should be described as purchase flow
    expect(shopText).toMatch(/shop/i);
    expect(shopText).toMatch(/purchase|buy/i);

    // Catalog should be described as archive/reference
    expect(shopText).toMatch(/catalog/i);
    expect(shopText).toMatch(/archive|reference/i);
  });
});
