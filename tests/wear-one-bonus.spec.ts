import { expect, test, type Page } from "@playwright/test";
import {
  openCatalogTab,
  resolveCatalogInteractCandidates,
  switchCatalogToOwned,
} from "./helpers/catalogFilters";
import { clickLocatorSafely, findFirstVisible } from "./helpers/interactions";

type SeededSave = {
  state: Record<string, unknown>;
  lastSimulatedAtMs: number;
};

async function seedSave(page: Page, seeded: SeededSave) {
  await page.addInitScript(({ state, lastSimulatedAtMs }: SeededSave) => {
    const settings = {
      themeMode: "system",
      hideCompletedAchievements: false,
      hiddenTabs: [],
      coachmarksDismissed: {},
      confirmNostalgiaUnlocks: true,
      notificationPreferences: {
        sessionsReady: true,
        prestigeReady: true,
        achievements: true,
        events: true,
      },
    };

    const payload = {
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs,
      state,
    };
    window.localStorage.setItem("emily-idle:save", JSON.stringify(payload));
    window.localStorage.setItem("emily-idle:settings", JSON.stringify(settings));
  }, seeded);
}

async function openPrimaryTab(page: Page, name: string) {
  const tab = page.getByRole("tab", { name: new RegExp(name, "i") }).first();
  await clickLocatorSafely(tab);
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: new RegExp(name, "i") })).toBeVisible();
}

test("wear one watch, switch, clear, and verify Stats + help", async ({ page }) => {
  test.slow();

  const watchIdA = "rolex-rolex-gmt-master-ref-16700"; // classic bucket (gmt)
  const watchIdB = "rolex-rolex-daytona-ref-6265-in-oro-primi-anni-settanta"; // chronograph bucket (daytona)

  const seededState = {
    currencyCents: 10_000,
    enjoymentCents: 10_000,
    wornWatchId: null,
    watchModels: {
      [watchIdA]: 5,
      [watchIdB]: 5,
    },
    items: { starter: 12, classic: 0, chronograph: 0, tourbillon: 0 },
    unlockedMilestones: ["collector-shelf", "showcase"],
    achievementUnlocks: ["first-drawer"],
  };

  await seedSave(page, { state: seededState, lastSimulatedAtMs: Date.now() });

  await page.goto("/");
  await openCatalogTab(page);
  await switchCatalogToOwned(page);

  const wearACandidates = await resolveCatalogInteractCandidates(
    page,
    `[data-testid="watch-wear-${watchIdA}"]`,
  );
  const wearA = await findFirstVisible(wearACandidates);
  expect(wearA).not.toBeNull();
  if (wearA === null) {
    throw new Error(`Expected wearable option for ${watchIdA}`);
  }
  await clickLocatorSafely(wearA);

  await expect(page.getByTestId(`watch-equipped-${watchIdA}`)).toBeVisible();
  await openPrimaryTab(page, "Collection");
  await expect(page.getByTestId("worn-watch-summary")).toBeVisible();
  await expect(page.getByTestId("worn-watch-summary")).not.toContainText("None");

  await clickLocatorSafely(page.getByTestId("worn-watch-change"));
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeVisible();
  await clickLocatorSafely(page.getByTestId(`worn-watch-option-${watchIdB}`));

  await openCatalogTab(page);
  await switchCatalogToOwned(page);

  await expect(page.getByTestId(`watch-equipped-${watchIdA}`)).toHaveCount(0);
  await expect(page.getByTestId(`watch-equipped-${watchIdB}`)).toBeVisible();

  await openPrimaryTab(page, "Stats");
  const enjoymentBreakdown = page.getByTestId("enjoyment-rate-breakdown");
  await expect(enjoymentBreakdown).toContainText("Worn watch ×1.08");
  await expect(enjoymentBreakdown).not.toContainText("Worn watch ×1.05");

  await clickLocatorSafely(page.getByRole("button", { name: "Explain rates" }).first());
  await expect(page.getByTestId("help-modal")).toBeVisible();
  await expect(page.getByTestId("help-active-section")).toHaveText(/Rates/i);
  await clickLocatorSafely(page.getByTestId("help-close"));
  await expect(page.getByTestId("help-modal")).toBeHidden();

  await openPrimaryTab(page, "Collection");
  await clickLocatorSafely(page.getByTestId("worn-watch-change"));
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeVisible();
  await clickLocatorSafely(page.getByTestId("worn-watch-option-none"));
  await expect(page.getByTestId("worn-watch-picker-modal")).toBeHidden();

  await expect(page.getByTestId(`watch-equipped-${watchIdB}`)).toHaveCount(0);

  await openPrimaryTab(page, "Stats");
  await expect(page.getByTestId("enjoyment-rate-breakdown")).not.toContainText("Worn watch");
});
