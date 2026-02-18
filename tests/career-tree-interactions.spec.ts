import { expect, test, type Page } from "@playwright/test";
import { openCareerProgression, selectCareerView } from "./helpers/careerProgression";
import { clickLocatorSafely } from "./helpers/interactions";

function visibleByTestId(page: Page, testId: string) {
  return page.getByTestId(testId).first();
}

test.describe("career upgrades tree interactions", () => {
  test("spend point, respec refunds, and track section appears after choosing track", async ({
    page,
  }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 0,
      therapistCareer: {
        careerStartId: "phd-program",
        salaryActiveUntilMs: Date.now() + 60_000,
        level: 3,
        xp: 0,
        nextAvailableAtMs: 0,
        activeTrackId: null,
        primaryTrackId: null,
        modalityId: null,
        operatingStyleId: null,
        expansionFocusId: null,
        pointsAvailable: 25,
        spentNodes: {},
        freeSessionAvailable: true,
      },
    };

    await page.addInitScript(
      ({ state, lastSimulatedAtMs }) => {
        (window as unknown as { __EMILY_IDLE_TEST_MODE__?: boolean }).__EMILY_IDLE_TEST_MODE__ =
          true;

        const payload = {
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs,
          state,
        };
        window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
      },
      { state: seededState, lastSimulatedAtMs: Date.now() },
    );

    await page.goto("/");
    await openCareerProgression(page);
    await selectCareerView(page, "upgrades");
    const tree = page.getByTestId("career-tree");
    await expect(tree).toBeVisible();
    await expect(page.getByTestId("career-view-upgrades")).toHaveClass(/career-view-active/);

    const pointsLabel = page.getByTestId("career-tree-points");
    const beforePointsText = await pointsLabel.innerText();
    const beforePoints = Number(beforePointsText.replace(/[^0-9]/g, ""));
    expect(beforePoints).toBeGreaterThan(0);

    const foundational = page.getByTestId("career-tree-node-core-foundation");
    await expect(foundational).toBeVisible();
    await clickLocatorSafely(foundational);
    await expect(page.getByTestId("career-upgrade-modal")).toBeVisible();
    await page.getByTestId("career-upgrade-spend").click();
    await expect(page.getByTestId("career-upgrade-modal")).toBeHidden({ timeout: 15_000 });
    await expect(foundational).toHaveClass(/career-tree-spent/);

    const afterSpendText = await pointsLabel.innerText();
    const afterSpendPoints = Number(afterSpendText.replace(/[^0-9]/g, ""));
    expect(afterSpendPoints).toBeLessThan(beforePoints);

    const respec = page.getByTestId("career-tree-respec");
    await expect(respec).toBeEnabled();
    await clickLocatorSafely(respec);
    const afterRespecText = await pointsLabel.innerText();
    const afterRespecPoints = Number(afterRespecText.replace(/[^0-9]/g, ""));
    expect(afterRespecPoints).toEqual(beforePoints);
    await expect(respec).toBeDisabled();
    await expect(foundational).not.toHaveClass(/career-tree-spent/);

    // Track nodes do not render until track is chosen.
    await expect(page.getByTestId("career-tree-node-private-intake")).toHaveCount(0);

    // Choose a primary track via stages view.
    await selectCareerView(page, "stages");
    await expect(page.getByTestId("career-view-stages")).toHaveClass(/career-view-active/);
    const trackOption = page.getByTestId("career-choice-option-private-practice");
    await trackOption.scrollIntoViewIfNeeded();
    await expect(trackOption).toBeVisible();
    await clickLocatorSafely(trackOption);
    await expect(page.getByTestId("career-permanent-choice-confirm")).toBeVisible();
    await clickLocatorSafely(page.getByTestId("career-permanent-choice-confirm"));
    // Wait for state transition to complete
    await page.waitForTimeout(500);
    const lockedTrackLabel = visibleByTestId(page, "career-choice-locked-licensed-associate");
    await expect(lockedTrackLabel).toBeVisible({ timeout: 15_000 });

    await selectCareerView(page, "upgrades");
    await expect(page.getByTestId("career-view-upgrades")).toHaveClass(/career-view-active/);
    await expect(page.getByTestId("career-tree-node-private-intake")).toBeVisible();
  });
});
