import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";

describe("catalog favorites experience", () => {
  afterEach(() => cleanup());

  it("filters catalog cards to favorites only", async () => {
    const user = userEvent.setup();
    render(<App />);

    const catalogTab = screen.getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);

    const cards = await screen.findAllByTestId("catalog-card");
    const firstCard = cards[0];
    const favoriteToggle = within(firstCard).getByTestId(/catalog-favorite-toggle-/);
    await user.click(favoriteToggle);

    const favoritesOnly = screen.getByTestId("catalog-favorites-only");
    await user.click(favoritesOnly);

    const filteredCards = screen.getAllByTestId("catalog-card");
    expect(filteredCards.length).toBe(1);
    expect(filteredCards[0]).toContainElement(screen.getByTestId(/catalog-favorite-toggle-/));
  });

  it("shows favorited watches in the collection filter panel", async () => {
    const user = userEvent.setup();
    render(<App />);

    const catalogTab = screen.getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);

    const [firstCard] = await screen.findAllByTestId("catalog-card");
    const favoriteToggle = within(firstCard).getByTestId(/catalog-favorite-toggle-/);
    await user.click(favoriteToggle);

    const collectionTab = screen.getByRole("tab", { name: /Collection/i });
    await user.click(collectionTab);

    const favoritesToggle = within(screen.getByTestId("collection-favorites-toggle")).getByRole(
      "checkbox",
    );
    await user.click(favoritesToggle);

    expect(screen.getByTestId("collection-favorites-panel")).toBeInTheDocument();
    expect(screen.getByTestId(/collection-favorite-/)).toBeInTheDocument();
  });
});
