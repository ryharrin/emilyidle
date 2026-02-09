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
  const NOW_MS = 1_000;

  const renderUpgradesTab = (state: ReturnType<typeof createInitialState>) =>
    render(
      <HelpProvider value={{ openHelpTo: vi.fn() }}>
        <UpgradesTab
          isActive={true}
          state={state}
          currentEventMultiplier={1}
          nowMs={NOW_MS}
          upgrades={getUpgrades()}
          workshopUpgrades={getWorkshopUpgrades()}
          maisonUpgrades={getMaisonUpgrades()}
          onPurchase={vi.fn()}
        />
      </HelpProvider>,
    );

  const createSeededState = () => {
    const baseState = createInitialState();
    const [firstModel] = getWatchModels();
    if (!firstModel) {
      throw new Error("Missing watch model definitions");
    }

    return {
      ...baseState,
      currencyCents: 1_000_000,
      workshopBlueprints: 10,
      maisonHeritage: 10,
      maisonReputation: 10,
      watchModels: {
        ...baseState.watchModels,
        [firstModel.id]: 200,
      },
    };
  };

  it("shows enjoyment delta and updates preview rates", () => {
    const state = createSeededState();

    renderUpgradesTab(state);

    expect(screen.getByTestId("upgrades-recommendations")).toBeTruthy();
    expect(screen.getByTestId("upgrade-intent-buckets")).toBeTruthy();

    const [firstCard] = screen.getAllByTestId("upgrade-card");
    expect(firstCard).toBeTruthy();
    if (!firstCard) {
      return;
    }

    const cardScope = within(firstCard);

    expect(cardScope.getByText(/Enjoyment \+/)).toBeTruthy();
    expect(cardScope.getByTestId("upgrade-impact-summary")).toBeTruthy();
    expect(cardScope.getByTestId("upgrade-impact-row-cash")).toBeTruthy();
    expect(cardScope.getByTestId("upgrade-impact-row-enjoyment")).toBeTruthy();
    expect(cardScope.getByTestId("upgrade-roi-summary")).toBeTruthy();
    expect(cardScope.getByText("Deep diagnostics")).toBeTruthy();
  });

  it("renders workshop and maison preview effects consistently", () => {
    const state = createSeededState();

    renderUpgradesTab(state);

    const workshopCards = screen.getAllByTestId("workshop-upgrade-card");
    const vaultCard = workshopCards[1];
    expect(vaultCard).toBeTruthy();
    if (!vaultCard) {
      return;
    }

    const softcapLine = within(vaultCard).getByTestId("upgrade-effect-softcap-value");
    const softcapBefore = within(softcapLine).getByTestId("upgrade-effect-value-before");
    const softcapAfter = within(softcapLine).getByTestId("upgrade-effect-value-after");

    expect(softcapBefore.textContent).not.toBe(softcapAfter.textContent);

    const maisonCards = screen.getAllByTestId("maison-upgrade-card");
    const heritageCard = maisonCards[1];
    expect(heritageCard).toBeTruthy();
    if (!heritageCard) {
      return;
    }

    const collectionLine = within(heritageCard).getByTestId("upgrade-effect-collection-bonus");
    const collectionBefore = within(collectionLine).getByTestId("upgrade-effect-value-before");
    const collectionAfter = within(collectionLine).getByTestId("upgrade-effect-value-after");

    expect(collectionBefore.textContent).not.toBe(collectionAfter.textContent);
  });

  it("highlights up to three actionable recommendations", () => {
    const state = createSeededState();

    renderUpgradesTab(state);

    const recommendationCards = screen.getAllByTestId("upgrade-recommendation-card");
    expect(recommendationCards.length).toBeGreaterThan(0);
    expect(recommendationCards.length).toBeLessThanOrEqual(3);

    for (const card of recommendationCards) {
      expect(within(card).getByTestId("upgrade-roi-summary")).toBeTruthy();
    }
  });
});
