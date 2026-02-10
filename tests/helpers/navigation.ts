import { expect, type Page } from "@playwright/test";

type RetryDelayMs = number | ((attempt: number) => number);

export type GotoAppWithNavigationReadyOptions = {
  path?: string;
  maxAttempts?: number;
  gotoTimeoutMs?: number;
  navigationVisibleTimeoutMs?: number;
  retryBlankTimeoutMs?: number;
  retryDelayMs?: RetryDelayMs;
};

function resolveRetryDelayMs(retryDelayMs: RetryDelayMs, attempt: number) {
  return typeof retryDelayMs === "function" ? retryDelayMs(attempt) : retryDelayMs;
}

export async function gotoAppWithNavigationReady(
  page: Page,
  options: GotoAppWithNavigationReadyOptions = {},
) {
  const {
    path = "/",
    maxAttempts = 2,
    gotoTimeoutMs = 30_000,
    navigationVisibleTimeoutMs = 15_000,
    retryBlankTimeoutMs = 10_000,
    retryDelayMs = 120,
  } = options;

  let lastError: unknown = new Error("Failed to navigate to app");

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await page.goto(path, { waitUntil: "domcontentloaded", timeout: gotoTimeoutMs });
      await expect(page.getByRole("tablist", { name: "Primary navigation" })).toBeVisible({
        timeout: navigationVisibleTimeoutMs,
      });
      return;
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) {
        break;
      }

      await page
        .goto("about:blank", { waitUntil: "commit", timeout: retryBlankTimeoutMs })
        .catch(() => {});
      const retryDelay = resolveRetryDelayMs(retryDelayMs, attempt);
      if (retryDelay > 0) {
        await page.waitForTimeout(retryDelay);
      }
    }
  }

  throw lastError;
}
