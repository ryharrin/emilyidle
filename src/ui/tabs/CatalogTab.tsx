import React from "react";

import { EmptyStateCTA } from "../components/EmptyStateCTA";
import { UnlockHint } from "../components/UnlockHint";
import { CatalogPurchaseGate } from "../components/catalog/CatalogPurchaseGate";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { useStableCatalogEntries } from "../hooks/useStableCatalogEntries";
import { LockIcon } from "../icons/coreIcons";
import { getCatalogCollectionContext } from "../catalog/collectionContext";

import { formatMoneyFromCents } from "../../game/format";
import { getCatalogEntryTags, getCatalogImageUrl } from "../../game/catalog";
import type { CatalogEntry } from "../../game/catalog";
import {
  buyWatchModel,
  dismantleWatchModel,
  getCraftingPartsPerWatch,
  getInteractionCooldownRemainingMs,
  getMilestoneUnlockProgressDetail,
  getNextDuplicateRewardMultiplier,
  getPowerReserveForItem,
  getWatchItems,
  getWatchModelOwnedCount,
  getWatchModelPurchaseGate,
  getWatchModelTierId,
  getWatchModels,
  isItemUnlocked,
  setWornWatchId,
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
  onInteract?: (itemId: WatchItemId) => void;
};

export type PurchaseMeta = {
  prestigeTier?: "workshop" | "maison" | "nostalgia";
};

