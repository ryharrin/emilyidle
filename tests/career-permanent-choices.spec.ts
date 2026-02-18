import { expect, test, type Page } from "@playwright/test";
import { openCareerProgression, selectCareerView } from "./helpers/careerProgression";
import { clickLocatorSafely } from "./helpers/interactions";

const seededState = {
  currencyCents: 1_000_000,
  enjoymentCents: 1_000_000,
  items: { quartz: 15, automatic: 5, manual: 1, tourbillon: 0 },
  upgrades: { "polishing-tools": 1, "assembly-jigs": 0, "guild-contracts": 0 },
  unlockedMilestones: ["showcase", "first-drawer"],
  catalogTierUnlocks: ["quartz", "automatic", "manual"],
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
  therapistCareer: {
    level: 60,
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
};

async function seedSave(page: Page) {
  await page.addInitScript(
    (args: { state: typeof seededState; lastSimulatedAtMs: number; lastTabId: string }) => {
      if (window.localStorage.getItem("emily-idle:save") !== null) {
        return;
      }
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs: args.lastSimulatedAtMs,
          state: args.state,
        }),
      );
      window.localStorage.setItem(
        "emily-idle:navigation",
        JSON.stringify({ lastTabId: args.lastTabId }),
      );
    },
    { state: seededState, lastSimulatedAtMs: Date.now(), lastTabId: "career" },
  );
}

function visibleByTestId(page: Page, testId: string) {
  return page.getByTestId(testId).first();
}

test("career permanent choices show previews and persist across refresh", async ({ page }) => {
  await seedSave(page);

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openCareerProgression(page);
  await selectCareerView(page, "stages");
  await expect(page.getByTestId("career-stages-card")).toBeVisible();

  // Stage 2: pick a primary track (permanent)
  const trackOption = page.getByTestId("career-choice-option-private-practice");
  await expect(trackOption).toBeVisible();

  await trackOption.scrollIntoViewIfNeeded();
  await clickLocatorSafely(trackOption);
  await expect(page.getByTestId("career-permanent-choice-confirm")).toBeVisible();
  await clickLocatorSafely(page.getByTestId("career-permanent-choice-confirm"));
  // Wait for state transition to complete
  await page.waitForTimeout(500);
  const lockedTrackLabel = visibleByTestId(page, "career-choice-locked-licensed-associate");
  await expect(lockedTrackLabel).toBeVisible({ timeout: 15_000 });

  // Stage 3: verify previews exist and show a delta
  const modalityOption = page.getByTestId("career-choice-option-cbt");
  const salaryBefore = await modalityOption.getByTestId("career-choice-salary-before").innerText();
  const salaryAfter = await modalityOption.getByTestId("career-choice-salary-after").innerText();
  expect(salaryBefore).not.toEqual(salaryAfter);

  await clickLocatorSafely(modalityOption);
  await expect(page.getByTestId("career-permanent-choice-confirm")).toBeVisible();
  await clickLocatorSafely(page.getByTestId("career-permanent-choice-confirm"));
  // Wait for state transition to complete
  await page.waitForTimeout(500);
  const lockedModalityLabel = visibleByTestId(
    page,
    "career-choice-locked-specialist-certification",
  );
  await expect(lockedModalityLabel).toBeVisible({ timeout: 15_000 });

  // Wait for autosave to persist the permanent choice before reloading.
  await page.waitForFunction(() => {
    const saved = window.localStorage.getItem("emily-idle:save");
    if (!saved) {
      return false;
    }
    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed !== "object" || parsed === null) {
        return false;
      }
      const state = (
        parsed as {
          state?: {
            therapistCareer?: {
              primaryTrackId?: string | null;
              activeTrackId?: string | null;
              modalityId?: string | null;
            };
          };
        }
      ).state;
      const career = state?.therapistCareer;
      const persistedTrack = career?.primaryTrackId ?? career?.activeTrackId;
      return persistedTrack === "private-practice" && career?.modalityId === "cbt";
    } catch {
      return false;
    }
  });

  await page.reload();
  await page.waitForLoadState("networkidle");

  await openCareerProgression(page);
  await selectCareerView(page, "stages");
  await expect(visibleByTestId(page, "career-choice-locked-licensed-associate")).toBeVisible({
    timeout: 15_000,
  });
  await expect(visibleByTestId(page, "career-choice-locked-specialist-certification")).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByTestId("career-choice-option-cbt")).toHaveCount(0);
});
