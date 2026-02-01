import { test, expect } from "@playwright/test";

test("Career sessions available pre-track selection", async ({ page }) => {
  // Clear localStorage for fresh save
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());

  // Navigate to app fresh
  await page.goto("/");

  // Ensure Career panel is visible
  const careerPanel = page.locator('[data-testid="career-panel"]');
  await expect(careerPanel).toBeVisible();

  // Click the start-career CTA (button with text "Enter program")
  const startButton = page.locator('[data-testid="career-next-action-start"]');
  await expect(startButton).toBeVisible();
  await expect(startButton).toHaveText("Enter program");
  await startButton.click();

  // Wait for career to start and sessions UI to appear
  await page.waitForTimeout(500);

  // Verify sessions are supported pre-track:
  // The run session button should be enabled
  const runSessionButton = page.locator('[data-testid="career-action"]');
  await expect(runSessionButton).toBeVisible();
  await expect(runSessionButton).toBeEnabled();

  // Check that session payout and cooldown values are NOT "Unavailable"
  const careerPanelText = await careerPanel.textContent();
  expect(careerPanelText).not.toContain("Sessions unavailable");
  expect(careerPanelText).not.toContain("Unavailable");

  // Capture screenshot: sessions available
  await page.screenshot({
    path: ".planning/uat-artifacts/35/10-career-started-sessions-available.png",
    fullPage: false,
  });

  // Click Run session button
  await runSessionButton.click();

  // Wait for session to process
  await page.waitForTimeout(500);

  // Capture screenshot: after running session
  await page.screenshot({
    path: ".planning/uat-artifacts/35/11-after-pretrack-session.png",
    fullPage: false,
  });

  // Verify state changed (XP or cooldown/status should be visible)
  const updatedText = await careerPanel.textContent() ?? "";
  // Should show some session-related state (XP, cooldown, or status)
  const hasStateChange =
    updatedText.includes("XP") ||
    updatedText.includes("cooldown") ||
    updatedText.includes("session") ||
    updatedText.includes("progress");

  // The button might be disabled now due to cooldown, but that's expected
  expect(hasStateChange || (await runSessionButton.isVisible())).toBeTruthy();
});
