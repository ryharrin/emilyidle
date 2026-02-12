import { test, expect } from "@playwright/test";
import { seedStorage } from "./helpers/storageSeed";

test.describe("help entry point", () => {
  test("opens help, switches section, and remembers last view", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("help-open").click();
    await expect(page.getByTestId("help-modal")).toBeVisible();

    const prestigeSectionButton = page.getByRole("button", { name: "Prestige" });
    await prestigeSectionButton.scrollIntoViewIfNeeded();
    await prestigeSectionButton.click({ force: true });
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
      items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 6 },
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

    await page.locator("#workshop-tab").click();
    await page.getByTestId("help-open").click();
    await expect(page.getByTestId("help-modal")).toBeVisible();
  });

  test("movement keyword search surfaces movement badge help and related chips", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("help-open").click();
    await expect(page.getByTestId("help-modal")).toBeVisible();

    const searchInput = page.getByTestId("help-search");
    await searchInput.fill("movement");

    const firstSectionButton = page.locator(".help-modal-sections button").first();
    await expect(firstSectionButton).toHaveText(/Movement badges/);
    await firstSectionButton.click();

    await expect(page.getByTestId("help-active-section")).toHaveText(/Movement badges/);

    const catalogChip = page.getByTestId("help-related-chip-catalog-shop");
    await expect(catalogChip).toBeVisible();
    await catalogChip.click();
    await expect(page.getByTestId("help-active-section")).toHaveText(/Catalog shopping/);
  });

  test("help still opens after using collection section nav", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Collection" }).click();
    await page
      .getByTestId("collection-section-nav-item-collection-events")
      .getByRole("button")
      .click({ force: true });

    await page.getByTestId("help-open").click();
    await expect(page.getByTestId("help-modal")).toBeVisible();
  });

  test("mission rail and hidden-tab recovery stay actionable", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("mission-rail")).toBeVisible();
    await expect(page.getByTestId("mission-guidance-lane-note")).toBeVisible();
    await expect(page.getByTestId("mission-action-primary")).toBeVisible();
    await expect(page.getByTestId("mission-action-secondary")).toBeVisible();

    await page.locator("#career-tab").click();
    await expect(page.getByTestId("career-panel")).toBeVisible();

    const missionRailBox = await page.getByTestId("mission-rail").boundingBox();
    const careerNowBox = await page.getByTestId("career-now-section").boundingBox();
    if (!missionRailBox || !careerNowBox) {
      throw new Error("Expected mission rail and career now section to be measurable");
    }
    expect(missionRailBox.y).toBeLessThan(careerNowBox.y);

    const careerSecondaryDetails = page.getByTestId("career-secondary-details");
    await expect(careerSecondaryDetails).toBeVisible();
    await expect(careerSecondaryDetails).not.toHaveAttribute("open", "");
    await page.getByTestId("career-secondary-details-toggle").click();
    await expect(careerSecondaryDetails).toHaveAttribute("open", "");
    await expect(page.getByTestId("career-economy-summary")).toBeVisible();

    await page.locator("#save-tab").click();
    await expect(page.getByTestId("settings-visibility")).toBeVisible();

    await page.getByTestId("tab-visibility-career").uncheck();
    await expect(page.getByTestId("hidden-tabs-recovery")).toContainText("Hidden tabs: 1");

    await page.getByTestId("hidden-tabs-recovery").click();
    await expect(page.getByTestId("settings-visibility")).toBeVisible();

    await page.getByTestId("settings-restore-hidden-tabs").click();
    await expect(page.getByTestId("hidden-tabs-recovery")).toHaveCount(0);
    await expect(page.locator("#career-tab")).toBeVisible();
  });
});

test.describe("icon cues", () => {
  test("lock icon renders on nostalgia unlocks", async ({ page }) => {
    const seededState = {
      currencyCents: 1_000_000,
      enjoymentCents: 0,
      nostalgiaPoints: 1,
      nostalgiaResets: 1,
      nostalgiaUnlockedItems: [],
      nostalgiaEnjoymentEarnedCents: 0,
      nostalgiaLastGain: 0,
      nostalgiaLastPrestigedAtMs: 0,
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
    await page.getByTestId("nostalgia-tab").click();

    const unlockCard = page.getByTestId("nostalgia-unlock-card-automatic");
    await expect(unlockCard).toBeVisible();
    await expect(unlockCard.locator("svg.lucide-lock")).toHaveCount(1);
  });

  test("prestige icon renders on atelier reset button", async ({ page }) => {
    const seededState = {
      currencyCents: 0,
      enjoymentCents: 800_000,
      items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 6 },
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
    await page.locator("#workshop-tab").click();

    const workshopPanel = page.getByTestId("workshop-panel");
    await expect(workshopPanel).toBeVisible();

    const resetButton = workshopPanel.getByRole("button", { name: "Review reset" });
    await expect(resetButton).toBeVisible();
    await expect(resetButton.locator("svg")).toHaveCount(1);
  });
});
