import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import { createInitialState, getSetBonuses } from "../src/game/state";

describe("primary navigation tabs", () => {
  beforeEach(() => {
    localStorage.clear();
    render(<App />);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders only vault and save tabs on a fresh save", () => {
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });

    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Save/i });

    expect(vaultTab.getAttribute("id")).toBe("collection-tab");
    expect(vaultTab.getAttribute("aria-controls")).toBe("collection");
    expect(saveTab.getAttribute("id")).toBe("save-tab");
    expect(saveTab.getAttribute("aria-controls")).toBe("save");

    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(saveTab.getAttribute("aria-selected")).toBe("false");

    expect(within(tabList).queryByRole("tab", { name: /Catalog/i })).toBeNull();
    expect(within(tabList).queryByRole("tab", { name: /Stats/i })).toBeNull();
    expect(within(tabList).queryByRole("tab", { name: /Atelier/i })).toBeNull();
    expect(within(tabList).queryByRole("tab", { name: /Maison/i })).toBeNull();
  });

  it("moves focus between visible tabs without activating", async () => {
    const user = userEvent.setup();

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Save/i });

    vaultTab.focus();
    expect(document.activeElement).toBe(vaultTab);
    expect(vaultTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(saveTab);
    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(saveTab.getAttribute("aria-selected")).toBe("false");
    expect(vaultTab.getAttribute("tabindex")).toBe("-1");
    expect(saveTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowLeft}");

    expect(document.activeElement).toBe(vaultTab);
    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(saveTab.getAttribute("aria-selected")).toBe("false");
    expect(vaultTab.getAttribute("tabindex")).toBe("0");
    expect(saveTab.getAttribute("tabindex")).toBe("-1");
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("activates the focused tab with %s", async (_label, key) => {
    const user = userEvent.setup();

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Save/i });

    expect(screen.queryByRole("tabpanel", { name: /Save/i })).toBeNull();

    vaultTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(saveTab);
    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(saveTab.getAttribute("aria-selected")).toBe("false");
    expect(screen.queryByRole("tabpanel", { name: /Save/i })).toBeNull();

    await user.keyboard(key);

    expect(vaultTab.getAttribute("aria-selected")).toBe("false");
    expect(saveTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: /Save/i })).toBeTruthy();
  });
});

