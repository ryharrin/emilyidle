import React from "react";

import { EmptyStateCTA } from "../components/EmptyStateCTA";
import { CatalogCardDetailsSheet } from "../components/catalog/CatalogCardDetailsSheet";
import { CatalogPurchaseGate } from "../components/catalog/CatalogPurchaseGate";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { TierBadge } from "../components/TierBadge";
import { PowerReserveHint } from "../components/PowerReserveHint";
import { UnlockHint } from "../components/UnlockHint";
import { LockIcon } from "../icons/coreIcons";
import { useStableCatalogEntries } from "../hooks/useStableCatalogEntries";
import { useCatalogVirtualizer } from "../hooks/useCatalogVirtualizer";
import type { CatalogVirtualizerResult } from "../hooks/useCatalogVirtualizer";
import { CatalogFilters, CatalogGrid } from "./catalog";
import {
  CATALOG_BEST_VALUE_TOP_SHARE,
  CATALOG_MOBILE_MEDIA_QUERY,
  CATALOG_MOVEMENT_SECTIONS,
  CATALOG_QUICK_PRESET_HINTS,
  CATALOG_QUICK_PRESET_LABELS,
  CATALOG_QUICK_PRESET_ORDER,
  CATALOG_SORT_LABELS,
  CATALOG_SORT_ORDER,
  CATALOG_UNLOCKING_SOON_MIN_RATIO,
  CATALOG_VIRTUALIZATION_THRESHOLD,
  CATALOG_VIRTUALIZER_ESTIMATED_CARD_HEIGHT,
  CATALOG_VIRTUALIZER_OVERSCAN,
  formatEtaLabel,
  getGateEtaLabel,
  type CatalogQuickPreset,
} from "./catalog/catalogPresentation";
import {
  buildCatalogDecisionInfo,
  CatalogDetailsContent,
  type CatalogDecisionInfo,
} from "./catalog/CatalogDetailsContent";

import { formatMoneyFromCents } from "../../game/format";
import { isTestEnvironment } from "../../game/runtime/isTestEnvironment";
import {
  getCatalogEntryTags,
  getCatalogFallbackImageUrl,
  getCatalogImageUrl,
  getWatchModelTierBadge,
  type CatalogEntry,
} from "../../game/catalog";
import type { CatalogTierId } from "../../game/model/types";
import {
  getAffordabilityEtaSecondsForDeficit,
  buyWatchModel,
  buyWatchModelWithUndo,
  dismantleWatchModel,
  getEffectiveCashRateCentsPerSec,
  getCraftingPartsPerWatch,
  getEnjoymentRateCentsPerSec,
  getInteractionCooldownRemainingMs,
  getInteractionMovementGate,
  getMilestoneUnlockProgressDetail,
  getNextDuplicateRewardMultiplier,
  getPerWatchStatsRows,
  getPowerReserveDetail,
  getResourceDeficit,
  getWatchItems,
  getWatchModelOwnedCount,
  getWatchModelPurchaseGate,
  getWatchModelTierId,
  getWatchModels,
  isItemUnlocked,
  setWornWatchId,
  toggleWatchFavorite,
  undoLastPurchase,
  WATCH_MODEL_PURCHASE_UNDO_WINDOW_MS,
  type GameState,
  type WatchItemId,
} from "../../game/state";

type TabId =
  | "collection"
  | "career"
  | "upgrades"
  | "workshop"
  | "maison"
  | "nostalgia"
  | "catalog"
  | "stats"
  | "save";

type CatalogTabProps = {
  isActive: boolean;
  state: GameState;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
  catalogSearch: string;
  onCatalogSearchChange: (next: string) => void;
  catalogBrand: string;
  onCatalogBrandChange: (next: string) => void;
  catalogStyle: "all" | "womens";
  onCatalogStyleChange: (next: "all" | "womens") => void;
  catalogSort: "default" | "brand" | "year" | "tier";
  onCatalogSortChange: (next: "default" | "brand" | "year" | "tier") => void;
  catalogEra: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown";
  onCatalogEraChange: (next: "all" | "pre-1970" | "1970-1999" | "2000+" | "unknown") => void;
  catalogType: "all" | "gmt" | "manual" | "dress" | "diver";
  onCatalogTypeChange: (next: "all" | "gmt" | "manual" | "dress" | "diver") => void;
  catalogTab: "unowned" | "owned";
  onCatalogTabChange: (next: "unowned" | "owned") => void;
  catalogViewMode: "novice" | "expert";
  onCatalogViewModeChange: (next: "novice" | "expert") => void;
  catalogBrands: ReadonlyArray<string>;
  filteredCatalogEntries: ReadonlyArray<CatalogEntry>;
  catalogEntries: ReadonlyArray<CatalogEntry>;
  hasOwnedCatalogTiers: boolean;
  onPurchase: (nextState: GameState, meta?: PurchaseMeta) => void;
  nowMs?: number;
  currentEventMultiplier?: number;
  onInteract?: (itemId: WatchItemId) => void;
  atelierUnlocked?: boolean;
};

