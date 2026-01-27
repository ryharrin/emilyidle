import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function seedSave(page: Page, state: unknown) {
  await page.addInitScript(
    ({ seededState, lastSimulatedAtMs }: { seededState: unknown; lastSimulatedAtMs: number }) => {
      // Freeze the RAF-driven sim loop so currency/enjoyment values stay stable for comparisons.
      window.requestAnimationFrame = (() => 0) as unknown as typeof window.requestAnimationFrame;
      window.cancelAnimationFrame = (() => {}) as unknown as typeof window.cancelAnimationFrame;

      const payload = {
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs,
        state: seededState,
      };
      window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
    },
    { seededState: state, lastSimulatedAtMs: Date.now() },
  );
}

test("atelier back-out keeps stats, confirm shows onboarding", async ({ page }) => {
  const seededState = {
    currencyCents: 12_345,
    enjoymentCents: 800_000,
    items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 6 },
    upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
    unlockedMilestones: [],
    workshopBlueprints: 0,
    workshopPrestigeCount: 0,
    workshopUpgrades: {
      "etched-ledgers": false,
      "vault-calibration": false,
      "heritage-templates": false,
      "automation-blueprints": false,
    },
    maisonHeritage: 0,
    maisonReputation: 0,
    maisonUpgrades: {
      "atelier-charter": false,
      "heritage-loom": false,
      "global-vitrine": false,
    },
    maisonLines: {
      "atelier-line": false,
      "heritage-line": false,
      "complication-line": false,
    },
    achievementUnlocks: [],
    eventStates: {
      "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 },
    },
    discoveredCatalogEntries: [],
    catalogTierUnlocks: [],
  };

  await seedSave(page, seededState);
  await page.goto("/");

  await page.getByRole("tab", { name: "Atelier" }).click();
  await expect(page.getByTestId("workshop-panel")).toBeVisible();

  const currencyBefore = await page.locator("#currency").innerText();
  const enjoymentBefore = await page.locator("#enjoyment").innerText();

  await page.getByRole("button", { name: "Reset atelier" }).click();
  await expect(page.getByTestId("workshop-prestige-summary")).toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator("#currency")).toHaveText(currencyBefore);
  await expect(page.locator("#enjoyment")).toHaveText(enjoymentBefore);

  await page.getByRole("button", { name: "Reset atelier" }).click();
  await page.getByRole("button", { name: "Confirm reset" }).click();

  await expect(page.getByTestId("prestige-onboarding-modal")).toBeVisible();
  await expect(page.locator("#currency")).toHaveText(/\$0/);
  await expect(page.locator("#enjoyment")).toHaveText(/\$0/);
});

test("maison back-out keeps stats, confirm shows onboarding", async ({ page }) => {
  const seededState = {
    currencyCents: 23_456,
    enjoymentCents: 4_000_000,
    items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 6 },
    upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
    unlockedMilestones: [],
    workshopBlueprints: 3,
    workshopPrestigeCount: 1,
    workshopUpgrades: {
      "etched-ledgers": false,
      "vault-calibration": false,
      "heritage-templates": false,
      "automation-blueprints": false,
    },
    maisonHeritage: 0,
    maisonReputation: 0,
    maisonUpgrades: {
      "atelier-charter": false,
      "heritage-loom": false,
      "global-vitrine": false,
    },
    maisonLines: {
      "atelier-line": false,
      "heritage-line": false,
      "complication-line": false,
    },
    achievementUnlocks: [],
    eventStates: {
      "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 },
    },
    discoveredCatalogEntries: [],
    catalogTierUnlocks: [],
  };

  await seedSave(page, seededState);
  await page.goto("/");

  await page.getByRole("tab", { name: "Maison" }).click();
  await expect(page.getByTestId("maison-panel")).toBeVisible();

  const currencyBefore = await page.locator("#currency").innerText();
  const enjoymentBefore = await page.locator("#enjoyment").innerText();

  await page.getByRole("button", { name: "Prestige atelier" }).click();
  await expect(page.getByTestId("maison-prestige-summary")).toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator("#currency")).toHaveText(currencyBefore);
  await expect(page.locator("#enjoyment")).toHaveText(enjoymentBefore);

  await page.getByRole("button", { name: "Prestige atelier" }).click();
  await page.getByRole("button", { name: "Confirm prestige" }).click();

  await expect(page.getByTestId("prestige-onboarding-modal")).toBeVisible();
});
