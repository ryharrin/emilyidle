import { expect, test } from "@playwright/test";

test("fresh saves land on Career by default", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");

  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  const careerTab = tabList.getByRole("tab", { name: "Career" });

  await expect(careerTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("career-panel")).toBeVisible();
});

test("deep links do not overwrite last-tab persistence for existing saves", async ({ page }) => {
  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { starter: 15, classic: 0, chronograph: 1, tourbillon: 0 },
    upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
    unlockedMilestones: ["showcase"],
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
      window.localStorage.clear();
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs,
          state,
        }),
      );
      window.localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "save" }));
    },
    { state: seededState, lastSimulatedAtMs: Date.now() },
  );

  await page.goto("/");

  const tabList = page.getByRole("tablist", { name: "Primary navigation" });
  const saveTab = tabList.getByRole("tab", { name: "Settings" });
  const careerTab = tabList.getByRole("tab", { name: "Career" });
  const vaultTab = tabList.getByRole("tab", { name: "Vault" });

  await expect(saveTab).toHaveAttribute("aria-selected", "true");

  await page.goto("/?tab=career");
  await expect(careerTab).toHaveAttribute("aria-selected", "true");

  await page.goto("/");
  await expect(saveTab).toHaveAttribute("aria-selected", "true");

  await page.goto("/?tab=catalog");
  await expect(vaultTab).toHaveAttribute("aria-selected", "true");

  const stored = await page.evaluate(() => window.localStorage.getItem("emily-idle:navigation"));
  expect(stored ? JSON.parse(stored) : null).toEqual({ lastTabId: "save" });
});
