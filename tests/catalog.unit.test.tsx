import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import App from "../src/App";
import { createInitialState, getSetBonuses, getWatchModels } from "../src/game/state";

function getModelIdForTier(tierId: string): string {
  const model = getWatchModels().find((entry) => entry.tierId === tierId);
  if (!model) {
    throw new Error(`Missing model for tier: ${tierId}`);
  }
  return model.id;
}

describe("primary navigation tabs", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
    render(<App />);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders collection, career, and save tabs on a fresh save", () => {
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });

    const vaultTab = within(tabList).getByRole("tab", { name: /Collection/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    const careerTab = within(tabList).getByRole("tab", { name: /Career/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });

    expect(vaultTab.getAttribute("id")).toBe("collection-tab");
    expect(vaultTab.getAttribute("aria-controls")).toBe("collection");
    expect(careerTab.getAttribute("id")).toBe("career-tab");
    expect(careerTab.getAttribute("aria-controls")).toBe("career");
    expect(saveTab.getAttribute("id")).toBe("save-tab");
    expect(saveTab.getAttribute("aria-controls")).toBe("save");
    expect(catalogTab.getAttribute("id")).toBe("catalog-tab");
    expect(catalogTab.getAttribute("aria-controls")).toBe("catalog");

    expect(vaultTab.getAttribute("aria-selected")).toBe("false");
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(saveTab.getAttribute("aria-selected")).toBe("false");
    expect(catalogTab.getAttribute("aria-selected")).toBe("false");

    expect(within(tabList).queryByRole("tab", { name: /Stats/i })).toBeNull();
    expect(within(tabList).queryByRole("tab", { name: /Atelier/i })).toBeNull();
    expect(within(tabList).queryByRole("tab", { name: /Maison/i })).toBeNull();
    expect(careerTab).toBeTruthy();
  });

  it("moves focus between visible tabs without activating", async () => {
    const user = userEvent.setup();

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const careerTab = within(tabList).getByRole("tab", { name: /Career/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Collection/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    const upgradesTab = within(tabList).getByRole("tab", { name: /Upgrades/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });

    careerTab.focus();
    expect(document.activeElement).toBe(careerTab);
    expect(careerTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(vaultTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(vaultTab.getAttribute("aria-selected")).toBe("false");
    expect(careerTab.getAttribute("tabindex")).toBe("-1");
    expect(vaultTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(catalogTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(catalogTab.getAttribute("aria-selected")).toBe("false");
    expect(vaultTab.getAttribute("tabindex")).toBe("-1");
    expect(catalogTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(upgradesTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(upgradesTab.getAttribute("aria-selected")).toBe("false");
    expect(catalogTab.getAttribute("tabindex")).toBe("-1");
    expect(upgradesTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(saveTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(saveTab.getAttribute("aria-selected")).toBe("false");
    expect(upgradesTab.getAttribute("tabindex")).toBe("-1");
    expect(saveTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowLeft}");

    expect(document.activeElement).toBe(upgradesTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(upgradesTab.getAttribute("aria-selected")).toBe("false");
    expect(upgradesTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowLeft}");

    expect(document.activeElement).toBe(catalogTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(catalogTab.getAttribute("aria-selected")).toBe("false");
    expect(catalogTab.getAttribute("tabindex")).toBe("0");
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("activates the focused tab with %s", async (_label, key) => {
    const user = userEvent.setup();

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Collection/i });
    const careerTab = within(tabList).getByRole("tab", { name: /Career/i });

    expect(screen.queryByRole("tabpanel", { name: /Collection/i })).toBeNull();

    careerTab.focus();

    expect(document.activeElement).toBe(careerTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: /Career/i })).toBeTruthy();

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(vaultTab);
    expect(vaultTab.getAttribute("aria-selected")).toBe("false");

    await user.keyboard(key);

    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(careerTab.getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("tabpanel", { name: /Collection/i })).toBeTruthy();
  });

  it("restores the last visited tab for existing saves", () => {
    cleanup();
    const baseState = createInitialState();
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: baseState,
      }),
    );
    localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "save" }));

    render(<App />);

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });

    expect(saveTab.getAttribute("aria-selected")).toBe("true");
  });

  it("restores catalog last-tab when it is visible", () => {
    cleanup();
    const baseState = createInitialState();
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: baseState,
      }),
    );
    localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "catalog" }));

    render(<App />);

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    expect(catalogTab.getAttribute("aria-selected")).toBe("true");
  });

  it("honors catalog deep links without persisting last-tab", () => {
    cleanup();
    const baseState = createInitialState();
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: baseState,
      }),
    );
    localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "save" }));
    window.history.replaceState({}, "", "/?tab=catalog");

    const { unmount } = render(<App />);

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    expect(catalogTab.getAttribute("aria-selected")).toBe("true");

    const stored = localStorage.getItem("emily-idle:navigation");
    expect(stored ? JSON.parse(stored) : null).toEqual({ lastTabId: "save" });

    unmount();
    window.history.replaceState({}, "", "/");

    render(<App />);

    const refreshedList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const saveTab = within(refreshedList).getByRole("tab", { name: /Settings/i });
    expect(saveTab.getAttribute("aria-selected")).toBe("true");
  });

  it("scrolls buy watch CTAs to the catalog shop", async () => {
    const user = userEvent.setup();
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    const scrollSpy = vi.spyOn(HTMLElement.prototype, "scrollIntoView");

    try {
      const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
      const vaultTab = within(tabList).getByRole("tab", { name: /Collection/i });
      const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
      await user.click(vaultTab);

      const buyCta = screen.getByTestId("next-unlock-cta-career");
      await user.click(buyCta);

      await waitFor(() => {
        expect(catalogTab.getAttribute("aria-selected")).toBe("true");
      });

      const catalogPanelId = catalogTab.getAttribute("aria-controls");
      if (!catalogPanelId) {
        throw new Error("Expected catalog tabpanel id");
      }

      const catalogPanel = document.getElementById(catalogPanelId);
      if (!catalogPanel) {
        throw new Error("Expected catalog tabpanel to exist");
      }

      await waitFor(() => {
        expect(catalogPanel.querySelector("#catalog-shop")).toBeTruthy();
      });

      const scrollTarget = catalogPanel.querySelector("#catalog-shop");
      if (!scrollTarget) {
        throw new Error("Expected catalog shop anchor to exist");
      }

      const buyButton = scrollTarget.querySelector('[data-testid^="catalog-buy-"]');
      if (!(buyButton instanceof HTMLElement)) {
        throw new Error("Expected catalog buy CTA to exist");
      }

      expect(scrollSpy).toHaveBeenCalledWith({ block: "start", behavior: "auto" });
    } finally {
      scrollSpy.mockRestore();
      rafSpy.mockRestore();
    }
  });

  it("keeps catalog buy buttons inside the catalog tabpanel", async () => {
    const user = userEvent.setup();

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);

    await waitFor(() => {
      expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    });

    const catalogPanelId = catalogTab.getAttribute("aria-controls");
    if (!catalogPanelId) {
      throw new Error("Expected catalog tabpanel id");
    }

    const catalogPanel = document.getElementById(catalogPanelId);
    if (!catalogPanel) {
      throw new Error("Expected catalog tabpanel element");
    }

    const buyButtons = await waitFor(() => screen.getAllByTestId(/catalog-buy-/));
    expect(buyButtons.length).toBeGreaterThan(0);

    buyButtons.forEach((button) => {
      expect(catalogPanel.contains(button)).toBe(true);
    });
  });
});

