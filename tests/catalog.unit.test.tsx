import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App";
import { createInitialState } from "../src/game/state";

describe("primary navigation tabs", () => {
  beforeEach(() => {
    localStorage.clear();
    render(<App />);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the primary navigation tablist and tabs", () => {
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });

    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    expect(vaultTab.getAttribute("id")).toBe("collection-tab");
    expect(vaultTab.getAttribute("aria-controls")).toBe("collection");

    expect(catalogTab.getAttribute("id")).toBe("catalog-tab");
    expect(catalogTab.getAttribute("aria-controls")).toBe("catalog");

    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(catalogTab.getAttribute("aria-selected")).toBe("false");
  });

  it("moves focus with arrow keys without activating tabs", async () => {
    const user = userEvent.setup();

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const atelierTab = within(tabList).getByRole("tab", { name: /Atelier/i });

    vaultTab.focus();
    expect(document.activeElement).toBe(vaultTab);
    expect(vaultTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(atelierTab);
    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(atelierTab.getAttribute("aria-selected")).toBe("false");
    expect(vaultTab.getAttribute("tabindex")).toBe("-1");
    expect(atelierTab.getAttribute("tabindex")).toBe("0");

    await user.keyboard("{ArrowLeft}");

    expect(document.activeElement).toBe(vaultTab);
    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(atelierTab.getAttribute("aria-selected")).toBe("false");
    expect(vaultTab.getAttribute("tabindex")).toBe("0");
    expect(atelierTab.getAttribute("tabindex")).toBe("-1");
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("activates the focused tab with %s", async (_label, key) => {
    const user = userEvent.setup();

    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    expect(screen.queryByTestId("catalog-filters")).toBeNull();

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");

    expect(document.activeElement).toBe(catalogTab);
    expect(vaultTab.getAttribute("aria-selected")).toBe("true");
    expect(catalogTab.getAttribute("aria-selected")).toBe("false");
    expect(screen.queryByTestId("catalog-filters")).toBeNull();

    await user.keyboard(key);

    expect(vaultTab.getAttribute("aria-selected")).toBe("false");
    expect(catalogTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByTestId("catalog-filters")).toBeTruthy();
  });
});

describe("catalog tier bonuses", () => {
  beforeEach(() => {
    localStorage.clear();
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

describe("catalog filters", () => {
  beforeEach(async () => {
    localStorage.clear();
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });

    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const catalogTab = within(tabList).getByRole("tab", { name: /Catalog/i });

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");

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
    const user = userEvent.setup();

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

  it("shows owned empty state when no tiers are owned", async () => {
    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Catalog ownership/i });
    const ownedTab = within(tabList).getByRole("tab", { name: /^Owned$/ });

    await user.click(ownedTab);

    expect(ownedTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByTestId("catalog-owned-empty")).toBeTruthy();
  });
});

describe("catalog ownership tabs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders stats tab metrics", async () => {
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const statsTab = within(tabList).getByRole("tab", { name: /Stats/i });

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");

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
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const statsTab = within(tabList).getByRole("tab", { name: /Stats/i });

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");

    expect(statsTab.getAttribute("aria-selected")).toBe("true");

    const chapters = screen.getAllByTestId("lore-chapter");
    expect(chapters).toHaveLength(2);

    const titles = chapters.map((chapter) => chapter.textContent);
    expect(titles.some((text) => text?.includes("First arrivals"))).toBe(true);
    expect(titles.some((text) => text?.includes("The cabinet grows"))).toBe(true);
    expect(titles.some((text) => text?.includes("Atelier nights"))).toBe(false);
  });

  it("renders trusted dealers panel under the catalog", async () => {
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");

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
    const ownedPayload = {
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: Date.now(),
      state: {
        currencyCents: 0,
        enjoymentCents: 0,
        items: { starter: 1, classic: 0, chronograph: 0, tourbillon: 0 },
        upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
        unlockedMilestones: [],
        workshopBlueprints: 0,
        workshopPrestigeCount: 0,
        workshopUpgrades: {
          "etched-ledgers": false,
          "vault-calibration": false,
          "heritage-templates": false,
          "automation-blueprints": false,
        },
        maisonHeritage: 0,
        maisonReputation: 0,
        maisonUpgrades: {
          "atelier-charter": false,
          "heritage-loom": false,
          "global-vitrine": false,
        },
        maisonLines: {
          "atelier-line": false,
          "heritage-line": false,
          "complication-line": false,
        },
        achievementUnlocks: [],
        eventStates: { "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 } },
        discoveredCatalogEntries: [],
        catalogTierUnlocks: [],
      },
    };

    localStorage.setItem("emily-idle:save", JSON.stringify(ownedPayload));
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");

    const ownershipTabList = screen.getByRole("tablist", { name: /Catalog ownership/i });
    const ownedTab = within(ownershipTabList).getByRole("tab", { name: /^Owned$/ });
    await user.click(ownedTab);

    const [catalogGrid] = screen.getAllByTestId(/catalog-grid/);
    await waitFor(() => within(catalogGrid).getAllByTestId(/catalog-card/));

    const ownedCards = within(catalogGrid).getAllByTestId(/catalog-card/);
    expect(ownedCards.length).toBeGreaterThan(0);
    ownedCards.forEach((card) => {
      expect(card.textContent).not.toContain("Jaeger-LeCoultre");
      expect(card.textContent).not.toContain("Audemars Piguet");
    });
  });

  it("excludes owned tiers from unowned tab", async () => {
    const ownedPayload = {
      version: 2,
      savedAt: new Date(0).toISOString(),
      lastSimulatedAtMs: Date.now(),
      state: {
        currencyCents: 0,
        enjoymentCents: 0,
        items: { starter: 1, classic: 0, chronograph: 0, tourbillon: 0 },
        upgrades: { "polishing-tools": 0, "assembly-jigs": 0, "guild-contracts": 0 },
        unlockedMilestones: [],
        workshopBlueprints: 0,
        workshopPrestigeCount: 0,
        workshopUpgrades: {
          "etched-ledgers": false,
          "vault-calibration": false,
          "heritage-templates": false,
          "automation-blueprints": false,
        },
        maisonHeritage: 0,
        maisonReputation: 0,
        maisonUpgrades: {
          "atelier-charter": false,
          "heritage-loom": false,
          "global-vitrine": false,
        },
        maisonLines: {
          "atelier-line": false,
          "heritage-line": false,
          "complication-line": false,
        },
        achievementUnlocks: [],
        eventStates: { "auction-weekend": { activeUntilMs: 0, nextAvailableAtMs: 0 } },
        discoveredCatalogEntries: [],
        catalogTierUnlocks: [],
      },
    };

    localStorage.setItem("emily-idle:save", JSON.stringify(ownedPayload));
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");

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
  beforeEach(async () => {
    localStorage.clear();
    render(<App />);

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });

    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Save/i });

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");

    expect(vaultTab.getAttribute("aria-selected")).toBe("false");
    expect(saveTab.getAttribute("aria-selected")).toBe("true");
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

    const user = userEvent.setup();
    const tabList = screen.getByRole("tablist", { name: /Primary navigation/i });
    const saveTab = within(tabList).getByRole("tab", { name: /Save/i });
    const vaultTab = within(tabList).getByRole("tab", { name: /Vault/i });

    vaultTab.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");

    expect(saveTab.getAttribute("aria-selected")).toBe("true");
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
