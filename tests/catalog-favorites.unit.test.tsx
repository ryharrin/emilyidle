import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";

describe("catalog favorites experience", () => {
  afterEach(() => cleanup());

  const isVisibleInPanel = (node: HTMLElement) => node.closest("[hidden]") === null;

  async function ensureCatalogFiltersOpen(user: ReturnType<typeof userEvent.setup>) {
    const catalogPanel = screen.getByRole("tabpanel", { name: /Catalog/i });
    const filterPanel = within(catalogPanel).getByTestId("catalog-filter-panel");
    if (filterPanel.hasAttribute("hidden")) {
      await user.click(within(catalogPanel).getByTestId("catalog-filter-toggle"));
    }
    return within(catalogPanel).getByTestId("catalog-filter-panel");
  }

  async function waitForTabSwitchComplete() {
    await waitFor(() => {
      expect(screen.getByTestId("tab-switch-skeleton")).toHaveAttribute("data-visible", "false");
    });
  }

  it("filters catalog cards to favorites only", async () => {
    const user = userEvent.setup();
    render(<App />);

    const catalogTab = screen.getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);
    await waitForTabSwitchComplete();
    const filterPanel = await ensureCatalogFiltersOpen(user);

    const catalogPanel = screen.getByRole("tabpanel", { name: /Catalog/i });
    const cards = await within(catalogPanel).findAllByTestId("catalog-card");
    const firstCard = cards.find((card) => isVisibleInPanel(card as HTMLElement));
    expect(firstCard).toBeDefined();
    if (!firstCard) {
      return;
    }
    const favoriteToggle = within(firstCard).getByTestId(/catalog-favorite-toggle-/);
    const favoriteToggleTestId = favoriteToggle.getAttribute("data-testid");
    await user.click(favoriteToggle);
    expect(favoriteToggleTestId).not.toBeNull();
    if (!favoriteToggleTestId) {
      return;
    }
    await waitFor(() => {
      expect(screen.getByTestId(favoriteToggleTestId)).toHaveAttribute("aria-pressed", "true");
    });

    const favoritesOnly = within(filterPanel).getByTestId("catalog-favorites-only");
    await user.click(favoritesOnly);
    await waitFor(() => {
      expect((screen.getByTestId("catalog-favorites-only") as HTMLInputElement).checked).toBe(true);
    });

    const filteredCards = within(catalogPanel)
      .getAllByTestId("catalog-card")
      .filter((card) => isVisibleInPanel(card as HTMLElement));
    expect(filteredCards.length).toBe(1);
    expect(
      within(filteredCards[0]).getByTestId(/catalog-favorite-toggle-/),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows favorited watches in the collection filter panel", async () => {
    const user = userEvent.setup();
    render(<App />);

    const catalogTab = screen.getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);
    await waitForTabSwitchComplete();
    await ensureCatalogFiltersOpen(user);

    const catalogPanel = screen.getByRole("tabpanel", { name: /Catalog/i });
    const cards = await within(catalogPanel).findAllByTestId("catalog-card");
    const firstCard = cards.find((card) => isVisibleInPanel(card as HTMLElement));
    expect(firstCard).toBeDefined();
    if (!firstCard) {
      return;
    }
    const favoriteToggle = within(firstCard).getByTestId(/catalog-favorite-toggle-/);
    const favoriteToggleTestId = favoriteToggle.getAttribute("data-testid");
    await user.click(favoriteToggle);
    expect(favoriteToggleTestId).not.toBeNull();
    if (!favoriteToggleTestId) {
      return;
    }
    await waitFor(() => {
      expect(screen.getByTestId(favoriteToggleTestId)).toHaveAttribute("aria-pressed", "true");
    });

    const collectionTab = screen.getByRole("tab", { name: /Collection/i });
    await user.click(collectionTab);
    await waitForTabSwitchComplete();

    const favoritesToggle = within(screen.getByTestId("collection-favorites-toggle")).getByRole(
      "checkbox",
    );
    await user.click(favoritesToggle);

    expect(screen.getByTestId("collection-favorites-panel")).toBeInTheDocument();
    const collectionPanel = screen.getByRole("tabpanel", { name: /Collection/i });
    const favoriteCards = within(collectionPanel)
      .queryAllByTestId(/collection-favorite-/)
      .filter((card) => isVisibleInPanel(card as HTMLElement));
    expect(favoriteCards.length).toBeGreaterThan(0);
  });
});
