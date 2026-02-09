import { expect, test } from "@playwright/test";
import { openCareerProgression, selectCareerView } from "./helpers/careerProgression";
import { clickLocatorSafely } from "./helpers/interactions";

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
    await expect(page.getByTestId("career-tree")).toBeVisible();

    const pointsLabel = page.getByTestId("career-tree-points");
    const beforePointsText = await pointsLabel.innerText();
    const beforePoints = Number(beforePointsText.replace(/[^0-9]/g, ""));
    expect(beforePoints).toBeGreaterThan(0);

    const foundational = page.getByTestId("career-tree-node-core-foundation");
    await expect(foundational).toBeVisible();
    await clickLocatorSafely(foundational);
    await expect(page.getByTestId("career-upgrade-modal")).toBeVisible();
    await page.getByTestId("career-upgrade-spend").click();
    await expect(page.getByTestId("career-upgrade-modal")).toBeHidden();
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
    const trackOption = page.getByTestId("career-choice-option-private-practice");
    await trackOption.scrollIntoViewIfNeeded();
    await expect(trackOption).toBeVisible();
    await clickLocatorSafely(trackOption);
    const lockedTrackLabel = page.getByTestId("career-choice-locked-licensed-associate");
    if (!(await lockedTrackLabel.isVisible().catch(() => false))) {
      await trackOption.evaluate((element) => {
        (element as HTMLButtonElement).click();
      });
    }
    await expect(lockedTrackLabel).toBeVisible();

    await selectCareerView(page, "upgrades");
    await expect(page.getByTestId("career-tree-node-private-intake")).toBeVisible();
  });
});
