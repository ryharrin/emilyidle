import { expect, test } from "@playwright/test";

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
    items: { starter: 12, classic: 3, chronograph: 0, tourbillon: 0 },
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
    catalogTierUnlocks: [],
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

  await expect(page.getByTestId("nostalgia-prestige-summary")).toBeVisible();

  const currencyBefore = await page.locator("#currency").innerText();
  const enjoymentBefore = await page.locator("#enjoyment").innerText();

  await page.getByTestId("nostalgia-prestige").click();
  await expect(page.getByTestId("nostalgia-modal")).toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByTestId("nostalgia-modal")).toHaveCount(0);
  await expect(page.locator("#currency")).toHaveText(currencyBefore);
  await expect(page.locator("#enjoyment")).toHaveText(enjoymentBefore);

  await page.getByTestId("nostalgia-prestige").click();
  await expect(page.getByTestId("nostalgia-modal")).toBeVisible();
  await page.getByRole("button", { name: "Confirm reset" }).click();

  await expect(page.getByTestId("prestige-onboarding-modal")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await expect(page.getByTestId("nostalgia-results")).toBeVisible();
  await expect(page.locator("#currency")).toHaveText(/\$0/);
  await expect(page.locator("#enjoyment")).toHaveText(/\$0/);
});