const PURCHASE_UNDO_WINDOW_SECONDS = Math.floor(WATCH_MODEL_PURCHASE_UNDO_WINDOW_MS / 1_000);

type CatalogOwnershipTabId = CatalogTabProps["catalogTab"];

const CATALOG_OWNERSHIP_TABS = [
  { id: "unowned", label: "Unowned" },
  { id: "owned", label: "Owned" },
] as const satisfies ReadonlyArray<{ id: CatalogOwnershipTabId; label: string }>;

const focusCatalogOwnershipTabById = (tabId: CatalogOwnershipTabId) => {
  if (typeof document === "undefined") {
    return;
  }
  document.getElementById(`catalog-${tabId}-tab`)?.focus();
};

function useCatalogOwnershipTabKeyboard(
  catalogTab: CatalogOwnershipTabId,
  onCatalogTabChange: (next: CatalogOwnershipTabId) => void,
) {
  const [focusedCatalogTab, setFocusedCatalogTab] =
    React.useState<CatalogOwnershipTabId>(catalogTab);

  React.useEffect(() => {
    setFocusedCatalogTab(catalogTab);
  }, [catalogTab]);

  const moveCatalogTabFocus = React.useCallback(
    (direction: -1 | 1) => {
      const currentIndex = CATALOG_OWNERSHIP_TABS.findIndex((tab) => tab.id === focusedCatalogTab);
      const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex =
        (safeCurrentIndex + direction + CATALOG_OWNERSHIP_TABS.length) %
        CATALOG_OWNERSHIP_TABS.length;
      const nextTab = CATALOG_OWNERSHIP_TABS[nextIndex];
      if (!nextTab) {
        return;
      }
      setFocusedCatalogTab(nextTab.id);
      focusCatalogOwnershipTabById(nextTab.id);
    },
    [focusedCatalogTab],
  );

  const focusCatalogTabEdge = React.useCallback((edge: "first" | "last") => {
    const nextTab =
      edge === "first"
        ? CATALOG_OWNERSHIP_TABS[0]
        : CATALOG_OWNERSHIP_TABS[CATALOG_OWNERSHIP_TABS.length - 1];
    if (!nextTab) {
      return;
    }
    setFocusedCatalogTab(nextTab.id);
    focusCatalogOwnershipTabById(nextTab.id);
  }, []);

  const handleCatalogTabKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp": {
          event.preventDefault();
          moveCatalogTabFocus(-1);
          return;
        }
        case "ArrowRight":
        case "ArrowDown": {
          event.preventDefault();
          moveCatalogTabFocus(1);
          return;
        }
        case "Home": {
          event.preventDefault();
          focusCatalogTabEdge("first");
          return;
        }
        case "End": {
          event.preventDefault();
          focusCatalogTabEdge("last");
          return;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          onCatalogTabChange(focusedCatalogTab);
          return;
        }
        default:
          return;
      }
    },
    [focusCatalogTabEdge, focusedCatalogTab, moveCatalogTabFocus, onCatalogTabChange],
  );

  return {
    focusedCatalogTab,
    setFocusedCatalogTab,
    handleCatalogTabKeyDown,
  };
}

export type PurchaseMeta = {
  prestigeTier?: "workshop" | "maison" | "nostalgia";
};

type CatalogPurchasePanelProps = Omit<CatalogTabProps, "isActive"> & {
  showBalance?: boolean;
  nowMs?: number;
  currentEventMultiplier?: number;
  onInteract?: (itemId: WatchItemId) => void;
  atelierUnlocked?: boolean;
};

