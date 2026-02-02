import { expect, Page, test } from "@playwright/test";

type SeededSave = {
  state: Record<string, unknown>;
  lastSimulatedAtMs: number;
};

async function seedSave(page: Page, seeded: SeededSave) {
  await page.addInitScript(({ state, lastSimulatedAtMs }: SeededSave) => {
    const payload = {
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs,
      state,
    };
    window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
  }, seeded);
}

test("wear one watch, switch, clear, and verify Stats + help", async ({ page }) => {
  const watchIdA = "rolex-rolex-gmt-master-ref-16700"; // classic bucket (gmt)
  const watchIdB = "rolex-rolex-daytona-ref-6265-in-oro-primi-anni-settanta"; // chronograph bucket (daytona)

  const seededState = {
    currencyCents: 10_000,
    enjoymentCents: 10_000,
    wornWatchId: null,
    watchModels: {
      [watchIdA]: 5,
      [watchIdB]: 5,
    },
    items: { starter: 10, classic: 0, chronograph: 0, tourbillon: 0 },
    unlockedMilestones: ["collector-shelf", "showcase"],
  };

  await seedSave(page, { state: seededState, lastSimulatedAtMs: Date.now() });

  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();

  await page
    .getByTestId("catalog-owned-tabs")
    .getByRole("tab", { name: /^Owned$/ })
    .click();

  const wearA = page.getByTestId(`watch-wear-${watchIdA}`);
  await wearA.scrollIntoViewIfNeeded();
  await wearA.click();

  await expect(page.getByTestId(`watch-equipped-${watchIdA}`)).toBeVisible();
  await page.getByRole("tab", { name: "Vault" }).click();
  await expect(page.getByTestId("worn-watch-summary")).toBeVisible();
  await expect(page.getByTestId("worn-watch-summary")).not.toContainText("None");

  await page.getByTestId("worn-watch-change").click();
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeVisible();
  await page.getByTestId(`worn-watch-option-${watchIdB}`).click();

  await page.getByRole("tab", { name: "Catalog" }).click();
  await page
    .getByTestId("catalog-owned-tabs")
    .getByRole("tab", { name: /^Owned$/ })
    .click();

  await expect(page.getByTestId(`watch-equipped-${watchIdA}`)).toHaveCount(0);
  await expect(page.getByTestId(`watch-equipped-${watchIdB}`)).toBeVisible();

  await page.getByRole("tab", { name: "Stats" }).click();
  const enjoymentBreakdown = page.getByTestId("enjoyment-rate-breakdown");
  await enjoymentBreakdown.locator("summary").click();
  await expect(enjoymentBreakdown).toContainText("Worn watch x1.08");
  await expect(enjoymentBreakdown).not.toContainText("Worn watch x1.05");

  await page.getByTestId("explain-worn-watch-bonus").click();
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Worn watch bonus/);
  await page.getByTestId("help-close").click();

  await page.getByRole("tab", { name: "Vault" }).click();
  await page.getByTestId("worn-watch-change").click();
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeVisible();
  await page.getByTestId("worn-watch-option-none").click();

  await expect(page.getByTestId(`watch-equipped-${watchIdB}`)).toHaveCount(0);

  await page.getByRole("tab", { name: "Stats" }).click();
  await page.getByTestId("enjoyment-rate-breakdown").locator("summary").click();
  await expect(page.getByTestId("enjoyment-rate-breakdown")).not.toContainText("Worn watch");
});
