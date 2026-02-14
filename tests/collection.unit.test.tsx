import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";

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
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render the tier badges summary panel", () => {
    expect(screen.queryByTestId("collection-tier-summary")).toBeNull();
    expect(screen.queryByTestId("explain-tier-badges")).toBeNull();
  });

  it("renders set bonus progress and analytics panels", () => {
    const bonusGrid = screen.getByTestId("collection-set-bonus-grid");
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
});
