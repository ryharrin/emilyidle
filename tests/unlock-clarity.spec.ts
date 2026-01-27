import { expect, test } from "@playwright/test";

test("vault shows next unlocks panel for hidden systems", async ({ page }) => {
  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { starter: 0, classic: 0, chronograph: 0, tourbillon: 0 },
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

  await page.addInitScript(
    ({ state, lastSimulatedAtMs }) => {
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

  await expect(page.getByTestId("next-unlocks")).toBeVisible();
  await expect(page.getByTestId("next-unlock-career")).toBeVisible();
  await expect(page.getByTestId("next-unlock-cta-career")).toBeVisible();

  await expect(page.getByTestId("locked-item-hint-classic")).toBeVisible();
  await expect(page.getByTestId("locked-upgrade-hint-assembly-jigs")).toBeVisible();
});

test("catalog empty state CTA returns to vault", async ({ page }) => {
  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { starter: 150, classic: 0, chronograph: 0, tourbillon: 0 },
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

  await page.addInitScript(
    ({ state, lastSimulatedAtMs }) => {
      // Playwright runs the real RAF-driven runtime loop (MODE !== "test").
      // If the sim ticks, owned items auto-discover catalog entries, which removes the empty state.
      // Freeze the runtime for this test to keep `discoveredCatalogEntries` empty and deterministic.
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
  await page.getByRole("tab", { name: "Catalog" }).click();

  await expect(page.getByTestId("catalog-discovered-empty")).toBeVisible();
  await page.getByRole("button", { name: "Go to Vault" }).click();

  await expect(page.getByRole("tab", { name: "Vault" })).toHaveAttribute("aria-selected", "true");
});