describe("career tab unlock", () => {
  beforeEach(() => {
    localStorage.clear();
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 5,
      },
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the Career tab and panel when unlocked", async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });

    const careerTab = within(tabList).getByRole("tab", { name: /Career/i });
    expect(careerTab.getAttribute("id")).toBe("career-tab");
    expect(careerTab.getAttribute("aria-controls")).toBe("career");

    await user.click(careerTab);

    expect(screen.getByRole("tabpanel", { name: /Career/i })).toBeTruthy();
    expect(screen.getByTestId("career-panel")).toBeTruthy();
    expect(screen.getByTestId("career-status")).toBeTruthy();
    expect(screen.getByTestId("career-action")).toBeTruthy();
  });
});

describe("catalog tier bonuses", () => {
  beforeEach(async () => {
    localStorage.clear();
    const baseState = createInitialState();
    const chronographModelId = getModelIdForTier("chronograph");
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 2,
      },
      watchModels: {
        ...baseState.watchModels,
        [chronographModelId]: 2,
        "cartier-cartier-tank-must-2021": 1,
      },
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Collection/i });
    await user.click(vaultTab);
    await waitFor(() => {
      expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders catalog tier bonuses", () => {
    const [panel] = screen.getAllByTestId("catalog-tier-panel");
    const cards = within(panel).getAllByTestId("catalog-tier-card");

    expect(cards).toHaveLength(4);
    expect(panel.textContent).toContain("Tier bonuses");
  });
});

describe("set bonuses", () => {
  beforeEach(async () => {
    localStorage.clear();
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 18,
        classic: 4,
        chronograph: 2,
        tourbillon: 1,
      },
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Collection/i });
    await user.click(vaultTab);
    await waitFor(() => {
      expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders set bonus cards and activates collector quartet", () => {
    const list = screen.getByTestId("set-bonus-list");
    const cards = within(list).getAllByTestId("set-bonus-card");

    expect(cards).toHaveLength(getSetBonuses().length);

    const collectorCard = cards.find(
      (card) => card.getAttribute("data-bonus-id") === "collector-quartet",
    );

    expect(collectorCard).toBeTruthy();
    expect(collectorCard?.textContent).toContain("Collector quartet");
    expect(collectorCard?.textContent).toContain("Active");
  });
});

