import { expect, test } from "@playwright/test";

test("nostalgia unlocks flow", async ({ page }) => {
  const seededState = {
    currencyCents: 5_000,
    enjoymentCents: 5_000,
    nostalgiaPoints: 1,
    nostalgiaResets: 1,
    nostalgiaUnlockedItems: [],
    nostalgiaEnjoymentEarnedCents: 0,
    nostalgiaLastGain: 0,
    nostalgiaLastPrestigedAtMs: 0,
    therapistCareer: {
      level: 1,
      xp: 0,
      nextAvailableAtMs: 0,
    },
    items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 0 },
    upgrades: {
      "polishing-tools": 0,
      "assembly-jigs": 0,
      "guild-contracts": 0,
      "archive-guides": 0,
    },
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
      "emily-birthday": { activeUntilMs: 0, nextAvailableAtMs: 0 },
      "wind-up": { activeUntilMs: 0, nextAvailableAtMs: 0 },
    },
    discoveredCatalogEntries: [],
    catalogTierUnlocks: [],
    craftingParts: 0,
    craftedBoosts: {
      "polished-tools": 0,
      "heritage-springs": 0,
      "artisan-jig": 0,
    },
  };

  await page.addInitScript(
    ({ state, lastSimulatedAtMs }) => {
      if (window.localStorage.getItem("emily-idle:save")) {
        return;
      }
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
  await page.getByTestId("nostalgia-tab").click();

  await expect(page.getByTestId("nostalgia-unlocks")).toBeVisible();
  await expect(page.getByTestId("nostalgia-unlock-buy-classic")).toBeEnabled();
  await expect(page.getByTestId("nostalgia-unlock-buy-chronograph")).toBeDisabled();

  await page.getByTestId("nostalgia-unlock-buy-classic").click();

  const unlockModal = page.getByTestId("nostalgia-unlock-modal");
  try {
    await unlockModal.waitFor({ state: "visible", timeout: 1000 });
    await unlockModal.getByRole("button", { name: "Confirm unlock" }).click();
  } catch {
    // Confirmation toggle may be disabled; no modal appears.
  }

  await expect(page.getByTestId("nostalgia-unlock-buy-classic")).toBeDisabled();
  await expect(page.getByTestId("nostalgia-unlock-refund-classic")).toBeEnabled();
  await expect(page.getByTestId("nostalgia-balance")).toHaveText(/0 Nostalgia/);

  await page.getByRole("tab", { name: "Vault" }).click();
  await expect(page.getByTestId("vault-buy-classic")).toBeEnabled();

  await expect(page.getByTestId("nostalgia-tab")).toBeVisible();
  await page.getByTestId("nostalgia-tab").click();
  await expect(page.getByTestId("nostalgia-unlocks")).toBeVisible();

  await page.reload();

  await page.getByTestId("nostalgia-tab").click();
  await expect(page.getByTestId("nostalgia-unlock-buy-classic")).toBeDisabled();
  await expect(page.getByTestId("nostalgia-unlock-refund-classic")).toBeEnabled();

  await page.getByRole("tab", { name: "Vault" }).click();
  await expect(page.getByTestId("vault-buy-classic")).toBeEnabled();
});
