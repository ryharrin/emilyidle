import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import { createInitialState, getWatchModels } from "../src/game/state";

function buildSeededState() {
  const base = createInitialState();
  const starterModel = getWatchModels().find((model) => model.tierId === "quartz");
  if (!starterModel) {
    throw new Error("Missing quartz model");
  }

  return {
    ...base,
    currencyCents: Math.max(base.currencyCents, 500_000),
    enjoymentCents: Math.max(base.enjoymentCents, 50_000),
    unlockedMilestones: ["collector-shelf", "showcase"],
    items: {
      ...base.items,
      quartz: 11,
    },
    watchModels: {
      [starterModel.id]: 11,
    },
    discoveredCatalogEntries: [starterModel.id],
    achievementUnlocks: [],
  };
}

function seedLocalStorage(options?: { achievementsEnabled?: boolean }) {
  const achievementsEnabled = options?.achievementsEnabled ?? true;
  const state = buildSeededState();
  localStorage.setItem(
    "emily-idle:save",
    JSON.stringify({
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: Date.now(),
      state,
    }),
  );

  localStorage.setItem(
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

  const starterModel = getWatchModels().find((model) => model.tierId === "quartz");
  if (!starterModel) {
    throw new Error("Missing quartz model");
  }
  return starterModel.id;
}

async function buyStarterWatch(starterModelId: string) {
  const user = userEvent.setup();
  const navTabList = screen.getByRole("tablist", { name: /Primary navigation/i });
  await user.click(within(navTabList).getByRole("tab", { name: /Catalog/i }));

  await user.click(screen.getByRole("tab", { name: /^Owned/ }));
  const currencyBeforePurchase = screen.getByTestId("value-ticker-currency").textContent;
  await user.click(screen.getByTestId(`catalog-buy-${starterModelId}`));
  await waitFor(() => {
    expect(screen.getByTestId("value-ticker-currency").textContent).not.toBe(
      currencyBeforePurchase,
    );
  });
}

describe("achievement toast gating", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("shows achievement unlock toast when channel is enabled", async () => {
    const starterModelId = seedLocalStorage({ achievementsEnabled: true });
    render(<App />);

    await buyStarterWatch(starterModelId);

    await waitFor(() => {
      expect(screen.queryAllByText(/Achievement unlocked/i).length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/First drawer/i)).toBeInTheDocument();
  });

  it("suppresses achievement unlock toast when channel is disabled", async () => {
    const starterModelId = seedLocalStorage({ achievementsEnabled: false });
    render(<App />);

    await buyStarterWatch(starterModelId);

    await waitFor(() => {
      expect(screen.queryByText(/Achievement unlocked/i)).not.toBeInTheDocument();
    });
  });
});