describe("catalog filters", () => {
  beforeEach(async () => {
    localStorage.clear();
    const baseState = createInitialState();
    const chronographModelId = getModelIdForTier("chronograph");
    const tourbillonModelId = getModelIdForTier("tourbillon");
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 2,
        tourbillon: 1,
      },
      watchModels: {
        ...baseState.watchModels,
        [chronographModelId]: 2,
        [tourbillonModelId]: 1,
      },
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });

    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    await user.click(catalogTab);

    expect(catalogTab.getAttribute("aria-selected")).toBe("true");
  });

  const getCatalogCardBrands = async () => {
    const catalogGrid = screen.getByTestId("catalog-grid");
    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    return cards.map((card) => {
      const brand = card.querySelector(".catalog-brand");
      return brand?.textContent ?? "";
    });
  };

  afterEach(() => {
    cleanup();
  });

  it("defaults catalog view to unowned", () => {
    const tabList = screen.getByRole("tablist", { name: /Catalog ownership/i });
    const unownedTab = within(tabList).getByRole("tab", { name: /Unowned/i });
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned$/ });

    expect(unownedTab.getAttribute("aria-selected")).toBe("true");
    expect(ownedTab.getAttribute("aria-selected")).toBe("false");
  });

  it("renders the catalog collection context pill", () => {
    const context = screen.getByTestId("catalog-collection-context");
    const contextText = context.textContent ?? "";

    expect(contextText).toMatch(/Collection:\s*[\d,]+\s*\/\s*[\d,]+/);
    expect(contextText).toMatch(/Collection value:/);

    const upgradeContext = screen.getByTestId("catalog-upgrade-context");
    expect(upgradeContext.textContent).toContain("Upgrades");
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

  it("includes new brands in catalog filters", async () => {
    const user = userEvent.setup();

    const [brandSelect] = screen.getAllByTestId(/catalog-brand/);
    const [catalogGrid] = screen.getAllByTestId(/catalog-grid/);

    const options = Array.from(brandSelect.querySelectorAll("option")).map(
      (option) => option.textContent,
    );

    expect(options).toContain("Omega");
    expect(options).toContain("Cartier");

    await user.selectOptions(brandSelect, "Omega");
    let cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card.textContent).toContain("Omega");
    });

    await user.selectOptions(brandSelect, "Cartier");
    cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card.textContent).toContain("Cartier");
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

  it("filters catalog by style", async () => {
    const user = userEvent.setup();

    const styleSelect = screen.getByTestId("catalog-style");
    const catalogGrid = screen.getByTestId("catalog-grid");

    await user.selectOptions(styleSelect, "womens");

    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card.textContent).toContain("womens");
    });
  });

  it("renders catalog facts as details when present", async () => {
    const baseState = createInitialState();
    const chronographModelId = getModelIdForTier("chronograph");
    const factsModelId = "rolex-rolex-gmt-master-ii-ref-126713grnr";
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 90,
        chronograph: 2,
      },
      watchModels: {
        ...baseState.watchModels,
        [chronographModelId]: 2,
        [factsModelId]: 1,
      },
      discoveredCatalogEntries: ["cartier-cartier-tank-must-2021"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    cleanup();
    render(<App />);

    const user = userEvent.setup();
    const primaryTabs = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(primaryTabs).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);

    const tabList = screen.getByRole("tablist", { name: /Catalog ownership/i });
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned$/ });
    await user.click(ownedTab);

    const searchInput = screen.getByTestId("catalog-search");
    await user.type(searchInput, "GMT-Master");

    const catalogGrid = screen.getByTestId("catalog-grid");
    const details = await waitFor(() => within(catalogGrid).getAllByTestId("catalog-details"));
    const facts = within(catalogGrid).getAllByTestId("catalog-facts");

    expect(details.length).toBeGreaterThan(0);
    expect(details[0]?.tagName).toBe("DETAILS");
    expect(facts.length).toBeGreaterThan(0);
  });

  it("does not render collector notes for unowned entries", async () => {
    const baseState = createInitialState();
    const chronographModelId = getModelIdForTier("chronograph");
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 2,
      },
      watchModels: {
        ...baseState.watchModels,
        [chronographModelId]: 2,
      },
      unlockedMilestones: ["showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    cleanup();
    render(<App />);

    const user = userEvent.setup();
    const primaryTabs = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(primaryTabs).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);

    const searchInput = screen.getByTestId("catalog-search");
    await user.type(searchInput, "Tank Must");

    const catalogGrid = screen.getByTestId("catalog-grid");
    await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));

    expect(catalogGrid.textContent).toContain("Cartier");
    expect(screen.queryByTestId("catalog-facts")).toBeNull();
  });

  it("sorts catalog by brand (A→Z)", async () => {
    const user = userEvent.setup();

    const sortSelect = screen.getByTestId("catalog-sort");
    await user.selectOptions(sortSelect, "brand");

    const brands = (await getCatalogCardBrands()).map((brand) => brand.toLowerCase());

    expect(brands.length).toBeGreaterThan(0);
    const sorted = brands.slice().sort((a, b) => a.localeCompare(b));
    expect(brands).toEqual(sorted);
  });

  it("sorts catalog by year with Unknown last", async () => {
    const user = userEvent.setup();

    const sortSelect = screen.getByTestId("catalog-sort");
    await user.selectOptions(sortSelect, "year");

    const catalogGrid = screen.getByTestId("catalog-grid");
    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));

    expect(cards[0]?.textContent).toContain("2021");
    expect(cards[cards.length - 1]?.textContent).toContain("Unknown");
  });

  it("filters catalog by era ranges", async () => {
    const user = userEvent.setup();

    const eraSelect = screen.getByTestId("catalog-era");
    const catalogGrid = screen.getByTestId("catalog-grid");

    await user.selectOptions(eraSelect, "1970-1999");

    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      const yearLabel = card.querySelector(".catalog-year");
      const yearText = yearLabel?.textContent ?? "";
      expect(yearText).not.toContain("Unknown");
      const maybeYear = yearText.match(/\b(19|20)\d{2}\b/)?.[0];
      expect(maybeYear).toBeTruthy();
      const year = maybeYear ? Number(maybeYear) : 0;
      expect(year).toBeGreaterThanOrEqual(1970);
      expect(year).toBeLessThanOrEqual(1999);
    });
  });

  it("filters catalog by type tags", async () => {
    const user = userEvent.setup();

    const typeSelect = screen.getByTestId("catalog-type");
    const catalogGrid = screen.getByTestId("catalog-grid");

    await user.selectOptions(typeSelect, "diver");

    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach((card) => {
      expect(card.textContent?.toLowerCase()).toContain("diver");
    });
  });

  it("shows owned grid when tiers are owned", async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Catalog ownership/i });
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned$/ });

    await user.click(ownedTab);

    expect(ownedTab.getAttribute("aria-selected")).toBe("true");
    await waitFor(() => {
      expect(screen.queryByTestId("catalog-owned-empty")).toBeNull();
      expect(screen.getByTestId("catalog-grid")).toBeTruthy();
    });
  }, 20_000);

  it("shows catalog filters when catalog is unlocked", async () => {
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    await userEvent.click(catalogTab);

    expect(screen.getByTestId("catalog-filters")).toBeTruthy();
  });
});

