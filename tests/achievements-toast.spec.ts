import { expect, test } from "@playwright/test";

import { createInitialState, getWatchModels, type GameState } from "../src/game/state";

function buildSeededState(): { state: GameState; starterModelId: string } {
  const base = createInitialState();
  const starterModel = getWatchModels().find((model) => model.tierId === "starter");
  if (!starterModel) {
    throw new Error("Missing starter model");
  }

  return {
    starterModelId: starterModel.id,
    state: {
      ...base,
      currencyCents: Math.max(base.currencyCents, 500_000),
      enjoymentCents: Math.max(base.enjoymentCents, 50_000),
      unlockedMilestones: ["collector-shelf", "showcase"],
      items: {
        ...base.items,
        starter: 11,
      },
      watchModels: {
        [starterModel.id]: 11,
      },
      discoveredCatalogEntries: [starterModel.id],
      achievementUnlocks: [],
    },
  };
}

async function seedPage(page: import("@playwright/test").Page, achievementsEnabled: boolean) {
  const { state } = buildSeededState();
  await page.addInitScript(
    ({ seededState, achievementsEnabled }) => {
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(0).toISOString(),
          lastSimulatedAtMs: Date.now(),
          state: seededState,
        }),
      );
      window.localStorage.setItem(
        "emily-idle:settings",
        JSON.stringify({
          themeMode: "system",
          hideCompletedAchievements: false,
          hiddenTabs: [],
          coachmarksDismissed: {},
          confirmNostalgiaUnlocks: true,
          notificationPreferences: {
            sessionsReady: true,
            prestigeReady: true,
            achievements: achievementsEnabled,
            events: true,
          },
        }),
      );
    },
    { seededState: state, achievementsEnabled },
  );
}

async function buyStarterWatch(page: import("@playwright/test").Page, starterModelId: string) {
  await page.getByRole("tab", { name: "Catalog" }).click();
  const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
  const ownedTab = catalogPanel.getByRole("tab", { name: /^Owned/ }).first();
  if (!(await ownedTab.isVisible().catch(() => false))) {
    await catalogPanel.getByRole("button", { name: /Filters/i }).click();
  }
  await ownedTab.click();
  await page.getByTestId(`catalog-buy-${starterModelId}`).click();
}

test.describe("achievement toasts", () => {
  test("shows unlock toast when achievement notifications are enabled", async ({ page }) => {
    const { starterModelId } = buildSeededState();
    await seedPage(page, true);

    await page.goto("/");
    await buyStarterWatch(page, starterModelId);

    await expect(page.getByTestId("toast-stack")).toContainText(/Achievement unlocked/i);
    await expect(page.getByTestId("toast-stack")).toContainText(/First drawer/i);
  });

  test("does not show unlock toast when achievement notifications are disabled", async ({ page }) => {
    const { starterModelId } = buildSeededState();
    await seedPage(page, false);

    await page.goto("/");
    await buyStarterWatch(page, starterModelId);

    await page.waitForTimeout(350);
    const toastStack = page.getByTestId("toast-stack");
    if ((await toastStack.count()) > 0) {
      await expect(toastStack).not.toContainText(/Achievement unlocked/i);
    }
  });
});
