import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";

describe("catalog filters", () => {
  beforeEach(() => {
    localStorage.clear();
    render(<App />);
  });

  afterEach(() => {
    cleanup();
  });

  it("filters catalog by search text", async () => {
    const user = userEvent.setup();

    const [searchInput] = screen.getAllByTestId(/catalog-search/);
    const [catalogGrid] = screen.getAllByTestId(/catalog-grid/);

    await user.type(searchInput, "reverso");

    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThan(10);

    cards.forEach((card) => {
      expect(card.textContent?.toLowerCase()).toContain("reverso");
    });
  });

  it("filters catalog by brand", async () => {
    const user = userEvent.setup();

    const [brandSelect] = screen.getAllByTestId(/catalog-brand/);
    const [catalogGrid] = screen.getAllByTestId(/catalog-grid/);

    await user.selectOptions(brandSelect, "Rolex");

    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card.textContent).toContain("Rolex");
    });
  });

  it("updates results count for combined filters", async () => {
    const user = userEvent.setup();

    const [brandSelect] = screen.getAllByTestId(/catalog-brand/);
    const [searchInput] = screen.getAllByTestId(/catalog-search/);
    const [resultsCount] = screen.getAllByTestId(/catalog-results-count/);
    const [catalogGrid] = screen.getAllByTestId(/catalog-grid/);

    await user.selectOptions(brandSelect, "Jaeger-LeCoultre");
    await user.type(searchInput, "reverso");

    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));

    expect(resultsCount.textContent).toContain(`${cards.length} results`);
    cards.forEach((card) => {
      expect(card.textContent).toContain("Jaeger-LeCoultre");
      expect(card.textContent?.toLowerCase()).toContain("reverso");
    });
  });
});