describe("catalog purchase CTA", () => {
  beforeEach(async () => {
    localStorage.clear();
    const baseState = createInitialState();
    const chronographModelId = getModelIdForTier("chronograph");
    const seededState = {
      ...baseState,
      currencyCents: 2_000_000_00,
      enjoymentCents: 2_000_000_00,
      items: {
        ...baseState.items,
        chronograph: 1,
      },
      watchModels: {
        ...baseState.watchModels,
        [chronographModelId]: 1,
      },
      unlockedMilestones: ["showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);
    await waitFor(() => {
      expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("increments owned count after a catalog purchase", async () => {
    const user = userEvent.setup();
    const catalogGrid = screen.getByTestId("catalog-grid");
    const buyButtons = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-buy-/));

    expect(buyButtons.length).toBeGreaterThan(0);

    const button = buyButtons[0];
    const card = button.closest('[data-testid="catalog-card"]');
    const buyTestId = button.getAttribute("data-testid");
    if (!(card instanceof HTMLElement) || !buyTestId) {
      throw new Error("Expected a catalog card for the buy button");
    }

    const ownedLabel = within(card).getByText(/owned/i);
    const ownedCount = Number(ownedLabel.textContent?.match(/\d+/)?.[0] ?? 0);

    await user.click(button);

    const ownedTab = screen.getByRole("tab", { name: /^Owned$/ });
    await user.click(ownedTab);

    await waitFor(() => {
      const ownedGrid = screen.getByTestId("catalog-grid");
      const updatedButton = within(ownedGrid).getByTestId(buyTestId);
      const updatedCard = updatedButton.closest('[data-testid="catalog-card"]');
      if (!(updatedCard instanceof HTMLElement)) {
        throw new Error("Expected updated catalog card after purchase");
      }
      const nextOwnedLabel = within(updatedCard).getByText(/owned/i);
      const nextOwnedCount = Number(nextOwnedLabel.textContent?.match(/\d+/)?.[0] ?? 0);
      expect(nextOwnedCount).toBeGreaterThan(ownedCount);
    });
  });

  it("marks affordable catalog cards as actionable", async () => {
    const catalogGrid = screen.getByTestId("catalog-grid");
    const buyButtons = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-buy-/));

    expect(buyButtons.length).toBeGreaterThan(0);

    const card = buyButtons[0]?.closest('[data-testid="catalog-card"]');
    if (!(card instanceof HTMLElement)) {
      throw new Error("Expected a catalog card for the buy button");
    }

    expect(card.classList.contains("catalog-actionable")).toBe(true);
  });
});

describe("catalog gating explanations", () => {
  const classicModelId = "rolex-rolex-gmt-master-ii-ref-126713grnr";

  beforeEach(async () => {
    localStorage.clear();
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      currencyCents: 0,
      enjoymentCents: 0,
      discoveredCatalogEntries: [],
      unlockedMilestones: ["collector-shelf", "showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);
    await waitFor(() => {
      expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders lock overlay and explainer for gated entries", async () => {
    const user = userEvent.setup();
    const catalogFilters = screen.getByTestId("catalog-filters");
    const searchInput = within(catalogFilters).getByTestId("catalog-search");

    await user.type(searchInput, "126713GRNR");

    expect(screen.queryByTestId(`catalog-buy-${classicModelId}`)).toBeNull();
    expect(screen.getByTestId(`catalog-gate-${classicModelId}`)).toBeTruthy();
    expect(screen.getByTestId(`catalog-lock-${classicModelId}`)).toBeTruthy();

    const whyButton = screen.getByTestId(`catalog-why-${classicModelId}`);
    await user.click(whyButton);

    const explainer = screen.getByTestId(`catalog-explain-${classicModelId}`);
    expect(explainer).toHaveAttribute("open");
    expect(explainer.textContent).toContain("Enjoyment requirement");
    expect(explainer.textContent).toContain("Cash requirement");
  });
});

describe("catalog help entry", () => {
  beforeEach(async () => {
    localStorage.clear();
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);
    await waitFor(() => {
      expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("opens help focused on catalog shopping", async () => {
    const user = userEvent.setup();
    const helpTarget = screen.getByTestId("catalog-help");
    const helpButton = within(helpTarget).getByRole("button");

    await user.click(helpButton);

    expect(screen.getByTestId("help-modal")).toBeTruthy();
    expect(screen.getByTestId("help-active-section").textContent).toBe("Catalog shopping");
  });
});

describe("catalog ownership tabs", () => {
  beforeEach(() => {
    localStorage.clear();
    const baseState = createInitialState();
    const chronographModelId = getModelIdForTier("chronograph");
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 2,
      },
      watchModels: {
        ...baseState.watchModels,
        [chronographModelId]: 2,
      },
      achievementUnlocks: ["first-drawer"],
      unlockedMilestones: ["collector-shelf", "showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders stats tab metrics when stats are unlocked", async () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 10,
      },
      achievementUnlocks: ["first-drawer"],
      unlockedMilestones: ["collector-shelf", "showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    cleanup();
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const statsTab = within(tabList).getByRole("tab", { name: /Stats/i });

    await user.click(statsTab);

    expect(statsTab.getAttribute("aria-selected")).toBe("true");

    const metrics = screen.getByTestId("stats-metrics");
    expect(metrics.textContent).toContain("Collection enjoyment");
    expect(metrics.textContent).toContain("Enjoyment / sec");
    expect(metrics.textContent).toContain("Dollars");
    expect(metrics.textContent).toContain("Dollars / sec");
    expect(metrics.textContent).toContain("Memories");
    expect(metrics.textContent).toContain("Atelier resets");
    expect(metrics.textContent).toContain("Maison heritage");
    expect(metrics.textContent).toContain("Maison reputation");
    expect(metrics.textContent).toContain("Event multiplier");

    expect(screen.getByTestId("stats-event-multiplier").textContent).toMatch(/^x\d+\.\d{2}$/);
  });

  it("unlocks lore chapters based on milestones", async () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 10,
      },
      achievementUnlocks: ["first-drawer"],
      unlockedMilestones: ["collector-shelf", "showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    cleanup();
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const statsTab = within(tabList).getByRole("tab", { name: /Stats/i });

    await user.click(statsTab);

    expect(statsTab.getAttribute("aria-selected")).toBe("true");

    const chapters = screen.getAllByTestId("lore-chapter");
    expect(chapters).toHaveLength(2);

    const titles = chapters.map((chapter) => chapter.textContent);
    expect(titles.some((text) => text?.includes("First arrivals"))).toBe(true);
    expect(titles.some((text) => text?.includes("The cabinet grows"))).toBe(true);
    expect(titles.some((text) => text?.includes("Atelier nights"))).toBe(false);
  });

  it("does not render trusted dealers panel under the catalog", async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    await user.click(catalogTab);

    expect(screen.queryByTestId("catalog-dealers")).toBeNull();
  });

  it("shows owned tier entries when items are owned", async () => {
    const baseState = createInitialState();
    const chronographModelId = getModelIdForTier("chronograph");
    const tourbillonModelId = getModelIdForTier("tourbillon");
    const ownedPayload = {
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: Date.now(),
      state: {
        ...baseState,
        items: { starter: 1, classic: 0, chronograph: 2, tourbillon: 0 },
        watchModels: {
          ...baseState.watchModels,
          [chronographModelId]: 2,
          [tourbillonModelId]: 1,
        },
        upgrades: {
          ...baseState.upgrades,
          "archive-guides": 0,
        },
      },
    };

    localStorage.setItem("emily-idle:save", JSON.stringify(ownedPayload));
    cleanup();
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    await user.click(catalogTab);

    const unownedGrid = screen.getByTestId("catalog-grid");
    await waitFor(() => within(unownedGrid).getAllByTestId(/catalog-card/));

    expect(unownedGrid.textContent).toContain("Jaeger-LeCoultre");
  });
});

describe("wind minigame", () => {
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
            chronograph: 1,
            tourbillon: 1,
          },
          upgrades: {
            ...baseState.upgrades,
            "archive-guides": 0,
          },
        },
      }),
    );

    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);
  });

  afterEach(() => {
    cleanup();
  });

  it("opens and closes the wind session modal and resets progress", async () => {
    const user = userEvent.setup();

    const chronographButtons = screen.getAllByTestId("vault-interact-chronograph");
    const chronographInteract = chronographButtons.find(
      (button) => !(button as HTMLButtonElement).disabled,
    );
    expect(chronographInteract).toBeTruthy();

    await user.click(chronographInteract as HTMLElement);

    expect(screen.getByTestId("winding-modal")).toBeTruthy();
    expect(screen.queryByTestId("winding-outcome")).toBeNull();
    const stopButton = screen.getByTestId("winding-stop");
    expect(stopButton).toHaveTextContent(/stop/i);
    const liveRegion = screen.getByTestId("winding-live");
    expect(liveRegion.textContent).toMatch(/Keep winding/i);
    expect(liveRegion.textContent).toMatch(/Tension \d+%/i);

    const softHint = screen.getByTestId("winding-soft-hint");
    expect(softHint).toHaveTextContent(/red glow/i);

    await user.click(screen.getByTestId("winding-stop"));
    expect(screen.getByTestId("winding-outcome").textContent).toMatch(/enjoyment/i);
    expect(screen.getByTestId("winding-live")).toHaveTextContent(/Stopped at/i);
    const legend = screen.getByTestId("winding-band-legend");
    expect(legend).toHaveAttribute("data-active-band");

    await user.click(screen.getByTestId("winding-done"));
    expect(screen.queryByTestId("winding-modal")).toBeNull();

    const ownershipTabs = screen.getByRole("tablist", { name: /Catalog ownership/i });
    await user.click(within(ownershipTabs).getByRole("tab", { name: /^Owned$/i }));

    const tourbillonButtons = screen.getAllByTestId("vault-interact-tourbillon");
    const tourbillonInteract = tourbillonButtons.find(
      (button) => !(button as HTMLButtonElement).disabled,
    );
    expect(tourbillonInteract).toBeTruthy();

    await user.click(tourbillonInteract as HTMLElement);
    expect(screen.getByTestId("winding-modal")).toBeTruthy();
    expect(screen.queryByTestId("winding-outcome")).toBeNull();

    await user.click(screen.getByTestId("winding-close"));
    expect(screen.queryByTestId("winding-modal")).toBeNull();
  });
});

