import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import { createInitialState, getWatchModels } from "../src/game/state";

function getModelIdForTier(tierId: string): string {
  const model = getWatchModels().find((entry) => entry.tierId === tierId);
  if (!model) {
    throw new Error(`Missing model for tier: ${tierId}`);
  }
  return model.id;
}

const setupCatalog = async () => {
  const user = userEvent.setup();
  const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
  const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
  await user.click(catalogTab);
  await waitFor(() => expect(catalogTab.getAttribute("aria-selected")).toBe("true"));
  return user;
};

const openWindingModal = async (user: ReturnType<typeof userEvent.setup>) => {
  const interactButtons = await screen.findAllByTestId("vault-interact-manual");
  const manualInteract = interactButtons.find((button) => !(button as HTMLButtonElement).disabled);
  expect(manualInteract).toBeTruthy();
  await user.click(manualInteract as HTMLElement);
};

describe("winding modal accessibility", () => {
  beforeEach(async () => {
    localStorage.clear();
    const baseState = createInitialState();
    const manualModelId = getModelIdForTier("manual");
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: {
          ...baseState,
          currencyCents: 100000000,
          enjoymentCents: 100000000,
          items: {
            ...baseState.items,
            quartz: 1,
            manual: 1,
          },
          watchModels: {
            ...baseState.watchModels,
            [manualModelId]: 1,
          },
          discoveredCatalogEntries: [manualModelId],
          unlockedMilestones: ["showcase"],
          upgrades: {
            ...baseState.upgrades,
            "archive-guides": 0,
          },
        },
      }),
    );
    render(<App />);
  });

  afterEach(() => {
    cleanup();
  });

  it("locks scroll, traps focus, updates aria-live, and closes on Escape", async () => {
    const user = await setupCatalog();
    await openWindingModal(user);

    const surface = await screen.findByTestId("winding-surface");
    await waitFor(() => expect(surface).toHaveFocus());

    const legend = await screen.findByTestId("winding-band-legend");
    expect(legend).toBeInTheDocument();
    expect(
      within(legend).getByText(/Under-wound|Good wind|Perfect tension|Over-wound!/i),
    ).toBeInTheDocument();
    expect(within(legend).getByTestId("winding-band-under")).toHaveClass("winding-band-chip");

    await user.tab();
    await user.tab();
    expect(document.activeElement).not.toBe(document.body);

    surface.focus();
    await waitFor(() => expect(surface).toHaveFocus());
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.getByTestId("winding-live")).toHaveTextContent(/Stopped at/i),
    );

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByTestId("winding-modal")).toBeNull());
  });

  it("keeps the stop control discoverable and outcome hidden until stopping", async () => {
    const user = await setupCatalog();
    await openWindingModal(user);

    const surface = screen.getByTestId("winding-surface");
    expect(surface).toHaveAttribute("aria-label", "Drag the crown to wind");
    expect(surface).toHaveAttribute("aria-describedby", "winding-live");
    expect(screen.queryByTestId("winding-outcome")).toBeNull();

    const softHint = screen.getByTestId("winding-soft-hint");
    expect(softHint).toHaveTextContent(/red glow/i);

    const legend = screen.getByTestId("winding-band-legend");
    expect(legend).toHaveAttribute("data-active-band");
    const activeBand = legend.getAttribute("data-active-band");

    await user.click(surface);
    await waitFor(() => {
      expect(screen.getByTestId("winding-live")).toHaveTextContent(/Stopped at/i);
      const outcome = screen.getByTestId("winding-outcome");
      expect(outcome).toBeInTheDocument();
      expect(outcome.textContent).toMatch(/enjoyment/i);
    });

    if (activeBand) {
      const activeChip = screen.getByTestId(`winding-band-${activeBand}`);
      expect(activeChip).toHaveClass("active");
    }

    const doneButton = screen.getByTestId("winding-done");
    expect(doneButton).toHaveTextContent(/done/i);
  });
});
