import { expect, test } from "@playwright/test";

import { createInitialState, getWatchModels, type GameState } from "../src/game/state";

function buildState(nowMs: number): GameState {
  const base = createInitialState();
  const starterModel = getWatchModels().find((model) => model.tierId === "starter");
  if (!starterModel) {
    throw new Error("Missing starter model");
  }

  return {
    ...base,
    currencyCents: Math.max(base.currencyCents, 250_000),
    enjoymentCents: Math.max(base.enjoymentCents, 50_000),
    unlockedMilestones: ["collector-shelf", "showcase"],
    items: {
      ...base.items,
      starter: 12,
    },
    watchModels: {
      [starterModel.id]: 12,
    },
    achievementUnlocks: ["first-drawer"],
    eventStates: {
      ...base.eventStates,
      "wind-up": {
        activeUntilMs: nowMs + 15_000,
        nextAvailableAtMs: nowMs + 35_000,
        incomeMultiplier: 1.12,
      },
      "auction-weekend": {
        activeUntilMs: 0,
        nextAvailableAtMs: nowMs + 25_000,
        incomeMultiplier: 1.6,
      },
    },
  };
}

test("stats tab renders event calendar buckets", async ({ page }) => {
  const nowMs = Date.now();
  const state = buildState(nowMs);

  await page.addInitScript(
    ({ seededState, nowMs }) => {
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: 2,
          savedAt: new Date(nowMs).toISOString(),
          lastSimulatedAtMs: nowMs,
          state: seededState,
        }),
      );
    },
    { seededState: state, nowMs },
  );

  await page.goto("/");
  await page.getByRole("tab", { name: "Stats" }).click();

  await expect(page.getByTestId("stats-summary-strip")).toBeVisible();
  await expect(page.getByTestId("stats-disclosure-calendar")).toBeVisible();
  await expect(page.getByTestId("event-calendar")).toBeVisible();
  await expect(page.getByTestId("event-calendar-active")).toContainText(/Wind-up/i);
  await expect(page.getByTestId("event-calendar-upcoming")).toContainText(/Auction weekend/i);
  await expect(page.getByTestId("event-calendar-ready")).toContainText(/Emily's birthday/i);
});