describe("quartz minigame", () => {
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
          },
          upgrades: {
            ...baseState.upgrades,
            "archive-guides": 0,
          },
        },
      }),
    );

    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);
    await waitFor(() => {
      expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("opens the quartz modal and applies an enjoyment reward", async () => {
    const user = userEvent.setup();

    const beforeRaw = localStorage.getItem("emily-idle:save");
    expect(beforeRaw).toBeTruthy();
    const before = beforeRaw
      ? (JSON.parse(beforeRaw) as { state: { enjoymentCents: number } })
      : null;
    if (!before) {
      return;
    }

    const quartzButtons = screen.getAllByTestId("vault-interact-starter");
    const quartzInteract = quartzButtons.find((button) => !(button as HTMLButtonElement).disabled);
    expect(quartzInteract).toBeTruthy();

    await user.click(quartzInteract as HTMLElement);
    expect(screen.getByTestId("quartz-modal")).toBeTruthy();

    await user.click(screen.getByTestId("quartz-action"));
    expect(screen.getByTestId("quartz-outcome").textContent).toMatch(/Enjoyment/i);

    await user.click(screen.getByTestId("quartz-done"));
    expect(screen.queryByTestId("quartz-modal")).toBeNull();

    const afterRaw = localStorage.getItem("emily-idle:save");
    expect(afterRaw).toBeTruthy();
    const after = afterRaw ? (JSON.parse(afterRaw) as { state: { enjoymentCents: number } }) : null;
    if (!after) {
      return;
    }

    expect(after.state.enjoymentCents).toBeGreaterThan(before.state.enjoymentCents);
  });
});

