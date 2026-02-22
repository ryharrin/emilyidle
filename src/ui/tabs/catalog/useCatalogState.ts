import React from "react";

import { isTestEnvironment } from "../../../game/runtime/isTestEnvironment";
import type { CatalogQuickPreset } from "./catalogPresentation";

export type CatalogTabId = "unowned" | "owned";

export type CatalogSortKey = "default" | "brand" | "year" | "tier";

export type CatalogEra = "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown";

export type CatalogType = "all" | "gmt" | "manual" | "dress" | "diver";

export type CatalogStyle = "all" | "womens";

export type CatalogViewMode = "novice" | "expert";

export type CatalogDensity = "compact" | "expanded";

export interface UseCatalogStateResult {
  // Filters
  search: string;
  setSearch: (value: string) => void;
  brand: string;
  setBrand: (value: string) => void;
  style: CatalogStyle;
  setStyle: (value: CatalogStyle) => void;
  sort: CatalogSortKey;
  setSort: (value: CatalogSortKey) => void;
  era: CatalogEra;
  setEra: (value: CatalogEra) => void;
  type: CatalogType;
  setType: (value: CatalogType) => void;

  // View state
  viewMode: CatalogViewMode;
  setViewMode: (value: CatalogViewMode) => void;
  density: CatalogDensity;
  setDensity: (value: CatalogDensity) => void;
  densityOverridden: boolean;
  setDensityOverridden: (value: boolean) => void;

  // Ownership tab
  tab: CatalogTabId;
  setTab: (value: CatalogTabId) => void;
  focusedTab: CatalogTabId;
  setFocusedTab: (value: CatalogTabId) => void;

  // Quick preset
  quickPreset: CatalogQuickPreset;
  setQuickPreset: (value: CatalogQuickPreset) => void;

  // Favorites
  favoritesOnly: boolean;
  setFavoritesOnly: (value: boolean) => void;

  // Filters panel
  filtersOpen: boolean;
  setFiltersOpen: (value: boolean) => void;
  toggleFilters: () => void;

  // Computed
  activeFilterCount: number;

  // Actions
  cycleSort: () => void;
  cycleQuickPreset: () => void;
}

export function useCatalogState(initialTab: CatalogTabId = "unowned"): UseCatalogStateResult {
  // Filters
  const [search, setSearch] = React.useState("");
  const [brand, setBrand] = React.useState("All");
  const [style, setStyle] = React.useState<CatalogStyle>("all");
  const [sort, setSort] = React.useState<CatalogSortKey>("default");
  const [era, setEra] = React.useState<CatalogEra>("all");
  const [type, setType] = React.useState<CatalogType>("all");

  // View state
  const [viewMode, setViewMode] = React.useState<CatalogViewMode>("novice");
  const [density, setDensity] = React.useState<CatalogDensity>(() =>
    isTestEnvironment() ? "compact" : "expanded",
  );
  const [densityOverridden, setDensityOverridden] = React.useState(false);

  // Ownership tab
  const [tab, setTab] = React.useState<CatalogTabId>(initialTab);
  const [focusedTab, setFocusedTab] = React.useState<CatalogTabId>(initialTab);

  // Quick preset
  const [quickPreset, setQuickPreset] = React.useState<CatalogQuickPreset>("all");

  // Favorites
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);

  // Filters panel - open by default in tests
  const [filtersOpen, setFiltersOpen] = React.useState(() => isTestEnvironment());

  // Sync focused tab with actual tab
  React.useEffect(() => {
    setFocusedTab(tab);
  }, [tab]);

  const toggleFilters = React.useCallback(() => {
    setFiltersOpen((prev: boolean) => !prev);
  }, []);

  const cycleSort = React.useCallback(() => {
    const order: CatalogSortKey[] = ["default", "brand", "year", "tier"];
    const currentIndex = order.indexOf(sort);
    const nextSort = order[(currentIndex + 1) % order.length];
    setSort(nextSort);
  }, [sort]);

  const cycleQuickPreset = React.useCallback(() => {
    const order: CatalogQuickPreset[] = [
      "all",
      "affordable",
      "unlocking-soon",
      "best-value",
      "needs-enjoyment",
    ];
    const currentIndex = order.indexOf(quickPreset);
    const nextPreset = order[(currentIndex + 1) % order.length];
    setQuickPreset(nextPreset);
  }, [quickPreset]);

  const activeFilterCount = React.useMemo(
    () =>
      [
        search.trim().length > 0,
        brand !== "All",
        style !== "all",
        era !== "all",
        type !== "all",
        quickPreset !== "all",
      ].filter(Boolean).length,
    [search, brand, style, era, type, quickPreset],
  );

  return {
    search,
    setSearch,
    brand,
    setBrand,
    style,
    setStyle,
    sort,
    setSort,
    era,
    setEra,
    type,
    setType,
    viewMode,
    setViewMode,
    density,
    setDensity,
    densityOverridden,
    setDensityOverridden,
    tab,
    setTab,
    focusedTab,
    setFocusedTab,
    quickPreset,
    setQuickPreset,
    favoritesOnly,
    setFavoritesOnly,
    filtersOpen,
    setFiltersOpen,
    toggleFilters,
    activeFilterCount,
    cycleSort,
    cycleQuickPreset,
  };
}

export default useCatalogState;
