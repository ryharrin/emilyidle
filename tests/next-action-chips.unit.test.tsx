import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import {
  createInitialState,
  enterPhdProgram,
  getNostalgiaPrestigeThresholdCents,
  getWatchModels,
  getWorkshopPrestigeThresholdCents,
} from "../src/game/state";

const SETTINGS_KEY = "emily-idle:settings";
const SAVE_KEY = "emily-idle:save";

function seedSave(state: ReturnType<typeof createInitialState>) {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: Date.now(),
      state,
    }),
  );
}

async function openTab(name: RegExp) {
  const user = userEvent.setup();
  const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
  await user.click(within(tabList).getByRole("tab", { name }));
}

describe("next-action chips", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a CTA chip after first career start and navigates to Catalog", async () => {
    render(<App />);
    const user = userEvent.setup();

    expect(screen.queryByTestId("next-action-chip-rail")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("career-next-action-start"));

    const chip = await screen.findByTestId("next-action-chip-career-started");
    expect(chip).toHaveTextContent(/Career started/i);

    await user.click(screen.getByTestId("next-action-chip-cta-career-started"));

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    await waitFor(() => {
      expect(within(tabList).getByRole("tab", { name: /Catalog/i })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
    expect(screen.queryByTestId("next-action-chip-career-started")).not.toBeInTheDocument();
  }, 30_000);

  it("shows a first purchase chip and keeps it dismissed across future purchases", async () => {
    const starter = enterPhdProgram(createInitialState(), 0);
    const seeded = {
      ...starter,
      currencyCents: 1_000_000,
      enjoymentCents: 50_000,
    };
    seedSave(seeded);
    render(<App />);

    const modelId = getWatchModels()[0]?.id;
    if (!modelId) {
      throw new Error("Missing starter model id");
    }

    await openTab(/Catalog/i);
    const user = userEvent.setup();
    await user.click(screen.getByTestId(`catalog-buy-${modelId}`));

    const firstPurchaseChip = await screen.findByTestId("next-action-chip-first-purchase");
    expect(firstPurchaseChip).toBeVisible();

    await user.click(screen.getByTestId("next-action-chip-dismiss-first-purchase"));
    await waitFor(() => {
      expect(screen.queryByTestId("next-action-chip-first-purchase")).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId(`catalog-buy-${modelId}`));
    await waitFor(() => {
      expect(screen.queryByTestId("next-action-chip-first-purchase")).not.toBeInTheDocument();
    });

    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    expect(rawSettings).not.toBeNull();
    const parsed = rawSettings ? JSON.parse(rawSettings) : {};
    expect(parsed.coachmarksDismissed?.["next-action:first-purchase"]).toBe(true);
  }, 30_000);

  it("shows a prestige completion chip after workshop reset and routes to Atelier", async () => {
    const threshold = getWorkshopPrestigeThresholdCents();
    const seeded = {
      ...createInitialState(),
      enjoymentCents: threshold,
      nostalgiaEnjoymentEarnedCents: getNostalgiaPrestigeThresholdCents(),
    };
    seedSave(seeded);

    render(<App />);
    await openTab(/Atelier/i);

    const user = userEvent.setup();
    const workshopPanel = screen.getByTestId("workshop-panel");
    await user.click(within(workshopPanel).getByRole("button", { name: /Review reset/i }));
    await user.click(within(workshopPanel).getByRole("button", { name: /Confirm reset/i }));

    const chip = await screen.findByTestId("next-action-chip-prestige-workshop");
    expect(chip).toHaveTextContent(/Atelier prestige complete/i);

    await openTab(/Collection/i);
    await user.click(screen.getByTestId("next-action-chip-cta-prestige-workshop"));

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    await waitFor(() => {
      expect(within(tabList).getByRole("tab", { name: /Atelier/i })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  }, 30_000);
});