// Hook to manage catalog-specific state that isn't controlled by parent
function useCatalogLocalState() {
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const [purchaseHighlights, setPurchaseHighlights] = React.useState<Record<string, boolean>>({});
  const purchaseHighlightTimeouts = React.useRef<Map<string, number>>(new Map());
  const [detailsSheetTarget, setDetailsSheetTarget] = React.useState<{
    entryId: string;
    showFacts: boolean;
  } | null>(null);
  const detailsTriggerRef = React.useRef<HTMLButtonElement | null>(null);

  const triggerPurchaseHighlight = React.useCallback((entryId: string) => {
    setPurchaseHighlights((prev) => ({ ...prev, [entryId]: true }));
    const existingTimeout = purchaseHighlightTimeouts.current.get(entryId);
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }
    const timeoutId = window.setTimeout(() => {
      setPurchaseHighlights((prev) => {
        if (!prev[entryId]) return prev;
        const next = { ...prev };
        delete next[entryId];
        return next;
      });
      purchaseHighlightTimeouts.current.delete(entryId);
    }, 750);
    purchaseHighlightTimeouts.current.set(entryId, timeoutId);
  }, []);

  React.useEffect(() => {
    return () => {
      purchaseHighlightTimeouts.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      purchaseHighlightTimeouts.current.clear();
    };
  }, []);

  const handleDetailsToggle = React.useCallback((entryId: string, isOpen: boolean) => {
    setExpandedCards((prev) => ({ ...prev, [entryId]: isOpen }));
  }, []);

  const openDetailsSheet = React.useCallback(
    (entryId: string, showFacts: boolean, trigger: HTMLButtonElement | null) => {
      detailsTriggerRef.current = trigger;
      setDetailsSheetTarget({ entryId, showFacts });
    },
    [],
  );

  const makeOpenDetailsHandler = React.useCallback(
    (showFacts: boolean) => {
      return (entryId: string, trigger: HTMLButtonElement | null) => {
        openDetailsSheet(entryId, showFacts, trigger);
      };
    },
    [openDetailsSheet],
  );

  const closeDetailsSheet = React.useCallback(() => {
    setDetailsSheetTarget(null);
    detailsTriggerRef.current?.focus();
    detailsTriggerRef.current = null;
  }, []);

  return {
    expandedCards,
    purchaseHighlights,
    detailsSheetTarget,
    detailsTriggerRef,
    triggerPurchaseHighlight,
    handleDetailsToggle,
    makeOpenDetailsHandler,
    closeDetailsSheet,
  };
}

// Hook for mobile viewport detection
function useMobileViewport() {
  const readMobileViewportMatch = React.useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(CATALOG_MOBILE_MEDIA_QUERY).matches;
  }, []);

  const [isMobileViewport, setIsMobileViewport] = React.useState<boolean>(() =>
    readMobileViewportMatch(),
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const query = window.matchMedia(CATALOG_MOBILE_MEDIA_QUERY);
    const handleChange = () => setIsMobileViewport(query.matches);
    handleChange();
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isMobileViewport;
}

// Hook for density management
function useCatalogDensity(isMobileViewport: boolean) {
  const [catalogDensity, setCatalogDensity] = React.useState<"compact" | "expanded">(() =>
    isMobileViewport ? "compact" : "expanded",
  );
  const catalogDensityOverriddenRef = React.useRef(false);

  React.useEffect(() => {
    if (catalogDensityOverriddenRef.current) {
      return;
    }
    setCatalogDensity(isMobileViewport ? "compact" : "expanded");
  }, [isMobileViewport]);

  const toggleCatalogDensity = React.useCallback(() => {
    catalogDensityOverriddenRef.current = true;
    setCatalogDensity((value) => (value === "compact" ? "expanded" : "compact"));
  }, []);

  return {
    catalogDensity,
    setCatalogDensity,
    catalogDensityOverriddenRef,
    toggleCatalogDensity,
    isCompactDensity: catalogDensity === "compact",
  };
}

