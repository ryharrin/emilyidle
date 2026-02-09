import { expect, type Locator } from "@playwright/test";

export async function clickLocatorSafely(locator: Locator) {
  await expect(locator).toBeVisible();
  await locator.scrollIntoViewIfNeeded().catch(() => {});

  const clickTimeoutMs = 4_000;

  try {
    await locator.click({ timeout: clickTimeoutMs });
    return;
  } catch {
    // Fall through to stronger click strategies used for mobile overlays.
  }

  try {
    await locator.click({ force: true, timeout: clickTimeoutMs });
    return;
  } catch {
    // Fall through to DOM-dispatched click as a final fallback.
  }

  await locator.evaluate((element) => {
    (element as HTMLButtonElement).click();
  });
}

export async function findFirstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible().catch(() => false)) {
      return candidate;
    }
  }

  return null;
}
