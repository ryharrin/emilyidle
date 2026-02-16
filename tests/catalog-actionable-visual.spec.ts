import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { CATALOG_ENTRIES } from "../src/game/catalog";
import { createInitialState } from "../src/game/state";
import { seedStorage } from "./helpers/storageSeed";

const baseState = createInitialState();
const seededState = {
  ...baseState,
  currencyCents: 1_000,
  enjoymentCents: 500_000,
  therapistCareer: {
    ...baseState.therapistCareer,
    careerStartId: "phd-program",
    activeTrackId: "private-practice",
    primaryTrackId: "private-practice",
  },
  unlockedMilestones: ["collector-shelf", "showcase", "atelier"],
  discoveredCatalogEntries: CATALOG_ENTRIES.map((entry) => entry.id),
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
  await page.goto("/");
  const catalogTab = page.getByRole("tab", { name: "Catalog" });
  await catalogTab.click();
  await expect(page.getByTestId("catalog-grid")).toBeVisible();
  const filterToggle = page.getByTestId("catalog-filter-toggle");
  if ((await filterToggle.getAttribute("aria-expanded")) !== "true") {
    await filterToggle.click();
  }
  await page.getByTestId("catalog-quick-preset").selectOption("all");

  const highlightedButton = page.locator('[data-testid^="catalog-buy-"]').first();
  await expect(highlightedButton).toBeVisible();
  const highlightedCard = highlightedButton.locator(
    'xpath=ancestor::article[@data-testid="catalog-card"][1]',
  );
  await expect(highlightedCard).toBeVisible();

  const nonActionableGate = page.locator('[data-testid^="catalog-gate-"]').first();
  await expect(nonActionableGate).toBeVisible();
  const nonActionableCard = nonActionableGate.locator(
    'xpath=ancestor::article[@data-testid="catalog-card"][1]',
  );
  await expect(nonActionableCard).toBeVisible();

  const highlightedStyles = await highlightedCard.evaluate(getCardStyles);
  const nonActionableStyles = await nonActionableCard.evaluate(getCardStyles);

  return { highlightedStyles, nonActionableStyles, highlightedCard, nonActionableCard };
};

test("catalog actionable styling differs in dark and light themes", async ({ page }) => {
  await seedStorage(page, {
    clearLocalStorage: true,
    disableAnimationFrame: true,
    save: {
      state: seededState,
      version: 4,
    },
    settings: seededSettings,
  });

  const { highlightedStyles, nonActionableStyles, highlightedCard, nonActionableCard } =
    await getCatalogCardStyles(page);

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

  const lightStyles = await getCatalogCardStyles(page);
  expect(lightStyles.highlightedStyles.opacity).toBe("1");
  expect(lightStyles.highlightedStyles.boxShadow).not.toBe("none");
  expect(Number(lightStyles.nonActionableStyles.opacity)).toBeLessThan(1);
  expect(lightStyles.nonActionableStyles.boxShadow).toBe("none");
});