export function CatalogPurchasePanel({
  state,
  onNavigate,
  catalogSearch,
  onCatalogSearchChange,
  catalogBrand,
  onCatalogBrandChange,
  catalogStyle,
  onCatalogStyleChange,
  catalogSort,
  onCatalogSortChange,
  catalogEra,
  onCatalogEraChange,
  catalogType,
  onCatalogTypeChange,
  catalogTab,
  onCatalogTabChange,
  catalogViewMode,
  onCatalogViewModeChange,
  catalogBrands,
  filteredCatalogEntries,
  catalogEntries,
  hasOwnedCatalogTiers,
  onPurchase,
  currentEventMultiplier = 1,
  showBalance = false,
  nowMs,
  onInteract,
  atelierUnlocked = true,
}: CatalogPurchasePanelProps) {
  const embeddedInVault = showBalance;
  const isMobileViewport = useMobileViewport();
  const { isCompactDensity, toggleCatalogDensity } = useCatalogDensity(isMobileViewport);
  const isNoviceViewMode = catalogViewMode === "novice";
  const isExpertViewMode = catalogViewMode === "expert";

  const { focusedCatalogTab, setFocusedCatalogTab, handleCatalogTabKeyDown } =
    useCatalogOwnershipTabKeyboard(catalogTab, onCatalogTabChange);

  const {
    expandedCards,
    purchaseHighlights,
    detailsSheetTarget,
    triggerPurchaseHighlight,
    handleDetailsToggle,
    makeOpenDetailsHandler,
    closeDetailsSheet,
  } = useCatalogLocalState();

  const toggleCatalogViewMode = React.useCallback(() => {
    onCatalogViewModeChange(catalogViewMode === "novice" ? "expert" : "novice");
  }, [catalogViewMode, onCatalogViewModeChange]);

  const favoriteSet = React.useMemo(
    () => new Set(state.favoriteWatchIds ?? []),
    [state.favoriteWatchIds],
  );

  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(() => isTestEnvironment());
  const [catalogFavoritesOnly, setCatalogFavoritesOnly] = React.useState(false);
  const [catalogQuickPreset, setCatalogQuickPreset] = React.useState<CatalogQuickPreset>("all");

  const favoriteIdsSignature = React.useMemo(
    () => (state.favoriteWatchIds ?? []).join(","),
    [state.favoriteWatchIds],
  );

  const filterSignature = React.useMemo(
    () =>
      [
        catalogTab,
        catalogSearch,
        catalogBrand,
        catalogStyle,
        catalogSort,
        catalogEra,
        catalogType,
        catalogQuickPreset,
        catalogFavoritesOnly ? "favorites-only" : "all-catalog",
        catalogFavoritesOnly ? favoriteIdsSignature : "favorites-ignored",
      ].join("|"),
    [
      catalogBrand,
      catalogEra,
      catalogFavoritesOnly,
      catalogSearch,
      catalogSort,
      catalogStyle,
      catalogTab,
      catalogType,
      catalogQuickPreset,
      favoriteIdsSignature,
    ],
  );

  const activeFilterCount = [
    catalogSearch.trim().length > 0,
    catalogBrand !== "All",
    catalogStyle !== "all",
    catalogEra !== "all",
    catalogType !== "all",
    catalogQuickPreset !== "all",
  ].filter(Boolean).length;

  const toggleFilters = React.useCallback(() => {
    setFiltersOpen((value) => !value);
  }, []);

  const catalogEntriesForView = React.useMemo(
    () =>
      catalogFavoritesOnly
        ? filteredCatalogEntries.filter((entry) => favoriteSet.has(entry.id))
        : filteredCatalogEntries,
    [catalogFavoritesOnly, favoriteSet, filteredCatalogEntries],
  );

  const catalogEntryById = React.useMemo(
    () => new Map(catalogEntries.map((entry) => [entry.id, entry])),
    [catalogEntries],
  );

  const effectiveNowMs = React.useMemo(
    () => (typeof nowMs === "number" ? nowMs : Date.now()),
    [nowMs],
  );
  const effectiveEventMultiplier = currentEventMultiplier ?? 1;

  const perWatchRows = React.useMemo(() => {
    return getPerWatchStatsRows(state, effectiveNowMs, currentEventMultiplier);
  }, [state, effectiveNowMs, currentEventMultiplier]);

  const previewRateByEntry = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const row of perWatchRows) {
      const valueRate = Math.max(0, row.enjoymentCentsPerSec) + Math.max(0, row.cashCentsPerSec);
      row.catalogEntryIds.forEach((entryId) => {
        map.set(entryId, valueRate);
      });
    }
    return map;
  }, [perWatchRows]);

  const handleBrowseWatches = React.useCallback(() => {
    onCatalogTabChange("unowned");
    if (typeof document === "undefined") {
      return;
    }
    document.getElementById("catalog-unowned")?.scrollIntoView({ block: "start" });
  }, [onCatalogTabChange]);

  const effectiveCashRateCentsPerSec = React.useMemo(
    () => getEffectiveCashRateCentsPerSec(state, effectiveNowMs, effectiveEventMultiplier),
    [effectiveEventMultiplier, effectiveNowMs, state],
  );
  const effectiveEnjoymentRateCentsPerSec = React.useMemo(
    () => getEnjoymentRateCentsPerSec(state) * effectiveEventMultiplier,
    [effectiveEventMultiplier, state],
  );

  const undoRemainingMs = React.useMemo(() => {
    if (!state.lastPurchase) {
      return 0;
    }
    return Math.max(
      0,
      WATCH_MODEL_PURCHASE_UNDO_WINDOW_MS -
        Math.max(0, effectiveNowMs - state.lastPurchase.purchasedAtMs),
    );
  }, [effectiveNowMs, state.lastPurchase]);

  const canUndoLastPurchase = state.lastPurchase !== null && undoRemainingMs > 0;
  const lastPurchaseModelId = state.lastPurchase?.modelId ?? null;
  const undoElapsedMs = state.lastPurchase
    ? Math.max(0, effectiveNowMs - state.lastPurchase.purchasedAtMs)
    : 0;
  const undoExpiredMsAgo = state.lastPurchase
    ? Math.max(0, undoElapsedMs - WATCH_MODEL_PURCHASE_UNDO_WINDOW_MS)
    : 0;
  const undoStatus: "available" | "expired" | "idle" = canUndoLastPurchase
    ? "available"
    : lastPurchaseModelId
      ? "expired"
      : "idle";

  const handlePurchase = React.useCallback(
    (entryId: string) => {
      onPurchase(buyWatchModelWithUndo(state, entryId, effectiveNowMs));
      triggerPurchaseHighlight(entryId);
    },
    [effectiveNowMs, onPurchase, state, triggerPurchaseHighlight],
  );

  const watchItems = React.useMemo(() => getWatchItems(), []);
  const watchItemById = React.useMemo(
    () => new Map(watchItems.map((item) => [item.id, item])),
    [watchItems],
  );

  const quickPresetEntryIds = React.useMemo(() => {
    if (catalogQuickPreset === "all") {
      return null;
    }

    if (catalogQuickPreset === "best-value") {
      const scored = catalogEntriesForView
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
      const count = Math.max(1, Math.ceil(scored.length * CATALOG_BEST_VALUE_TOP_SHARE));
      return new Set(scored.slice(0, count).map((entry) => entry.id));
    }

    return new Set(
      catalogEntriesForView
        .filter((entry) => {
          const tierId = getWatchModelTierId(entry.id);
          const unlocked = isItemUnlocked(state, tierId);
          const gate = getWatchModelPurchaseGate(state, entry.id);
          if (catalogQuickPreset === "affordable") {
            return unlocked && gate.ok;
          }
          if (catalogQuickPreset === "needs-enjoyment") {
            return (
              unlocked &&
              !gate.ok &&
              gate.blocksBy === "enjoyment" &&
              (gate.enjoymentDeficitCents ?? 0) > 0
            );
          }
          if (catalogQuickPreset === "unlocking-soon") {
            if (unlocked) {
              return false;
            }
            const unlockMilestoneId = watchItemById.get(tierId)?.unlockMilestoneId;
            if (!unlockMilestoneId) {
              return false;
            }
            const unlockDetail = getMilestoneUnlockProgressDetail(state, unlockMilestoneId);
            return unlockDetail.ratio >= CATALOG_UNLOCKING_SOON_MIN_RATIO && unlockDetail.ratio < 1;
          }
          return true;
        })
        .map((entry) => entry.id),
    );
  }, [catalogEntriesForView, catalogQuickPreset, previewRateByEntry, state, watchItemById]);

  const presetFilteredEntries = React.useMemo(() => {
    if (quickPresetEntryIds === null) {
      return catalogEntriesForView;
    }
    return catalogEntriesForView.filter((entry) => quickPresetEntryIds.has(entry.id));
  }, [catalogEntriesForView, quickPresetEntryIds]);

  const stableCatalogEntries = useStableCatalogEntries({
    entries: presetFilteredEntries,
    allEntries: catalogEntries,
    signature: filterSignature,
  });

  const craftingPartsPerWatch = getCraftingPartsPerWatch();

  const hasQuickActionForOwnedEntry = React.useCallback(
    (entryId: string) => {
      const tierId = getWatchModelTierId(entryId);
      const ownedCount = getWatchModelOwnedCount(state, entryId);
      if (ownedCount <= 0) {
        return false;
      }
      const movementGate = getInteractionMovementGate(tierId);
      if (!movementGate.available) {
        return false;
      }
      const cooldownRemaining = getInteractionCooldownRemainingMs(state, tierId, effectiveNowMs);
      const hasInteract = cooldownRemaining <= 0;
      const hasDismantle =
        atelierUnlocked && (craftingPartsPerWatch[tierId] ?? 0) > 0 && ownedCount > 1;
      return hasInteract || hasDismantle;
    },
    [atelierUnlocked, craftingPartsPerWatch, effectiveNowMs, state],
  );

  const unownedReady = React.useMemo(
    () =>
      stableCatalogEntries.some(
        (entry) =>
          getWatchModelOwnedCount(state, entry.id) === 0 &&
          getWatchModelPurchaseGate(state, entry.id).ok,
      ),
    [stableCatalogEntries, state],
  );

  const ownedReady = React.useMemo(
    () =>
      stableCatalogEntries.some(
        (entry) =>
          getWatchModelOwnedCount(state, entry.id) > 0 && hasQuickActionForOwnedEntry(entry.id),
      ),
    [hasQuickActionForOwnedEntry, stableCatalogEntries, state],
  );

  const showLaneLayout = catalogSort === "tier";

  const activeDetailsEntry = detailsSheetTarget?.entryId
    ? (catalogEntryById.get(detailsSheetTarget.entryId) ?? null)
    : null;

  return (
    <>
      <CatalogFilters
        search={catalogSearch}
        onSearchChange={onCatalogSearchChange}
        brand={catalogBrand}
        onBrandChange={onCatalogBrandChange}
        style={catalogStyle}
        onStyleChange={onCatalogStyleChange}
        sort={catalogSort}
        onSortChange={onCatalogSortChange}
        era={catalogEra}
        onEraChange={onCatalogEraChange}
        type={catalogType}
        onTypeChange={onCatalogTypeChange}
        isCompact={isCompactDensity}
        onToggleDensity={toggleCatalogDensity}
        isExpertMode={isExpertViewMode}
        onToggleViewMode={toggleCatalogViewMode}
        quickPreset={catalogQuickPreset}
        onQuickPresetChange={setCatalogQuickPreset}
        favoritesOnly={catalogFavoritesOnly}
        onFavoritesOnlyChange={setCatalogFavoritesOnly}
        tab={catalogTab}
        focusedTab={focusedCatalogTab}
        onTabChange={onCatalogTabChange}
        onTabFocus={setFocusedCatalogTab}
        onTabKeyDown={handleCatalogTabKeyDown}
        isOpen={filtersOpen}
        onToggleOpen={toggleFilters}
        activeFilterCount={activeFilterCount}
        brands={catalogBrands}
        resultsCount={stableCatalogEntries.length}
        unownedReady={unownedReady}
        ownedReady={ownedReady}
        embeddedInVault={embeddedInVault}
        showHelp={true}
        showUndo={true}
        canUndoLastPurchase={canUndoLastPurchase}
        undoStatus={undoStatus}
        undoRemainingMs={undoRemainingMs}
        undoExpiredMsAgo={undoExpiredMsAgo}
        lastPurchaseModelId={lastPurchaseModelId}
        onUndo={() => onPurchase(undoLastPurchase(state, effectiveNowMs))}
      />

      <section
        id="catalog-unowned"
        role="tabpanel"
        aria-labelledby="catalog-unowned-tab"
        hidden={catalogTab !== "unowned"}
      >
        {catalogTab === "unowned" &&
          (stableCatalogEntries.length === 0 ? (
            <div className="catalog-empty" data-testid="catalog-discovered-empty">
              <EmptyStateCTA
                title="No catalog entries yet"
                body="Shop the catalog to discover watches you can buy and interact with."
                ctaLabel="Shop catalog"
                onCta={() => onNavigate("catalog", "catalog-shop")}
              />
            </div>
          ) : (
            <CatalogGrid
              entries={stableCatalogEntries}
              allEntries={catalogEntries}
              state={state}
              isCompact={isCompactDensity}
              isExpertMode={isExpertViewMode}
              showFacts={false}
              showLaneLayout={showLaneLayout}
              favoriteIds={favoriteSet}
              expandedCards={expandedCards}
              purchaseHighlights={purchaseHighlights}
              nowMs={nowMs}
              effectiveCashRateCentsPerSec={effectiveCashRateCentsPerSec}
              effectiveEnjoymentRateCentsPerSec={effectiveEnjoymentRateCentsPerSec}
              craftingPartsPerWatch={craftingPartsPerWatch}
              atelierUnlocked={atelierUnlocked}
              filterSignature={filterSignature}
              detailsSheetTarget={detailsSheetTarget}
              onPurchase={onPurchase}
              onToggleExpand={handleDetailsToggle}
              onOpenDetails={makeOpenDetailsHandler(false)}
              onInteract={onInteract}
              embeddedInVault={embeddedInVault}
            />
          ))}
      </section>

      <section
        id="catalog-owned"
        role="tabpanel"
        aria-labelledby="catalog-owned-tab"
        hidden={catalogTab !== "owned"}
      >
        {catalogTab === "owned" && (
          <>
            {!hasOwnedCatalogTiers ? (
              <div className="catalog-empty" data-testid="catalog-owned-empty">
                <EmptyStateCTA
                  title="No owned references yet"
                  body={
                    embeddedInVault
                      ? "Buy watches to start filling your shelf with owned references."
                      : "Buy watches in Catalog to start filling your archive shelf with owned references."
                  }
                  ctaLabel={embeddedInVault ? "Browse watches" : "Build collection"}
                  onCta={
                    embeddedInVault
                      ? handleBrowseWatches
                      : () => onNavigate("catalog", "catalog-shop")
                  }
                />
              </div>
            ) : (
              <CatalogGrid
                entries={stableCatalogEntries}
                allEntries={catalogEntries}
                state={state}
                isCompact={isCompactDensity}
                isExpertMode={isExpertViewMode}
                showFacts={true}
                showLaneLayout={showLaneLayout}
                favoriteIds={favoriteSet}
                expandedCards={expandedCards}
                purchaseHighlights={purchaseHighlights}
                nowMs={nowMs}
                effectiveCashRateCentsPerSec={effectiveCashRateCentsPerSec}
                effectiveEnjoymentRateCentsPerSec={effectiveEnjoymentRateCentsPerSec}
                craftingPartsPerWatch={craftingPartsPerWatch}
                atelierUnlocked={atelierUnlocked}
                filterSignature={filterSignature}
                detailsSheetTarget={detailsSheetTarget}
                onPurchase={onPurchase}
                onToggleExpand={handleDetailsToggle}
                onOpenDetails={makeOpenDetailsHandler(true)}
                onInteract={onInteract}
                embeddedInVault={embeddedInVault}
              />
            )}
          </>
        )}
      </section>

      {activeDetailsEntry && (
        <CatalogDetailsSheet
          entry={activeDetailsEntry}
          state={state}
          isOpen={Boolean(detailsSheetTarget)}
          isCompact={isCompactDensity}
          showFacts={detailsSheetTarget?.showFacts ?? false}
          viewMode={catalogViewMode}
          nowMs={nowMs}
          effectiveCashRateCentsPerSec={effectiveCashRateCentsPerSec}
          effectiveEnjoymentRateCentsPerSec={effectiveEnjoymentRateCentsPerSec}
          onClose={closeDetailsSheet}
          onPurchase={onPurchase}
          onInteract={onInteract}
        />
      )}
    </>
  );
}

