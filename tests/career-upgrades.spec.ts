import { expect, test } from "@playwright/test";

test("career and upgrades surfaces are reachable with preview markers", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");

  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  const careerTab = tabList.getByRole("tab", { name: "Career" });
  const upgradesTab = tabList.getByRole("tab", { name: "Upgrades" });

  await expect(careerTab).toBeVisible();
  await expect(upgradesTab).toBeVisible();

  await careerTab.click();
  await expect(page.getByTestId("career-panel")).toBeVisible();

  await upgradesTab.click();
  const upgradesPanel = page.getByTestId("upgrades-panel");
  await expect(upgradesPanel).toBeVisible();

  const firstUpgradeCard = upgradesPanel.getByTestId("upgrade-card").first();
  const ratePreviewToggle = firstUpgradeCard.getByText("Rate preview");
  await ratePreviewToggle.click();
  await expect(firstUpgradeCard.getByText("Before")).toBeVisible();
  await expect(firstUpgradeCard.getByText("After")).toBeVisible();
});
