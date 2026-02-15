import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import {
  buildAchievementToastSeed,
  buildAchievementToastSettings,
} from "./helpers/achievementToastSeed";

function seedLocalStorage(options?: { achievementsEnabled?: boolean }) {
  const achievementsEnabled = options?.achievementsEnabled ?? true;
  // Canonical buy-button preconditions are centralized in tests/helpers/achievementToastSeed.ts.
  const { state, starterModelId } = buildAchievementToastSeed();
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
    JSON.stringify(buildAchievementToastSettings(achievementsEnabled)),
  );

  return starterModelId;
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
