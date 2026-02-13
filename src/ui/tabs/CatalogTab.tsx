import React from "react";

import { EmptyStateCTA } from "../components/EmptyStateCTA";
import { UnlockHint } from "../components/UnlockHint";
import { CatalogCardDetailsSheet } from "../components/catalog/CatalogCardDetailsSheet";
import { CatalogPurchaseGate } from "../components/catalog/CatalogPurchaseGate";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { useStableCatalogEntries } from "../hooks/useStableCatalogEntries";
import { useCatalogVirtualizer } from "../hooks/useCatalogVirtualizer";
import type { CatalogVirtualizerResult } from "../hooks/useCatalogVirtualizer";
import { LockIcon } from "../icons/coreIcons";
import { getCatalogCollectionContext } from "../catalog/collectionContext";
import { getCatalogUpgradeContext } from "../catalog/upgradeContext";
import { PerWatchStatsTable } from "../components/PerWatchStatsTable";
import { TierBadge } from "../components/TierBadge";
import {
  WatchComparePanel,
  type CompareSlotPayload,
} from "../components/catalog/WatchComparePanel";
import { PowerReserveHint } from "../components/PowerReserveHint";
import {
  buildCatalogDecisionInfo,
  CatalogDetailsContent,
  type CatalogDecisionInfo,
} from "./catalog/CatalogDetailsContent";
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
  describeGateStatus,
  formatEtaLabel,
  formatMovementLabel,
  getGateEtaLabel,
  type CatalogQuickPreset,
} from "./catalog/catalogPresentation";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../game/format";
import { isTestEnvironment } from "../../game/runtime/isTestEnvironment";
import {
  CATALOG_TIER_SEQUENCE,
  getCatalogEntryTags,
  getCatalogFallbackImageUrl,
  getCatalogImageUrl,
  getWatchModelTierBadge,
} from "../../game/catalog";
import type { CatalogEntry } from "../../game/catalog";
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
  discoveredCatalogEntries: ReadonlyArray<CatalogEntry>;
  discoveredCatalogIds: ReadonlyArray<string>;
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

