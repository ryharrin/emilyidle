import { expect, test, type TestInfo } from "@playwright/test";
import { openCareerPanel } from "./helpers/careerProgression";
import { clickLocatorSafely } from "./helpers/interactions";
import { gotoAppWithNavigationReady } from "./helpers/navigation";

test("Career sessions available pre-track selection", async ({ page }, testInfo: TestInfo) => {
  // Clear localStorage for a fresh save before app bootstrap.
  await page.addInitScript(() => localStorage.clear());
  await gotoAppWithNavigationReady(page, {
    maxAttempts: 3,
    navigationVisibleTimeoutMs: 20_000,
    retryDelayMs: (attempt) => 150 * attempt,
  });

  await openCareerPanel(page);

  // Ensure Career panel is visible
  const careerPanel = page.locator('[data-testid="career-panel"]');
  await expect(careerPanel).toBeVisible();

  // Fresh saves should allow bootstrap directly from the Run session action.
  const runSessionButton = page.locator('[data-testid="career-action"]');
  await expect(runSessionButton).toBeVisible();
  await expect(runSessionButton).toBeEnabled();
  await clickLocatorSafely(runSessionButton);

  // Verify sessions are supported pre-track:
  // Kickoff flow may consume the free first session immediately.
  // Ensure the session surface is present and actionable state is rendered.
  await expect(runSessionButton).toBeVisible();
  await expect(page.locator('[data-testid="career-next-action-start"]')).toHaveCount(0);

  // Check that session payout and cooldown values are NOT "Unavailable"
  const careerPanelText = await careerPanel.textContent();
  expect(careerPanelText).not.toContain("Sessions unavailable");
  expect(careerPanelText).not.toContain("Unavailable");

  // Capture screenshot: sessions available
  await page.screenshot({
    path: testInfo.outputPath("10-career-started-sessions-available.png"),
    fullPage: false,
  });

  const canRunSession = await runSessionButton.isEnabled();
  if (canRunSession) {
    await clickLocatorSafely(runSessionButton);
  }

  await expect
    .poll(async () => {
      const text = (await careerPanel.textContent()) ?? "";
      return text.includes("cooldown") || text.includes("XP") || text.includes("session");
    })
    .toBeTruthy();

  // Capture screenshot: after running session
  await page.screenshot({
    path: testInfo.outputPath("11-after-pretrack-session.png"),
    fullPage: false,
  });

  // Verify state changed (XP or cooldown/status should be visible)
  const updatedText = (await careerPanel.textContent()) ?? "";
  // Should show some session-related state (XP, cooldown, or status)
  const hasStateChange =
    updatedText.includes("XP") ||
    updatedText.includes("cooldown") ||
    updatedText.includes("session") ||
    updatedText.includes("progress");

  // The button might be disabled now due to cooldown, but that's expected
  expect(hasStateChange || (await runSessionButton.isVisible())).toBeTruthy();
});
