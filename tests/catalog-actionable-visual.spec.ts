import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { createInitialState, getWatchModels } from "../src/game/state";

function getModelIdForTier(tierId: string): string {
  const model = getWatchModels().find((entry) => entry.tierId === tierId);
  if (!model) {
    throw new Error(`Missing model for tier: ${tierId}`);
  }
  return model.id;
}

const highlightedModelId = getModelIdForTier("quartz");
const seededState = {
  ...createInitialState(),
  currencyCents: 5_000_000_00,
  enjoymentCents: 5_000_000_00,
  discoveredCatalogEntries: [highlightedModelId],
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

const getCatalogCardStyles = async (page: Page, highlightedEntryId: string) => {
  await page.goto("http://127.0.0.1:5177/emilyidle/");
  const catalogTab = page.getByRole("tab", { name: "Catalog" });
  await catalogTab.click();
  await expect(page.getByTestId("catalog-grid")).toBeVisible();
  const filterToggle = page.getByTestId("catalog-filter-toggle");
  if ((await filterToggle.getAttribute("aria-expanded")) !== "true") {
    await filterToggle.click();
  }
  await page.getByTestId("catalog-quick-preset").selectOption("all");

  const highlightedButton = page.getByTestId(`catalog-buy-${highlightedEntryId}`);
  const highlightedCard = highlightedButton.locator(
    'xpath=ancestor::article[@data-testid="catalog-card"][1]',
  );
  await expect(highlightedCard).toBeVisible();
  await expect(highlightedCard).toContainText("0 owned");

  const nonActionableGate = page.locator('[data-testid^="catalog-gate-"]').first();
  const nonActionableCard = nonActionableGate.locator(
    'xpath=ancestor::article[@data-testid="catalog-card"][1]',
  );
  await expect(nonActionableCard).toBeVisible();

  const highlightedStyles = await highlightedCard.evaluate(getCardStyles);
  const nonActionableStyles = await nonActionableCard.evaluate(getCardStyles);

  return { highlightedStyles, nonActionableStyles, highlightedCard, nonActionableCard };
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

  const { highlightedStyles, nonActionableStyles, highlightedCard, nonActionableCard } =
    await getCatalogCardStyles(page, highlightedModelId);

  expect(highlightedStyles.opacity).toBe("1");
  expect(highlightedStyles.boxShadow).not.toBe("none");
  expect(Number(nonActionableStyles.opacity)).toBeLessThan(1);
  expect(nonActionableStyles.boxShadow).toBe("none");

  await expect(highlightedCard).toHaveClass(/catalog-actionable/);
  await expect(nonActionableCard).toHaveClass(/catalog-nonactionable/);
  await expect(nonActionableCard).not.toHaveClass(/catalog-actionable/);

  await expect(highlightedCard.locator('[data-testid^="catalog-preview-"]')).toHaveCount(0);

  await page.evaluate((settings) => {
    const nextSettings = { ...settings, themeMode: "light" };
    window.localStorage.setItem("emily-idle:settings", JSON.stringify(nextSettings));
  }, seededSettings);

  await page.reload();

  const lightStyles = await getCatalogCardStyles(page, highlightedModelId);
  expect(lightStyles.highlightedStyles.opacity).toBe("1");
  expect(lightStyles.highlightedStyles.boxShadow).not.toBe("none");
  expect(Number(lightStyles.nonActionableStyles.opacity)).toBeLessThan(1);
  expect(lightStyles.nonActionableStyles.boxShadow).toBe("none");
});
