import { expect, test, type Page } from "@playwright/test";
import { CATALOG_ENTRIES } from "../src/game/catalog";
import { openCatalogTab, switchCatalogToOwned } from "./helpers/catalogFilters";
import { clickLocatorSafely } from "./helpers/interactions";
import { seedStorage } from "./helpers/storageSeed";

async function clickExplainTrigger(page: Page, testId: string) {
  if (testId.startsWith("explain-career-")) {
    const deepDetails = page.getByTestId("career-deep-details");
    if ((await deepDetails.count()) > 0) {
      const isOpen = await deepDetails.evaluate(
        (node: Element) => (node as HTMLDetailsElement).open,
      );
      if (!isOpen) {
        await clickLocatorSafely(page.getByTestId("career-deep-details-toggle"));
      }
    }
  }

  const trigger = page.locator(`[data-testid="${testId}"]:visible`).first();
  await expect(trigger).toBeVisible();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.evaluate((element: Element) => (element as HTMLButtonElement).click());
}

const AUTOMATIC_MODEL_ID = CATALOG_ENTRIES.find((entry) => entry.movementType === "automatic")?.id;

test("currency explain trigger opens currencies help", async ({ page }) => {
  test.slow();
  await page.goto("/");

  await clickLocatorSafely(page.getByTestId("explain-currencies"));
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Currencies/);
});

test("catalog help opens shopping guidance", async ({ page }) => {
  const seededState = {
    currencyCents: 1_000_000,
    enjoymentCents: 0,
    items: { quartz: 5, automatic: 0, manual: 0, tourbillon: 0 },
    upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
    unlockedMilestones: ["collector-shelf"],
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

  await seedStorage(page, {
    save: {
      state: seededState,
    },
  });

  await page.goto("/");
  await clickLocatorSafely(page.getByRole("tab", { name: "Catalog" }));
  await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();

  await clickLocatorSafely(page.getByTestId("explain-catalog-shop"));
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Catalog shopping/);
});

test("power reserve tooltip links aria-describedby for keyboard and touch", async ({
  page,
  browserName,
}) => {
  if (!AUTOMATIC_MODEL_ID) {
    throw new Error("Expected at least one automatic catalog model to exist");
  }

  const seededState = {
    currencyCents: 1_000_000,
    enjoymentCents: 0,
    items: { quartz: 5, automatic: 3, manual: 0, tourbillon: 0 },
    upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
    unlockedMilestones: ["collector-shelf"],
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
    watchModels: {
      [AUTOMATIC_MODEL_ID]: 2,
    },
    discoveredCatalogEntries: CATALOG_ENTRIES.map((entry) => entry.id),
    catalogTierUnlocks: [],
  };

  await seedStorage(page, {
    save: {
      state: seededState,
    },
  });

  await page.goto("/");
  const catalogPanel = await openCatalogTab(page);
  await switchCatalogToOwned(page, catalogPanel);
  await clickLocatorSafely(catalogPanel.getByTestId("catalog-view-mode-toggle"));

  const trigger = catalogPanel.locator(".power-reserve-hint-button:visible").first();
  await expect(trigger).toBeVisible();

  await trigger.focus();
  const keyboardTooltipId = await trigger.getAttribute("aria-describedby");
  expect(keyboardTooltipId).toBeTruthy();
  if (!keyboardTooltipId) {
    throw new Error("Missing tooltip id after keyboard focus");
  }
  await expect(page.locator(`[id="${keyboardTooltipId}"]`)).toBeVisible();

  await page.keyboard.press("Escape");
  const keyboardTooltip = page.locator(`[id="${keyboardTooltipId}"]`);
  await expect
    .poll(async () => {
      const tooltipCount = await keyboardTooltip.count();
      if (tooltipCount === 0) {
        return true;
      }

      return !(await keyboardTooltip.first().isVisible());
    })
    .toBe(true);

  await trigger.dispatchEvent("pointerdown", { pointerType: "touch" });
  await trigger.dispatchEvent("click");

  const touchTooltipId = await trigger.getAttribute("aria-describedby");
  if (!touchTooltipId && browserName === "webkit") {
    // WebKit mobile can dispatch click without wiring aria-describedby for synthetic touch.
    return;
  }
  if (!touchTooltipId) {
    throw new Error("Missing tooltip id after touch interaction");
  }
  await expect(page.locator(`[id="${touchTooltipId}"]`)).toBeVisible();
});

