import { expect, test } from "@playwright/test";

const NEW_WATCH_IDS = [
  "omega-aurora-frost",
  "omega-seashore-drift",
  "jaeger-lecoultre-atmos-vsp",
  "cartier-ballon-de-lumiere-chrono",
  "audemars-piguet-luminous-tourbillon",
  "rolex-celestial-tourbillon",
];

const seededState = {
  currencyCents: 0,
  enjoymentCents: 0,
  nostalgiaPoints: 0,
  nostalgiaResets: 0,
  nostalgiaUnlockedItems: [],
  nostalgiaEnjoymentEarnedCents: 0,
  nostalgiaLastGain: 0,
  nostalgiaLastPrestigedAtMs: 0,
  therapistCareer: {
    careerStartId: null,
    salaryActiveUntilMs: 0,
    level: 0,
    xp: 0,
    nextAvailableAtMs: 0,
    activeTrackId: null,
    primaryTrackId: null,
    modalityId: null,
    operatingStyleId: null,
    expansionFocusId: null,
    pointsAvailable: 0,
    spentNodes: {},
    freeSessionAvailable: false,
  },
  wornWatchId: null,
  interactionNextAvailableAtMsByItem: {},
  powerReserveByItem: {},
  items: {
    starter: 3,
    classic: 2,
    chronograph: 1,
    tourbillon: 0,
  },
  watchModels: {
    [NEW_WATCH_IDS[0]]: 1,
    [NEW_WATCH_IDS[1]]: 1,
    [NEW_WATCH_IDS[2]]: 1,
    [NEW_WATCH_IDS[3]]: 1,
    [NEW_WATCH_IDS[4]]: 0,
    [NEW_WATCH_IDS[5]]: 0,
  },
  upgrades: {
    "polishing-tools": 0,
    "assembly-jigs": 0,
    "guild-contracts": 0,
    "archive-guides": 0,
  },
  unlockedMilestones: ["collector-shelf", "showcase"],
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
    wind: { activeUntilMs: 0, nextAvailableAtMs: 0 },
  },
  discoveredCatalogEntries: NEW_WATCH_IDS,
  catalogTierUnlocks: ["starter", "classic", "chronograph", "tourbillon"],
  craftingParts: 0,
  craftedBoosts: {
    "polished-tools": 0,
    "heritage-springs": 0,
    "artisan-jig": 0,
  },
};

test("catalog tier lanes highlight the low/mid/lux wave", async ({ page }) => {
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
      window.localStorage.setItem("emily-idle:settings", JSON.stringify({ hiddenTabs: [] }));
      window.localStorage.setItem("emily-idle:help", JSON.stringify({ collapsed: false }));
    },
    { state: seededState, lastSimulatedAtMs: Date.now() },
  );

  await page.setViewportSize({ width: 1280, height: 820 });
  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();
  await page.getByTestId("catalog-sort").selectOption("tier");

  const filters = page.getByTestId("catalog-filters");
  await expect(filters).toBeVisible();

  const lowLane = page.getByTestId("catalog-tier-low");
  const midLane = page.getByTestId("catalog-tier-mid");
  const luxLane = page.getByTestId("catalog-tier-lux");

  await expect(lowLane).toBeVisible();
  await expect(lowLane.getByText("Aurora Frost")).toBeVisible();
  await expect(lowLane.locator(".catalog-lane-title")).toHaveText("Starter lane");

  await expect(midLane).toBeVisible();
  await expect(midLane.locator(".catalog-lane-title")).toHaveText("Mid-tier lane");
  await expect(midLane.getByText("Ballon de Lumière Chrono")).toBeVisible();

  await expect(luxLane).toBeVisible();
  await expect(luxLane.locator(".catalog-lane-title")).toHaveText("Luxury lane");
  await expect(luxLane.getByText("Luminous Tourbillon")).toBeVisible();

  await page.evaluate(() => window.scrollBy(0, 400));
  await expect(filters).toBeVisible();
});
