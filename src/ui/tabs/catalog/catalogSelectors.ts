import type { CatalogEntry } from "../../../game/catalog";
import type { GameState } from "../../../game/state";
import {
  getWatchModelOwnedCount,
  getWatchModelPurchaseGate,
  getWatchModelTierId,
  isItemUnlocked,
} from "../../../game/state";

export type CatalogFilterState = {
  search: string;
  brand: string;
  style: "all" | "womens";
  sort: "default" | "brand" | "year" | "tier";
  era: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown";
  type: "all" | "gmt" | "manual" | "dress" | "diver";
  favoritesOnly: boolean;
};

export type CatalogViewState = {
  viewMode: "novice" | "expert";
  density: "compact" | "expanded";
};

export function filterCatalogEntries(
  entries: ReadonlyArray<CatalogEntry>,
  filters: CatalogFilterState,
  favoriteIds: ReadonlySet<string>,
): CatalogEntry[] {
  return entries.filter((entry) => {
    // Search filter
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase().trim();
      const match =
        entry.model.toLowerCase().includes(term) ||
        entry.brand.toLowerCase().includes(term) ||
        entry.year.toLowerCase().includes(term) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(term));
      if (!match) return false;
    }

    // Brand filter
    if (filters.brand !== "All" && entry.brand !== filters.brand) {
      return false;
    }

    // Style filter
    if (filters.style === "womens" && !entry.tags.includes("womens")) {
      return false;
    }

    // Era filter
    if (filters.era !== "all") {
      const year = entry.year;
      if (filters.era === "pre-1970" && (year >= "1970" || year === "Unknown")) return false;
      if (filters.era === "1970-1999" && (year < "1970" || year >= "2000")) return false;
      if (filters.era === "2000+" && year < "2000") return false;
      if (filters.era === "unknown" && year !== "Unknown") return false;
    }

    // Type filter
    if (filters.type !== "all") {
      const hasType = entry.tags.some((tag) => tag.toLowerCase() === filters.type);
      if (!hasType) return false;
    }

    // Favorites filter
    if (filters.favoritesOnly && !favoriteIds.has(entry.id)) {
      return false;
    }

    return true;
  });
}

export function sortCatalogEntries(
  entries: CatalogEntry[],
  sort: "default" | "brand" | "year" | "tier",
): CatalogEntry[] {
  const sorted = [...entries];

  switch (sort) {
    case "brand":
      sorted.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
      break;
    case "year":
      sorted.sort((a, b) => {
        const yearA = a.year === "Unknown" ? "0" : a.year;
        const yearB = b.year === "Unknown" ? "0" : b.year;
        return yearB.localeCompare(yearA) || a.brand.localeCompare(b.brand);
      });
      break;
    case "tier":
      sorted.sort((a, b) => {
        const tierA = getWatchModelTierId(a.id);
        const tierB = getWatchModelTierId(b.id);
        const orderA = ["quartz", "automatic", "manual", "tourbillon"].indexOf(tierA);
        const orderB = ["quartz", "automatic", "manual", "tourbillon"].indexOf(tierB);
        if (orderA !== orderB) return orderA - orderB;
        return a.model.localeCompare(b.model);
      });
      break;
    default:
      // Keep original order
      break;
  }

  return sorted;
}

export function filterByOwnershipTab(
  entries: ReadonlyArray<CatalogEntry>,
  state: GameState,
  tab: "unowned" | "owned",
): CatalogEntry[] {
  if (tab === "unowned") {
    return entries.filter((entry) => getWatchModelOwnedCount(state, entry.id) === 0);
  }
  return entries.filter((entry) => getWatchModelOwnedCount(state, entry.id) > 0);
}

export function getQuickPresetEntryIds(
  entries: ReadonlyArray<CatalogEntry>,
  state: GameState,
  preset: "all" | "affordable" | "unlocking-soon" | "best-value" | "needs-enjoyment",
  previewRateByEntry: Map<string, number>,
): Set<string> | null {
  if (preset === "all") {
    return null;
  }

  if (preset === "best-value") {
    const scored = entries
      .map((entry) => {
        const tierId = getWatchModelTierId(entry.id);
        if (!isItemUnlocked(state, tierId)) {
          return null;
        }
        const gate = getWatchModelPurchaseGate(state, entry.id);
        if (!gate.ok || gate.cashPriceCents <= 0) {
          return null;
        }
        const valueRate = previewRateByEntry.get(entry.id) ?? 0;
        const score = valueRate / gate.cashPriceCents;
        if (!Number.isFinite(score) || score <= 0) {
          return null;
        }
        return { id: entry.id, score };
      })
      .filter((entry): entry is { id: string; score: number } => entry !== null)
      .sort((left, right) => right.score - left.score);

    if (scored.length === 0) {
      return new Set<string>();
    }

    const count = Math.max(1, Math.ceil(scored.length * 0.2));
    return new Set(scored.slice(0, count).map((entry) => entry.id));
  }

  return new Set(
    entries
      .filter((entry) => {
        const tierId = getWatchModelTierId(entry.id);
        const unlocked = isItemUnlocked(state, tierId);
        const gate = getWatchModelPurchaseGate(state, entry.id);

        if (preset === "affordable") {
          return unlocked && gate.ok;
        }

        if (preset === "needs-enjoyment") {
          return (
            unlocked &&
            !gate.ok &&
            gate.blocksBy === "enjoyment" &&
            (gate.enjoymentDeficitCents ?? 0) > 0
          );
        }

        if (preset === "unlocking-soon") {
          if (unlocked) return false;
          // This needs milestone detail - simplified version
          return false;
        }

        return true;
      })
      .map((entry) => entry.id),
  );
}

export function hasOwnedCatalogTiers(
  entries: ReadonlyArray<CatalogEntry>,
  state: GameState,
): boolean {
  return entries.some((entry) => getWatchModelOwnedCount(state, entry.id) > 0);
}

export function getCatalogBrands(entries: ReadonlyArray<CatalogEntry>): string[] {
  const brands = new Set<string>(["All"]);
  entries.forEach((entry) => brands.add(entry.brand));
  return Array.from(brands).sort();
}

export const catalogSelectors = {
  filterCatalogEntries,
  sortCatalogEntries,
  filterByOwnershipTab,
  getQuickPresetEntryIds,
  hasOwnedCatalogTiers,
  getCatalogBrands,
};

export default catalogSelectors;
