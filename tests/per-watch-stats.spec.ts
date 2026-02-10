import { test, expect } from "@playwright/test";

const WATCH_ROW_1 = "rolex-rolex-gmt-master-ii-ref-126713grnr";
const WATCH_ROW_2 = "rolex-rolex-gmt-master-ref-16700";

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
  wornWatchId: WATCH_ROW_1,
  interactionNextAvailableAtMsByItem: {},
  powerReserveByItem: {},
  items: {
    quartz: 5,
    automatic: 3,
    manual: 1,
    tourbillon: 0,
  },
  watchModels: {
    [WATCH_ROW_1]: 3,
    [WATCH_ROW_2]: 2,
  },
  upgrades: {
    "polishing-tools": 0,
    "assembly-jigs": 0,
    "guild-contracts": 0,
    "archive-guides": 0,
  },
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
    "emily-birthday": { activeUntilMs: 0, nextAvailableAtMs: 0 },
    wind: { activeUntilMs: 0, nextAvailableAtMs: 0 },
  },
  discoveredCatalogEntries: [WATCH_ROW_1, WATCH_ROW_2],
  catalogTierUnlocks: ["quartz", "automatic", "manual", "tourbillon"],
  craftingParts: 0,
  craftedBoosts: {
    "polished-tools": 0,
    "heritage-springs": 0,
    "artisan-jig": 0,
  },
};

test("per-watch stats sticky controls remain visible on mobile", async ({ page }) => {
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

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("tab", { name: "Catalog" }).click();

  const statsSection = page.getByTestId("per-watch-stats");
  await statsSection.scrollIntoViewIfNeeded();
  await expect(statsSection).toBeVisible();
  const row1 = page.getByTestId(`per-watch-row-${WATCH_ROW_1}`);
  await expect(row1.getByText("Enjoyment / sec")).toBeVisible();
  await expect(row1.getByText("Cash / sec (career)")).toBeVisible();
  await expect(page.getByTestId(`per-watch-row-${WATCH_ROW_2}`)).toBeVisible();

  const header = page.getByTestId("per-watch-stats-controls");
  await expect(header).toBeVisible();

  await page.getByTestId(`per-watch-row-${WATCH_ROW_2}`).scrollIntoViewIfNeeded();
  await expect(header).toBeVisible();
  let headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox!.height).toBeGreaterThan(0);
  expect(headerBox!.width).toBeGreaterThan(0);

  await page.evaluate(() => {
    const section = document.querySelector("[data-testid='per-watch-stats']");
    if (section) {
      section.scrollTop = section.scrollHeight;
    }
  });
  await page.getByTestId(`per-watch-row-${WATCH_ROW_1}`).scrollIntoViewIfNeeded();
  await expect(header).toBeVisible();
  headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox!.height).toBeGreaterThan(0);
});
