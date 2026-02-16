import { expect, test } from "@playwright/test";
import { openCatalogTab, switchCatalogToOwned } from "./helpers/catalogFilters";

const CLASSIC_MODEL_ID = "rolex-rolex-gmt-master-ii-ref-126713grnr";

test("collection keeps catalog callouts while hidden systems remain locked", async ({ page }) => {
  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 0 },
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

  await page.getByRole("tab", { name: "Collection" }).click();
  await expect(page.getByTestId("next-unlocks")).toHaveCount(0);
  const callout = page.getByTestId("catalog-shop-callout");
  await expect(callout).toBeVisible();
  await expect(callout.getByRole("button", { name: "Open Catalog" })).toBeVisible();

  const setBonusesSectionButton = page
    .locator('[data-testid="collection-section-nav-item-collection-set-bonuses"] button')
    .first();
  if ((await setBonusesSectionButton.count()) > 0) {
    await setBonusesSectionButton.click();
    await expect(page.getByTestId("collection-section-nav")).toHaveAttribute(
      "data-active-section",
      "collection-set-bonuses",
    );
  }

  await expect(
    page
      .getByTestId("collection-set-bonus-grid")
      .getByRole("button", { name: "Find in Catalog" })
      .first(),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Catalog" }).click();
  const lockedItemHint = page.getByTestId(`locked-item-hint-${CLASSIC_MODEL_ID}`);
  await lockedItemHint.scrollIntoViewIfNeeded();
  await expect(lockedItemHint).toBeVisible();
  await page.getByTestId("catalog-quick-preset").selectOption("unlocking-soon");
  await expect(page.getByTestId("catalog-quick-preset-hint")).toContainText(
    "Show locked references near their unlock threshold.",
  );
  await page.getByTestId("catalog-quick-preset").selectOption("needs-enjoyment");
  await expect(page.getByTestId("catalog-quick-preset-hint")).toContainText(
    "blocked by enjoyment requirements",
  );
  await page.getByTestId("catalog-quick-preset").selectOption("all");
  const catalogGrid = page.getByTestId("catalog-grid");
  const initialCatalogDensity = await catalogGrid.getAttribute("data-density");
  if (initialCatalogDensity !== "compact" && initialCatalogDensity !== "expanded") {
    throw new Error(`Unexpected catalog density: ${initialCatalogDensity}`);
  }
  await page.getByTestId("catalog-density-toggle").click();
  await expect(catalogGrid).toHaveAttribute(
    "data-density",
    initialCatalogDensity === "compact" ? "expanded" : "compact",
  );
  await page.getByTestId("catalog-density-toggle").click();
  await expect(catalogGrid).toHaveAttribute("data-density", initialCatalogDensity);
  await expect(page.getByTestId("catalog-undo-countdown")).toContainText(
    "No purchase to undo yet. Buy a watch to start a 10s window.",
  );

  await page.getByRole("tab", { name: "Upgrades" }).click();
  const collectionDisclosure = page.getByTestId("upgrades-group-collection");
  const workshopDisclosure = page.getByTestId("upgrades-group-workshop");
  const maisonDisclosure = page.getByTestId("upgrades-group-maison");
  expect(
    await collectionDisclosure.evaluate((element) => (element as HTMLDetailsElement).open),
  ).toBe(true);
  expect(await workshopDisclosure.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
    false,
  );
  expect(await maisonDisclosure.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
    false,
  );
  const lockedUpgradeHint = page.getByTestId("locked-upgrade-hint-assembly-jigs");
  await expect(lockedUpgradeHint).toBeVisible();
  await expect(
    lockedUpgradeHint.getByRole("heading", { name: "Unlock requirement" }),
  ).toBeVisible();
  await expect(lockedUpgradeHint).toContainText(/Own \d+ total items/);
  await expect(lockedUpgradeHint).toContainText(/\d+ \/ \d+ - \d+%/);
  await expect(
    page.locator("#upgrade-card-assembly-jigs").getByRole("button", { name: /^Upgrade \(/ }),
  ).toBeDisabled();
});

test("catalog empty state CTA stays in catalog", async ({ page }) => {
  const seededState = {
    currencyCents: 0,
    enjoymentCents: 0,
    items: { quartz: 0, automatic: 0, manual: 0, tourbillon: 0 },
    watchModels: {},
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
  const catalogPanel = await openCatalogTab(page);
  await page.getByTestId("catalog-shop").scrollIntoViewIfNeeded();
  await switchCatalogToOwned(page, catalogPanel);
  await expect(page.getByTestId("catalog-owned-empty")).toBeVisible();
  await page.getByRole("button", { name: "Build collection" }).click();

  await expect(page.getByRole("tab", { name: "Catalog" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("catalog-shop")).toBeVisible();
});
