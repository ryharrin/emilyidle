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
  await expect(upgradesPanel.getByText("Recommended next upgrades")).toHaveCount(0);

  const firstUpgradeCard = upgradesPanel.getByTestId("upgrade-card").first();
  await expect(firstUpgradeCard.getByTestId("upgrade-impact-summary")).toBeVisible();
  await expect(firstUpgradeCard.getByTestId("upgrade-roi-summary")).toBeVisible();

  const ratePreviewToggle = firstUpgradeCard.getByText("Deep diagnostics");
  await ratePreviewToggle.click();
  const diagnosticsGrid = firstUpgradeCard.locator(".upgrade-preview-grid");
  await expect(diagnosticsGrid.getByText("Before", { exact: true })).toBeVisible();
  await expect(diagnosticsGrid.getByText("After", { exact: true })).toBeVisible();

  const workshopDisclosure = upgradesPanel.getByTestId("upgrades-group-workshop");
  const workshopStartsClosed = await workshopDisclosure.evaluate(
    (element) => !(element as HTMLDetailsElement).open,
  );
  expect(workshopStartsClosed).toBe(true);
  await workshopDisclosure.getByText("Workshop upgrades").click();
  await expect(upgradesPanel.getByTestId("upgrades-workshop-list")).toBeVisible();
});
