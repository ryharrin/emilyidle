import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const seedSave = async (page: Page, state: Record<string, unknown>) => {
  await page.addInitScript(
    ({
      seededState,
      lastSimulatedAtMs,
    }: {
      seededState: Record<string, unknown>;
      lastSimulatedAtMs: number;
    }) => {
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
};

test.describe("help entry point", () => {
  test("opens help, switches section, and remembers last view", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("help-open").click();
    await expect(page.getByTestId("help-modal")).toBeVisible();

    await page.getByRole("button", { name: "Prestige" }).click();
    await expect(page.getByRole("heading", { name: "Prestige" })).toBeVisible();

    await page.getByTestId("help-close").click();
    await expect(page.locator('[data-testid="help-modal"]')).toHaveCount(0);

    await page.getByTestId("help-open").click();
    await expect(page.getByTestId("help-modal")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Prestige" })).toBeVisible();
  });

  test("help button works after switching tabs", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
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
    await page.getByTestId("help-open").click();
    await expect(page.getByTestId("help-modal")).toBeVisible();
  });
});

test.describe("icon cues", () => {
  test("lock icon renders in enjoyment gate", async ({ page }) => {
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

    await seedSave(page, seededState);
    await page.goto("/");
    await page.getByRole("tab", { name: "Vault" }).click();

    const gate = page.getByTestId("purchase-gate-classic");
    await expect(gate).toBeVisible();
    await expect(gate.locator("svg")).toHaveCount(1);
  });

  test("prestige icon renders on atelier reset button", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
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

    const workshopPanel = page.getByTestId("workshop-panel");
    await expect(workshopPanel).toBeVisible();

    const resetButton = workshopPanel.getByRole("button", { name: "Reset atelier" });
    await expect(resetButton).toBeVisible();
    await expect(resetButton.locator("svg")).toHaveCount(1);
  });
});