describe("catalog tier bonuses", () => {
  beforeEach(() => {
    localStorage.clear();
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 2,
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

  it("renders catalog tier bonuses", () => {
    const [panel] = screen.getAllByTestId("catalog-tier-panel");
    const cards = within(panel).getAllByTestId("catalog-tier-card");

    expect(cards).toHaveLength(4);
    expect(panel.textContent).toContain("Tier bonuses");
  });
});

describe("set bonuses", () => {
  beforeEach(() => {
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
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 2,
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

    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    await user.click(catalogTab);

    expect(vaultTab.getAttribute("aria-selected")).toBe("false");
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
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 90,
        chronograph: 2,
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
    await user.type(searchInput, "Tank Must");

    const catalogGrid = screen.getByTestId("catalog-grid");
    const details = await waitFor(() => within(catalogGrid).getAllByTestId("catalog-facts"));

    expect(details.length).toBeGreaterThan(0);
    expect(details[0]?.tagName).toBe("DETAILS");
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
      expect(card.textContent).not.toContain("Unknown");
      const maybeYear = card.textContent?.match(/\b(19|20)\d{2}\b/)?.[0];
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

describe("catalog ownership tabs", () => {
  beforeEach(() => {
    localStorage.clear();
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        chronograph: 2,
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
    expect(metrics.textContent).toContain("Vault cash");
    expect(metrics.textContent).toContain("Cash / sec");
    expect(metrics.textContent).toContain("Enjoyment");
    expect(metrics.textContent).toContain("Enjoyment / sec");
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

  it("renders trusted dealers panel under the catalog", async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    await user.click(catalogTab);

    expect(screen.getByText(/Trusted dealers \(external\)/i)).toBeTruthy();
    expect(
      screen.getByText(
        /Dealer names are provided for reference only; no affiliation or endorsement is implied\./i,
      ),
    ).toBeTruthy();

    const dealerList = screen.getByTestId("dealer-list");
    const dealers = within(dealerList)
      .getAllByRole("listitem")
      .map((item) => item.textContent);

    expect(dealers).toEqual([
      "Hodinkee",
      "Crown & Caliber",
      "WatchBox",
      "Bob's Watches",
      "Tourneau",
    ]);
  });

  it("shows owned tier entries when items are owned", async () => {
    const baseState = createInitialState();
    const ownedPayload = {
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: Date.now(),
      state: {
        ...baseState,
        items: { starter: 1, classic: 0, chronograph: 2, tourbillon: 0 },
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
  beforeEach(() => {
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
  });

  afterEach(() => {
    cleanup();
  });

  it("opens and closes the wind modal and resets progress", async () => {
    const user = userEvent.setup();

    const interactButtons = screen.getAllByRole("button", { name: /^Interact$/ });
    const enabledInteract = interactButtons.find(
      (button) => !(button as HTMLButtonElement).disabled,
    );
    expect(enabledInteract).toBeTruthy();

    await user.click(enabledInteract as HTMLElement);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByTestId("wind-progress").textContent).toContain("0 / 10");

    const windButton = screen.getByTestId("wind-button");
    await user.click(windButton);
    await user.click(windButton);
    await user.click(windButton);

    expect(screen.getByTestId("wind-progress").textContent).toContain("3 / 10");

    await user.click(screen.getByTestId("wind-close"));
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(enabledInteract as HTMLElement);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByTestId("wind-progress").textContent).toContain("0 / 10");
  });

  it("activates the wind-up event after 10 clicks", async () => {
    const user = userEvent.setup();

    const interactButtons = screen.getAllByRole("button", { name: /^Interact$/ });
    const enabledInteract = interactButtons.find(
      (button) => !(button as HTMLButtonElement).disabled,
    );
    expect(enabledInteract).toBeTruthy();

    await user.click(enabledInteract as HTMLElement);

    const windButton = screen.getByTestId("wind-button");
    for (let i = 0; i < 10; i += 1) {
      await user.click(windButton);
    }

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText(/Current multiplier x1\.05\./i)).toBeTruthy();
  });
});

describe("audio toggles", () => {
  const openSaveTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Save/i });

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
    const saveTab = within(tabList).getByRole("tab", { name: /Save/i });

    await user.click(saveTab);

    expect(saveTab.getAttribute("aria-selected")).toBe("true");
  };

  const openStatsTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const statsTab = within(tabList).getByRole("tab", { name: /Stats/i });

    await user.click(statsTab);

    expect(statsTab.getAttribute("aria-selected")).toBe("true");
  };

  const renderWithStatsUnlocked = () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 12,
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
  };

  const renderWithCatalogUnlocked = () => {
    const baseState = createInitialState();
    const seededState = {
      ...baseState,
      items: {
        ...baseState.items,
        starter: 15,
        chronograph: 1,
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

  it("persists theme selection", async () => {
    const user = userEvent.setup();
    const themeSelect = screen.getByTestId("settings-theme") as HTMLSelectElement;

    await user.selectOptions(themeSelect, "light");

    const raw = localStorage.getItem("emily-idle:settings");
    expect(raw).not.toBeNull();

    const parsed = raw ? JSON.parse(raw) : null;
    expect(parsed.themeMode).toBe("light");
  });

  it("hides completed achievements when enabled", async () => {
    cleanup();
    renderWithStatsUnlocked();
    await openSaveTab();

    const user = userEvent.setup();
    const hideAchievements = screen.getByTestId("settings-hide-achievements") as HTMLInputElement;
    await user.click(hideAchievements);

    await openStatsTab();

    expect(screen.queryByText(/First drawer/i)).toBeNull();
  });

  it("hides tabs when preference disabled", async () => {
    cleanup();
    renderWithCatalogUnlocked();
    await openSaveTab();

    const user = userEvent.setup();
    const catalogToggle = screen.getByTestId("tab-visibility-catalog") as HTMLInputElement;
    await user.click(catalogToggle);

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    expect(within(tabList).queryByRole("tab", { name: /Catalog/i })).toBeNull();
  });
});

describe("coachmarks", () => {
  const openVaultTab = async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });

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
        tabVisibility: {
          collection: true,
          workshop: true,
          maison: true,
          catalog: true,
          stats: true,
          save: true,
        },
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
      items: {
        ...baseState.items,
        tourbillon: 2,
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
    expect(tourbillonCard.textContent).toContain("1 owned");

    await user.click(dismantleButton);
    expect(screen.getByTestId("workshop-crafting-parts").textContent).toContain("16 parts");
    expect(tourbillonCard.textContent).toContain("0 owned");

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