type CatalogDensity = "compact" | "expanded";

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
  discoveredCatalogEntries,
  discoveredCatalogIds,
  catalogEntries,
  hasOwnedCatalogTiers,
  onPurchase,
  currentEventMultiplier = 1,
  showBalance = false,
  nowMs,
  onInteract,
  atelierUnlocked = true,
}: CatalogPurchasePanelProps) {
  const formatCount = (value: number) => Math.floor(value).toLocaleString();
  const embeddedInVault = showBalance;
  const craftingPartsPerWatch = getCraftingPartsPerWatch();
  const watchModels = getWatchModels();
  const watchItems = getWatchItems();
  const watchItemById = new Map(watchItems.map((item) => [item.id, item]));
  const watchModelById = React.useMemo(
    () => new Map(watchModels.map((model) => [model.id, model])),
    [watchModels],
  );
  const [compareSlots, setCompareSlots] = React.useState<string[]>([]);
  const comparedEntries = React.useMemo(() => new Set(compareSlots), [compareSlots]);
  const modelOwnedByTier = new Map<WatchItemId, number>();
  const firstModelByTier = new Map<WatchItemId, string>();

  for (const model of watchModels) {
    modelOwnedByTier.set(
      model.tierId,
      (modelOwnedByTier.get(model.tierId) ?? 0) + getWatchModelOwnedCount(state, model.id),
    );
    if (!firstModelByTier.has(model.tierId)) {
      firstModelByTier.set(model.tierId, model.id);
    }
  }

  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const [purchaseHighlights, setPurchaseHighlights] = React.useState<Record<string, boolean>>({});
  const purchaseHighlightTimeouts = React.useRef<Map<string, number>>(new Map());
  const [detailsSheetTarget, setDetailsSheetTarget] = React.useState<{
    entryId: string;
    showFacts: boolean;
  } | null>(null);
  const detailsTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const { focusedCatalogTab, setFocusedCatalogTab, handleCatalogTabKeyDown } =
    useCatalogOwnershipTabKeyboard(catalogTab, onCatalogTabChange);

  const openDetailsSheet = React.useCallback(
    (entryId: string, showFacts: boolean, trigger: HTMLButtonElement | null) => {
      detailsTriggerRef.current = trigger;
      setDetailsSheetTarget({ entryId, showFacts });
    },
    [],
  );

  const closeDetailsSheet = React.useCallback(() => {
    setDetailsSheetTarget(null);
    detailsTriggerRef.current?.focus();
    detailsTriggerRef.current = null;
  }, []);

  const readMobileViewportMatch = React.useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(CATALOG_MOBILE_MEDIA_QUERY).matches;
  }, []);
  const [isMobileViewport, setIsMobileViewport] = React.useState<boolean>(() =>
    readMobileViewportMatch(),
  );
  const [catalogDensity, setCatalogDensity] = React.useState<CatalogDensity>(() =>
    readMobileViewportMatch() ? "compact" : "expanded",
  );
  const catalogDensityOverriddenRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const query = window.matchMedia(CATALOG_MOBILE_MEDIA_QUERY);
    const handleChange = () => {
      setIsMobileViewport(query.matches);
    };
    handleChange();
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  React.useEffect(() => {
    if (catalogDensityOverriddenRef.current) {
      return;
    }
    setCatalogDensity(isMobileViewport ? "compact" : "expanded");
  }, [isMobileViewport]);

  const isCompactDensity = catalogDensity === "compact";
  const isNoviceViewMode = catalogViewMode === "novice";
  const isExpertViewMode = catalogViewMode === "expert";
  const toggleCatalogDensity = React.useCallback(() => {
    catalogDensityOverriddenRef.current = true;
    setCatalogDensity((value) => (value === "compact" ? "expanded" : "compact"));
  }, []);
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
  React.useEffect(() => {
    if (activeFilterCount > 0 && !filtersOpen) {
      setFiltersOpen(true);
    }
  }, [activeFilterCount, filtersOpen]);
  const toggleFilters = React.useCallback(() => {
    setFiltersOpen((value) => !value);
  }, []);
  const filterCountLabel = activeFilterCount > 0 ? `${activeFilterCount} active` : "Show filters";
  const cycleCatalogSort = React.useCallback(() => {
    const currentIndex = CATALOG_SORT_ORDER.indexOf(catalogSort);
    const nextSort =
      CATALOG_SORT_ORDER[
        (currentIndex + 1 + CATALOG_SORT_ORDER.length) % CATALOG_SORT_ORDER.length
      ];
    onCatalogSortChange(nextSort);
  }, [catalogSort, onCatalogSortChange]);
  const quickSortLabel = CATALOG_SORT_LABELS[catalogSort];
  const cycleCatalogQuickPreset = React.useCallback(() => {
    const currentIndex = CATALOG_QUICK_PRESET_ORDER.indexOf(catalogQuickPreset);
    const nextPreset =
      CATALOG_QUICK_PRESET_ORDER[
        (currentIndex + 1 + CATALOG_QUICK_PRESET_ORDER.length) % CATALOG_QUICK_PRESET_ORDER.length
      ];
    setCatalogQuickPreset(nextPreset);
  }, [catalogQuickPreset]);
  const quickPresetLabel = CATALOG_QUICK_PRESET_LABELS[catalogQuickPreset];

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

  const perWatchRows = React.useMemo(() => {
    const effectiveNowMs = typeof nowMs === "number" ? nowMs : Date.now();
    return getPerWatchStatsRows(state, effectiveNowMs, currentEventMultiplier);
  }, [state, nowMs, currentEventMultiplier]);

  const previewStatsByEntry = React.useMemo(() => {
    const map = new Map<string, { enjoyment: string; cash: string }>();
    for (const row of perWatchRows) {
      const stats = {
        enjoyment: formatRateFromCentsPerSec(row.enjoymentCentsPerSec),
        cash: formatRateFromCentsPerSec(row.cashCentsPerSec),
      };
      row.catalogEntryIds.forEach((entryId) => {
        map.set(entryId, stats);
      });
    }
    return map;
  }, [perWatchRows]);
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

  const { ownedCount, maxCapacity, collectionValueCents } = getCatalogCollectionContext(state);
  const upgradeContext = getCatalogUpgradeContext(state);
  const ownedCountLabel = formatCount(ownedCount);
  const maxCapacityLabel = formatCount(maxCapacity);
  const upgradeLevelsLabel = formatCount(upgradeContext.totalUpgradeLevels);
  const workshopOwnedLabel = formatCount(upgradeContext.workshopOwned);
  const workshopTotalLabel = formatCount(upgradeContext.workshopTotal);
  const maisonOwnedLabel = formatCount(upgradeContext.maisonOwned);
  const maisonTotalLabel = formatCount(upgradeContext.maisonTotal);
  const maisonLinesActiveLabel = formatCount(upgradeContext.maisonLinesActive);
  const maisonLinesTotalLabel = formatCount(upgradeContext.maisonLinesTotal);

  const handleBrowseWatches = React.useCallback(() => {
    onCatalogTabChange("unowned");
    if (typeof document === "undefined") {
      return;
    }
    document.getElementById("catalog-unowned")?.scrollIntoView({ block: "start" });
  }, [onCatalogTabChange]);

  const handleDetailsToggle = React.useCallback((entryId: string, isOpen: boolean) => {
    setExpandedCards((prev) => ({
      ...prev,
      [entryId]: isOpen,
    }));
  }, []);

  const handleCompareToggle = React.useCallback((entryId: string) => {
    setCompareSlots((prev) => {
      if (prev.includes(entryId)) {
        return prev.filter((id) => id !== entryId);
      }
      if (prev.length < 2) {
        return [...prev, entryId];
      }
      return [prev[1], entryId];
    });
  }, []);

  const handleClearCompareSlot = React.useCallback((index: number) => {
    setCompareSlots((prev) => prev.filter((_, slotIndex) => slotIndex !== index));
  }, []);

  const handleClearAllCompare = React.useCallback(() => {
    setCompareSlots([]);
  }, []);

  const handleSwapCompareOrder = React.useCallback(() => {
    setCompareSlots((prev) => (prev.length === 2 ? [prev[1], prev[0]] : prev));
  }, []);

  const triggerPurchaseHighlight = React.useCallback((entryId: string) => {
    setPurchaseHighlights((prev) => ({
      ...prev,
      [entryId]: true,
    }));

    const existingTimeout = purchaseHighlightTimeouts.current.get(entryId);
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    const timeoutId = window.setTimeout(() => {
      setPurchaseHighlights((prev) => {
        if (!prev[entryId]) {
          return prev;
        }
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

  const effectiveNowMs = React.useMemo(
    () => (typeof nowMs === "number" ? nowMs : Date.now()),
    [nowMs],
  );
  const effectiveEventMultiplier = currentEventMultiplier ?? 1;
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
  const readyToBuyCount = React.useMemo(
    () =>
      stableCatalogEntries.reduce((count, entry) => {
        if (getWatchModelOwnedCount(state, entry.id) > 0) {
          return count;
        }
        return count + (getWatchModelPurchaseGate(state, entry.id).ok ? 1 : 0);
      }, 0),
    [stableCatalogEntries, state],
  );
  const readyOwnedQuickActionsCount = React.useMemo(
    () =>
      stableCatalogEntries.reduce((count, entry) => {
        if (getWatchModelOwnedCount(state, entry.id) <= 0) {
          return count;
        }
        return count + (hasQuickActionForOwnedEntry(entry.id) ? 1 : 0);
      }, 0),
    [hasQuickActionForOwnedEntry, stableCatalogEntries, state],
  );
  const undoComplicationValue =
    undoStatus === "available"
      ? `Available · ${Math.ceil(undoRemainingMs / 1_000)}s left`
      : undoStatus === "expired"
        ? "Expired"
        : "No undo yet";
  const undoComplicationDetail =
    undoStatus === "available"
      ? `Last purchase ${lastPurchaseModelId} can be reversed until the timer reaches 0s.`
      : undoStatus === "expired"
        ? `Last purchase ${lastPurchaseModelId} passed the ${PURCHASE_UNDO_WINDOW_SECONDS}s undo window.`
        : `Buy a watch to open a ${PURCHASE_UNDO_WINDOW_SECONDS}s undo window.`;

  const compareSlotPayloads = React.useMemo<
    [CompareSlotPayload | null, CompareSlotPayload | null]
  >(() => {
    const normalizedSlots: [string | null, string | null] = [
      compareSlots[0] ?? null,
      compareSlots[1] ?? null,
    ];
    const buildPayload = (entryId: string | null): CompareSlotPayload | null => {
      if (!entryId) {
        return null;
      }
      const entry = catalogEntryById.get(entryId);
      if (!entry) {
        return null;
      }
      const watchModel = watchModelById.get(entryId);
      const tierId = getWatchModelTierId(entryId);
      const tierItem = watchItemById.get(tierId);
      const gate = getWatchModelPurchaseGate(state, entryId);
      const preview = previewStatsByEntry.get(entryId);
      return {
        entry,
        movementLabel: formatMovementLabel(tierItem?.movement),
        priceLabel: formatMoneyFromCents(gate.cashPriceCents),
        gateDescription: describeGateStatus(gate),
        tierBadge: getWatchModelTierBadge(entryId, watchModel?.tierBadge),
        enjoymentLabel: preview?.enjoyment ?? "-",
        cashLabel: preview?.cash ?? "-",
        ready: gate.ok,
      };
    };

    return [buildPayload(normalizedSlots[0]), buildPayload(normalizedSlots[1])];
  }, [compareSlots, catalogEntryById, previewStatsByEntry, state, watchItemById, watchModelById]);

  const buildDecisionInfoForEntry = (entryId: string): CatalogDecisionInfo => {
    const tierId = getWatchModelTierId(entryId);
    const tierItem = watchItemById.get(tierId);
    if (!tierItem) {
      throw new Error(`Missing watch tier definition for ${tierId}`);
    }
    const tierOwned = state.items[tierId] ?? 0;
    const totalTierOwned = modelOwnedByTier.get(tierId) ?? 0;
    const fallbackOwner =
      totalTierOwned === 0 && tierOwned > 0 && firstModelByTier.get(tierId) === entryId;
    const modelOwned = getWatchModelOwnedCount(state, entryId);
    const ownedCount = fallbackOwner ? tierOwned : modelOwned;
    const unlocked = isItemUnlocked(state, tierId);
    const unlockMilestoneId = tierItem.unlockMilestoneId;
    const unlockDetail = unlockMilestoneId
      ? getMilestoneUnlockProgressDetail(state, unlockMilestoneId)
      : null;
    const unlockUsesCents = unlockMilestoneId === "showcase";
    const unlockProgressLabel = unlockDetail
      ? `${unlockUsesCents ? formatMoneyFromCents(unlockDetail.current) : formatCount(unlockDetail.current)} / ${
          unlockUsesCents
            ? formatMoneyFromCents(unlockDetail.threshold)
            : formatCount(unlockDetail.threshold)
        }`
      : null;
    const gate = getWatchModelPurchaseGate(state, entryId);
    const gateEtaLabel = getGateEtaLabel(
      gate,
      effectiveCashRateCentsPerSec,
      effectiveEnjoymentRateCentsPerSec,
    );
    const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entryId);

    return buildCatalogDecisionInfo({
      tierId,
      movement: tierItem.movement,
      unlocked,
      ownedCount,
      unlockRequirementLabel: unlockDetail?.label ?? null,
      unlockProgressLabel,
      gateReady: gate.ok,
      gateEtaLabel,
      duplicateMultiplier,
    });
  };

  const renderCatalogDetailsContent = (
    entry: CatalogEntry,
    tags: string[],
    showFacts: boolean,
    decisionInfo = buildDecisionInfoForEntry(entry.id),
  ) => (
    <CatalogDetailsContent
      entry={entry}
      tags={tags}
      showFacts={showFacts}
      decisionInfo={decisionInfo}
    />
  );

  const renderCatalogDetails = (
    entry: CatalogEntry,
    tags: string[],
    showFacts: boolean,
    decisionInfo: CatalogDecisionInfo,
  ) => (
    <details
      className="catalog-details"
      open={expandedCards[entry.id] ?? false}
      onToggle={(event) => handleDetailsToggle(entry.id, event.currentTarget.open)}
      data-testid="catalog-details"
    >
      <summary>Details</summary>
      {renderCatalogDetailsContent(entry, tags, showFacts, decisionInfo)}
    </details>
  );

  const getTierBadgeDefinition = (entryId: string) => {
    const watchModel = watchModelById.get(entryId);
    return getWatchModelTierBadge(entryId, watchModel?.tierBadge);
  };

  const renderCompactSheetActions = (entry: CatalogEntry) => {
    const tierId = getWatchModelTierId(entry.id);
    const tierItem = watchItemById.get(tierId);
    if (!tierItem) {
      throw new Error(`Missing watch tier definition for ${tierId}`);
    }
    const tierOwned = state.items[tierId] ?? 0;
    const totalTierOwned = modelOwnedByTier.get(tierId) ?? 0;
    const fallbackOwner =
      totalTierOwned === 0 && tierOwned > 0 && firstModelByTier.get(tierId) === entry.id;
    const modelOwned = getWatchModelOwnedCount(state, entry.id);
    const ownedCount = fallbackOwner ? tierOwned : modelOwned;
    const isWorn = state.wornWatchId === entry.id;
    const canWear = modelOwned > 0 && !isWorn;
    const hasCraftingParts = (craftingPartsPerWatch[tierId] ?? 0) > 0;
    const canDismantle = modelOwned > 1 && hasCraftingParts;
    const showDismantleAction = atelierUnlocked && hasCraftingParts;
    const movementGate = getInteractionMovementGate(tierId);
    const movementReason = ownedCount > 0 ? (movementGate.reason ?? null) : null;
    const interactionLabel =
      tierItem.movement === "manual"
        ? "Wind crown"
        : tierItem.movement === "automatic"
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
    const showSecondaryInteract = canShowInteract && ownedCount > 0;
    const isFavorite = favoriteSet.has(entry.id);
    const isCompared = comparedEntries.has(entry.id);

    return (
      <div className="catalog-sheet-actions" data-testid={`catalog-sheet-actions-${entry.id}`}>
        <p className="catalog-sheet-actions-title">Quick actions</p>
        <div className="catalog-sheet-actions-grid">
          <button
            type="button"
            className={`catalog-favorite-toggle secondary ${isFavorite ? "catalog-favorite-toggle--active" : ""}`}
            data-testid={`catalog-favorite-toggle-${entry.id}`}
            aria-pressed={isFavorite}
            onClick={() => onPurchase(toggleWatchFavorite(state, entry.id))}
          >
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
          <button
            type="button"
            className={`catalog-compare-toggle secondary ${isCompared ? "catalog-compare-toggle-active" : ""}`}
            data-testid={`catalog-compare-toggle-${entry.id}`}
            aria-pressed={isCompared}
            onClick={() => handleCompareToggle(entry.id)}
          >
            {isCompared ? "Selected" : "Compare"}
          </button>
          {canWear && (
            <button
              type="button"
              className="secondary catalog-secondary-action"
              data-testid={`watch-wear-${entry.id}`}
              onClick={() => {
                onPurchase(setWornWatchId(state, entry.id));
                closeDetailsSheet();
              }}
            >
              Wear
            </button>
          )}
          {showSecondaryInteract && (
            <button
              type="button"
              className="secondary catalog-secondary-action"
              disabled={!canInteract}
              data-testid={`vault-interact-${tierId}`}
              onClick={() => {
                onInteract?.(tierId);
                closeDetailsSheet();
              }}
            >
              {interactionLabel}
            </button>
          )}
          {showDismantleAction && (
            <button
              type="button"
              className="secondary catalog-secondary-action"
              data-testid={`catalog-dismantle-${entry.id}`}
              disabled={!canDismantle}
              onClick={() => {
                onPurchase(dismantleWatchModel(state, entry.id, 1));
                closeDetailsSheet();
              }}
            >
              Dismantle
            </button>
          )}
          {canShowInteract && (
            <ExplainButton
              sectionId={HELP_SECTION_IDS.interactions}
              label="Explain interactions"
              className="help-open-button catalog-secondary-help"
            />
          )}
        </div>
        {showSecondaryInteract && interactionHint && (
          <p className="muted catalog-interaction-hint">{interactionHint}</p>
        )}
      </div>
    );
  };

  const renderCatalogCard = (entry: CatalogEntry, showFacts: boolean) => {
    const discovered = discoveredCatalogIds.includes(entry.id);
    const tags = getCatalogEntryTags(entry);
    const tierBadge = getTierBadgeDefinition(entry.id);
    const tierId = getWatchModelTierId(entry.id);
    const tierOwned = state.items[tierId] ?? 0;
    const totalTierOwned = modelOwnedByTier.get(tierId) ?? 0;
    const fallbackOwner =
      totalTierOwned === 0 && tierOwned > 0 && firstModelByTier.get(tierId) === entry.id;
    const modelOwned = getWatchModelOwnedCount(state, entry.id);
    const ownedCount = fallbackOwner ? tierOwned : modelOwned;
    const tierItem = watchItemById.get(tierId);
    if (!tierItem) {
      throw new Error(`Missing watch tier definition for ${tierId}`);
    }
    const unlocked = isItemUnlocked(state, tierId);
    const unlockMilestoneId = tierItem.unlockMilestoneId;
    const unlockDetail = unlockMilestoneId
      ? getMilestoneUnlockProgressDetail(state, unlockMilestoneId)
      : null;
    const unlockUsesCents = unlockMilestoneId === "showcase";
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
    const gate = getWatchModelPurchaseGate(state, entry.id);
    const gateEtaLabel = getGateEtaLabel(
      gate,
      effectiveCashRateCentsPerSec,
      effectiveEnjoymentRateCentsPerSec,
    );
    const previewStats = previewStatsByEntry.get(entry.id);
    const isActionable = unlocked && gate.ok;
    const hasAffordabilityHighlight = discovered && ownedCount === 0 && isActionable;
    const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entry.id);
    const buyLabel = ownedCount > 0 ? "Buy another" : "Buy";
    const isHighlighted = purchaseHighlights[entry.id];
    const isCompared = comparedEntries.has(entry.id);
    const isDetailsOpen = detailsSheetTarget?.entryId === entry.id;
    const isFavorite = favoriteSet.has(entry.id);

    const movementGate = getInteractionMovementGate(tierId);
    const movementReason = ownedCount > 0 ? (movementGate.reason ?? null) : null;
    const interactionLabel =
      tierItem.movement === "manual"
        ? "Wind crown"
        : tierItem.movement === "automatic"
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
    const showSecondaryInteract = canShowInteract && ownedCount > 0;

    const isWorn = state.wornWatchId === entry.id;
    const canWear = modelOwned > 0 && !isWorn;
    const hasCraftingParts = (craftingPartsPerWatch[tierId] ?? 0) > 0;
    const canDismantle = modelOwned > 1 && hasCraftingParts;
    const showDismantleAction = atelierUnlocked && hasCraftingParts;
    const powerReserveDetail = getPowerReserveDetail(state, tierId);
    const showInlineSecondaryActions = !isCompactDensity;
    const showDetailsButton = isCompactDensity || isMobileViewport;
    const showExpertCardDetails = !isCompactDensity && isExpertViewMode;
    const showExpertSecondaryActions = showInlineSecondaryActions && isExpertViewMode;
    const showSecondaryActions = showInlineSecondaryActions || showDetailsButton;
    const decisionInfo = buildCatalogDecisionInfo({
      tierId,
      movement: tierItem.movement,
      unlocked,
      ownedCount,
      unlockRequirementLabel: unlockDetail?.label ?? null,
      unlockProgressLabel: unlockDetail ? `${unlockCurrentLabel} / ${unlockThresholdLabel}` : null,
      gateReady: gate.ok,
      gateEtaLabel,
      duplicateMultiplier,
    });
    return (
      <article
        key={entry.id}
        className={`catalog-card ${
          discovered ? "catalog-discovered" : "catalog-locked"
        } ${isHighlighted ? "purchase-flash" : ""} ${
          hasAffordabilityHighlight ? "catalog-actionable" : ""
        } ${
          isActionable ? "" : "catalog-nonactionable"
        } ${isCompared ? "catalog-card-compared" : ""} ${
          isCompactDensity ? "catalog-card-compact" : "catalog-card-expanded"
        }`}
        data-testid="catalog-card"
      >
        {previewStats && (
          <div
            className="catalog-card-preview"
            data-testid={`catalog-preview-${entry.id}`}
            aria-hidden="true"
            data-label="Stat preview"
          >
            <div className="catalog-card-preview__rows">
              <div
                className="catalog-card-preview__row catalog-card-preview__row--enjoyment"
                data-label="Enjoyment / sec"
                data-value={previewStats.enjoyment}
              />
              <div
                className="catalog-card-preview__row catalog-card-preview__row--cash"
                data-label="Cash / sec"
                data-value={previewStats.cash}
              />
            </div>
          </div>
        )}
        <div className="catalog-media">
          <img
            src={getCatalogImageUrl(entry)}
            alt={`${entry.brand} ${entry.model}`}
            loading="lazy"
            onError={(event) => {
              const target = event.currentTarget;
              const tierFallback = getCatalogFallbackImageUrl(entry);
              const finalFallback =
                "data:image/svg+xml;utf8," +
                encodeURIComponent(
                  `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                    `<defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#161b24'/><stop offset='1' stop-color='#0f131b'/></linearGradient></defs>` +
                    `<rect width='100%' height='100%' fill='url(#bg)'/>` +
                    `<path d='M126 294c42-68 94-112 194-112s152 44 194 112' stroke='#3a4150' stroke-width='10' fill='none' stroke-linecap='round'/>` +
                    `<circle cx='320' cy='252' r='68' fill='none' stroke='#3a4150' stroke-width='9'/>` +
                    `<rect x='248' y='354' width='144' height='28' rx='14' fill='rgba(232,198,147,0.12)' stroke='rgba(232,198,147,0.35)'/>` +
                    `<text x='320' y='372' dominant-baseline='middle' text-anchor='middle' fill='#d5c4a8' font-size='16' font-family='Arial, sans-serif'>Reference pending</text>` +
                    `</svg>`,
                );

              if (target.dataset.fallbackStage !== "tier") {
                target.dataset.fallbackStage = "tier";
                target.src = tierFallback;
                return;
              }

              target.dataset.fallbackStage = "final";
              target.src = finalFallback;
            }}
          />
          {!discovered && (
            <span className="catalog-lock-icon" data-testid={`catalog-lock-${entry.id}`}>
              <LockIcon />
            </span>
          )}
          {!discovered && <span className="catalog-badge">Undiscovered</span>}
        </div>
        <div className="catalog-content">
          <div className="catalog-title">
            <div className="catalog-title-primary">
              {tierBadge && (
                <TierBadge
                  tier={tierBadge.category}
                  showLabel
                  label={tierBadge.label}
                  description={tierBadge.description}
                  backgroundVar={tierBadge.backgroundVar}
                  textVar={tierBadge.textVar}
                />
              )}
              <div>
                <p className="catalog-brand">{entry.brand}</p>
                <h3>{entry.model}</h3>
              </div>
            </div>
            <p className="catalog-year">{entry.year}</p>
          </div>
          {showExpertCardDetails && renderCatalogDetails(entry, tags, showFacts, decisionInfo)}
          {!unlocked && unlockDetail && (
            <div data-testid={`locked-item-hint-${entry.id}`}>
              <UnlockHint
                eyebrow="Locked"
                title="Unlock requirement"
                detail={unlockDetail.label}
                currentLabel={unlockCurrentLabel}
                thresholdLabel={unlockThresholdLabel}
                ratio={unlockDetail.ratio}
              />
            </div>
          )}
          {isExpertViewMode && tierItem.movement === "automatic" && ownedCount > 0 && (
            <PowerReserveHint
              detail={powerReserveDetail}
              testId={`power-reserve-hint-${entry.id}`}
            />
          )}
          {isExpertViewMode && (craftingPartsPerWatch[tierId] ?? 0) > 0 && (
            <p className="muted">Dismantle value: {craftingPartsPerWatch[tierId] ?? 0} parts</p>
          )}
          <div className="catalog-action-bar">
            <div className="catalog-action-meta">
              {isWorn && (
                <span className="catalog-equipped" data-testid={`watch-equipped-${entry.id}`}>
                  Equipped
                </span>
              )}
              <span className="catalog-owned">{ownedCount} owned</span>
              <span className="catalog-price">{formatMoneyFromCents(gate.cashPriceCents)}</span>
              {isExpertViewMode && (
                <span className="catalog-duplicate">Next x{duplicateMultiplier.toFixed(2)}</span>
              )}
            </div>
            <div className="catalog-primary-actions">
              <CatalogPurchaseGate
                entryId={entry.id}
                discovered={discovered}
                unlocked={unlocked}
                unlockDetail={unlockDetail}
                unlockCurrentLabel={unlockCurrentLabel}
                unlockThresholdLabel={unlockThresholdLabel}
                gate={gate}
                buyLabel={buyLabel}
                onBuy={() => handlePurchase(entry.id)}
                extraReasons={
                  gateEtaLabel
                    ? [
                        {
                          code: "prerequisite",
                          label: "Affordability ETA",
                          detail: gateEtaLabel,
                        },
                      ]
                    : []
                }
              />
            </div>
          </div>
          {gateEtaLabel && <p className="muted catalog-gate-eta">{gateEtaLabel}</p>}
          {gateEtaLabel && <p className="muted catalog-gate-eta">{gateEtaLabel}</p>}
          <details
            className="catalog-economics-disclosure"
            data-testid={`catalog-advanced-economics-${entry.id}`}
          >
            <summary>Advanced economics</summary>
            <div className="catalog-economics-disclosure__body">
              <p className="catalog-duplicate">Next duplicate multiplier x{duplicateMultiplier.toFixed(2)}</p>
              {(craftingPartsPerWatch[tierId] ?? 0) > 0 && (
                <p className="muted">
                  Dismantle yield: {craftingPartsPerWatch[tierId] ?? 0} parts per watch
                </p>
              )}
            </div>
          </details>
          {showSecondaryActions && (
            <div className="catalog-secondary-actions">
              {showInlineSecondaryActions && (
                <>
                  <button
                    type="button"
                    className={`catalog-favorite-toggle secondary ${isFavorite ? "catalog-favorite-toggle--active" : ""}`}
                    data-testid={`catalog-favorite-toggle-${entry.id}`}
                    aria-pressed={isFavorite}
                    onClick={() => onPurchase(toggleWatchFavorite(state, entry.id))}
                  >
                    {isFavorite ? "Favorited" : "Favorite"}
                  </button>
                  <button
                    type="button"
                    className={`catalog-compare-toggle secondary ${isCompared ? "catalog-compare-toggle-active" : ""}`}
                    data-testid={`catalog-compare-toggle-${entry.id}`}
                    aria-pressed={isCompared}
                    onClick={() => handleCompareToggle(entry.id)}
                  >
                    {isCompared ? "Selected" : "Compare"}
                  </button>
                  {canWear && (
                    <button
                      type="button"
                      className="secondary catalog-secondary-action"
                      data-testid={`watch-wear-${entry.id}`}
                      onClick={() => onPurchase(setWornWatchId(state, entry.id))}
                    >
                      Wear
                    </button>
                  )}
                  {showSecondaryInteract && (
                    <button
                      type="button"
                      className="secondary catalog-secondary-action"
                      disabled={!canInteract}
                      data-testid={`vault-interact-${tierId}`}
                      onClick={() => onInteract?.(tierId)}
                    >
                      {interactionLabel}
                    </button>
                  )}
                  {showDismantleAction && (
                    <button
                      type="button"
                      className="secondary catalog-secondary-action"
                      data-testid={`catalog-dismantle-${entry.id}`}
                      disabled={!canDismantle}
                      onClick={() => onPurchase(dismantleWatchModel(state, entry.id, 1))}
                    >
                      Dismantle
                    </button>
                  )}
                </>
              )}
              {showDetailsButton && (
                <button
                  type="button"
                  className="catalog-card-details-button catalog-secondary-action"
                  data-testid={`catalog-details-button-${entry.id}`}
                  aria-haspopup="dialog"
                  aria-controls="catalog-details-sheet"
                  aria-expanded={isDetailsOpen}
                  onClick={(event) =>
                    openDetailsSheet(entry.id, showFacts, event.currentTarget as HTMLButtonElement)
                  }
                >
                  More
                </button>
              )}
              {showExpertSecondaryActions && canShowInteract && ownedCount > 0 && interactionHint && (
                <span className="muted catalog-interaction-hint">{interactionHint}</span>
              )}
              {showExpertSecondaryActions && canShowInteract && (
                <ExplainButton
                  sectionId={HELP_SECTION_IDS.interactions}
                  label="Explain interactions"
                  className="help-open-button catalog-secondary-help"
                />
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  const renderCatalogLanes = (showFacts: boolean) => {
    const sortedEntries = [...stableCatalogEntries].sort((a, b) => {
      const tierA = getWatchModelTierId(a.id);
      const tierB = getWatchModelTierId(b.id);
      const orderA = CATALOG_TIER_SEQUENCE.indexOf(tierA);
      const orderB = CATALOG_TIER_SEQUENCE.indexOf(tierB);

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.model.localeCompare(b.model);
    });

    const sectionMap = new Map<CatalogTierId, CatalogEntry[]>();
    for (const section of CATALOG_MOVEMENT_SECTIONS) {
      sectionMap.set(section.id, []);
    }

    for (const entry of sortedEntries) {
      const movementType = getWatchModelTierId(entry.id);
      sectionMap.get(movementType)?.push(entry);
    }

    return (
      <div
        className={`catalog-grid catalog-lanes ${isCompactDensity ? "catalog-grid-density-compact" : "catalog-grid-density-expanded"}`}
        data-testid="catalog-grid"
        data-density={catalogDensity}
        data-view-mode={catalogViewMode}
      >
        {CATALOG_MOVEMENT_SECTIONS.map((section) => {
          const movementEntries = sectionMap.get(section.id) ?? [];
          return (
            <section
              key={section.id}
              className="catalog-lane"
              data-testid={`catalog-tier-${section.id}`}
            >
              <header
                className="catalog-lane-header"
                data-testid={`catalog-tier-header-${section.id}`}
              >
                <TierBadge
                  tier={section.id}
                  showLabel
                  label={section.title}
                  description={section.note}
                />
                <div>
                  <p className="catalog-lane-title">{section.title}</p>
                  <p className="catalog-lane-description">{section.description}</p>
                </div>
                <span className="catalog-lane-note">{section.note}</span>
              </header>
              {movementEntries.length > 0 ? (
                <div className="catalog-lane-grid">
                  {movementEntries.map((entry) => renderCatalogCard(entry, showFacts))}
                </div>
              ) : (
                <p className="catalog-lane-empty" data-testid={`catalog-tier-empty-${section.id}`}>
                  No catalog entries match these filters.
                </p>
              )}
            </section>
          );
        })}
      </div>
    );
  };

  const showLaneLayout = catalogSort === "tier";
  const catalogVirtualizer: CatalogVirtualizerResult | null = useCatalogVirtualizer({
    count: stableCatalogEntries.length,
    enabled:
      !showLaneLayout &&
      !isTestEnvironment() &&
      stableCatalogEntries.length >= CATALOG_VIRTUALIZATION_THRESHOLD,
    estimateSize: CATALOG_VIRTUALIZER_ESTIMATED_CARD_HEIGHT,
    overscan: CATALOG_VIRTUALIZER_OVERSCAN,
  });

  const activeDetailsEntry = detailsSheetTarget?.entryId
    ? (catalogEntryById.get(detailsSheetTarget.entryId) ?? null)
    : null;
  const detailsSheetTags = activeDetailsEntry ? getCatalogEntryTags(activeDetailsEntry) : [];
  const detailsSheetShowFacts = detailsSheetTarget?.showFacts ?? false;
  const detailsSheetDecisionInfo = activeDetailsEntry
    ? buildDecisionInfoForEntry(activeDetailsEntry.id)
    : null;
  const detailsSheetContent = activeDetailsEntry ? (
    <>
      {detailsSheetDecisionInfo &&
        renderCatalogDetailsContent(
          activeDetailsEntry,
          detailsSheetTags,
          detailsSheetShowFacts,
          detailsSheetDecisionInfo,
        )}
      {isCompactDensity && renderCompactSheetActions(activeDetailsEntry)}
    </>
  ) : null;

  const renderCatalogList = (showFacts: boolean) => {
    if (catalogVirtualizer) {
      const { virtualItems, paddingTop, paddingBottom } = catalogVirtualizer;
      return (
        <div
          className={`catalog-grid catalog-grid-virtualized ${
            isCompactDensity ? "catalog-grid-density-compact" : "catalog-grid-density-expanded"
          }`}
          data-testid="catalog-grid"
          data-density={catalogDensity}
          data-view-mode={catalogViewMode}
          style={{ paddingTop, paddingBottom }}
        >
          {virtualItems.map((virtualItem) => {
            const entry = stableCatalogEntries[virtualItem.index];
            return (
              <React.Fragment key={entry.id}>{renderCatalogCard(entry, showFacts)}</React.Fragment>
            );
          })}
        </div>
      );
    }

    return (
      <div
        className={`catalog-grid ${
          isCompactDensity ? "catalog-grid-density-compact" : "catalog-grid-density-expanded"
        }`}
        data-testid="catalog-grid"
        data-density={catalogDensity}
        data-view-mode={catalogViewMode}
      >
        {stableCatalogEntries.map((entry) => renderCatalogCard(entry, showFacts))}
      </div>
    );
  };

  return (
    <>
      <header className="panel-header catalog-header">
        <div>
          <p className="eyebrow">{embeddedInVault ? "Shop" : "Catalog"}</p>
          {embeddedInVault ? <h3>Shop</h3> : <h2>Catalog</h2>}
          <p className="muted">
            {embeddedInVault
              ? "Buy watches here, then explore catalog references and licensing details."
              : "Buy watches directly from catalog cards and track references as you discover them."}
          </p>
          <div
            className="surface-complication-strip catalog-complication-strip"
            data-testid="catalog-complication-strip"
          >
            <article
              className="surface-complication catalog-complication"
              data-testid="catalog-complication-power-reserve"
            >
              <p className="surface-complication-label">Power reserve · Visible catalog</p>
              <p className="surface-complication-value">
                {stableCatalogEntries.length} visible references
              </p>
              <p className="surface-complication-detail">
                {discoveredCatalogEntries.length} discovered in archive
              </p>
            </article>
            <article
              className="surface-complication catalog-complication"
              data-testid="catalog-complication-chronograph"
            >
              <p className="surface-complication-label">Chronograph · Ready to buy</p>
              <p className="surface-complication-value">{readyToBuyCount} ready to buy</p>
              <p className="surface-complication-detail">
                {unownedReady
                  ? "Unowned references are currently affordable."
                  : "Build cash or enjoyment to open more purchase gates."}
              </p>
            </article>
            <article
              className="surface-complication catalog-complication"
              data-testid="catalog-complication-date-wheel"
            >
              <p className="surface-complication-label">Date wheel · Owned actions</p>
              <p className="surface-complication-value">
                {readyOwnedQuickActionsCount} quick actions
              </p>
              <p className="surface-complication-detail">
                {ownedReady
                  ? "Owned references have interaction or dismantle actions ready."
                  : "No owned quick actions are currently available."}
              </p>
            </article>
            <article
              className="surface-complication catalog-complication"
              data-testid="catalog-complication-moonphase"
            >
              <p className="surface-complication-label">Moonphase · Undo window</p>
              <p className="surface-complication-value">{undoComplicationValue}</p>
              <p className="surface-complication-detail">{undoComplicationDetail}</p>
            </article>
          </div>
        </div>
        <div className="catalog-header-actions">
          <div className="catalog-collection-context" data-testid="catalog-collection-context">
            <span>
              Collection: {ownedCountLabel} / {maxCapacityLabel}
            </span>
            <span> · </span>
            <span>Collection value: {formatMoneyFromCents(collectionValueCents)}</span>
          </div>
          <div className="catalog-upgrade-context" data-testid="catalog-upgrade-context">
            <span>Upgrades: {upgradeLevelsLabel} levels</span>
            <span> · </span>
            <span>
              Workshop {workshopOwnedLabel}/{workshopTotalLabel}
            </span>
            <span> · </span>
            <span>
              Maison {maisonOwnedLabel}/{maisonTotalLabel}
            </span>
            <span> · </span>
            <span>
              Lines {maisonLinesActiveLabel}/{maisonLinesTotalLabel}
            </span>
          </div>
          <div className="results-count" aria-live="polite" data-testid="catalog-results-count">
            {stableCatalogEntries.length} results · {discoveredCatalogEntries.length} discovered
          </div>
          <div className="catalog-undo-action">
            <button
              type="button"
              className="secondary"
              data-testid="catalog-undo-purchase"
              disabled={!canUndoLastPurchase}
              onClick={() => onPurchase(undoLastPurchase(state, effectiveNowMs))}
            >
              Undo last purchase
            </button>
            <p className="muted" data-testid="catalog-undo-countdown">
              {undoStatus === "available"
                ? `Undo available for ${lastPurchaseModelId} · expires in ${Math.ceil(undoRemainingMs / 1_000)}s.`
                : undoStatus === "expired"
                  ? `Undo expired for ${lastPurchaseModelId} ${Math.max(1, Math.ceil(undoExpiredMsAgo / 1_000))}s ago. Buy again to reopen a ${PURCHASE_UNDO_WINDOW_SECONDS}s window.`
                  : `No purchase to undo yet. Buy a watch to start a ${PURCHASE_UNDO_WINDOW_SECONDS}s window.`}
            </p>
          </div>
          <div className="catalog-help" data-testid="catalog-view-mode-control">
            <button
              type="button"
              className="secondary"
              data-testid="catalog-view-mode-toggle"
              aria-pressed={!isNoviceViewMode}
              onClick={toggleCatalogViewMode}
            >
              Card detail mode · {isNoviceViewMode ? "Novice" : "Expert"}
            </button>
          </div>
          <div className="catalog-help" data-testid="catalog-density-control">
            <button
              type="button"
              className="secondary"
              data-testid="catalog-density-toggle"
              aria-pressed={isCompactDensity}
              onClick={toggleCatalogDensity}
            >
              Card density · {isCompactDensity ? "Compact" : "Expanded"}
            </button>
          </div>
          <div className="catalog-help" data-testid="catalog-help">
            <ExplainButton
              sectionId={HELP_SECTION_IDS.catalogShop}
              label={embeddedInVault ? "Shop help" : "Catalog help"}
              className="help-open-button"
            />
          </div>
        </div>
      </header>
      {isMobileViewport && (
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
            aria-pressed={filtersOpen}
            onClick={toggleFilters}
          >
            Filters · {activeFilterCount > 0 ? `${activeFilterCount} active` : "none"}
          </button>
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-sort"
            onClick={cycleCatalogSort}
          >
            Sort · {quickSortLabel}
          </button>
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-preset-cycle"
            onClick={cycleCatalogQuickPreset}
          >
            Preset · {quickPresetLabel}
          </button>
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-view-mode"
            aria-pressed={!isNoviceViewMode}
            onClick={toggleCatalogViewMode}
          >
            Detail · {isNoviceViewMode ? "Novice" : "Expert"}
          </button>
          <button
            type="button"
            className="catalog-quick-action"
            data-testid="catalog-quick-density"
            aria-pressed={isCompactDensity}
            onClick={toggleCatalogDensity}
          >
            Density · {isCompactDensity ? "Compact" : "Expanded"}
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
            aria-expanded={filtersOpen}
            aria-controls="catalog-filter-panel"
            onClick={toggleFilters}
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
          data-visible={filtersOpen ? "true" : "false"}
          aria-hidden={!filtersOpen}
          hidden={!filtersOpen}
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
              value={catalogSearch}
              onChange={(event) => onCatalogSearchChange(event.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-brand">
              Brand
            </label>
            <select
              id="catalog-brand"
              data-testid="catalog-brand"
              value={catalogBrand}
              onChange={(event) => onCatalogBrandChange(event.target.value)}
            >
              {catalogBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
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
              value={catalogStyle}
              onChange={(event) => onCatalogStyleChange(event.target.value as typeof catalogStyle)}
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
              value={catalogSort}
              onChange={(event) => onCatalogSortChange(event.target.value as typeof catalogSort)}
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
              value={catalogQuickPreset}
              onChange={(event) => setCatalogQuickPreset(event.target.value as CatalogQuickPreset)}
            >
              {CATALOG_QUICK_PRESET_ORDER.map((preset) => (
                <option key={preset} value={preset}>
                  {CATALOG_QUICK_PRESET_LABELS[preset]}
                </option>
              ))}
            </select>
            <p className="muted" data-testid="catalog-quick-preset-hint">
              {CATALOG_QUICK_PRESET_HINTS[catalogQuickPreset]}
            </p>
          </div>
          <div className="filter-field">
            <label className="filter-label" htmlFor="catalog-era">
              Era
            </label>
            <select
              id="catalog-era"
              data-testid="catalog-era"
              value={catalogEra}
              onChange={(event) => onCatalogEraChange(event.target.value as typeof catalogEra)}
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
              value={catalogType}
              onChange={(event) => onCatalogTypeChange(event.target.value as typeof catalogType)}
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
                checked={catalogFavoritesOnly}
                onChange={() => setCatalogFavoritesOnly((value) => !value)}
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
              {CATALOG_OWNERSHIP_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={`catalog-tab ${catalogTab === tab.id ? "catalog-tab-active" : ""}`}
                  aria-selected={catalogTab === tab.id}
                  aria-controls={`catalog-${tab.id}`}
                  id={`catalog-${tab.id}-tab`}
                  tabIndex={focusedCatalogTab === tab.id ? 0 : -1}
                  onFocus={() => setFocusedCatalogTab(tab.id)}
                  onKeyDown={handleCatalogTabKeyDown}
                  onClick={() => onCatalogTabChange(tab.id)}
                >
                  {tab.label}
                  {tab.id === "unowned" && unownedReady && (
                    <span
                      className="catalog-tab-ready-badge"
                      data-testid="catalog-tab-ready-unowned"
                    >
                      Ready
                    </span>
                  )}
                  {tab.id === "owned" && ownedReady && (
                    <span className="catalog-tab-ready-badge" data-testid="catalog-tab-ready-owned">
                      Quick action ready
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      <WatchComparePanel
        slots={compareSlotPayloads}
        onClearSlot={handleClearCompareSlot}
        onClearAll={handleClearAllCompare}
        onSwap={handleSwapCompareOrder}
      />

      <section className="panel per-watch-stats-panel" data-testid="per-watch-stats-section">
        <PerWatchStatsTable rows={perWatchRows} highlightModelId={state.wornWatchId ?? null} />
      </section>

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
          ) : showLaneLayout ? (
            renderCatalogLanes(false)
          ) : (
            renderCatalogList(false)
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
            ) : showLaneLayout ? (
              renderCatalogLanes(true)
            ) : (
              renderCatalogList(true)
            )}
          </>
        )}
      </section>
      {activeDetailsEntry && detailsSheetContent && (
        <CatalogCardDetailsSheet
          entry={activeDetailsEntry}
          tags={detailsSheetTags}
          show={Boolean(activeDetailsEntry)}
          onClose={closeDetailsSheet}
        >
          {detailsSheetContent}
        </CatalogCardDetailsSheet>
      )}
    </>
  );
}

export function CatalogTabLegacy({
  isActive,
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
  catalogBrands,
  filteredCatalogEntries,
  discoveredCatalogEntries,
  discoveredCatalogIds,
  catalogEntries,
  hasOwnedCatalogTiers,
  onPurchase,
  nowMs,
  currentEventMultiplier,
}: CatalogTabProps) {
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const [purchaseHighlights, setPurchaseHighlights] = React.useState<Record<string, boolean>>({});
  const purchaseHighlightTimeouts = React.useRef<Map<string, number>>(new Map());
  const { focusedCatalogTab, setFocusedCatalogTab, handleCatalogTabKeyDown } =
    useCatalogOwnershipTabKeyboard(catalogTab, onCatalogTabChange);

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
      ].join("|"),
    [catalogBrand, catalogEra, catalogSearch, catalogSort, catalogStyle, catalogTab, catalogType],
  );

  const stableCatalogEntries = useStableCatalogEntries({
    entries: filteredCatalogEntries,
    allEntries: catalogEntries,
    signature: filterSignature,
  });

  const handleDetailsToggle = React.useCallback((entryId: string, isOpen: boolean) => {
    setExpandedCards((prev) => ({
      ...prev,
      [entryId]: isOpen,
    }));
  }, []);

  const triggerPurchaseHighlight = React.useCallback((entryId: string) => {
    setPurchaseHighlights((prev) => ({
      ...prev,
      [entryId]: true,
    }));

    const existingTimeout = purchaseHighlightTimeouts.current.get(entryId);
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    const timeoutId = window.setTimeout(() => {
      setPurchaseHighlights((prev) => {
        if (!prev[entryId]) {
          return prev;
        }
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

  const handlePurchase = React.useCallback(
    (entryId: string) => {
      onPurchase(buyWatchModel(state, entryId));
      triggerPurchaseHighlight(entryId);
    },
    [onPurchase, state, triggerPurchaseHighlight],
  );
  const effectiveNowMs = React.useMemo(
    () => (typeof nowMs === "number" ? nowMs : Date.now()),
    [nowMs],
  );
  const effectiveEventMultiplier = currentEventMultiplier ?? 1;
  const effectiveCashRateCentsPerSec = React.useMemo(
    () => getEffectiveCashRateCentsPerSec(state, effectiveNowMs, effectiveEventMultiplier),
    [effectiveEventMultiplier, effectiveNowMs, state],
  );
  const effectiveEnjoymentRateCentsPerSec = React.useMemo(
    () => getEnjoymentRateCentsPerSec(state) * effectiveEventMultiplier,
    [effectiveEventMultiplier, state],
  );

  const renderCatalogDetails = (entry: CatalogEntry, tags: string[], showFacts: boolean) => {
    const sourceLabel = entry.image.sourceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const specs = [
      { label: "Year", value: entry.year },
      { label: "Tags", value: tags.join(" · ") },
      { label: "License", value: entry.image.licenseName },
      { label: "Author", value: entry.image.author },
      {
        label: "Source",
        value: (
          <a href={entry.image.sourceUrl} target="_blank" rel="noreferrer">
            {sourceLabel}
          </a>
        ),
      },
    ];

    return (
      <details
        className="catalog-details"
        open={expandedCards[entry.id] ?? false}
        onToggle={(event) => handleDetailsToggle(entry.id, event.currentTarget.open)}
        data-testid="catalog-details"
      >
        <summary>Details</summary>
        <div className="catalog-details-body">
          <p className="catalog-description">{entry.description}</p>
          <ul className="catalog-specs">
            {specs.map((spec) => (
              <li key={`${entry.id}-${spec.label}`}>
                <span className="catalog-spec-label">{spec.label}</span>
                <span className="catalog-spec-value">{spec.value}</span>
              </li>
            ))}
          </ul>
          {showFacts && entry.facts && entry.facts.length > 0 && (
            <div className="catalog-facts">
              <p className="catalog-facts-title">Collector notes</p>
              <ul data-testid="catalog-facts">
                {entry.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    );
  };

  return (
    <section
      className="panel catalog-panel"
      id="catalog"
      role="tabpanel"
      aria-labelledby="catalog-tab"
      hidden={!isActive}
    >
      {isActive && (
        <>
          <header className="panel-header catalog-header">
            <div>
              <p className="eyebrow">Archive</p>
              <h2>Catalog</h2>
              <p className="muted">
                Buy watches in Catalog, then review reference details and licensing sources.
              </p>
            </div>
            <div className="catalog-header-actions">
              <div className="results-count" aria-live="polite" data-testid="catalog-results-count">
                {stableCatalogEntries.length} results · {discoveredCatalogEntries.length} discovered
              </div>
              <div className="catalog-help" data-testid="catalog-help">
                <ExplainButton
                  sectionId={HELP_SECTION_IDS.catalogShop}
                  label="Catalog help"
                  className="help-open-button"
                />
              </div>
            </div>
          </header>
          <form
            className="catalog-filters"
            data-testid="catalog-filters"
            onSubmit={(event) => event.preventDefault()}
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
                value={catalogSearch}
                onChange={(event) => onCatalogSearchChange(event.target.value)}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label" htmlFor="catalog-brand">
                Brand
              </label>
              <select
                id="catalog-brand"
                data-testid="catalog-brand"
                value={catalogBrand}
                onChange={(event) => onCatalogBrandChange(event.target.value)}
              >
                {catalogBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
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
                value={catalogStyle}
                onChange={(event) =>
                  onCatalogStyleChange(event.target.value as typeof catalogStyle)
                }
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
                value={catalogSort}
                onChange={(event) => onCatalogSortChange(event.target.value as typeof catalogSort)}
              >
                <option value="default">Default</option>
                <option value="brand">Brand (A→Z)</option>
                <option value="year">Year (newest→oldest)</option>
                <option value="tier">Movement (quartz→tourbillon)</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label" htmlFor="catalog-era">
                Era
              </label>
              <select
                id="catalog-era"
                data-testid="catalog-era"
                value={catalogEra}
                onChange={(event) => onCatalogEraChange(event.target.value as typeof catalogEra)}
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
                value={catalogType}
                onChange={(event) => onCatalogTypeChange(event.target.value as typeof catalogType)}
              >
                <option value="all">All</option>
                <option value="gmt">GMT</option>
                <option value="manual">Manual</option>
                <option value="dress">Dress</option>
                <option value="diver">Diver</option>
              </select>
            </div>
            <div className="filter-field" data-testid="catalog-owned-tabs">
              <span className="filter-label">View</span>
              <div className="catalog-tablist" role="tablist" aria-label="Catalog ownership">
                {CATALOG_OWNERSHIP_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    className={`catalog-tab ${catalogTab === tab.id ? "catalog-tab-active" : ""}`}
                    aria-selected={catalogTab === tab.id}
                    aria-controls={`catalog-${tab.id}`}
                    id={`catalog-${tab.id}-tab`}
                    tabIndex={focusedCatalogTab === tab.id ? 0 : -1}
                    onFocus={() => setFocusedCatalogTab(tab.id)}
                    onKeyDown={handleCatalogTabKeyDown}
                    onClick={() => onCatalogTabChange(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </form>

          <section
            id="catalog-unowned"
            role="tabpanel"
            aria-labelledby="catalog-unowned-tab"
            hidden={catalogTab !== "unowned"}
          >
            {catalogTab === "unowned" && (
              <div className="catalog-grid" data-testid="catalog-grid">
                {stableCatalogEntries.map((entry) => {
                  const discovered = discoveredCatalogIds.includes(entry.id);
                  const tags = getCatalogEntryTags(entry);
                  const tierBadge = getWatchModelTierBadge(entry.id);
                  const ownedCount = getWatchModelOwnedCount(state, entry.id);
                  const gate = getWatchModelPurchaseGate(state, entry.id);
                  const cashDeficitCents = getResourceDeficit(
                    gate.cashPriceCents,
                    state.currencyCents,
                  );
                  const enjoymentDeficitCents = getResourceDeficit(
                    gate.enjoymentRequiredCents,
                    state.enjoymentCents,
                  );
                  const cashEtaSeconds = getAffordabilityEtaSecondsForDeficit(
                    cashDeficitCents,
                    effectiveCashRateCentsPerSec,
                  );
                  const enjoymentEtaSeconds = getAffordabilityEtaSecondsForDeficit(
                    enjoymentDeficitCents,
                    effectiveEnjoymentRateCentsPerSec,
                  );
                  const gateEtaLabel = getGateEtaLabel(
                    gate,
                    effectiveCashRateCentsPerSec,
                    effectiveEnjoymentRateCentsPerSec,
                  );
                  const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entry.id);
                  const buyLabel = ownedCount > 0 ? "Buy another" : "Buy";
                  const isHighlighted = purchaseHighlights[entry.id];
                  return (
                    <article
                      key={entry.id}
                      className={`catalog-card ${
                        discovered ? "catalog-discovered" : "catalog-locked"
                      } ${isHighlighted ? "purchase-flash" : ""}`}
                      data-testid="catalog-card"
                    >
                      <div className="catalog-media">
                        <img
                          src={getCatalogImageUrl(entry)}
                          alt={`${entry.brand} ${entry.model}`}
                          loading="lazy"
                          onError={(event) => {
                            const target = event.currentTarget;
                            const placeholder =
                              "data:image/svg+xml;utf8," +
                              encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                                  `<rect width='100%' height='100%' fill='#131720'/>` +
                                  `<path d='M140 280c40-72 88-120 180-120s140 48 180 120' stroke='#3e4554' stroke-width='12' fill='none' stroke-linecap='round'/>` +
                                  `<circle cx='320' cy='260' r='70' fill='none' stroke='#3e4554' stroke-width='10'/>` +
                                  `<text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' fill='#9da3ad' font-size='26' font-family='Arial, sans-serif'>Image unavailable</text>` +
                                  `</svg>`,
                              );

                            if (target.dataset.fallback !== "true") {
                              target.dataset.fallback = "true";
                              target.src = placeholder;
                            }
                          }}
                        />
                        {!discovered && <span className="catalog-badge">Undiscovered</span>}
                      </div>
                      <div className="catalog-content">
                        <div className="catalog-title">
                          <div className="catalog-title-primary">
                            {tierBadge && (
                              <TierBadge
                                tier={tierBadge.category}
                                showLabel
                                label={tierBadge.label}
                                description={tierBadge.description}
                                backgroundVar={tierBadge.backgroundVar}
                                textVar={tierBadge.textVar}
                              />
                            )}
                            <div>
                              <p className="catalog-brand">{entry.brand}</p>
                              <h3>{entry.model}</h3>
                            </div>
                          </div>
                          <p className="catalog-year">{entry.year}</p>
                        </div>
                        {renderCatalogDetails(entry, tags, false)}
                        <div className="catalog-action-bar">
                          <div className="catalog-action-meta">
                            <span className="catalog-owned">{ownedCount} owned</span>
                            <span className="catalog-price">
                              {formatMoneyFromCents(gate.cashPriceCents)}
                            </span>
                            <span className="catalog-duplicate">
                              Next x{duplicateMultiplier.toFixed(2)}
                            </span>
                          </div>
                          {gate.ok ? (
                            <button
                              type="button"
                              data-testid={`catalog-buy-${entry.id}`}
                              onClick={() => handlePurchase(entry.id)}
                            >
                              {buyLabel}
                            </button>
                          ) : (
                            <div className="catalog-gate" data-testid={`catalog-gate-${entry.id}`}>
                              {gate.blocksBy === "enjoyment" && (
                                <>
                                  Requires {formatMoneyFromCents(gate.enjoymentRequiredCents)}
                                  {` (${formatMoneyFromCents(enjoymentDeficitCents)} more, ETA ${formatEtaLabel(enjoymentEtaSeconds)})`}
                                </>
                              )}
                              {gate.blocksBy === "cash" && (
                                <>
                                  Need {formatMoneyFromCents(cashDeficitCents)} more cash (ETA{" "}
                                  {formatEtaLabel(cashEtaSeconds)})
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        {gateEtaLabel && <p className="muted catalog-gate-eta">{gateEtaLabel}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
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
                      body="Buy watches in Catalog to start filling your archive shelf with owned references."
                      ctaLabel="Build collection"
                      onCta={() => onNavigate("catalog", "catalog-shop")}
                    />
                  </div>
                ) : (
                  <div className="catalog-grid" data-testid="catalog-grid">
                    {stableCatalogEntries.map((entry) => {
                      const discovered = discoveredCatalogIds.includes(entry.id);
                      const tags = getCatalogEntryTags(entry);
                      const tierBadge = getWatchModelTierBadge(entry.id);
                      const ownedCount = getWatchModelOwnedCount(state, entry.id);
                      const gate = getWatchModelPurchaseGate(state, entry.id);
                      const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entry.id);
                      const buyLabel = ownedCount > 0 ? "Buy another" : "Buy";
                      const isHighlighted = purchaseHighlights[entry.id];
                      return (
                        <article
                          key={entry.id}
                          className={`catalog-card ${
                            discovered ? "catalog-discovered" : "catalog-locked"
                          } ${isHighlighted ? "purchase-flash" : ""}`}
                          data-testid="catalog-card"
                        >
                          <div className="catalog-media">
                            <img
                              src={getCatalogImageUrl(entry)}
                              alt={`${entry.brand} ${entry.model}`}
                              loading="lazy"
                              onError={(event) => {
                                const target = event.currentTarget;
                                const placeholder =
                                  "data:image/svg+xml;utf8," +
                                  encodeURIComponent(
                                    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                                      `<rect width='100%' height='100%' fill='#131720'/>` +
                                      `<path d='M140 280c40-72 88-120 180-120s140 48 180 120' stroke='#3e4554' stroke-width='12' fill='none' stroke-linecap='round'/>` +
                                      `<circle cx='320' cy='260' r='70' fill='none' stroke='#3e4554' stroke-width='10'/>` +
                                      `<text x='50%' y='78%' dominant-baseline='middle' text-anchor='middle' fill='#9da3ad' font-size='26' font-family='Arial, sans-serif'>Image unavailable</text>` +
                                      `</svg>`,
                                  );

                                if (target.dataset.fallback !== "true") {
                                  target.dataset.fallback = "true";
                                  target.src = placeholder;
                                }
                              }}
                            />
                            {!discovered && <span className="catalog-badge">Undiscovered</span>}
                          </div>
                          <div className="catalog-content">
                            <div className="catalog-title">
                              <div className="catalog-title-primary">
                                {tierBadge && (
                                  <TierBadge
                                    tier={tierBadge.category}
                                    showLabel
                                    label={tierBadge.label}
                                    description={tierBadge.description}
                                    backgroundVar={tierBadge.backgroundVar}
                                    textVar={tierBadge.textVar}
                                  />
                                )}
                                <div>
                                  <p className="catalog-brand">{entry.brand}</p>
                                  <h3>{entry.model}</h3>
                                </div>
                              </div>
                              <p className="catalog-year">{entry.year}</p>
                            </div>
                            {renderCatalogDetails(entry, tags, true)}
                            <div className="catalog-action-bar">
                              <div className="catalog-action-meta">
                                <span className="catalog-owned">{ownedCount} owned</span>
                                <span className="catalog-price">
                                  {formatMoneyFromCents(gate.cashPriceCents)}
                                </span>
                                <span className="catalog-duplicate">
                                  Next x{duplicateMultiplier.toFixed(2)}
                                </span>
                              </div>
                              {gate.ok ? (
                                <button
                                  type="button"
                                  data-testid={`catalog-buy-${entry.id}`}
                                  onClick={() => handlePurchase(entry.id)}
                                >
                                  {buyLabel}
                                </button>
                              ) : (
                                <div
                                  className="catalog-gate"
                                  data-testid={`catalog-gate-${entry.id}`}
                                >
                                  {gate.blocksBy === "enjoyment" && (
                                    <>
                                      Requires {formatMoneyFromCents(gate.enjoymentRequiredCents)}
                                      {gate.enjoymentDeficitCents !== undefined && (
                                        <>
                                          {" "}
                                          ({formatMoneyFromCents(gate.enjoymentDeficitCents)} more)
                                        </>
                                      )}
                                    </>
                                  )}
                                  {gate.blocksBy === "cash" && (
                                    <>
                                      Need {formatMoneyFromCents(gate.cashDeficitCents ?? 0)} more
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </section>
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