test("career start explain trigger opens starting-career help", async ({ page }) => {
  await page.goto("/");
  await clickLocatorSafely(page.getByRole("tab", { name: "Career" }));

  await clickExplainTrigger(page, "explain-career-start");
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Starting your career/);
});

test("career stages explain trigger opens stages help", async ({ page }) => {
  await page.goto("/");
  await clickLocatorSafely(page.getByRole("tab", { name: "Career" }));

  await clickExplainTrigger(page, "explain-career-stages");
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Career stages/);
});

test("career progression card surfaces the now-action feedback strip", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("mission-rail")).toBeVisible();
  await page.getByTestId("mission-primary-toggle").click();
  await expect(page.getByTestId("mission-lane-groups")).toBeVisible();
  await expect(page.getByTestId("mission-next-lane")).toBeVisible();
  await expect(page.getByTestId("mission-later-lane")).toBeVisible();
  await expect(
    page.locator('[data-testid="mission-action-primary"]:visible').first(),
  ).toBeVisible();

  await clickLocatorSafely(page.getByRole("tab", { name: "Career" }));

  await expect(page.getByTestId("career-now-section")).toBeVisible();

  const nextDetails = page.getByTestId("career-next-details");
  if ((await nextDetails.count()) > 0) {
    const isOpen = await nextDetails.evaluate((node) => (node as HTMLDetailsElement).open);
    if (!isOpen) {
      await clickLocatorSafely(page.getByTestId("career-next-details-toggle"));
    }
  }

  await expect(page.getByTestId("career-feedback-strip")).toBeVisible();
  await expect
    .poll(
      async () =>
        (await page.getByTestId("career-feedback-primary").textContent())?.trim().length ?? 0,
    )
    .toBeGreaterThan(0);
  await expect
    .poll(
      async () =>
        (await page.getByTestId("career-feedback-secondary").textContent())?.trim().length ?? 0,
    )
    .toBeGreaterThan(0);
});

test("stats rate breakdown disclosures render line items", async ({ page }) => {
  const seededState = {
    currencyCents: 10_000,
    enjoymentCents: 10_000,
    items: { quartz: 10, automatic: 0, manual: 0, tourbillon: 0 },
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

  await seedStorage(page, {
    save: {
      state: seededState,
    },
  });

  await page.goto("/");
  const statsTab = page.getByRole("tab", { name: "Stats" });
  await clickLocatorSafely(statsTab);

  await expect(page.getByTestId("stats-priority-board")).toBeVisible();
  await expect(page.getByTestId("stats-priority-trigger")).toContainText(
    /Wind-up|Auction weekend|ready/i,
  );

  const enjoymentBreakdown = page.getByTestId("enjoyment-rate-breakdown");
  const cashBreakdown = page.getByTestId("cash-rate-breakdown");

  await expect
    .poll(async () => enjoymentBreakdown.locator("li").count(), { timeout: 10_000 })
    .toBeGreaterThan(0);
  await expect
    .poll(async () => cashBreakdown.locator("li").count(), { timeout: 10_000 })
    .toBeGreaterThan(0);
  await expect(cashBreakdown).toContainText(/Career salary/);
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
    items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 0 },
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

  await seedStorage(page, {
    save: {
      state: seededState,
    },
  });

  await page.goto("/");
  await clickLocatorSafely(page.getByTestId("nostalgia-tab"));
  await expect(page.getByTestId("nostalgia-panel")).toBeVisible();
  await expect(page.getByTestId("nostalgia-unlocks")).toBeVisible();

  const explainUnlocks = page.locator('[data-testid="explain-nostalgia-unlocks"]:visible').first();
  await clickLocatorSafely(explainUnlocks);
  if (
    !(await page
      .getByTestId("help-modal")
      .isVisible()
      .catch(() => false))
  ) {
    await clickLocatorSafely(explainUnlocks);
  }
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Nostalgia unlocks/);
});
