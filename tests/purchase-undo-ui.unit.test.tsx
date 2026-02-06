import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import { createInitialState, getWatchModels } from "../src/game/state";

function seedSaveForStarterPurchase() {
  const base = createInitialState();
  const starterModel = getWatchModels().find((model) => model.tierId === "starter");
  if (!starterModel) {
    throw new Error("Missing starter model");
  }

  const state = {
    ...base,
    currencyCents: Math.max(base.currencyCents, 500_000),
    unlockedMilestones: ["collector-shelf", "showcase"],
    items: {
      ...base.items,
      starter: 2,
    },
    watchModels: {
      [starterModel.id]: 2,
    },
    discoveredCatalogEntries: [starterModel.id],
  };

  localStorage.setItem(
    "emily-idle:save",
    JSON.stringify({
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: Date.now(),
      state,
    }),
  );

  return starterModel.id;
}

describe("catalog purchase undo UI", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("enables undo after a purchase and clears it once used", async () => {
    const starterModelId = seedSaveForStarterPurchase();
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    await user.click(within(tabList).getByRole("tab", { name: /Catalog/i }));

    await user.click(screen.getByRole("tab", { name: /^Owned/ }));

    const undoButton = screen.getByTestId("catalog-undo-purchase") as HTMLButtonElement;
    expect(undoButton.disabled).toBe(true);

    await user.click(screen.getByTestId(`catalog-buy-${starterModelId}`));

    expect(undoButton.disabled).toBe(false);
    expect(screen.getByTestId("catalog-undo-countdown").textContent).toMatch(/Available/i);

    await user.click(undoButton);

    expect(undoButton.disabled).toBe(true);
    expect(screen.getByTestId("catalog-undo-countdown").textContent).toMatch(/No undo/i);
  });
});
