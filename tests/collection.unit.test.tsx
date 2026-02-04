import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";

describe("collection tier summary", () => {
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

  it("shows a badge for each tier with help copy", () => {
    const summary = screen.getByTestId("collection-tier-summary");
    expect(summary).toBeInTheDocument();
    const cards = within(summary).getAllByTestId(/collection-tier-card-/);
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card.querySelector(".tier-badge")).toBeTruthy();
    });
    const helpButton = within(summary).getByTestId("explain-tier-badges");
    expect(helpButton).toBeInTheDocument();
  });
});