describe("audio toggles", () => {
  const openSaveTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });

    await user.click(saveTab);

    expect(saveTab.getAttribute("aria-selected")).toBe("true");
  };

  beforeEach(async () => {
    localStorage.clear();
    render(<App />);

    await openSaveTab();
  });

  afterEach(() => {
    cleanup();
  });

  it("defaults both toggles to off when storage is empty", () => {
    const sfxToggle = screen.getByTestId("audio-sfx-toggle") as HTMLInputElement;
    const bgmToggle = screen.getByTestId("audio-bgm-toggle") as HTMLInputElement;

    expect(sfxToggle.checked).toBe(false);
    expect(bgmToggle.checked).toBe(false);
  });

  it("falls back to defaults for invalid JSON", async () => {
    localStorage.setItem("emily-idle:audio", "not-json");
    cleanup();
    render(<App />);

    await openSaveTab();

    const sfxToggle = screen.getByTestId("audio-sfx-toggle") as HTMLInputElement;
    const bgmToggle = screen.getByTestId("audio-bgm-toggle") as HTMLInputElement;
    expect(sfxToggle.checked).toBe(false);
    expect(bgmToggle.checked).toBe(false);
  });

  it("persists changes when toggled", async () => {
    const user = userEvent.setup();

    const sfxToggle = screen.getByTestId("audio-sfx-toggle") as HTMLInputElement;
    await user.click(sfxToggle);

    const raw = localStorage.getItem("emily-idle:audio");
    expect(raw).not.toBeNull();

    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed).toEqual({ sfxEnabled: true, bgmEnabled: false });
  });
});