// CatalogDetailsSheet wraps the details content with the sheet component
interface CatalogDetailsSheetProps {
  entry: CatalogEntry;
  state: GameState;
  isOpen: boolean;
  isCompact: boolean;
  showFacts: boolean;
  viewMode: "novice" | "expert";
  nowMs?: number;
  effectiveCashRateCentsPerSec: number;
  effectiveEnjoymentRateCentsPerSec: number;
  onClose: () => void;
  onPurchase: (nextState: GameState) => void;
  onInteract?: (itemId: WatchItemId) => void;
}

function CatalogDetailsSheet({
  entry,
  state,
  isOpen,
  isCompact,
  showFacts,
  viewMode,
  nowMs,
  effectiveCashRateCentsPerSec,
  effectiveEnjoymentRateCentsPerSec,
  onClose,
  onPurchase,
  onInteract,
}: CatalogDetailsSheetProps) {
  const watchItems = React.useMemo(() => getWatchItems(), []);
  const watchItemById = React.useMemo(
    () => new Map(watchItems.map((item) => [item.id, item])),
    [watchItems],
  );

  const tierId = getWatchModelTierId(entry.id);
  const tierItem = watchItemById.get(tierId);
  const ownedCount = getWatchModelOwnedCount(state, entry.id);
  const isWorn = state.wornWatchId === entry.id;
  const canWear = ownedCount > 0 && !isWorn;

  const unlocked = isItemUnlocked(state, tierId);
  const unlockMilestoneId = tierItem?.unlockMilestoneId;
  const unlockDetail = unlockMilestoneId
    ? getMilestoneUnlockProgressDetail(state, unlockMilestoneId)
    : null;
  const unlockUsesCents = unlockMilestoneId === "showcase";

  const gate = getWatchModelPurchaseGate(state, entry.id);
  const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entry.id);

  const gateEtaLabel = getGateEtaLabel(
    gate,
    effectiveCashRateCentsPerSec,
    effectiveEnjoymentRateCentsPerSec,
  );

  const formatCount = (value: number) => Math.floor(value).toLocaleString();

  const decisionInfo: CatalogDecisionInfo = React.useMemo(() => {
    const unlockCurrentLabel = unlockDetail
      ? unlockUsesCents
        ? formatMoneyFromCents(unlockDetail.current)
        : formatCount(unlockDetail.current)
      : "0";
    const unlockThresholdLabel = unlockDetail
      ? unlockUsesCents
        ? formatMoneyFromCents(unlockDetail.threshold)
        : formatCount(unlockDetail.threshold)
      : "0";

    return buildCatalogDecisionInfo({
      tierId,
      movement: tierItem?.movement,
      unlocked,
      ownedCount,
      unlockRequirementLabel: unlockDetail?.label ?? null,
      unlockProgressLabel: unlockDetail ? `${unlockCurrentLabel} / ${unlockThresholdLabel}` : null,
      gateReady: gate.ok,
      gateEtaLabel,
      duplicateMultiplier,
    });
  }, [
    tierId,
    tierItem?.movement,
    unlocked,
    ownedCount,
    unlockDetail,
    unlockUsesCents,
    gate.ok,
    gateEtaLabel,
    duplicateMultiplier,
  ]);

  const tags = React.useMemo(
    () => [
      ...(entry.movementType ? [entry.movementType] : []),
      ...(entry.windingSystem ? [entry.windingSystem] : []),
      ...(entry.tags ?? []),
    ],
    [entry],
  );

  const movementGate = getInteractionMovementGate(tierId);
  const movementReason = ownedCount > 0 ? (movementGate.reason ?? null) : null;
  const interactionLabel =
    tierItem?.movement === "manual"
      ? "Wind crown"
      : tierItem?.movement === "automatic"
        ? "Charge rotor"
        : "Set time";

  const cooldownRemainingMs =
    typeof nowMs === "number" ? getInteractionCooldownRemainingMs(state, tierId, nowMs) : 0;
  const cooldownSeconds = Math.ceil(cooldownRemainingMs / 1_000);
  const interactionHint =
    movementReason ??
    (ownedCount <= 0
      ? "Own one to interact"
      : cooldownSeconds > 0
        ? `Cooldown ${cooldownSeconds}s`
        : null);
  const canInteract = movementGate.available && interactionHint === null;
  const canShowInteract = Boolean(onInteract) && typeof nowMs === "number";

  const craftingPartsPerWatch = getCraftingPartsPerWatch();
  const hasCraftingParts = (craftingPartsPerWatch[tierId] ?? 0) > 0;
  const canDismantle = ownedCount > 1 && hasCraftingParts;

  return (
    <CatalogCardDetailsSheet entry={entry} tags={tags} show={isOpen} onClose={onClose}>
      <CatalogDetailsContent
        entry={entry}
        tags={tags}
        showFacts={showFacts}
        decisionInfo={decisionInfo}
        viewMode={viewMode}
      />
      {isCompact && (
        <div className="catalog-sheet-actions" data-testid={`catalog-sheet-actions-${entry.id}`}>
          <p className="catalog-sheet-actions-title">Quick actions</p>
          <div className="catalog-sheet-actions-grid">
            <button
              type="button"
              className={`catalog-favorite-toggle secondary ${
                state.favoriteWatchIds?.includes(entry.id) ? "catalog-favorite-toggle--active" : ""
              }`}
              data-testid={`catalog-favorite-toggle-${entry.id}`}
              aria-pressed={state.favoriteWatchIds?.includes(entry.id)}
              onClick={() => onPurchase(toggleWatchFavorite(state, entry.id))}
            >
              {state.favoriteWatchIds?.includes(entry.id) ? "Favorited" : "Favorite"}
            </button>
            {canWear && (
              <button
                type="button"
                className="secondary catalog-secondary-action"
                data-testid={`watch-wear-${entry.id}`}
                onClick={() => {
                  onPurchase(setWornWatchId(state, entry.id));
                  onClose();
                }}
              >
                Wear
              </button>
            )}
            {canShowInteract && (
              <button
                type="button"
                className="secondary catalog-secondary-action"
                disabled={!canInteract}
                data-testid={`vault-interact-${tierId}`}
                onClick={() => {
                  onInteract?.(tierId);
                  onClose();
                }}
              >
                {interactionLabel}
              </button>
            )}
            {hasCraftingParts && (
              <button
                type="button"
                className="secondary catalog-secondary-action"
                data-testid={`catalog-dismantle-${entry.id}`}
                disabled={!canDismantle}
                onClick={() => {
                  onPurchase(dismantleWatchModel(state, entry.id, 1));
                  onClose();
                }}
              >
                Dismantle
              </button>
            )}
          </div>
          {canShowInteract && interactionHint && (
            <p className="muted catalog-interaction-hint">{interactionHint}</p>
          )}
        </div>
      )}
    </CatalogCardDetailsSheet>
  );
}
export function CatalogTab({ isActive, catalogEntries, ...panelProps }: CatalogTabProps) {
  return (
    <section
      className="panel catalog-panel"
      id="catalog"
      role="tabpanel"
      aria-labelledby="catalog-tab"
      hidden={!isActive}
    >
      <section id="catalog-shop" data-testid="catalog-shop">
        {isActive && <CatalogPurchasePanel {...panelProps} catalogEntries={catalogEntries} />}
      </section>
    </section>
  );
}
