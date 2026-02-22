import React from "react";

import { isTestEnvironment } from "../../../game/runtime/isTestEnvironment";
import { ExplainButton } from "../../help/ExplainButton";
import { HELP_SECTION_IDS } from "../../help/helpContent";
import type { CatalogQuickPreset } from "./catalogPresentation";
import {
  CATALOG_QUICK_PRESET_HINTS,
  CATALOG_QUICK_PRESET_LABELS,
  CATALOG_QUICK_PRESET_ORDER,
  CATALOG_SORT_LABELS,
  CATALOG_SORT_ORDER,
} from "./catalogPresentation";

export type CatalogTabId = "unowned" | "owned";

export interface CatalogFiltersProps {
  // Filters state
  search: string;
  onSearchChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  style: "all" | "womens";
  onStyleChange: (value: "all" | "womens") => void;
  sort: "default" | "brand" | "year" | "tier";
  onSortChange: (value: "default" | "brand" | "year" | "tier") => void;
  era: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown";
  onEraChange: (value: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown") => void;
  type: "all" | "gmt" | "manual" | "dress" | "diver";
  onTypeChange: (value: "all" | "gmt" | "manual" | "dress" | "diver") => void;

  // View state
  isCompact: boolean;
  onToggleDensity: () => void;
  isExpertMode: boolean;
  onToggleViewMode: () => void;

  // Quick preset
  quickPreset: CatalogQuickPreset;
  onQuickPresetChange: (value: CatalogQuickPreset) => void;

  // Favorites
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;

  // Ownership tab
  tab: CatalogTabId;
  focusedTab: CatalogTabId;
  onTabChange: (value: CatalogTabId) => void;
  onTabFocus: (value: CatalogTabId) => void;
  onTabKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;

  // Filter panel
  isOpen: boolean;
  onToggleOpen: () => void;
  activeFilterCount: number;

  // Data
  brands: ReadonlyArray<string>;
  resultsCount: number;
  unownedReady: boolean;
  ownedReady: boolean;

  // Config
  embeddedInVault?: boolean;
  showHelp?: boolean;
  showUndo?: boolean;
  canUndoLastPurchase?: boolean;
  undoStatus?: "available" | "expired" | "idle";
  undoRemainingMs?: number;
  undoExpiredMsAgo?: number;
  lastPurchaseModelId?: string | null;
  onUndo?: () => void;
}

const CATALOG_OWNERSHIP_TABS = [
  { id: "unowned" as const, label: "Unowned" },
  { id: "owned" as const, label: "Owned" },
] as const satisfies ReadonlyArray<{ id: CatalogTabId; label: string }>;

const PURCHASE_UNDO_WINDOW_SECONDS = 20;

export function CatalogFilters({
  search,
  onSearchChange,
  brand,
  onBrandChange,
  style,
  onStyleChange,
  sort,
  onSortChange,
  era,
  onEraChange,
  type,
  onTypeChange,
  isCompact,
  onToggleDensity,
  isExpertMode,
  onToggleViewMode,
  quickPreset,
  onQuickPresetChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  tab,
  focusedTab,
  onTabChange,
  onTabFocus,
  onTabKeyDown,
  isOpen,
  onToggleOpen,
  activeFilterCount,
  brands,
  resultsCount,
  unownedReady,
  ownedReady,
  embeddedInVault = false,
  showHelp = true,
  showUndo = false,
  canUndoLastPurchase = false,
  undoStatus = "idle",
  undoRemainingMs = 0,
  undoExpiredMsAgo = 0,
  lastPurchaseModelId = null,
  onUndo,
}: CatalogFiltersProps): React.ReactElement {
  const filterCountLabel = activeFilterCount > 0 ? `${activeFilterCount} active` : "Show filters";
  const quickPresetLabel = CATALOG_QUICK_PRESET_LABELS[quickPreset];
  const quickPresetHint = CATALOG_QUICK_PRESET_HINTS[quickPreset];
  const quickSortLabel = CATALOG_SORT_LABELS[sort];

  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 720px)").matches;
  }, []);

  return (
    <>
      <header className="panel-header catalog-header">
        <div>
          <p className="eyebrow">{embeddedInVault ? "Shop" : "Catalog"}</p>
          {embeddedInVault ? <h3>Shop</h3> : <h2>Catalog</h2>}
          <p className="muted">
            {embeddedInVault
              ? "Buy watches and manage owned references."
              : "Buy watches and track discovered references."}
          </p>
        </div>
        <div className="catalog-header-actions">
          <div className="results-count" aria-live="polite" data-testid="catalog-results-count">
            {resultsCount} results
          </div>
          {showUndo && (
            <div className="catalog-undo-action">
              <button
                type="button"
                className="secondary"
                data-testid="catalog-undo-purchase"
                disabled={!canUndoLastPurchase}
                onClick={onUndo}
              >
                Undo last purchase
              </button>
              <p className="muted" data-testid="catalog-undo-countdown">
                {undoStatus === "available"
                  ? `Undo available for ${lastPurchaseModelId} · expires in ${Math.ceil(
                      undoRemainingMs / 1_000,
                    )}s.`
                  : undoStatus === "expired"
                    ? `Undo expired for ${lastPurchaseModelId} ${Math.max(
                        1,
                        Math.ceil(undoExpiredMsAgo / 1_000),
                      )}s ago. Buy again to reopen a ${PURCHASE_UNDO_WINDOW_SECONDS}s window.`
                    : `No purchase to undo yet. Buy a watch to start a ${PURCHASE_UNDO_WINDOW_SECONDS}s window.`}
              </p>
            </div>
          )}
          <div className="catalog-help" data-testid="catalog-view-mode-control">
            <button
              type="button"
              className="secondary"
              data-testid="catalog-view-mode-toggle"
              aria-pressed={isExpertMode}
              onClick={onToggleViewMode}
            >
              Card detail mode · {isExpertMode ? "Expert" : "Novice"}
            </button>
          </div>
          <div className="catalog-help" data-testid="catalog-density-control">
            <button
              type="button"
              className="secondary"
              data-testid="catalog-density-toggle"
              aria-pressed={isCompact}
              onClick={onToggleDensity}
            >
              Card density · {isCompact ? "Compact" : "Expanded"}
            </button>
          </div>
          {showHelp && (
            <div className="catalog-help" data-testid="catalog-help">
              <ExplainButton
                sectionId={HELP_SECTION_IDS.catalogShop}
                label={embeddedInVault ? "Shop help" : "Catalog help"}
                className="help-open-button"
              />
            </div>
          )}
        </div>
      </header>

      {isMobile && (
        <div
          className="catalog-quick-actions"
          role="toolbar"
          aria-label="Catalog quick actions"
          data-testid="catalog-quick-actions"
        >
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-filters"
            aria-pressed={isOpen}
            onClick={onToggleOpen}
          >
            Filters · {activeFilterCount > 0 ? `${activeFilterCount} active` : "none"}
          </button>
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-sort"
            onClick={() => {
              const currentIndex = CATALOG_SORT_ORDER.indexOf(sort);
              const nextSort = CATALOG_SORT_ORDER[(currentIndex + 1) % CATALOG_SORT_ORDER.length];
              onSortChange(nextSort);
            }}
          >
            Sort · {quickSortLabel}
          </button>
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-preset-cycle"
            onClick={() => {
              const currentIndex = CATALOG_QUICK_PRESET_ORDER.indexOf(quickPreset);
              const nextPreset =
                CATALOG_QUICK_PRESET_ORDER[(currentIndex + 1) % CATALOG_QUICK_PRESET_ORDER.length];
              onQuickPresetChange(nextPreset);
            }}
          >
            Preset · {quickPresetLabel}
          </button>
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-view-mode"
            aria-pressed={isExpertMode}
            onClick={onToggleViewMode}
          >
            Detail · {isExpertMode ? "Expert" : "Novice"}
          </button>
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-density"
            aria-pressed={isCompact}
            onClick={onToggleDensity}
          >
            Density · {isCompact ? "Compact" : "Expanded"}
          </button>
        </div>
      )}

      <form
        className="catalog-filters"
        data-testid="catalog-filters"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="catalog-filter-heading">
          <button
            type="button"
            className="catalog-filter-toggle"
            aria-expanded={isOpen}
            aria-controls="catalog-filter-panel"
            onClick={onToggleOpen}
            data-testid="catalog-filter-toggle"
          >
            <span>Filters</span>
            <span className="catalog-filter-count" aria-live="polite">
              {filterCountLabel}
            </span>
          </button>
        </div>
        <div
          id="catalog-filter-panel"
          className="catalog-filter-panel"
          data-visible={isOpen ? "true" : "false"}
          aria-hidden={!isOpen}
          hidden={!isOpen}
          data-testid="catalog-filter-panel"
        >
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-search">
              Search
            </label>
            <input
              id="catalog-search"
              data-testid="catalog-search"
              type="search"
              placeholder="Search by model, year, tags"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-brand">
              Brand
            </label>
            <select
              id="catalog-brand"
              data-testid="catalog-brand"
              value={brand}
              onChange={(event) => onBrandChange(event.target.value)}
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-style">
              Style
            </label>
            <select
              id="catalog-style"
              data-testid="catalog-style"
              value={style}
              onChange={(event) => onStyleChange(event.target.value as "all" | "womens")}
            >
              <option value="all">All</option>
              <option value="womens">Womens</option>
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-sort">
              Sort
            </label>
            <select
              id="catalog-sort"
              data-testid="catalog-sort"
              value={sort}
              onChange={(event) =>
                onSortChange(event.target.value as "default" | "brand" | "year" | "tier")
              }
            >
              <option value="default">Default</option>
              <option value="brand">Brand (A→Z)</option>
              <option value="year">Year (newest→oldest)</option>
              <option value="tier">Movement (quartz→tourbillon)</option>
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-quick-preset">
              Quick preset
            </label>
            <select
              id="catalog-quick-preset"
              data-testid="catalog-quick-preset"
              value={quickPreset}
              onChange={(event) => onQuickPresetChange(event.target.value as CatalogQuickPreset)}
            >
              {CATALOG_QUICK_PRESET_ORDER.map((preset) => (
                <option key={preset} value={preset}>
                  {CATALOG_QUICK_PRESET_LABELS[preset]}
                </option>
              ))}
            </select>
            <p className="muted" data-testid="catalog-quick-preset-hint">
              {quickPresetHint}
            </p>
          </div>
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-era">
              Era
            </label>
            <select
              id="catalog-era"
              data-testid="catalog-era"
              value={era}
              onChange={(event) =>
                onEraChange(
                  event.target.value as "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown",
                )
              }
            >
              <option value="all">All</option>
              <option value="pre-1970">Pre-1970</option>
              <option value="1970-1999">1970-1999</option>
              <option value="2000+">2000+</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-type">
              Type
            </label>
            <select
              id="catalog-type"
              data-testid="catalog-type"
              value={type}
              onChange={(event) =>
                onTypeChange(event.target.value as "all" | "gmt" | "manual" | "dress" | "diver")
              }
            >
              <option value="all">All</option>
              <option value="gmt">GMT</option>
              <option value="manual">Manual</option>
              <option value="dress">Dress</option>
              <option value="diver">Diver</option>
            </select>
          </div>
          <div className="filter-field" data-testid="catalog-favorites-filter">
            <label className="filter-label" htmlFor="catalog-favorites-only">
              Favorites
            </label>
            <label className="catalog-favorites-toggle" htmlFor="catalog-favorites-only">
              <input
                id="catalog-favorites-only"
                data-testid="catalog-favorites-only"
                type="checkbox"
                checked={favoritesOnly}
                onChange={() => onFavoritesOnlyChange(!favoritesOnly)}
              />
              Favorites only
            </label>
          </div>
          <div className="filter-field" data-testid="catalog-owned-tabs">
            <span className="filter-label">View</span>
            <div
              className="catalog-tablist"
              role="tablist"
              aria-label={embeddedInVault ? "Shop view" : "Catalog ownership"}
            >
              {CATALOG_OWNERSHIP_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  className={`catalog-tab ${tab === t.id ? "catalog-tab-active" : ""}`}
                  aria-selected={tab === t.id}
                  aria-controls={`catalog-${t.id}`}
                  id={`catalog-${t.id}-tab`}
                  tabIndex={focusedTab === t.id ? 0 : -1}
                  onFocus={() => onTabFocus(t.id)}
                  onKeyDown={onTabKeyDown}
                  onClick={() => onTabChange(t.id)}
                >
                  {t.label}
                  {t.id === "unowned" && unownedReady && (
                    <span
                      className="catalog-tab-ready-badge"
                      data-testid="catalog-tab-ready-unowned"
                      aria-hidden="true"
                    >
                      Ready
                    </span>
                  )}
                  {t.id === "owned" && ownedReady && (
                    <span
                      className="catalog-tab-ready-badge"
                      data-testid="catalog-tab-ready-owned"
                      aria-hidden="true"
                    >
                      Quick action ready
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default CatalogFilters;