describe("settings preferences", () => {
  const openSaveTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });

    await user.click(saveTab);

    expect(saveTab.getAttribute("aria-selected")).toBe("true");
  };

  const renderWithWorkshopVisible = () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      workshopPrestigeCount: 1,
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);
  };

  const renderWithAchievementsUnlocked = () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      achievementUnlocks: ["first-drawer"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);
  };

  beforeEach(async () => {
    localStorage.clear();
    render(<App />);

    await openSaveTab();
  });

  afterEach(() => {
    cleanup();
  });

  it("defaults to system theme and shows all toggles", () => {
    const themeSelect = screen.getByTestId("settings-theme") as HTMLSelectElement;
    const hideAchievements = screen.getByTestId("settings-hide-achievements") as HTMLInputElement;

    expect(themeSelect.value).toBe("system");
    expect(hideAchievements.checked).toBe(false);
  });

  it("applies theme mode to the document root", async () => {
    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("system");
    });

    const user = userEvent.setup();
    const themeSelect = screen.getByTestId("settings-theme") as HTMLSelectElement;

    await user.selectOptions(themeSelect, "light");
    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    await user.selectOptions(themeSelect, "dark");
    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });

  it("falls back to defaults for invalid JSON", async () => {
    localStorage.setItem("emily-idle:settings", "not-json");

    cleanup();
    render(<App />);

    await openSaveTab();

    const themeSelect = screen.getByTestId("settings-theme") as HTMLSelectElement;
    const hideAchievements = screen.getByTestId("settings-hide-achievements") as HTMLInputElement;

    expect(themeSelect.value).toBe("system");
    expect(hideAchievements.checked).toBe(false);
  });

  it("defaults unlocked tab toggles to visible", async () => {
    cleanup();
    renderWithWorkshopVisible();

    await openSaveTab();

    const workshopToggle = screen.getByTestId("tab-visibility-workshop") as HTMLInputElement;
    expect(workshopToggle.checked).toBe(true);
  });

  it("persists theme selection", async () => {
    const user = userEvent.setup();
    const themeSelect = screen.getByTestId("settings-theme") as HTMLSelectElement;

    await user.selectOptions(themeSelect, "light");

    const raw = localStorage.getItem("emily-idle:settings");
    expect(raw).not.toBeNull();

    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed.themeMode).toBe("light");
  });

  it("persists achievement visibility preference", async () => {
    const user = userEvent.setup();
    const hideAchievements = screen.getByTestId("settings-hide-achievements") as HTMLInputElement;

    await user.click(hideAchievements);

    const raw = localStorage.getItem("emily-idle:settings");
    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed.hideCompletedAchievements).toBe(true);
  });

  it("hides completed achievements when enabled", async () => {
    cleanup();
    renderWithAchievementsUnlocked();

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Collection/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });

    await user.click(vaultTab);
    expect(screen.queryByText(/First drawer/i)).toBeTruthy();

    await user.click(saveTab);
    const hideAchievements = screen.getByTestId("settings-hide-achievements") as HTMLInputElement;
    await user.click(hideAchievements);

    await user.click(vaultTab);
    expect(screen.queryByText(/First drawer/i)).toBeNull();
  });

  it("persists hidden tab selections", async () => {
    cleanup();
    renderWithWorkshopVisible();
    await openSaveTab();

    const user = userEvent.setup();
    const workshopToggle = screen.getByTestId("tab-visibility-workshop") as HTMLInputElement;
    await user.click(workshopToggle);

    const raw = localStorage.getItem("emily-idle:settings");
    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed.hiddenTabs).toEqual(["workshop"]);
  });

  it("hides tabs when preference disabled", async () => {
    cleanup();
    renderWithWorkshopVisible();

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const workshopTab = within(tabList).getByRole("tab", { name: /Atelier/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });

    expect(workshopTab.getAttribute("aria-selected")).toBe("false");

    await user.click(saveTab);

    const workshopToggle = screen.getByTestId("tab-visibility-workshop") as HTMLInputElement;
    await user.click(workshopToggle);

    expect(within(tabList).queryByRole("tab", { name: /Atelier/i })).toBeNull();
  });
});