type CatalogPurchasePanelProps = Omit<CatalogTabProps, "isActive"> & {
  showBalance?: boolean;
  nowMs?: number;
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

  const { ownedCount, maxCapacity, collectionValueCents } = getCatalogCollectionContext(state);
  const ownedCountLabel = formatCount(ownedCount);
  const maxCapacityLabel = formatCount(maxCapacity);

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
          <div className="results-count" aria-live="polite" data-testid="catalog-results-count">
            {stableCatalogEntries.length} results · {discoveredCatalogEntries.length} discovered
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
              </button>
            ))}
          </div>
        </div>
      </form>
      {!embeddedInVault && (
        <section className="catalog-collection" aria-labelledby="catalog-collection-title">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Collection book</p>
              <h3 id="catalog-collection-title">Archive shelf</h3>
              <p className="muted">Discovered references appear here for quick review.</p>
            </div>
            <div className="results-count" data-testid="catalog-discovered-count">
              {discoveredCatalogEntries.length} / {catalogEntries.length} discovered
            </div>
          </header>
          {discoveredCatalogEntries.length > 0 ? (
            <div className="catalog-grid" data-testid="catalog-discovered-grid">
              {discoveredCatalogEntries.map((entry) => {
                const tags = getCatalogEntryTags(entry);
                return (
                  <article
                    key={entry.id}
                    className="catalog-card catalog-discovered"
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
                    </div>
                    <div className="catalog-content">
                      <div className="catalog-title">
                        <div>
                          <p className="catalog-brand">{entry.brand}</p>
                          <h3>{entry.model}</h3>
                        </div>
                        <p className="catalog-year">{entry.year}</p>
                      </div>
                      <p>{entry.description}</p>
                      <p className="catalog-tags">{tags.join(" · ")}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="catalog-empty" data-testid="catalog-discovered-empty">
              <EmptyStateCTA
                title="No references discovered yet"
                body="Buy and interact with watch models in the Catalog to discover references and unlock tier bonuses."
                ctaLabel="Shop catalog"
                onCta={() => onNavigate("catalog", "catalog-shop")}
              />
            </div>
          )}
        </section>
      )}
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
              const isActionable = unlocked && gate.ok;
              const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entry.id);
              const buyLabel = ownedCount > 0 ? "Buy another" : "Buy";
              const isHighlighted = purchaseHighlights[entry.id];

              const interactionLabel =
                tierItem.movement === "manual"
                  ? "Wind crown"
                  : tierItem.movement === "automatic"
                    ? "Charge rotor"
                    : "Set time";
              const cooldownRemainingMs =
                typeof nowMs === "number"
                  ? getInteractionCooldownRemainingMs(state, tierId, nowMs)
                  : 0;
              const cooldownSeconds = Math.ceil(cooldownRemainingMs / 1_000);
              const interactionHint =
                tierOwned <= 0
                  ? "Own one to interact"
                  : cooldownSeconds > 0
                    ? `Cooldown ${cooldownSeconds}s`
                    : null;
              const canInteract = interactionHint === null;
              const canShowInteract = Boolean(onInteract) && typeof nowMs === "number";

              const isWorn = state.wornWatchId === entry.id;
              const canWear = modelOwned > 0 && !isWorn;
              const canDismantle =
                atelierUnlocked && modelOwned > 1 && (craftingPartsPerWatch[tierId] ?? 0) > 0;
              const showDismantle = (craftingPartsPerWatch[tierId] ?? 0) > 0;
              const powerReservePercent = Math.round(getPowerReserveForItem(state, tierId) * 100);
              return (
                <article
                  key={entry.id}
                  className={`catalog-card ${
                    discovered ? "catalog-discovered" : "catalog-locked"
                  } ${isHighlighted ? "purchase-flash" : ""} ${
                    isActionable ? "catalog-actionable" : "catalog-nonactionable"
                  }`}
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
                    {!discovered && (
                      <span className="catalog-lock-icon" data-testid={`catalog-lock-${entry.id}`}>
                        <LockIcon />
                      </span>
                    )}
                    {!discovered && <span className="catalog-badge">Undiscovered</span>}
                  </div>
                  <div className="catalog-content">
                    <div className="catalog-title">
                      <div>
                        <p className="catalog-brand">{entry.brand}</p>
                        <h3>{entry.model}</h3>
                      </div>
                      <p className="catalog-year">{entry.year}</p>
                    </div>
                    {renderCatalogDetails(entry, tags, false)}
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
                      <p className="muted">Power reserve: {powerReservePercent}%</p>
                    )}
                    {(craftingPartsPerWatch[tierId] ?? 0) > 0 && (
                      <p className="muted">
                        Dismantle value: {craftingPartsPerWatch[tierId] ?? 0} parts
                      </p>
                    )}
                    <div className="catalog-action-bar">
                      <div className="catalog-action-meta">
                        {isWorn && (
                          <span
                            className="catalog-equipped"
                            data-testid={`watch-equipped-${entry.id}`}
                          >
                            Equipped
                          </span>
                        )}
                        <span className="catalog-owned">{ownedCount} owned</span>
                        <span className="catalog-price">
                          {formatMoneyFromCents(gate.cashPriceCents)}
                        </span>
                        <span className="catalog-duplicate">
                          Next x{duplicateMultiplier.toFixed(2)}
                        </span>
                      </div>
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
                    </div>
                    {(canWear || canShowInteract || (craftingPartsPerWatch[tierId] ?? 0) > 0) && (
                      <div className="card-actions">
                        {canWear && (
                          <button
                            type="button"
                            className="secondary"
                            data-testid={`watch-wear-${entry.id}`}
                            onClick={() => onPurchase(setWornWatchId(state, entry.id))}
                          >
                            Wear
                          </button>
                        )}
                        {canShowInteract && (
                          <button
                            type="button"
                            className="secondary"
                            disabled={!canInteract}
                            data-testid={`vault-interact-${tierId}`}
                            onClick={() => onInteract?.(tierId)}
                          >
                            {interactionLabel}
                          </button>
                        )}
                        {canShowInteract && (
                          <ExplainButton
                            sectionId={HELP_SECTION_IDS.interactions}
                            label="Explain interactions"
                            className="help-open-button"
                          />
                        )}
                        {showDismantle &&
                          (atelierUnlocked ? (
                            <button
                              type="button"
                              className="secondary"
                              disabled={!canDismantle}
                              onClick={() => onPurchase(dismantleWatchModel(state, entry.id, 1))}
                            >
                              Dismantle
                            </button>
                          ) : (
                            <div className="dismantle-locked">
                              <button type="button" className="secondary" disabled>
                                Dismantle
                              </button>
                              <span className="muted">Unlocks with Atelier reset.</span>
                            </div>
                          ))}
                      </div>
                    )}
                    {canShowInteract && interactionHint && (
                      <p className="muted interaction-hint">{interactionHint}</p>
                    )}
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
            ) : (
              <div className="catalog-grid" data-testid="catalog-grid">
                {stableCatalogEntries.map((entry) => {
                  const discovered = discoveredCatalogIds.includes(entry.id);
                  const tags = getCatalogEntryTags(entry);
                  const tierId = getWatchModelTierId(entry.id);
                  const tierOwned = state.items[tierId] ?? 0;
                  const totalTierOwned = modelOwnedByTier.get(tierId) ?? 0;
                  const fallbackOwner =
                    totalTierOwned === 0 &&
                    tierOwned > 0 &&
                    firstModelByTier.get(tierId) === entry.id;
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
                  const isActionable = unlocked && gate.ok;
                  const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entry.id);
                  const buyLabel = ownedCount > 0 ? "Buy another" : "Buy";
                  const isHighlighted = purchaseHighlights[entry.id];

                  const interactionLabel =
                    tierItem.movement === "manual"
                      ? "Wind crown"
                      : tierItem.movement === "automatic"
                        ? "Charge rotor"
                        : "Set time";
                  const cooldownRemainingMs =
                    typeof nowMs === "number"
                      ? getInteractionCooldownRemainingMs(state, tierId, nowMs)
                      : 0;
                  const cooldownSeconds = Math.ceil(cooldownRemainingMs / 1_000);
                  const interactionHint =
                    tierOwned <= 0
                      ? "Own one to interact"
                      : cooldownSeconds > 0
                        ? `Cooldown ${cooldownSeconds}s`
                        : null;
                  const canInteract = interactionHint === null;
                  const canShowInteract = Boolean(onInteract) && typeof nowMs === "number";

                  const isWorn = state.wornWatchId === entry.id;
                  const canWear = modelOwned > 0 && !isWorn;
                  const canDismantle =
                    atelierUnlocked && modelOwned > 1 && (craftingPartsPerWatch[tierId] ?? 0) > 0;
                  const showDismantle = (craftingPartsPerWatch[tierId] ?? 0) > 0;
                  const powerReservePercent = Math.round(
                    getPowerReserveForItem(state, tierId) * 100,
                  );
                  return (
                    <article
                      key={entry.id}
                      className={`catalog-card ${
                        discovered ? "catalog-discovered" : "catalog-locked"
                      } ${isHighlighted ? "purchase-flash" : ""} ${
                        isActionable ? "catalog-actionable" : "catalog-nonactionable"
                      }`}
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
                        {!discovered && (
                          <span
                            className="catalog-lock-icon"
                            data-testid={`catalog-lock-${entry.id}`}
                          >
                            <LockIcon />
                          </span>
                        )}
                        {!discovered && <span className="catalog-badge">Undiscovered</span>}
                      </div>
                      <div className="catalog-content">
                        <div className="catalog-title">
                          <div>
                            <p className="catalog-brand">{entry.brand}</p>
                            <h3>{entry.model}</h3>
                          </div>
                          <p className="catalog-year">{entry.year}</p>
                        </div>
                        {renderCatalogDetails(entry, tags, true)}
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
                          <p className="muted">Power reserve: {powerReservePercent}%</p>
                        )}
                        {(craftingPartsPerWatch[tierId] ?? 0) > 0 && (
                          <p className="muted">
                            Dismantle value: {craftingPartsPerWatch[tierId] ?? 0} parts
                          </p>
                        )}
                        <div className="catalog-action-bar">
                          <div className="catalog-action-meta">
                            {isWorn && (
                              <span
                                className="catalog-equipped"
                                data-testid={`watch-equipped-${entry.id}`}
                              >
                                Equipped
                              </span>
                            )}
                            <span className="catalog-owned">{ownedCount} owned</span>
                            <span className="catalog-price">
                              {formatMoneyFromCents(gate.cashPriceCents)}
                            </span>
                            <span className="catalog-duplicate">
                              Next x{duplicateMultiplier.toFixed(2)}
                            </span>
                          </div>
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
                        </div>
                        {(canWear ||
                          canShowInteract ||
                          (craftingPartsPerWatch[tierId] ?? 0) > 0) && (
                          <div className="card-actions">
                            {canWear && (
                              <button
                                type="button"
                                className="secondary"
                                data-testid={`watch-wear-${entry.id}`}
                                onClick={() => onPurchase(setWornWatchId(state, entry.id))}
                              >
                                Wear
                              </button>
                            )}
                            {canShowInteract && (
                              <button
                                type="button"
                                className="secondary"
                                disabled={!canInteract}
                                data-testid={`vault-interact-${tierId}`}
                                onClick={() => onInteract?.(tierId)}
                              >
                                {interactionLabel}
                              </button>
                            )}
                            {canShowInteract && (
                              <ExplainButton
                                sectionId={HELP_SECTION_IDS.interactions}
                                label="Explain interactions"
                                className="help-open-button"
                              />
                            )}
                            {showDismantle &&
                              (atelierUnlocked ? (
                                <button
                                  type="button"
                                  className="secondary"
                                  disabled={!canDismantle}
                                  onClick={() =>
                                    onPurchase(dismantleWatchModel(state, entry.id, 1))
                                  }
                                >
                                  Dismantle
                                </button>
                              ) : (
                                <div className="dismantle-locked">
                                  <button type="button" className="secondary" disabled>
                                    Dismantle
                                  </button>
                                  <span className="muted">Unlocks with Atelier reset.</span>
                                </div>
                              ))}
                          </div>
                        )}
                        {canShowInteract && interactionHint && (
                          <p className="muted interaction-hint">{interactionHint}</p>
                        )}
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
          <section className="catalog-collection" aria-labelledby="catalog-collection-title">
            <header className="panel-header">
              <div>
                <p className="eyebrow">Collection book</p>
                <h3 id="catalog-collection-title">Archive shelf</h3>
                <p className="muted">Discovered references appear here for quick review.</p>
              </div>
              <div className="results-count" data-testid="catalog-discovered-count">
                {discoveredCatalogEntries.length} / {catalogEntries.length} discovered
              </div>
            </header>
            {discoveredCatalogEntries.length > 0 ? (
              <div className="catalog-grid" data-testid="catalog-discovered-grid">
                {discoveredCatalogEntries.map((entry) => {
                  const tags = getCatalogEntryTags(entry);
                  return (
                    <article
                      key={entry.id}
                      className="catalog-card catalog-discovered"
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
                      </div>
                      <div className="catalog-content">
                        <div className="catalog-title">
                          <div>
                            <p className="catalog-brand">{entry.brand}</p>
                            <h3>{entry.model}</h3>
                          </div>
                          <p className="catalog-year">{entry.year}</p>
                        </div>
                        <p>{entry.description}</p>
                        <p className="catalog-tags">{tags.join(" · ")}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="catalog-empty" data-testid="catalog-discovered-empty">
                <EmptyStateCTA
                  title="No references discovered yet"
                  body="Buy and interact with watch models in the Catalog to discover references and unlock tier bonuses."
                  ctaLabel="Shop catalog"
                  onCta={() => onNavigate("catalog", "catalog-shop")}
                />
              </div>
            )}
          </section>
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
                          <div>
                            <p className="catalog-brand">{entry.brand}</p>
                            <h3>{entry.model}</h3>
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
                              <div>
                                <p className="catalog-brand">{entry.brand}</p>
                                <h3>{entry.model}</h3>
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
