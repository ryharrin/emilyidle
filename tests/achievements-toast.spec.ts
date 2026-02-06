import { expect, test, type Locator } from "@playwright/test";

import { createInitialState, getWatchModels, type GameState } from "../src/game/state";
import { openCatalogFilters } from "./helpers/catalogFilters";

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

type Box = NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>;

function hasOverlap(first: Box, second: Box) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

async function expectNoOverlap(first: Locator, second: Locator) {
  await first.scrollIntoViewIfNeeded();
  await second.scrollIntoViewIfNeeded();
  const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()]);
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  if (!firstBox || !secondBox) {
    return;
  }
  expect(hasOverlap(firstBox, secondBox)).toBe(false);
}

async function buyStarterWatch(
  page: import("@playwright/test").Page,
  starterModelId: string,
): Promise<Locator> {
  await page.getByRole("tab", { name: "Catalog" }).click();
  const catalogPanel = page.getByRole("tabpanel", { name: /Catalog/i });
  const ownedTab = catalogPanel.getByRole("tab", { name: /^Owned/ }).first();
  if (!(await ownedTab.isVisible().catch(() => false))) {
    await openCatalogFilters(page);
  }
  await ownedTab.click();
  const buyButton = page.getByTestId(`catalog-buy-${starterModelId}`).first();
  await buyButton.click();
  return buyButton;
}

test.describe("achievement toasts", () => {
  test("shows unlock toast when achievement notifications are enabled", async ({ page }) => {
    const { starterModelId } = buildSeededState();
    await seedPage(page, true);

    await page.goto("/");
    const buyButton = await buyStarterWatch(page, starterModelId);

    await expect(page.getByTestId("toast-stack")).toContainText(/Achievement unlocked/i);
    await expect(page.getByTestId("toast-stack")).toContainText(/First drawer/i);
    await expectNoOverlap(page.getByTestId("toast-stack"), buyButton);
  });

  test("does not show unlock toast when achievement notifications are disabled", async ({
    page,
  }) => {
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