describe("coachmarks", () => {
  const openVaultTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Collection/i });

    await user.click(vaultTab);

    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
  };

  beforeEach(async () => {
    localStorage.clear();
    render(<App />);

    await openVaultTab();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders coachmarks for new players", async () => {
    const coachmarks = screen.getAllByTestId("coachmark");
    expect(coachmarks.length).toBeGreaterThan(0);

    const titles = coachmarks.map((card) =>
      within(card as HTMLElement)
        .getByRole("heading", { level: 4 })
        .textContent?.trim(),
    );

    expect(titles).toContain("Collection basics");
    expect(titles).toContain("Catalog archive");
    expect(titles).toContain("Atelier reset");
    expect(titles).toContain("Maison legacy");
    expect(titles).toContain("Set bonuses");
    expect(titles).toContain("Crafting workshop");
  });

  it("stores dismissed coachmarks in settings", async () => {
    const coachmarks = screen.getAllByTestId("coachmark");
    const user = userEvent.setup();

    const dismissButton = within(coachmarks[0] as HTMLElement).getByRole("button", {
      name: /Dismiss/i,
    });

    await user.click(dismissButton);

    const raw = localStorage.getItem("emily-idle:settings");
    expect(raw).toContain("coachmarksDismissed");
  });

  it("respects persisted dismissals", () => {
    localStorage.setItem(
      "emily-idle:settings",
      JSON.stringify({
        themeMode: "system",
        hideCompletedAchievements: false,
        hiddenTabs: [],
        coachmarksDismissed: {
          "vault-basics": true,
          "catalog-archive": true,
          "atelier-reset": true,
          "maison-legacy": true,
          "set-bonuses": true,
          "crafting-workshop": true,
        },
      }),
    );

    cleanup();
    render(<App />);

    expect(screen.queryByTestId("coachmark")).toBeNull();
    expect(screen.queryByTestId("coachmarks")).toBeNull();
  });
});

describe("dev mode controls", () => {
  const openSaveTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Settings/i });

    await user.click(saveTab);
    expect(saveTab.getAttribute("aria-selected")).toBe("true");
  };

  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render dev controls when dev mode is disabled", async () => {
    render(<App />);
    await openSaveTab();

    expect(screen.queryByTestId("dev-controls")).toBeNull();
  });

  it("renders dev controls when enabled via ?dev=1", async () => {
    window.history.replaceState({}, "", "/?dev=1");
    render(<App />);
    await openSaveTab();

    await waitFor(() => {
      expect(screen.getByTestId("dev-controls")).toBeTruthy();
    });
  });

  it("grants cash and persists save when enabled", async () => {
    window.history.replaceState({}, "", "/?dev");
    render(<App />);
    await openSaveTab();

    await waitFor(() => {
      expect(screen.getByTestId("dev-controls")).toBeTruthy();
    });

    const user = userEvent.setup();
    const devControls = screen.getByTestId("dev-controls");
    await user.click(within(devControls).getByRole("button", { name: /Grant/i }));

    const rawSave = localStorage.getItem("emily-idle:save");
    expect(rawSave).toBeTruthy();
    if (!rawSave) {
      throw new Error("Expected save to be written after dev purchase");
    }

    const parsed = JSON.parse(rawSave);
    expect(parsed.state.currencyCents).toBeGreaterThan(createInitialState().currencyCents);
  });
});

describe("atelier crafting UI", () => {
  const openAtelierTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const atelierTab = within(tabList).getByRole("tab", { name: /Atelier/i });

    await user.click(atelierTab);
    expect(atelierTab.getAttribute("aria-selected")).toBe("true");
  };

  beforeEach(async () => {
    localStorage.clear();

    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      enjoymentCents: 640_000,
      workshopBlueprints: 1,
      items: {
        ...baseState.items,
        tourbillon: 3,
      },
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: Date.now(),
        state: seededState,
      }),
    );

    render(<App />);
    await openAtelierTab();
  });

  afterEach(() => {
    cleanup();
  });

  it("dismantles watches into parts and crafts a boost", async () => {
    const user = userEvent.setup();

    expect(screen.getByTestId("workshop-crafting")).toBeTruthy();
    expect(screen.getByTestId("workshop-crafting-parts").textContent).toContain("0 parts");

    const dismantleList = screen.getByTestId("workshop-dismantle-list");
    const dismantleCards = within(dismantleList).getAllByTestId(
      "workshop-dismantle-card",
    ) as HTMLElement[];
    const tourbillonCard = dismantleCards.find(
      (card) => card.getAttribute("data-item-id") === "tourbillon",
    );
    expect(tourbillonCard).toBeTruthy();
    if (!tourbillonCard) {
      throw new Error("Expected tourbillon dismantle card");
    }

    const dismantleButton = within(tourbillonCard).getByRole("button", { name: /Dismantle/i });

    await user.click(dismantleButton);
    expect(screen.getByTestId("workshop-crafting-parts").textContent).toContain("8 parts");
    expect(tourbillonCard.textContent).toContain("2 owned");

    await user.click(dismantleButton);
    expect(screen.getByTestId("workshop-crafting-parts").textContent).toContain("16 parts");
    expect(tourbillonCard.textContent).toContain("1 owned");
    expect(dismantleButton).toBeDisabled();

    const recipes = screen.getByTestId("workshop-crafting-recipes");
    const polishedToolsHeading = within(recipes).getByRole("heading", {
      name: /Polished tools/i,
    });
    const polishedToolsCard = polishedToolsHeading.closest(".card");
    expect(polishedToolsCard).toBeTruthy();
    if (!(polishedToolsCard instanceof HTMLElement)) {
      throw new Error("Expected Polished tools recipe card");
    }

    await user.click(within(polishedToolsCard).getByRole("button", { name: /^Craft$/ }));

    expect(screen.getByTestId("workshop-crafting-parts").textContent).toContain("4 parts");
    expect(within(polishedToolsCard).getByText(/1 crafted/i)).toBeTruthy();
    expect(screen.getByTestId("workshop-crafting-boosts").textContent).toContain("Income x1.05");
  });
});
