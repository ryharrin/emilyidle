import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import { createInitialState } from "../src/game/state";

describe("collection depth insights", () => {
  beforeEach(async () => {
    cleanup();
    render(<App />);
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const collectionTab = within(tabList).getByRole("tab", { name: /Collection/i });
    await user.click(collectionTab);
    await waitFor(() => {
      expect(collectionTab.getAttribute("aria-selected")).toBe("true");
    });
    const overviewButton = screen
      .getByTestId("collection-section-nav-item-collection-overview")
      .querySelector("button");
    if (!overviewButton) {
      throw new Error("Missing collection overview section button");
    }
    await user.click(overviewButton);
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render the tier badges summary panel", () => {
    expect(screen.queryByTestId("collection-tier-summary")).toBeNull();
    expect(screen.queryByTestId("explain-tier-badges")).toBeNull();
  });

  it("renders set bonus progress and analytics panels", async () => {
    const user = userEvent.setup();
    const setBonusesButton = screen
      .getByTestId("collection-section-nav-item-collection-set-bonuses")
      .querySelector("button");
    if (!setBonusesButton) {
      throw new Error("Missing collection set bonuses section button");
    }
    await user.click(setBonusesButton);

    const bonusGrid = await screen.findByTestId("collection-set-bonus-grid");
    expect(bonusGrid).toBeInTheDocument();
    const cards = within(bonusGrid).getAllByTestId("collection-set-bonus-card");
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      expect(card.textContent).toMatch(/\d+\s*\/\s*\d+/);
      expect(card).toHaveTextContent(/Active|Need|Complete/);
    });

    const prestige = screen.getByTestId("collection-prestige-preview");
    expect(prestige).toBeVisible();
    const analytics = screen.getByTestId("collection-analytics-panel");
    expect(analytics).toBeVisible();

    const optionalGroups = [
      "collection-analytics-brand",
      "collection-analytics-era",
      "collection-analytics-tier",
    ];
    optionalGroups.forEach((testId) => {
      const group = screen.queryByTestId(testId);
      if (group) {
        const entries = within(group).queryAllByRole("listitem");
        expect(entries.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("renders watch passport fallback copy when no watch is equipped", () => {
    const passport = screen.getByTestId("collection-watch-passport");
    expect(passport).toBeVisible();
    expect(passport).toHaveTextContent("Watch passport");
    expect(passport).toHaveTextContent("Equip a watch to view its passport and provenance.");
  });
});

describe("collection watch passport", () => {
  beforeEach(async () => {
    cleanup();
    const baseState = createInitialState();
    const wornWatchId = "rolex-rolex-gmt-master-ref-16700";
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: {
          ...baseState,
          wornWatchId,
          discoveredCatalogEntries: [wornWatchId],
          watchModels: {
            ...baseState.watchModels,
            [wornWatchId]: 1,
          },
        },
      }),
    );

    render(<App />);
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const collectionTab = within(tabList).getByRole("tab", { name: /Collection/i });
    await user.click(collectionTab);
    await waitFor(() => {
      expect(collectionTab.getAttribute("aria-selected")).toBe("true");
    });
    const overviewButton = screen
      .getByTestId("collection-section-nav-item-collection-overview")
      .querySelector("button");
    if (!overviewButton) {
      throw new Error("Missing collection overview section button");
    }
    await user.click(overviewButton);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows provenance details for the equipped watch passport", async () => {
    const user = userEvent.setup();
    const passport = screen.getByTestId("collection-watch-passport");
    expect(passport).toBeVisible();
    expect(passport).toHaveTextContent("Watch passport");

    await user.click(screen.getByTestId("collection-watch-passport-toggle"));
    expect(screen.getByTestId("collection-watch-passport-provenance")).toBeVisible();
  });
});
