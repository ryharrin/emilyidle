import { expect, test, type Locator } from "@playwright/test";

type Box = NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>;

function hasOverlap(first: Box, second: Box) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

async function expectNoOverlap(first: Locator, second: Locator) {
  await first.scrollIntoViewIfNeeded();
  await second.scrollIntoViewIfNeeded();
  const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()]);
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  if (!firstBox || !secondBox) {
    return;
  }
  expect(hasOverlap(firstBox, secondBox)).toBe(false);
}

test("nostalgia prestige flow", async ({ page }) => {
  const seededState = {
    currencyCents: 85_000,
    enjoymentCents: 32_000,
    nostalgiaPoints: 0,
    nostalgiaResets: 0,
    nostalgiaEnjoymentEarnedCents: 16_000_000,
    nostalgiaLastGain: 0,
    nostalgiaLastPrestigedAtMs: 0,
    therapistCareer: {
      level: 3,
      xp: 40,
      nextAvailableAtMs: 0,
    },
    items: { quartz: 12, automatic: 3, manual: 0, tourbillon: 0 },
    upgrades: {
      "polishing-tools": 1,
      "assembly-jigs": 0,
      "guild-contracts": 0,
      "archive-guides": 0,
    },
    unlockedMilestones: ["collector-shelf", "showcase", "atelier", "archive-curator"],
    workshopBlueprints: 2,
    workshopPrestigeCount: 1,
    workshopUpgrades: {
      "etched-ledgers": true,
      "vault-calibration": false,
      "heritage-templates": false,
      "automation-blueprints": false,
    },
    maisonHeritage: 1,
    maisonReputation: 1,
    maisonUpgrades: {
      "atelier-charter": true,
      "heritage-loom": false,
      "global-vitrine": false,
    },
    maisonLines: {
      "atelier-line": true,
      "heritage-line": false,
      "complication-line": false,
    },
    achievementUnlocks: [],
    eventStates: {
      "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 },
      "emily-birthday": { activeUntilMs: 0, nextAvailableAtMs: 0 },
      "wind-up": { activeUntilMs: 0, nextAvailableAtMs: 0 },
    },
    discoveredCatalogEntries: [],
    catalogTierUnlocks: ["quartz", "automatic"],
    craftingParts: 5,
    craftedBoosts: {
      "polished-tools": 1,
      "heritage-springs": 0,
      "artisan-jig": 0,
    },
  };

  await page.addInitScript(
    ({ state, lastSimulatedAtMs }) => {
      // Freeze the RAF-driven sim loop so currency/enjoyment values stay stable for comparisons.
      window.requestAnimationFrame = (() => 0) as unknown as typeof window.requestAnimationFrame;
      window.cancelAnimationFrame = (() => {}) as unknown as typeof window.cancelAnimationFrame;

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
  await page.getByRole("tab", { name: "Nostalgia" }).click();

  await expect(page.getByTestId("nostalgia-progress")).toBeVisible();
  await expect(page.getByTestId("nostalgia-preview")).toBeVisible();
  await expect(page.getByTestId("nostalgia-reset-matrix")).toBeVisible();
  await expect(page.getByTestId("nostalgia-reset-matrix")).toContainText("What resets");
  await expect(page.getByTestId("nostalgia-reset-matrix")).toContainText("What stays");

  await expect(page.getByTestId("nostalgia-prestige-summary")).toBeVisible();

  const currencyBefore = await page.locator("#currency").innerText();
  const enjoymentBefore = await page.locator("#enjoyment").innerText();

  await page.getByTestId("nostalgia-prestige").evaluate((button) => {
    (button as HTMLButtonElement).click();
  });
  await expect(page.getByTestId("nostalgia-modal")).toBeVisible();
  await expect(page.getByTestId("nostalgia-reset-matrix-modal")).toBeVisible();

  await page.getByRole("button", { name: "Keep current run" }).evaluate((button) => {
    (button as HTMLButtonElement).click();
  });
  await expect(page.getByTestId("nostalgia-modal")).toHaveCount(0);
  await expect(page.locator("#currency")).toHaveText(currencyBefore);
  await expect(page.locator("#enjoyment")).toHaveText(enjoymentBefore);

  await page.getByTestId("nostalgia-prestige").evaluate((button) => {
    (button as HTMLButtonElement).click();
  });
  await expect(page.getByTestId("nostalgia-modal")).toBeVisible();
  await page.getByRole("button", { name: "Confirm reset" }).evaluate((button) => {
    (button as HTMLButtonElement).click();
  });

  await expect(page.getByTestId("prestige-onboarding-modal")).toBeVisible();
  await page.getByRole("button", { name: "Keep current tab" }).click();

  await expect(page.getByTestId("nostalgia-results")).toBeVisible();
  await expect(page.getByTestId("nostalgia-floating-delta")).toBeVisible({ timeout: 5_000 });
  const toastStack = page.getByTestId("toast-stack");
  const dismissButton = page.getByRole("button", {
    name: /dismiss nostalgia prestige toast/i,
  });
  const nostalgiaToast = toastStack.getByTestId("toast-item").filter({ has: dismissButton });
  await expect(toastStack).toBeVisible();
  await expect(nostalgiaToast).toContainText(/\+\d+ Nostalgia/);
  const unlockButton = page.getByRole("button", { name: /^Unlock \(1\)$/ }).first();
  if (await unlockButton.isVisible().catch(() => false)) {
    await expectNoOverlap(toastStack, unlockButton);
  }
  await dismissButton.click();
  await expect(page.getByRole("button", { name: /dismiss nostalgia prestige toast/i })).toHaveCount(
    0,
  );
  await expect(nostalgiaToast).toHaveCount(0);

  const openUnlockStore = page.getByTestId("nostalgia-results-open-unlock-store");
  await expect(openUnlockStore).toBeVisible();
  await openUnlockStore.click();
  await expect(page.getByTestId("nostalgia-unlocks")).toBeVisible();

  const finalSave = await page.evaluate(() => {
    const raw = window.localStorage.getItem("emily-idle:save");
    return raw ? JSON.parse(raw).state : null;
  });
  expect(finalSave?.currencyCents).toBe(0);
  expect(finalSave?.enjoymentCents).toBe(0);
});
