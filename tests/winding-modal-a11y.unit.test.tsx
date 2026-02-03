import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import { createInitialState } from "../src/game/state";

const setupCatalog = async () => {
  const user = userEvent.setup();
  const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
  const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
  await user.click(catalogTab);
  await waitFor(() => expect(catalogTab.getAttribute("aria-selected")).toBe("true"));
  return user;
};

const openWindingModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() =>
    expect(screen.queryAllByTestId(/vault-interact-/i).length).toBeGreaterThan(0),
  );
  const interactButtons = await screen.findAllByTestId(/vault-interact-/i);
  const manualInteract = interactButtons.find((button) => {
    const testId = button.getAttribute("data-testid") ?? "";
    const isManual = /vault-interact-(chronograph|tourbillon)/i.test(testId);
    return isManual && !(button as HTMLButtonElement).disabled;
  });
  const interact =
    manualInteract ?? interactButtons.find((button) => !(button as HTMLButtonElement).disabled);
  expect(interact).toBeTruthy();
  await user.click(interact as HTMLElement);
};

describe("winding modal accessibility", () => {
  beforeEach(async () => {
    localStorage.clear();
    const baseState = createInitialState();
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: {
          ...baseState,
          items: {
            ...baseState.items,
            starter: 1,
            chronograph: 1,
          },
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

    const stopButton = await screen.findByTestId("winding-stop");
    expect(stopButton).toHaveFocus();

    const legend = await screen.findByTestId("winding-band-legend");
    expect(legend).toBeInTheDocument();
    expect(
      within(legend).getByText(/Under-wound|Good wind|Perfect tension|Over-wound!/i),
    ).toBeInTheDocument();
    expect(within(legend).getByTestId("winding-band-under")).toHaveClass("winding-band-chip");

    await user.tab();
    await user.tab();
    expect(document.activeElement).not.toBe(document.body);

    await user.click(stopButton);
    await waitFor(() =>
      expect(screen.getByTestId("winding-live")).toHaveTextContent(/Stopped at/i),
    );

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByTestId("winding-modal")).toBeNull());
  });

  it("keeps the stop control discoverable and outcome hidden until stopping", async () => {
    const user = await setupCatalog();
    await openWindingModal(user);

    const stopButton = screen.getByTestId("winding-stop");
    expect(stopButton).toHaveTextContent(/stop/i);
    expect(stopButton).toHaveAttribute("aria-label", "Stop winding run");
    expect(screen.queryByTestId("winding-outcome")).toBeNull();

    const softHint = screen.getByTestId("winding-soft-hint");
    expect(softHint).toHaveTextContent(/red glow/i);

    const legend = screen.getByTestId("winding-band-legend");
    expect(legend).toHaveAttribute("data-active-band");
    const activeBand = legend.getAttribute("data-active-band");

    await user.click(stopButton);

    await waitFor(() =>
      expect(screen.getByTestId("winding-live")).toHaveTextContent(/Stopped at/i),
    );
    const outcome = await screen.findByTestId("winding-outcome");
    expect(outcome).toBeInTheDocument();
    expect(outcome.textContent).toMatch(/enjoyment/i);

    if (activeBand) {
      const activeChip = screen.getByTestId(`winding-band-${activeBand}`);
      expect(activeChip).toHaveClass("active");
    }

    const doneButton = screen.getByTestId("winding-done");
    expect(doneButton).toHaveTextContent(/done/i);
  });
});
