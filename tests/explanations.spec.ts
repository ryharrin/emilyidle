import { expect, test, type Page } from "@playwright/test";
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
    items: { starter: 5, classic: 0, chronograph: 0, tourbillon: 0 },
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
  await clickLocatorSafely(page.getByRole("tab", { name: "Career" }));

  const nextDetails = page.getByTestId("career-next-details");
  if ((await nextDetails.count()) > 0) {
    const isOpen = await nextDetails.evaluate((node) => (node as HTMLDetailsElement).open);
    if (!isOpen) {
      await clickLocatorSafely(page.getByTestId("career-next-details-toggle"));
    }
  }

  await expect(page.getByTestId("career-feedback-strip")).toBeVisible();
  await expect(page.getByTestId("career-feedback-primary")).toContainText(/Next step|Last session/);
  await expect(page.getByTestId("career-feedback-secondary")).toContainText(
    /threshold|Cost|complete/i,
  );
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
