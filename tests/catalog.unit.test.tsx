import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import App from "../src/App";
import {
  createInitialState,
  getInteractionMovementGate,
  getPowerReserveDetail,
  getSetBonuses,
  getWatchModels,
} from "../src/game/state";
import { getTierBadgeByCategory, type TierBadgeCategory } from "../src/game/tierBadges";

function getModelIdForTier(tierId: string): string {
  const model = getWatchModels().find((entry) => entry.tierId === tierId);
  if (!model) {
    throw new Error(`Missing model for tier: ${tierId}`);
  }
  return model.id;
}

const ALL_CATALOG_IDS = getWatchModels().map((m) => m.id);

const evaluateMediaQuery = (query: string, width: number) => {
  const maxMatch = /max-width:\s*(\d+)px/.exec(query);
  const minMatch = /min-width:\s*(\d+)px/.exec(query);
  const maxWidth = maxMatch ? Number(maxMatch[1]) : undefined;
  const minWidth = minMatch ? Number(minMatch[1]) : undefined;
  const matchesMax = maxWidth === undefined ? true : width <= maxWidth;
  const matchesMin = minWidth === undefined ? true : width >= minWidth;
  return matchesMax && matchesMin;
};

const createMatchMediaMock = (width: number): typeof window.matchMedia =>
  ((query: string) => ({
    matches: evaluateMediaQuery(query, width),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;

const switchToAllPreset = async (user: ReturnType<typeof userEvent.setup>) => {
  const presetSelect = screen.getByLabelText(/Quick preset/i);
  await user.selectOptions(presetSelect, "all");
};

describe("interaction movement gating", () => {
  it("allows automatic watches for rotor interactions", () => {
    expect(getInteractionMovementGate("automatic")).toEqual({ available: true });
  });

  it("allows quartz and hand-wind watches", () => {
    expect(getInteractionMovementGate("quartz")).toEqual({ available: true });
    expect(getInteractionMovementGate("manual")).toEqual({ available: true });
  });
});

describe("power reserve detail", () => {
  it("reports a reserve percent and explanation for automatic watches", () => {
    const baseState = createInitialState();
    const detail = getPowerReserveDetail(
      {
        ...baseState,
        powerReserveByItem: {
          ...baseState.powerReserveByItem,
          automatic: 0.42,
        },
      },
      "automatic",
    );

    expect(detail.reserve01).toBeCloseTo(0.42, 8);
    expect(detail.reservePercent).toBe(42);
    expect(detail.label).toBe("Power reserve");
    expect(detail.explanation).toContain("Automatic");
  });

  it("clamps reserve values between 0 and 100 percent", () => {
    const baseState = createInitialState();
    const high = getPowerReserveDetail(
      {
        ...baseState,
        powerReserveByItem: {
          ...baseState.powerReserveByItem,
          automatic: 2,
        },
      },
      "automatic",
    );
    expect(high.reservePercent).toBe(100);

    const low = getPowerReserveDetail(
      {
        ...baseState,
        powerReserveByItem: {
          ...baseState.powerReserveByItem,
          automatic: -1,
        },
      },
      "automatic",
    );
    expect(low.reservePercent).toBe(0);
  });

  it("provides manual-specific explanation when the movement is wrist-driven", () => {
    const baseState = createInitialState();
    const detail = getPowerReserveDetail(baseState, "quartz");

    expect(detail.explanation).toContain("Manual");
  });
});

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

    expect(document.activeElement).toBe(catalogTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(catalogTab.getAttribute("aria-selected")).toBe("false");
    expect(careerTab.getAttribute("tabindex")).toBe("-1");
    expect(catalogTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(vaultTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(vaultTab.getAttribute("aria-selected")).toBe("false");
    expect(catalogTab.getAttribute("tabindex")).toBe("-1");
    expect(vaultTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(upgradesTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(upgradesTab.getAttribute("aria-selected")).toBe("false");
    expect(vaultTab.getAttribute("tabindex")).toBe("-1");
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

    expect(document.activeElement).toBe(vaultTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(vaultTab.getAttribute("aria-selected")).toBe("false");
    expect(vaultTab.getAttribute("tabindex")).toBe("0");
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("activates the focused tab with %s", async (_label, key) => {
    const user = userEvent.setup();

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    const careerTab = within(tabList).getByRole("tab", { name: /Career/i });

    expect(screen.queryByRole("tabpanel", { name: /Collection/i })).toBeNull();

    careerTab.focus();

    expect(document.activeElement).toBe(careerTab);
    expect(careerTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: /Career/i })).toBeTruthy();

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(catalogTab);
    expect(catalogTab.getAttribute("aria-selected")).toBe("false");

    await user.keyboard(key);

    expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    expect(careerTab.getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("tabpanel", { name: /Catalog/i })).toBeTruthy();
  });

  it("always lands on Career for existing saves", () => {
    cleanup();
    const baseState = createInitialState();
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: baseState,
      }),
    );
    localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "save" }));

    render(<App />);

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const careerTab = within(tabList).getByRole("tab", { name: /Career/i });

    expect(careerTab.getAttribute("aria-selected")).toBe("true");
  });

  it("ignores stored catalog last-tab on initial landing", () => {
    cleanup();
    const baseState = createInitialState();
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: baseState,
      }),
    );
    localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "catalog" }));

    render(<App />);

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const careerTab = within(tabList).getByRole("tab", { name: /Career/i });

    expect(careerTab.getAttribute("aria-selected")).toBe("true");
  });

  it("ignores initial deep-link tabs and keeps Career as first landing", () => {
    cleanup();
    const baseState = createInitialState();
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: baseState,
      }),
    );
    localStorage.setItem("emily-idle:navigation", JSON.stringify({ lastTabId: "save" }));
    window.history.replaceState({}, "", "/?tab=catalog");

    const { unmount } = render(<App />);

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const careerTab = within(tabList).getByRole("tab", { name: /Career/i });

    expect(careerTab.getAttribute("aria-selected")).toBe("true");

    const stored = localStorage.getItem("emily-idle:navigation");
    expect(stored ? JSON.parse(stored) : null).toEqual({ lastTabId: "save" });

    unmount();
    window.history.replaceState({}, "", "/");

    render(<App />);

    const refreshedList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const refreshedCareerTab = within(refreshedList).getByRole("tab", { name: /Career/i });
    expect(refreshedCareerTab.getAttribute("aria-selected")).toBe("true");
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

      const callout = screen.getByTestId("catalog-shop-callout");
      const buyCta = within(callout).getByRole("button", { name: "Open Catalog" });
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

  it("opens the owned catalog view from collection when owned references exist", async () => {
    cleanup();
    localStorage.clear();
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 2,
      },
    };
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: seededState,
      }),
    );
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const collectionTab = within(tabList).getByRole("tab", { name: /Collection/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await user.click(collectionTab);

    const callout = screen.getByTestId("catalog-shop-callout");
    const ownedCta = within(callout).getByRole("button", { name: "Open Owned" });
    expect(ownedCta).toBeEnabled();
    await user.click(ownedCta);

    await waitFor(() => {
      expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    });

    const ownedTab = screen.getByRole("tab", { name: "Owned" });
    await waitFor(() => {
      expect(ownedTab.getAttribute("aria-selected")).toBe("true");
    });
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
        quartz: 5,
      },
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    const chronographModelId = getModelIdForTier("manual");
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        manual: 2,
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
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    expect(panel.textContent).toContain("Movement bonuses");
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
        quartz: 18,
        automatic: 4,
        manual: 2,
        tourbillon: 1,
      },
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    const grid = screen.getByTestId("collection-set-bonus-grid");
    const cards = within(grid).getAllByTestId("collection-set-bonus-card");

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
    const chronographModelId = getModelIdForTier("manual");
    const tourbillonModelId = getModelIdForTier("tourbillon");
    const seededState = {
      ...baseState,
      currencyCents: 100000000,
      enjoymentCents: 100000000,
      discoveredCatalogEntries: ALL_CATALOG_IDS,
      items: {
        ...baseState.items,
        manual: 2,
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
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned/ });

    expect(unownedTab.getAttribute("aria-selected")).toBe("true");
    expect(ownedTab.getAttribute("aria-selected")).toBe("false");
  });

  it("supports roving focus keys for the catalog ownership tablist", async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Catalog ownership/i });
    const unownedTab = within(tabList).getByRole("tab", { name: /Unowned/i });
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned/ });

    unownedTab.focus();
    expect(document.activeElement).toBe(unownedTab);
    expect(unownedTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(ownedTab);
    expect(unownedTab.getAttribute("aria-selected")).toBe("true");
    expect(ownedTab.getAttribute("aria-selected")).toBe("false");
    expect(unownedTab.getAttribute("tabindex")).toBe("-1");
    expect(ownedTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(unownedTab);
    expect(unownedTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{End}");
    expect(document.activeElement).toBe(ownedTab);
    expect(ownedTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(unownedTab);
    expect(unownedTab.getAttribute("tabindex")).toBe("0");
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("activates the focused catalog ownership tab with %s", async (_label, key) => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Catalog ownership/i });
    const unownedTab = within(tabList).getByRole("tab", { name: /Unowned/i });
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned/ });

    unownedTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(ownedTab);
    expect(ownedTab.getAttribute("aria-selected")).toBe("false");

    await user.keyboard(key);

    expect(ownedTab.getAttribute("aria-selected")).toBe("true");
    expect(unownedTab.getAttribute("aria-selected")).toBe("false");

    const unownedPanel = document.getElementById("catalog-unowned");
    const ownedPanel = document.getElementById("catalog-owned");
    if (!unownedPanel || !ownedPanel) {
      throw new Error("Expected catalog ownership tabpanels to exist.");
    }

    expect(unownedPanel.hidden).toBe(true);
    expect(ownedPanel.hidden).toBe(false);
  });

  it("defaults to compact mobile density and exposes quick action controls", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = createMatchMediaMock(390);

    try {
      cleanup();
      render(<App />);

      const user = userEvent.setup();
      const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
      const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
      await user.click(catalogTab);

      const quickActions = await waitFor(() => screen.getByTestId("catalog-quick-actions"));
      expect(quickActions).toBeInTheDocument();
      expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-density", "compact");
      expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-view-mode", "novice");
      expect(screen.queryByTestId("catalog-details")).toBeNull();

      const quickSort = screen.getByTestId("catalog-quick-sort");
      const sortSelect = screen.getByTestId("catalog-sort") as HTMLSelectElement;
      expect(sortSelect.value).toBe("default");
      await user.click(quickSort);
      expect(sortSelect.value).toBe("brand");

      const quickViewMode = screen.getByTestId("catalog-quick-view-mode");
      await user.click(quickViewMode);
      await waitFor(() => {
        expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-view-mode", "expert");
      });

      const quickDensity = screen.getByTestId("catalog-quick-density");
      await user.click(quickDensity);
      await waitFor(() => {
        expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-density", "expanded");
      });
      expect(screen.getAllByTestId("catalog-details").length).toBeGreaterThan(0);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("persists catalog detail mode preference between sessions", async () => {
    const user = userEvent.setup();

    const viewModeToggle = screen.getByTestId("catalog-view-mode-toggle");
    expect(viewModeToggle).toHaveTextContent("Novice");
    expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-view-mode", "novice");

    await user.click(viewModeToggle);
    await waitFor(() => {
      expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-view-mode", "expert");
      expect(screen.getByTestId("catalog-view-mode-toggle")).toHaveTextContent("Expert");
    });

    await waitFor(() => {
      const raw = localStorage.getItem("emily-idle:navigation");
      if (!raw) {
        throw new Error("Expected persisted navigation state.");
      }
      const parsed = JSON.parse(raw) as { catalogFilters?: { viewMode?: string } };
      expect(parsed.catalogFilters?.viewMode).toBe("expert");
    });

    cleanup();
    render(<App />);

    const nextUser = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await nextUser.click(catalogTab);

    await waitFor(() => {
      expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    });
    expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-view-mode", "expert");
    expect(screen.getByTestId("catalog-view-mode-toggle")).toHaveTextContent("Expert");
  });

  it("routes low-frequency compact actions through the details sheet", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = createMatchMediaMock(390);

    try {
      cleanup();
      render(<App />);

      const user = userEvent.setup();
      const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
      const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
      await user.click(catalogTab);

      const ownershipTabs = screen.getByRole("tablist", { name: /Catalog ownership/i });
      await user.click(within(ownershipTabs).getByRole("tab", { name: /^Owned/ }));

      const catalogGrid = screen.getByTestId("catalog-grid");
      const cards = await waitFor(() => within(catalogGrid).getAllByTestId("catalog-card"));
      const firstCard = cards[0];
      if (!(firstCard instanceof HTMLElement)) {
        throw new Error("Expected first catalog card to be an HTMLElement");
      }

      expect(within(firstCard).queryByRole("button", { name: /Explain interactions/i })).toBeNull();
      const moreButton = within(firstCard).getByTestId(/catalog-details-button-/);
      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByTestId("catalog-details-sheet")).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /Explain interactions/i })).toBeInTheDocument();
      await user.click(screen.getByTestId("catalog-details-sheet-close"));
      await waitFor(() => {
        expect(screen.queryByTestId("catalog-details-sheet")).toBeNull();
      });
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("shows movement and progression decision signals in details sheet", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = createMatchMediaMock(390);

    try {
      cleanup();
      render(<App />);

      const user = userEvent.setup();
      const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
      const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
      await user.click(catalogTab);

      const ownershipTabs = screen.getByRole("tablist", { name: /Catalog ownership/i });
      await user.click(within(ownershipTabs).getByRole("tab", { name: /^Owned/ }));

      const catalogGrid = screen.getByTestId("catalog-grid");
      const cards = await waitFor(() => within(catalogGrid).getAllByTestId("catalog-card"));
      const firstCard = cards[0];
      if (!(firstCard instanceof HTMLElement)) {
        throw new Error("Expected first catalog card to be an HTMLElement");
      }

      const moreButton = within(firstCard).getByTestId(/catalog-details-button-/);
      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByTestId("catalog-details-sheet")).toBeInTheDocument();
      });
      await waitFor(() => screen.getByTestId("catalog-decision-summary"));
      const movementSignal = screen.getByTestId("catalog-decision-movement");
      const tierSignal = screen.getByTestId("catalog-decision-tier");
      const progressionSignal = screen.getByTestId("catalog-decision-progression");

      expect(movementSignal.textContent).toMatch(/movement/i);
      expect(tierSignal.textContent).toMatch(/Tier \d of 4/i);
      expect(progressionSignal.textContent).toMatch(/Locked|Buy-ready|Unlocked/i);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("renders the simplified catalog header status line", () => {
    const results = screen.getByTestId("catalog-results-count");
    expect(results.textContent).toMatch(/\d+\s+results/);
    expect(results.textContent).toMatch(/\d+\s+discovered/);
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

    const viewModeToggle = screen.getByTestId("catalog-view-mode-toggle");
    await user.click(viewModeToggle);
    await waitFor(() => {
      expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-view-mode", "expert");
    });

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
    const chronographModelId = getModelIdForTier("manual");
    const factsModelId = "rolex-rolex-gmt-master-ii-ref-126713grnr";
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 90,
        manual: 2,
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
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: seededState,
      }),
    );

    cleanup();
    render(<App />);

    const user = userEvent.setup();
    const primaryTabs = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(primaryTabs).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);

    await switchToAllPreset(user);

    const tabList = screen.getByRole("tablist", { name: /Catalog ownership/i });
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned/ });
    await user.click(ownedTab);

    const viewModeToggle = screen.getByTestId("catalog-view-mode-toggle");
    await user.click(viewModeToggle);
    await waitFor(() => {
      expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-view-mode", "expert");
    });

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
    const chronographModelId = getModelIdForTier("manual");
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        manual: 2,
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
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    const years = cards.map(
      (card) => card.querySelector(".catalog-year")?.textContent?.trim() ?? "",
    );

    expect(years.length).toBeGreaterThan(0);
    expect(years.some((value) => /unknown/i.test(value))).toBe(true);
    expect(years[0]?.toLowerCase()).not.toContain("unknown");
    expect(years[years.length - 1]?.toLowerCase()).toContain("unknown");
  });

  it("orders default catalog results by price ascending", async () => {
    const catalogGrid = screen.getByTestId("catalog-grid");
    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));

    expect(cards.length).toBeGreaterThan(1);

    const priceValues = cards.map((card) => {
      const priceText = card.querySelector(".catalog-price")?.textContent ?? "";
      const parsed = Number(priceText.replace(/[^0-9.]/g, ""));
      expect(Number.isFinite(parsed)).toBe(true);
      return parsed;
    });

    for (let index = 1; index < priceValues.length; index += 1) {
      expect(priceValues[index]).toBeGreaterThanOrEqual(priceValues[index - 1]);
    }
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

    const viewModeToggle = screen.getByTestId("catalog-view-mode-toggle");
    await user.click(viewModeToggle);
    await waitFor(() => {
      expect(screen.getByTestId("catalog-grid")).toHaveAttribute("data-view-mode", "expert");
    });

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
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned/ });

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
  let highlightedModelId = "";

  beforeEach(async () => {
    localStorage.clear();
    const baseState = createInitialState();
    highlightedModelId = getModelIdForTier("quartz");
    const chronographModelId = getModelIdForTier("manual");
    const seededState = {
      ...baseState,
      currencyCents: 2_000_000_00,
      enjoymentCents: 2_000_000_00,
      items: {
        ...baseState.items,
        manual: 1,
      },
      watchModels: {
        ...baseState.watchModels,
        [chronographModelId]: 1,
      },
      unlockedMilestones: ["showcase"],
      discoveredCatalogEntries: [highlightedModelId],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
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

    const ownedTab = screen.getByRole("tab", { name: /^Owned/ });
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

  it("marks affordable unowned discovered catalog cards as actionable", async () => {
    const highlightedBuyButton = await waitFor(() =>
      screen.getByTestId(`catalog-buy-${highlightedModelId}`),
    );
    const card = highlightedBuyButton.closest('[data-testid="catalog-card"]');
    if (!(card instanceof HTMLElement)) {
      throw new Error("Expected a catalog card for the highlighted buy button");
    }

    expect(card.textContent).toContain("0 owned");
    expect(card.classList.contains("catalog-actionable")).toBe(true);
    expect(card.classList.contains("catalog-nonactionable")).toBe(false);
  });

  it("does not mark non-actionable catalog cards as actionable", async () => {
    const user = userEvent.setup();
    await switchToAllPreset(user);

    const catalogGrid = screen.getByTestId("catalog-grid");
    const gates = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-gate-/));
    expect(gates.length).toBeGreaterThan(0);

    const card = gates[0]?.closest('[data-testid="catalog-card"]');
    if (!(card instanceof HTMLElement)) {
      throw new Error("Expected a catalog card for the gate state");
    }

    expect(card.classList.contains("catalog-nonactionable")).toBe(true);
    expect(card.classList.contains("catalog-actionable")).toBe(false);
  });

  it("renders primary and secondary catalog card actions with distinct affordances", async () => {
    const catalogGrid = screen.getByTestId("catalog-grid");
    const buyButtons = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-buy-/));
    expect(buyButtons.length).toBeGreaterThan(0);

    const buyButton = buyButtons[0];
    const card = buyButton.closest('[data-testid="catalog-card"]');
    if (!(card instanceof HTMLElement)) {
      throw new Error("Expected a catalog card for action hierarchy assertions");
    }

    const favoriteToggle = within(card).getByTestId(/catalog-favorite-toggle-/);
    const primaryActions = card.querySelector(".catalog-primary-actions");
    const primaryButtons = primaryActions?.querySelectorAll(".catalog-primary-action");

    expect(buyButton.classList.contains("catalog-primary-action")).toBe(true);
    expect(primaryButtons?.length).toBe(1);
    expect(favoriteToggle.classList.contains("secondary")).toBe(true);
  });
});

