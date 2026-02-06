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
import type { TierBadgeCategory } from "../../game/tierBadges";
import { PowerReserveHint } from "../components/PowerReserveHint";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../game/format";
import { isTestEnvironment } from "../../game/runtime/isTestEnvironment";
import {
  CATALOG_TIER_SEQUENCE,
  getCatalogEntryTags,
  getCatalogImageUrl,
  getWatchModelTierBadge,
} from "../../game/catalog";
import type { CatalogEntry } from "../../game/catalog";
import type { CatalogTierId } from "../../game/model/types";
import {
  buyWatchModel,
  buyWatchModelWithUndo,
  dismantleWatchModel,
  getCraftingPartsPerWatch,
  getInteractionCooldownRemainingMs,
  getInteractionMovementGate,
  getMilestoneUnlockProgressDetail,
  getNextDuplicateRewardMultiplier,
  getPerWatchStatsRows,
  getPowerReserveDetail,
  getWatchItems,
  getWatchModelOwnedCount,
  getWatchModelPurchaseGate,
  getWatchModelTierId,
  getWatchModels,
  isItemUnlocked,
  setWornWatchId,
  toggleWatchFavorite,
  undoLastPurchase,
  type GameState,
  type WatchModelPurchaseGate,
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
  catalogType: "all" | "gmt" | "chronograph" | "dress" | "diver";
  onCatalogTypeChange: (next: "all" | "gmt" | "chronograph" | "dress" | "diver") => void;
  catalogTab: "unowned" | "owned";
  onCatalogTabChange: (next: "unowned" | "owned") => void;
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

type CatalogFilterOptions = {
  brand: string;
  style: CatalogTabProps["catalogStyle"];
  era: CatalogTabProps["catalogEra"];
  type: CatalogTabProps["catalogType"];
  query: string;
};

function matchesCatalogFilters(entry: CatalogEntry, options: CatalogFilterOptions): boolean {
  const entryTags = getCatalogEntryTags(entry);
  const matchesBrand = options.brand === "All" || entry.brand === options.brand;
  const matchesStyle = options.style === "all" || entryTags.includes("womens");
  const year = entry.year === "Unknown" ? null : Number(entry.year);
  const matchesEra = (() => {
    switch (options.era) {
      case "all":
        return true;
      case "unknown":
        return year === null;
      case "pre-1970":
        return year !== null && year < 1970;
      case "1970-1999":
        return year !== null && year >= 1970 && year <= 1999;
      default:
        return year !== null && year >= 2000;
    }
  })();
  const matchesType =
    options.type === "all" || entryTags.some((tag) => tag.toLowerCase() === options.type);
  const tags = entryTags.join(" ");
  const matchesQuery =
    options.query.length === 0 ||
    `${entry.brand} ${entry.model} ${entry.description} ${entry.year} ${tags}`
      .toLowerCase()
      .includes(options.query);
  return matchesBrand && matchesStyle && matchesEra && matchesType && matchesQuery;
}

function describeGateStatus(gate: WatchModelPurchaseGate): string {
  if (gate.ok) {
    return "Ready to buy";
  }
  const reasons: string[] = [];
  if (gate.cashDeficitCents && gate.cashDeficitCents > 0) {
    reasons.push(`Need ${formatMoneyFromCents(gate.cashDeficitCents)} cash`);
  }
  if (gate.enjoymentDeficitCents && gate.enjoymentDeficitCents > 0) {
    reasons.push(`Need ${formatMoneyFromCents(gate.enjoymentDeficitCents)} enjoyment`);
  }
  return reasons.length > 0 ? reasons.join(" + ") : "Awaiting resources";
}

function formatMovementLabel(movement?: string): string {
  if (!movement) {
    return "Movement unavailable";
  }
  return `${movement.charAt(0).toUpperCase()}${movement.slice(1)} movement`;
}

type CatalogLaneId = "low" | "mid" | "lux";

type CatalogLaneDefinition = {
  id: CatalogLaneId;
  title: string;
  description: string;
  badge: TierBadgeCategory;
  note: string;
};

const CATALOG_TIER_TO_LANE: Record<CatalogTierId, CatalogLaneId> = {
  starter: "low",
  classic: "mid",
  chronograph: "mid",
  tourbillon: "lux",
};

const CATALOG_LANES: ReadonlyArray<CatalogLaneDefinition> = [
  {
    id: "low",
    title: "Starter lane",
    description: "Low-tier quartz discoveries tuned for consistent enjoyment flow.",
    badge: "starter",
    note: "Accessible pricing and gentle pacing keep the lane approachable.",
  },
  {
    id: "mid",
    title: "Mid-tier lane",
    description: "Classic automatics and chronographs that mix enjoyment with cash.",
    badge: "mid",
    note: "Mechanical craftsmanship with predictable pricing helps comparison.",
  },
  {
    id: "lux",
    title: "Luxury lane",
    description: "Tourbillons reserved for prestige, featuring high enjoyment and cachet.",
    badge: "lux",
    note: "Premium tags and storytelling reinforce the high tier narrative.",
  },
];

const CATALOG_VIRTUALIZATION_THRESHOLD = 200;
const CATALOG_VIRTUALIZER_ESTIMATED_CARD_HEIGHT = 420;
const CATALOG_VIRTUALIZER_OVERSCAN = 6;
const PURCHASE_UNDO_WINDOW_MS = 10_000;
const CATALOG_MOBILE_MEDIA_QUERY = "(max-width: 720px)";
const CATALOG_SORT_ORDER: readonly CatalogTabProps["catalogSort"][] = [
  "default",
  "brand",
  "year",
  "tier",
];

const CATALOG_SORT_LABELS: Record<CatalogTabProps["catalogSort"], string> = {
  default: "Default",
  brand: "Brand",
  year: "Year",
  tier: "Tier",
};

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
  const toggleCatalogDensity = React.useCallback(() => {
    catalogDensityOverriddenRef.current = true;
    setCatalogDensity((value) => (value === "compact" ? "expanded" : "compact"));
  }, []);

  const favoriteSet = React.useMemo(
    () => new Set(state.favoriteWatchIds ?? []),
    [state.favoriteWatchIds],
  );

  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(() => isTestEnvironment());
  const [catalogFavoritesOnly, setCatalogFavoritesOnly] = React.useState(false);
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
      favoriteIdsSignature,
    ],
  );
  const activeFilterCount = [
    catalogSearch.trim().length > 0,
    catalogBrand !== "All",
    catalogStyle !== "all",
    catalogEra !== "all",
    catalogType !== "all",
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

  const catalogEntriesForView = React.useMemo(
    () =>
      catalogFavoritesOnly
        ? filteredCatalogEntries.filter((entry) => favoriteSet.has(entry.id))
        : filteredCatalogEntries,
    [catalogFavoritesOnly, favoriteSet, filteredCatalogEntries],
  );

  const stableCatalogEntries = useStableCatalogEntries({
    entries: catalogEntriesForView,
    allEntries: catalogEntries,
    signature: filterSignature,
  });

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
  const undoRemainingMs = React.useMemo(() => {
    if (!state.lastPurchase) {
      return 0;
    }
    return Math.max(
      0,
      PURCHASE_UNDO_WINDOW_MS - Math.max(0, effectiveNowMs - state.lastPurchase.purchasedAtMs),
    );
  }, [effectiveNowMs, state.lastPurchase]);
  const canUndoLastPurchase = state.lastPurchase !== null && undoRemainingMs > 0;

  const handlePurchase = React.useCallback(
    (entryId: string) => {
      onPurchase(buyWatchModelWithUndo(state, entryId, effectiveNowMs));
      triggerPurchaseHighlight(entryId);
    },
    [effectiveNowMs, onPurchase, state, triggerPurchaseHighlight],
  );

  const catalogFilterOptions = React.useMemo(
    () => ({
      brand: catalogBrand,
      style: catalogStyle,
      era: catalogEra,
      type: catalogType,
      query: catalogSearch.trim().toLowerCase(),
    }),
    [catalogBrand, catalogEra, catalogSearch, catalogStyle, catalogType],
  );

  const visibleUnownedEntries = React.useMemo(
    () =>
      catalogEntries.filter(
        (entry) =>
          (!catalogFavoritesOnly || favoriteSet.has(entry.id)) &&
          matchesCatalogFilters(entry, catalogFilterOptions) &&
          getWatchModelOwnedCount(state, entry.id) === 0,
      ),
    [catalogEntries, catalogFilterOptions, state, catalogFavoritesOnly, favoriteSet],
  );

  const visibleOwnedEntries = React.useMemo(
    () =>
      catalogEntries.filter(
        (entry) =>
          (!catalogFavoritesOnly || favoriteSet.has(entry.id)) &&
          matchesCatalogFilters(entry, catalogFilterOptions) &&
          getWatchModelOwnedCount(state, entry.id) > 0,
      ),
    [catalogEntries, catalogFilterOptions, state, catalogFavoritesOnly, favoriteSet],
  );

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
    () => visibleUnownedEntries.some((entry) => getWatchModelPurchaseGate(state, entry.id).ok),
    [state, visibleUnownedEntries],
  );

  const ownedReady = React.useMemo(
    () => visibleOwnedEntries.some((entry) => hasQuickActionForOwnedEntry(entry.id)),
    [hasQuickActionForOwnedEntry, visibleOwnedEntries],
  );

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

  const renderCatalogDetailsContent = (entry: CatalogEntry, tags: string[], showFacts: boolean) => {
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
    );
  };

  const renderCatalogDetails = (entry: CatalogEntry, tags: string[], showFacts: boolean) => (
    <details
      className="catalog-details"
      open={expandedCards[entry.id] ?? false}
      onToggle={(event) => handleDetailsToggle(entry.id, event.currentTarget.open)}
      data-testid="catalog-details"
    >
      <summary>Details</summary>
      {renderCatalogDetailsContent(entry, tags, showFacts)}
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
    const gate = getWatchModelPurchaseGate(state, entry.id);
    const showPrimaryInteract = canShowInteract && ownedCount > 0 && !gate.ok;
    const showSecondaryInteract = canShowInteract && ownedCount > 0 && !showPrimaryInteract;
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
    const previewStats = previewStatsByEntry.get(entry.id);
    const isActionable = unlocked && gate.ok;
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
    const showPrimaryInteract = canShowInteract && ownedCount > 0 && !gate.ok;
    const showSecondaryInteract = canShowInteract && ownedCount > 0 && !showPrimaryInteract;

    const isWorn = state.wornWatchId === entry.id;
    const canWear = modelOwned > 0 && !isWorn;
    const hasCraftingParts = (craftingPartsPerWatch[tierId] ?? 0) > 0;
    const canDismantle = modelOwned > 1 && hasCraftingParts;
    const showDismantleAction = atelierUnlocked && hasCraftingParts;
    const powerReserveDetail = getPowerReserveDetail(state, tierId);
    const showInlineSecondaryActions = !isCompactDensity;
    const showDetailsButton = isCompactDensity || isMobileViewport;
    return (
      <article
        key={entry.id}
        className={`catalog-card ${
          discovered ? "catalog-discovered" : "catalog-locked"
        } ${isHighlighted ? "purchase-flash" : ""} ${
          isActionable ? "catalog-actionable" : "catalog-nonactionable"
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
          {!isCompactDensity && renderCatalogDetails(entry, tags, showFacts)}
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
          {tierItem.movement === "automatic" && ownedCount > 0 && (
            <PowerReserveHint
              detail={powerReserveDetail}
              testId={`power-reserve-hint-${entry.id}`}
            />
          )}
          {(craftingPartsPerWatch[tierId] ?? 0) > 0 && (
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
              <span className="catalog-duplicate">Next x{duplicateMultiplier.toFixed(2)}</span>
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
              />
              {showPrimaryInteract && (
                <button
                  type="button"
                  className="catalog-primary-action"
                  disabled={!canInteract}
                  data-testid={`vault-interact-${tierId}`}
                  onClick={() => onInteract?.(tierId)}
                >
                  {interactionLabel}
                </button>
              )}
            </div>
          </div>
          <div className="catalog-secondary-actions">
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
            {showInlineSecondaryActions && canWear && (
              <button
                type="button"
                className="secondary catalog-secondary-action"
                data-testid={`watch-wear-${entry.id}`}
                onClick={() => onPurchase(setWornWatchId(state, entry.id))}
              >
                Wear
              </button>
            )}
            {showInlineSecondaryActions && showSecondaryInteract && (
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
            {showInlineSecondaryActions && showDismantleAction && (
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
            {showInlineSecondaryActions && canShowInteract && ownedCount > 0 && interactionHint && (
              <span className="muted catalog-interaction-hint">{interactionHint}</span>
            )}
            {showInlineSecondaryActions && canShowInteract && (
              <ExplainButton
                sectionId={HELP_SECTION_IDS.interactions}
                label="Explain interactions"
                className="help-open-button catalog-secondary-help"
              />
            )}
          </div>
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

    const laneMap = new Map<CatalogLaneId, CatalogEntry[]>();
    for (const lane of CATALOG_LANES) {
      laneMap.set(lane.id, []);
    }

    for (const entry of sortedEntries) {
      const laneId = CATALOG_TIER_TO_LANE[getWatchModelTierId(entry.id)];
      laneMap.get(laneId)?.push(entry);
    }

    return (
      <div
        className={`catalog-grid catalog-lanes ${isCompactDensity ? "catalog-grid-density-compact" : "catalog-grid-density-expanded"}`}
        data-testid="catalog-grid"
        data-density={catalogDensity}
      >
        {CATALOG_LANES.map((lane) => {
          const laneEntries = laneMap.get(lane.id) ?? [];
          return (
            <section key={lane.id} className="catalog-lane" data-testid={`catalog-tier-${lane.id}`}>
              <header
                className="catalog-lane-header"
                data-testid={`catalog-tier-header-${lane.id}`}
              >
                <TierBadge tier={lane.badge} showLabel label={lane.title} description={lane.note} />
                <div>
                  <p className="catalog-lane-title">{lane.title}</p>
                  <p className="catalog-lane-description">{lane.description}</p>
                </div>
                <span className="catalog-lane-note">{lane.note}</span>
              </header>
              {laneEntries.length > 0 ? (
                <div className="catalog-lane-grid">
                  {laneEntries.map((entry) => renderCatalogCard(entry, showFacts))}
                </div>
              ) : (
                <p className="catalog-lane-empty" data-testid={`catalog-tier-empty-${lane.id}`}>
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
  const detailsSheetContent = activeDetailsEntry ? (
    <>
      {renderCatalogDetailsContent(activeDetailsEntry, detailsSheetTags, detailsSheetShowFacts)}
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
              {canUndoLastPurchase
                ? `Available ${Math.ceil(undoRemainingMs / 1000)}s`
                : "No undo available"}
            </p>
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
              <option value="tier">Tier (starter→tourbillon)</option>
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
              <option value="chronograph">Chronograph</option>
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
              {(
                [
                  { id: "unowned", label: "Unowned" },
                  { id: "owned", label: "Owned" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className={`catalog-tab ${catalogTab === tab.id ? "catalog-tab-active" : ""}`}
                  aria-selected={catalogTab === tab.id}
                  aria-controls={`catalog-${tab.id}`}
                  id={`catalog-${tab.id}-tab`}
                  tabIndex={catalogTab === tab.id ? 0 : -1}
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
                      : "Build your collection to start filling your archive shelf with owned references."
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
}: CatalogTabProps) {
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const [purchaseHighlights, setPurchaseHighlights] = React.useState<Record<string, boolean>>({});
  const purchaseHighlightTimeouts = React.useRef<Map<string, number>>(new Map());

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
                Archive reference pieces and licensing sources. The Shop in Collection handles
                purchases.
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
                <option value="tier">Tier (starter→tourbillon)</option>
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
                <option value="chronograph">Chronograph</option>
                <option value="dress">Dress</option>
                <option value="diver">Diver</option>
              </select>
            </div>
            <div className="filter-field" data-testid="catalog-owned-tabs">
              <span className="filter-label">View</span>
              <div className="catalog-tablist" role="tablist" aria-label="Catalog ownership">
                {(
                  [
                    { id: "unowned", label: "Unowned" },
                    { id: "owned", label: "Owned" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    className={`catalog-tab ${catalogTab === tab.id ? "catalog-tab-active" : ""}`}
                    aria-selected={catalogTab === tab.id}
                    aria-controls={`catalog-${tab.id}`}
                    id={`catalog-${tab.id}-tab`}
                    tabIndex={catalogTab === tab.id ? 0 : -1}
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
                                  {gate.enjoymentDeficitCents !== undefined && (
                                    <> ({formatMoneyFromCents(gate.enjoymentDeficitCents)} more)</>
                                  )}
                                </>
                              )}
                              {gate.blocksBy === "cash" && (
                                <>Need {formatMoneyFromCents(gate.cashDeficitCents ?? 0)} more</>
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
                      body="Build your collection to start filling your archive shelf with owned references."
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
