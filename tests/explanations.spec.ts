import { expect, Page, test } from "@playwright/test";

type SeededSave = {
  state: Record<string, unknown>;
  lastSimulatedAtMs: number;
};

async function seedSave(page: Page, seeded: SeededSave) {
  await page.addInitScript(({ state, lastSimulatedAtMs }: SeededSave) => {
    const payload = {
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs,
      state,
    };
    window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
  }, seeded);
}

test("currency explain trigger opens currencies help", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("explain-currencies").click();
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Currencies/);
});

test("purchase gate explain trigger opens gates help", async ({ page }) => {
  const seededState = {
    currencyCents: 1_000_000,
    enjoymentCents: 0,
    items: { starter: 5, classic: 0, chronograph: 0, tourbillon: 0 },
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

  await seedSave(page, { state: seededState, lastSimulatedAtMs: Date.now() });

  await page.goto("/");
  await page.getByRole("tab", { name: "Vault" }).click();

  const gateBadge = page.getByTestId("purchase-gate-classic");
  await expect(gateBadge).toBeVisible();

  await gateBadge.getByTestId("explain-gates").click();
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Gates/);
});

test("stats rate breakdown disclosures render line items", async ({ page }) => {
  const seededState = {
    currencyCents: 10_000,
    enjoymentCents: 10_000,
    items: { starter: 10, classic: 0, chronograph: 0, tourbillon: 0 },
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

  await seedSave(page, { state: seededState, lastSimulatedAtMs: Date.now() });

  await page.goto("/");
  await page.getByRole("tab", { name: "Stats" }).click();

  const enjoymentBreakdown = page.getByTestId("enjoyment-rate-breakdown");
  const cashBreakdown = page.getByTestId("cash-rate-breakdown");

  await enjoymentBreakdown.locator("summary").click();
  await cashBreakdown.locator("summary").click();

  await expect(enjoymentBreakdown).toContainText(/Event/);
  await expect(cashBreakdown).toContainText(/Event|Softcap|Therapist/);
});

test("nostalgia unlock order explain trigger opens nostalgia help", async ({ page }) => {
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

  await seedSave(page, { state: seededState, lastSimulatedAtMs: Date.now() });

  await page.goto("/");
  await page.getByTestId("nostalgia-tab").click();

  await page.getByTestId("explain-nostalgia-unlocks").click();
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Nostalgia unlocks/);
});
