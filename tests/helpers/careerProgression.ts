import { expect, type Page } from "@playwright/test";
import { clickLocatorSafely } from "./interactions";

async function isDeepDetailsOpen(page: Page): Promise<boolean> {
  const details = page.getByTestId("career-deep-details");
  if (!(await details.isVisible().catch(() => false))) {
    return false;
  }

  return details.evaluate((element) => (element as HTMLDetailsElement).open);
}

export async function openCareerPanel(page: Page) {
  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  const careerTab = tabList.getByRole("tab", { name: "Career" });
  await expect(careerTab).toBeVisible();
  await clickLocatorSafely(careerTab);
  await expect(page.getByTestId("career-panel")).toBeVisible();
}

export async function openCareerProgression(page: Page) {
  await openCareerPanel(page);

  const deepDetails = page.getByTestId("career-deep-details");
  const deepDetailsToggle = page.getByTestId("career-deep-details-toggle");
  const viewSwitch = page.getByTestId("career-view-switch");

  if (!(await isDeepDetailsOpen(page))) {
    const railAction = page.getByTestId("career-mobile-now-rail-action");
    if (await railAction.isVisible().catch(() => false)) {
      const actionLabel = (await railAction.textContent().catch(() => ""))?.toLowerCase() ?? "";
      if (actionLabel.includes("progression")) {
        await clickLocatorSafely(railAction);
      }
    }
  }

  if (!(await isDeepDetailsOpen(page))) {
    await clickLocatorSafely(deepDetailsToggle);
    const opened = await deepDetails
      .evaluate((element) => (element as HTMLDetailsElement).open)
      .catch(() => false);
    if (!opened) {
      await deepDetails.evaluate((element) => {
        (element as HTMLDetailsElement).open = true;
      });
    }
  }

  await expect(deepDetails).toHaveJSProperty("open", true);
  await expect(viewSwitch).toBeVisible({ timeout: 15_000 });
}

export async function selectCareerView(page: Page, view: "stages" | "upgrades") {
  await openCareerProgression(page);
  const viewButton = page.getByTestId(
    view === "stages" ? "career-view-stages" : "career-view-upgrades",
  );
  await clickLocatorSafely(viewButton);
  await expect(viewButton).toHaveClass(/career-view-active/);
}
