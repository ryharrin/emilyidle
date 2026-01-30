import { render, screen, within } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { HelpProvider } from "../src/ui/help/helpContext";
import { UpgradesTab } from "../src/ui/tabs/UpgradesTab";
import {
  createInitialState,
  getMaisonUpgrades,
  getUpgrades,
  getWatchModels,
  getWorkshopUpgrades,
} from "../src/game/state";

describe("upgrades preview", () => {
  it("shows enjoyment delta and updates preview rates", () => {
    const baseState = createInitialState();
    const [firstModel] = getWatchModels();

    expect(firstModel).toBeTruthy();
    if (!firstModel) {
      return;
    }

    const state = {
      ...baseState,
      currencyCents: 1_000_000,
      watchModels: {
        ...baseState.watchModels,
        [firstModel.id]: 200,
      },
    };

    render(
      <HelpProvider value={{ openHelpTo: vi.fn() }}>
        <UpgradesTab
          isActive={true}
          state={state}
          currentEventMultiplier={1}
          upgrades={getUpgrades()}
          workshopUpgrades={getWorkshopUpgrades()}
          maisonUpgrades={getMaisonUpgrades()}
          onPurchase={vi.fn()}
        />
      </HelpProvider>,
    );

    const [firstCard] = screen.getAllByTestId("upgrade-card");
    expect(firstCard).toBeTruthy();
    if (!firstCard) {
      return;
    }

    const cardScope = within(firstCard);

    expect(cardScope.getByText(/Enjoyment \+/)).toBeTruthy();
    expect(cardScope.queryByText(/Cash \+/)).toBeNull();

    const enjoymentLines = cardScope
      .getAllByText(/^Enjoyment /)
      .map((node) => node.textContent ?? "")
      .filter((text) => !text.includes("+"));

    expect(enjoymentLines).toHaveLength(2);
    expect(enjoymentLines[0]).not.toBe(enjoymentLines[1]);
  });
});