describe("catalog card affordances", () => {
  const openCatalogTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });
    await user.click(catalogTab);
    await waitFor(() => {
      expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    });
  };

  afterEach(() => {
    cleanup();
  });

  it("does not render stat preview overlays on catalog cards", async () => {
    localStorage.clear();
    render(<App />);
    await openCatalogTab();

    const catalogGrid = await waitFor(() => screen.getByTestId("catalog-grid"));
    const cards = await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));
    expect(within(cards[0]).queryByTestId(/catalog-preview-/)).toBeNull();
  });

  it("hides dismantle actions until the workshop unlocks", async () => {
    localStorage.clear();
    render(<App />);
    await openCatalogTab();

    const catalogGrid = await waitFor(() => screen.getByTestId("catalog-grid"));
    expect(within(catalogGrid).queryByTestId(/catalog-dismantle-/)).toBeNull();
  });

  it("reveals dismantle actions when the workshop unlocks", async () => {
    cleanup();
    localStorage.clear();
    const baseState = createInitialState();
    const starterModelId = getModelIdForTier("quartz");
    const seededState = {
      ...baseState,
      workshopBlueprints: 1,
      items: {
        ...baseState.items,
        quartz: 3,
      },
      watchModels: {
        ...baseState.watchModels,
        [starterModelId]: 3,
      },
    };
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: seededState,
      }),
    );

    render(<App />);
    await openCatalogTab();

    const catalogGrid = await waitFor(() => screen.getByTestId("catalog-grid"));
    const dismantleButtons = await waitFor(() =>
      within(catalogGrid).getAllByTestId(/catalog-dismantle-/),
    );
    expect(dismantleButtons.length).toBeGreaterThan(0);
  });

  it("falls back to tier placeholders before using terminal media fallback", async () => {
    localStorage.clear();
    render(<App />);
    await openCatalogTab();

    const catalogGrid = await waitFor(() => screen.getByTestId("catalog-grid"));
    const firstImage = catalogGrid.querySelector("img");
    if (!(firstImage instanceof HTMLImageElement)) {
      throw new Error("Expected a catalog image");
    }

    fireEvent.error(firstImage);
    await waitFor(() => {
      expect(firstImage.dataset.fallbackStage).toBe("tier");
    });
    expect(firstImage.src).toContain("/catalog/placeholders/");

    fireEvent.error(firstImage);
    await waitFor(() => {
      expect(firstImage.dataset.fallbackStage).toBe("final");
    });
    expect(firstImage.src).toContain("data:image/svg+xml");
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
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    await switchToAllPreset(user);

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
    expect(explainer.textContent).toContain("Enjoyment");
    expect(explainer.textContent).toContain("Funds");
    expect(explainer.textContent).toContain("Next:");
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
    const chronographModelId = getModelIdForTier("manual");
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        manual: 2,
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
        version: 4,
        savedAt: new Date(0).toISOString(),
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
        quartz: 10,
      },
      achievementUnlocks: ["first-drawer"],
      unlockedMilestones: ["collector-shelf", "showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    expect(metrics.textContent).toContain("Cash");
    expect(metrics.textContent).toContain("Cash / sec");
    expect(metrics.textContent).toContain("Enjoyment");
    expect(metrics.textContent).toContain("Enjoyment / sec");
    expect(metrics.textContent).toContain("Memories");
    expect(screen.queryByTestId("stats-system-details")).toBeNull();
    expect(screen.queryByTestId("stats-event-multiplier")).toBeNull();
  });

  it("renders only discovered entries in the system card", async () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 10,
      },
      enjoymentCents: 0,
      workshopPrestigeCount: 1,
      workshopBlueprints: 0,
      achievementUnlocks: ["first-drawer"],
      unlockedMilestones: ["collector-shelf", "showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
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

    const systemDetails = screen.getByTestId("stats-system-details");
    expect(systemDetails.textContent).toContain("Atelier resets");
    expect(systemDetails.textContent).not.toContain("Maison heritage");
    expect(systemDetails.textContent).not.toContain("Maison reputation");
    expect(systemDetails.textContent).not.toContain("Event multiplier");
    expect(screen.queryByTestId("stats-event-multiplier")).toBeNull();
  });

  it("unlocks lore chapters based on milestones", async () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        quartz: 10,
      },
      achievementUnlocks: ["first-drawer"],
      unlockedMilestones: ["collector-shelf", "showcase"],
    };

    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    const chronographModelId = getModelIdForTier("manual");
    const tourbillonModelId = getModelIdForTier("tourbillon");
    const ownedPayload = {
      version: 4,
      savedAt: new Date(0).toISOString(),
      state: {
        ...baseState,
        items: { quartz: 1, automatic: 0, manual: 2, tourbillon: 0 },
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

    await switchToAllPreset(user);

    const unownedGrid = screen.getByTestId("catalog-grid");
    await waitFor(() => within(unownedGrid).getAllByTestId(/catalog-card/));

    expect(unownedGrid.textContent).toContain("Jaeger-LeCoultre");
  });
});

