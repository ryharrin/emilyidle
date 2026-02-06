import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const seededState = {
  currencyCents: 5_000_000_00,
  enjoymentCents: 5_000_000_00,
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

const seededSettings = {
  themeMode: "system",
  hideCompletedAchievements: false,
  hiddenTabs: [],
  coachmarksDismissed: {},
  confirmNostalgiaUnlocks: true,
};

const getCardStyles = async (element: HTMLElement) => {
  const computed = window.getComputedStyle(element);
  return {
    opacity: computed.opacity,
    boxShadow: computed.boxShadow,
  };
};

const getCatalogCardStyles = async (page: Page) => {
  await page.goto("http://127.0.0.1:5177/emilyidle/");
  const catalogTab = page.getByRole("tab", { name: "Catalog" });
  await catalogTab.click();
  await expect(page.getByTestId("catalog-grid")).toBeVisible();

  const actionableButton = page.locator('[data-testid^="catalog-buy-"]').first();
  const actionableCard = actionableButton.locator(
    'xpath=ancestor::article[@data-testid="catalog-card"][1]',
  );
  await expect(actionableCard).toBeVisible();

  const nonActionableGate = page.locator('[data-testid^="catalog-gate-"]').first();
  const nonActionableCard = nonActionableGate.locator(
    'xpath=ancestor::article[@data-testid="catalog-card"][1]',
  );
  await expect(nonActionableCard).toBeVisible();

  const actionableStyles = await actionableCard.evaluate(getCardStyles);
  const nonActionableStyles = await nonActionableCard.evaluate(getCardStyles);

  return { actionableStyles, nonActionableStyles, actionableCard, nonActionableCard };
};

test("catalog actionable styling differs in dark and light themes", async ({ page }) => {
  await page.addInitScript(
    ({ state, lastSimulatedAtMs, settings }) => {
      window.requestAnimationFrame = (() => 0) as unknown as typeof window.requestAnimationFrame;
      window.cancelAnimationFrame = (() => {}) as unknown as typeof window.cancelAnimationFrame;

      window.localStorage.clear();

      const payload = {
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs,
        state,
      };
      window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
      window.localStorage.setItem("emily-idle:settings", JSON.stringify(settings));
    },
    { state: seededState, lastSimulatedAtMs: Date.now(), settings: seededSettings },
  );

  const { actionableStyles, nonActionableStyles, actionableCard, nonActionableCard } =
    await getCatalogCardStyles(page);

  expect(actionableStyles.opacity).toBe("1");
  expect(actionableStyles.boxShadow).not.toBe("none");
  expect(Number(nonActionableStyles.opacity)).toBeLessThan(1);
  expect(nonActionableStyles.boxShadow).toBe("none");

  await expect(actionableCard).toHaveClass(/catalog-actionable/);
  await expect(nonActionableCard).toHaveClass(/catalog-nonactionable/);

  const viewport = page.viewportSize();
  if (!viewport || viewport.width >= 720) {
    const preview = actionableCard.locator('[data-testid^="catalog-preview-"]').first();
    await expect(preview).toHaveCSS("opacity", "0");
    await actionableCard.hover();
    await expect(preview).toHaveCSS("opacity", "1");
    await page.mouse.move(0, 0);
  }

  await page.evaluate((settings) => {
    const nextSettings = { ...settings, themeMode: "light" };
    window.localStorage.setItem("emily-idle:settings", JSON.stringify(nextSettings));
  }, seededSettings);

  await page.reload();

  const lightStyles = await getCatalogCardStyles(page);
  expect(lightStyles.actionableStyles.opacity).toBe("1");
  expect(lightStyles.actionableStyles.boxShadow).not.toBe("none");
  expect(Number(lightStyles.nonActionableStyles.opacity)).toBeLessThan(1);
  expect(lightStyles.nonActionableStyles.boxShadow).toBe("none");
});