describe("catalog tier badges", () => {
  beforeEach(async () => {
    cleanup();
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

  it("renders tier badges with proper tooltip text", async () => {
    const catalogGrid = await waitFor(() => screen.getByTestId("catalog-grid"));
    const badge = catalogGrid.querySelector(".catalog-card .tier-badge");
    expect(badge).toBeTruthy();
    const category = badge?.getAttribute("data-tier-badge") as TierBadgeCategory | null;
    expect(category).toBeTruthy();
    const expected = getTierBadgeByCategory(category as TierBadgeCategory);
    expect(badge).toHaveAttribute("title", expected.description);
  });
});

describe("wind minigame", () => {
  beforeEach(async () => {
    localStorage.clear();

    const baseState = createInitialState();
    const manualModelId = getModelIdForTier("manual");
    const tourbillonModelId = getModelIdForTier("tourbillon");
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: {
          ...baseState,
          currencyCents: 100000000,
          enjoymentCents: 100000000,
          discoveredCatalogEntries: [manualModelId, tourbillonModelId],
          items: {
            ...baseState.items,
            manual: 1,
            tourbillon: 1,
          },
          watchModels: {
            ...baseState.watchModels,
            [manualModelId]: 1,
            [tourbillonModelId]: 1,
          },
          unlockedMilestones: ["showcase", "atelier"],
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

    await switchToAllPreset(user);
  });

  afterEach(() => {
    cleanup();
  });

  it("opens and closes the wind session modal and resets progress", async () => {
    const user = userEvent.setup();

    await waitFor(() =>
      expect(screen.queryAllByTestId(/vault-interact-/i).length).toBeGreaterThan(0),
    );
    const chronographButtons = screen.getAllByTestId("vault-interact-manual");
    const chronographInteract = chronographButtons.find(
      (button) => !(button as HTMLButtonElement).disabled,
    );
    expect(chronographInteract).toBeTruthy();

    await user.click(chronographInteract as HTMLElement);

    expect(screen.getByTestId("winding-modal")).toBeTruthy();
    expect(screen.queryByTestId("winding-outcome")).toBeNull();
    const surface = screen.getByTestId("winding-surface");
    expect(surface).toHaveAttribute("aria-label", "Drag the crown to wind");
    expect(surface).toHaveAttribute("aria-describedby", "winding-live");
    const liveRegion = screen.getByTestId("winding-live");
    expect(liveRegion.textContent).toMatch(/Keep dragging/i);
    expect(liveRegion.textContent).toMatch(/Tension \d+%/i);

    const softHint = screen.getByTestId("winding-soft-hint");
    expect(softHint).toHaveTextContent(/red glow/i);

    await user.click(surface);
    expect(screen.getByTestId("winding-outcome").textContent).toMatch(/enjoyment/i);
    expect(screen.getByTestId("winding-live")).toHaveTextContent(/Stopped at/i);
    const legend = screen.getByTestId("winding-band-legend");
    expect(legend).toHaveAttribute("data-active-band");

    await user.click(screen.getByTestId("winding-done"));
    expect(screen.queryByTestId("winding-modal")).toBeNull();

    const ownershipTabs = screen.getByRole("tablist", { name: /Catalog ownership/i });
    await user.click(within(ownershipTabs).getByRole("tab", { name: /^Owned/i }));

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
    const quartzModelId = getModelIdForTier("quartz");
    localStorage.setItem(
      "emily-idle:save",
      JSON.stringify({
        version: 4,
        savedAt: new Date(0).toISOString(),
        state: {
          ...baseState,
          currencyCents: 100000000,
          discoveredCatalogEntries: [quartzModelId],
          items: {
            ...baseState.items,
            quartz: 1,
          },
          watchModels: {
            ...baseState.watchModels,
            [quartzModelId]: 1,
          },
          unlockedMilestones: ["showcase"],
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

  it("opens the quartz modal and applies a cash reward", async () => {
    const user = userEvent.setup();

    const beforeRaw = localStorage.getItem("emily-idle:save");
    expect(beforeRaw).toBeTruthy();
    const before = beforeRaw
      ? (JSON.parse(beforeRaw) as { state: { currencyCents: number } })
      : null;
    if (!before) {
      return;
    }

    const quartzButtons = screen.getAllByTestId("vault-interact-quartz");
    const quartzInteract = quartzButtons.find((button) => !(button as HTMLButtonElement).disabled);
    expect(quartzInteract).toBeTruthy();

    await user.click(quartzInteract as HTMLElement);
    expect(screen.getByTestId("quartz-modal")).toBeTruthy();

    await user.click(screen.getByTestId("quartz-action"));
    const quartzOutcome = await screen.findByTestId("quartz-outcome", {}, { timeout: 8_000 });
    expect(quartzOutcome.textContent).toMatch(/Enjoyment/i);

    await user.click(screen.getByTestId("quartz-done"));
    expect(screen.queryByTestId("quartz-modal")).toBeNull();

    const afterRaw = localStorage.getItem("emily-idle:save");
    expect(afterRaw).toBeTruthy();
    const after = afterRaw ? (JSON.parse(afterRaw) as { state: { currencyCents: number } }) : null;
    if (!after) {
      return;
    }

    expect(after.state.currencyCents).toBeGreaterThan(before.state.currencyCents);
  }, 10_000);
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
        version: 4,
        savedAt: new Date(0).toISOString(),
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
        version: 4,
        savedAt: new Date(0).toISOString(),
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
    expect(screen.queryByRole("heading", { name: /First drawer/i })).toBeTruthy();

    await user.click(saveTab);
    const hideAchievements = screen.getByTestId("settings-hide-achievements") as HTMLInputElement;
    await user.click(hideAchievements);

    await user.click(vaultTab);
    expect(screen.queryByRole("heading", { name: /First drawer/i })).toBeNull();
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
        version: 4,
        savedAt: new Date(0).toISOString(),
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
