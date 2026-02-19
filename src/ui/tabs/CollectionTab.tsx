import React from "react";

import { type PurchaseMeta } from "./CatalogTab";
import { CollectionInsightsPanel } from "../components/CollectionInsightsPanel";
import {
  CollectionSectionNav,
  type CollectionSectionNavLink,
} from "../components/CollectionSectionNav";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { PrestigeComparisonCard } from "../components/PrestigeComparisonCard";

import { formatMoneyFromCents } from "../../game/format";
import {
  buyMaisonLine,
  canBuyMaisonLine,
  getAchievementUnlockProgressDetail,
  getCatalogPassportMetadata,
  getEventStatusLabel,
  getMilestoneRequirementLabel,
  getWatchModelOwnedCount,
  getWatchModels,
  getEquippedWatchContribution,
  setWornWatchId,
  isEventActive,
} from "../../game/state";
import type {
  AchievementDefinition,
  CatalogTierBonusDefinition,
  CatalogTierId,
  EventDefinition,
  GameState,
  MaisonLineDefinition,
  MilestoneDefinition,
  WatchItemId,
} from "../../game/state";

type ThemeMode = "system" | "light" | "dark";

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

type Settings = {
  themeMode: ThemeMode;
  hideCompletedAchievements: boolean;
  hiddenTabs: TabId[];
  coachmarksDismissed: Record<string, boolean>;
  confirmNostalgiaUnlocks: boolean;
  notificationPreferences: {
    sessionsReady: boolean;
    prestigeReady: boolean;
    achievements: boolean;
    events: boolean;
  };
};

type Coachmark = {
  id: string;
  title: string;
  text: string;
};

const COLLECTION_SECTION_NAV_LINKS: CollectionSectionNavLink[] = [
  {
    id: "collection-overview",
    label: "Overview",
    coachmark: {
      id: "collection-overview",
      title: "Collection cockpit",
      description: "Automation controls, tier progress, and catalog hooks live in this overview.",
    },
  },
  {
    id: "collection-milestones",
    label: "Milestones",
  },
  {
    id: "collection-achievements",
    label: "Achievements",
  },
  {
    id: "collection-events",
    label: "Events",
  },
  {
    id: "collection-set-bonuses",
    label: "Set bonuses",
  },
  {
    id: "collection-crafting",
    label: "Crafting",
  },
];

const MOBILE_COLLECTION_QUERY = "(max-width: 900px)";
const DEFAULT_COLLECTION_SECTION_ID = "collection-overview";

const resolveCollectionSectionSelection = (
  sections: CollectionSectionNavLink[],
  currentSectionId?: string,
) => {
  if (sections.length === 0) {
    return "";
  }

  if (currentSectionId && sections.some((section) => section.id === currentSectionId)) {
    return currentSectionId;
  }

  return (
    sections.find((section) => section.id === DEFAULT_COLLECTION_SECTION_ID)?.id ?? sections[0].id
  );
};

const getIsCompactCollectionViewport = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(MOBILE_COLLECTION_QUERY).matches;
};

type PrestigeLayerInfo = {
  visible: boolean;
  ratio: number;
  gain: number;
  thresholdCents: number;
  resetsWhat: string[];
  carriesWhat: string[];
};

type PrestigeComparisonInfo = {
  atelier: PrestigeLayerInfo;
  maison: PrestigeLayerInfo;
  nostalgia: PrestigeLayerInfo;
};

type CollectionTabProps = {
  isActive: boolean;
  state: GameState;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
  watchItemLabels: Map<WatchItemId, string>;
  autoBuyUnlocked: boolean;
  autoBuyEnabled: boolean;
  onToggleAutoBuy: () => void;
  catalogTierUnlocks: CatalogTierId[];
  catalogTierDefinitions: ReadonlyArray<CatalogTierBonusDefinition>;
  catalogTierProgress: Record<CatalogTierId, number>;
  catalogTierBonuses: ReadonlyArray<CatalogTierBonusDefinition>;
  catalogTierBonusMultiplier: number;
  archiveCuratorMilestone?: MilestoneDefinition;
  archiveCuratorProgress: number;
  archiveCuratorThreshold: number;
  archiveCuratorUnlocked: boolean;
  showMaisonLines: boolean;
  maisonLines: ReadonlyArray<MaisonLineDefinition>;
  craftingParts: number;
  renderCraftingRecipes: (testId: string) => React.ReactNode;
  renderCraftingBoosts: (testId: string) => React.ReactNode;
  activeCoachmarks: Coachmark[];
  settings: Settings;
  persistSettings: (nextSettings: Settings) => void;
  milestones: ReadonlyArray<MilestoneDefinition>;
  achievements: ReadonlyArray<AchievementDefinition>;
  events: ReadonlyArray<EventDefinition>;
  currentEventMultiplier: number;
  nowMs: number;
  onPurchase: (nextState: GameState, meta?: PurchaseMeta) => void;
  showSetBonusesSection: boolean;
  showCraftingSection: boolean;
  showMilestonesSection: boolean;
  showAchievementsSection: boolean;
  showEventsSection: boolean;
  prestigeComparisonInfo: PrestigeComparisonInfo;
};

type CollectionMobileSectionId =
  | "movement-bonuses"
  | "maison-lines"
  | "equipment"
  | "coachmarks"
  | "upgrades"
  | "milestones"
  | "achievements"
  | "events"
  | "crafting";

export function CollectionTab({
  isActive,
  state,
  onNavigate,
  watchItemLabels,
  autoBuyUnlocked,
  autoBuyEnabled,
  onToggleAutoBuy,
  catalogTierUnlocks,
  catalogTierDefinitions,
  catalogTierProgress,
  catalogTierBonuses,
  catalogTierBonusMultiplier,
  archiveCuratorMilestone,
  archiveCuratorProgress,
  archiveCuratorThreshold,
  archiveCuratorUnlocked,
  showMaisonLines,
  maisonLines,
  craftingParts,
  renderCraftingRecipes,
  renderCraftingBoosts,
  activeCoachmarks,
  settings,
  persistSettings,
  milestones,
  achievements,
  events,
  currentEventMultiplier,
  nowMs,
  onPurchase,
  showSetBonusesSection,
  showCraftingSection,
  showMilestonesSection,
  showAchievementsSection,
  showEventsSection,
  prestigeComparisonInfo,
}: CollectionTabProps) {
  const watchModels = getWatchModels();
  const watchModelById = new Map(watchModels.map((model) => [model.id, model]));
  const wornModel = state.wornWatchId ? (watchModelById.get(state.wornWatchId) ?? null) : null;
  const [wornPickerOpen, setWornPickerOpen] = React.useState(false);
  const ownedWearableModels = watchModels
    .filter((model) => getWatchModelOwnedCount(state, model.id) > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const [collectionFavoritesOnly, setCollectionFavoritesOnly] = React.useState(false);
  const [isCompactLayout, setIsCompactLayout] = React.useState(getIsCompactCollectionViewport);
  const [openMobileSectionId, setOpenMobileSectionId] =
    React.useState<CollectionMobileSectionId | null>(null);
  const favoriteSet = React.useMemo(
    () => new Set(state.favoriteWatchIds ?? []),
    [state.favoriteWatchIds],
  );
  const favoriteModels = React.useMemo(
    () => watchModels.filter((model) => favoriteSet.has(model.id)),
    [favoriteSet, watchModels],
  );
  const ownedReferenceCount = ownedWearableModels.length;
  const hasOwnedReferences = ownedReferenceCount > 0;
  const discoveredReferenceCount = ownedReferenceCount;

  const coachmarksDismissed = settings.coachmarksDismissed;
  const activeCoachmarkSection = React.useMemo(() => {
    return COLLECTION_SECTION_NAV_LINKS.find(
      (link) => link.coachmark && !coachmarksDismissed[link.coachmark.id],
    );
  }, [coachmarksDismissed]);
  const navigationSections = React.useMemo<CollectionSectionNavLink[]>(() => {
    const visibleLinks = COLLECTION_SECTION_NAV_LINKS.filter((link) => {
      if (link.id === "collection-set-bonuses") {
        return showSetBonusesSection;
      }
      if (link.id === "collection-milestones") {
        return showMilestonesSection;
      }
      if (link.id === "collection-achievements") {
        return showAchievementsSection;
      }
      if (link.id === "collection-events") {
        return showEventsSection;
      }
      if (link.id === "collection-crafting") {
        return showCraftingSection;
      }
      return true;
    });

    return visibleLinks.map((link) => {
      if (
        link.coachmark &&
        activeCoachmarkSection?.coachmark &&
        link.coachmark.id === activeCoachmarkSection.coachmark.id
      ) {
        return link;
      }
      if (link.coachmark) {
        return { id: link.id, label: link.label };
      }
      return link;
    });
  }, [
    activeCoachmarkSection,
    showAchievementsSection,
    showCraftingSection,
    showEventsSection,
    showMilestonesSection,
    showSetBonusesSection,
  ]);
  const [activeCollectionSectionId, setActiveCollectionSectionId] = React.useState(() =>
    resolveCollectionSectionSelection(navigationSections),
  );

  React.useEffect(() => {
    setActiveCollectionSectionId((currentSectionId) =>
      resolveCollectionSectionSelection(navigationSections, currentSectionId),
    );
  }, [navigationSections]);

  const handleDismissSectionCoachmark = React.useCallback(
    (coachmarkId: string) => {
      if (settings.coachmarksDismissed[coachmarkId]) {
        return;
      }
      persistSettings({
        ...settings,
        coachmarksDismissed: {
          ...settings.coachmarksDismissed,
          [coachmarkId]: true,
        },
      });
    },
    [persistSettings, settings],
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_COLLECTION_QUERY);
    const syncLayout = (matches: boolean) => {
      setIsCompactLayout(matches);
      setOpenMobileSectionId(null);
    };

    syncLayout(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent) => {
      syncLayout(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  const handleMobileSectionToggle = React.useCallback(
    (sectionId: CollectionMobileSectionId, isOpen: boolean) => {
      if (!isCompactLayout) {
        return;
      }
      setOpenMobileSectionId((currentValue) => {
        if (!isOpen) {
          return currentValue === sectionId ? null : currentValue;
        }
        return sectionId;
      });
    },
    [isCompactLayout],
  );

  const isMobileSectionOpen = React.useCallback(
    (sectionId: CollectionMobileSectionId) => openMobileSectionId === sectionId,
    [openMobileSectionId],
  );

  const equippedContribution = getEquippedWatchContribution(state, nowMs, currentEventMultiplier);
  const wornPassport = wornModel ? getCatalogPassportMetadata(wornModel.id) : null;
  const totalOwnedWatches = watchModels.reduce(
    (count, model) => count + getWatchModelOwnedCount(state, model.id),
    0,
  );
  const automationComplicationValue = autoBuyUnlocked
    ? autoBuyEnabled
      ? "Enabled"
      : "Standby"
    : "Locked";
  const movementComplicationDetail =
    catalogTierBonuses.length > 0
      ? `Bonus x${catalogTierBonusMultiplier.toFixed(2)} active`
      : "Discover references to unlock tier bonuses.";
  const archiveComplicationValue = archiveCuratorMilestone
    ? `${archiveCuratorProgress} / ${archiveCuratorThreshold}`
    : "No curator track";
  const archiveComplicationDetail = archiveCuratorUnlocked
    ? "Archive guides available in Upgrades."
    : archiveCuratorMilestone
      ? `Next: ${archiveCuratorMilestone.name}`
      : "Unlock curator milestones to reveal guides.";
  const interactionRunsTotal = state.interactionRunsTotal;
  const interactionPerfectRuns = state.interactionPerfectRuns;
  const interactionPerfectStreak = state.interactionPerfectStreak;
  const interactionBestPerfectStreak = state.interactionBestPerfectStreak;
  const interactionPrecisionPercent =
    interactionRunsTotal > 0
      ? Math.round((interactionPerfectRuns / interactionRunsTotal) * 100)
      : 0;
  const interactionOutcomeSummary =
    interactionPerfectStreak > 0
      ? `Live streak: ${interactionPerfectStreak} perfect run${
          interactionPerfectStreak === 1 ? "" : "s"
        }.`
      : interactionRunsTotal > 0
        ? "No active perfect streak."
        : "No outcomes logged yet.";
  const showOverviewTab = activeCollectionSectionId === "collection-overview";
  const showSetBonusesTab = activeCollectionSectionId === "collection-set-bonuses";
  const showMilestonesTab =
    showMilestonesSection && activeCollectionSectionId === "collection-milestones";
  const showAchievementsTab =
    showAchievementsSection && activeCollectionSectionId === "collection-achievements";
  const showEventsTab = showEventsSection && activeCollectionSectionId === "collection-events";
  const showCraftingTab =
    showCraftingSection && activeCollectionSectionId === "collection-crafting";

  const renderWornWatchPassport = () => (
    <section className="panel collection-watch-passport" data-testid="collection-watch-passport">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Watch passport</p>
          <h3>Real-world specs and provenance</h3>
        </div>
      </header>
      {wornPassport ? (
        <>
          <p className="muted">{wornPassport.headline}</p>
          <ul className="catalog-specs">
            <li>
              <span className="catalog-spec-label">Reference</span>
              <span className="catalog-spec-value">{wornPassport.referenceFamily.value}</span>
            </li>
            <li>
              <span className="catalog-spec-label">Complications</span>
              <span className="catalog-spec-value">{wornPassport.complications.value}</span>
            </li>
            <li>
              <span className="catalog-spec-label">Movement origin</span>
              <span className="catalog-spec-value">{wornPassport.movementOrigin.value}</span>
            </li>
          </ul>
          <details
            className="catalog-passport-details"
            data-testid="collection-watch-passport-details"
          >
            <summary data-testid="collection-watch-passport-toggle">
              Show full passport details and provenance
            </summary>
            <div className="catalog-passport-details__content">
              <ul className="catalog-specs">
                <li>
                  <span className="catalog-spec-label">Production era</span>
                  <span className="catalog-spec-value">{wornPassport.productionEra.value}</span>
                </li>
                <li>
                  <span className="catalog-spec-label">Case material</span>
                  <span className="catalog-spec-value">{wornPassport.caseMaterial.value}</span>
                </li>
                <li>
                  <span className="catalog-spec-label">Case diameter</span>
                  <span className="catalog-spec-value">{wornPassport.caseDiameterMm.value}</span>
                </li>
                <li>
                  <span className="catalog-spec-label">Water resistance</span>
                  <span className="catalog-spec-value">{wornPassport.waterResistance.value}</span>
                </li>
              </ul>
              <div className="catalog-facts" data-testid="collection-watch-passport-provenance">
                <p className="catalog-facts-title">Source provenance</p>
                <ul>
                  {wornPassport.provenance.map((source, index) => (
                    <li key={`collection-watch-passport-source-${index}`}>
                      {source.sourceUrl ? (
                        <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                          {source.sourceLabel}
                        </a>
                      ) : (
                        source.sourceLabel
                      )}
                      {` · ${source.provenance}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </>
      ) : (
        <p className="muted">Equip a watch to view its passport and provenance.</p>
      )}
    </section>
  );

  return (
    <section
      className="collection"
      id="collection"
      role="tabpanel"
      aria-labelledby="collection-tab"
      hidden={!isActive}
    >
      {isActive && (
        <>
          <div className="collection-main">
            <div className="collection-favorites-filter" data-testid="collection-favorites-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={collectionFavoritesOnly}
                  onChange={() => setCollectionFavoritesOnly((value) => !value)}
                />
                Favorites only
              </label>
            </div>
            {collectionFavoritesOnly ? (
              <section
                className="panel collection-favorites"
                data-testid="collection-favorites-panel"
              >
                <header className="panel-header">
                  <div>
                    <p className="eyebrow">Favorites</p>
                    <h3>Marked watches</h3>
                    <p className="muted">
                      Quickly highlight the watches you've tagged as favorites.
                    </p>
                  </div>
                </header>
                <div className="card-stack">
                  {favoriteModels.length === 0 ? (
                    <p className="muted" data-testid="collection-favorites-empty">
                      No favorites yet. Mark watches from the catalog to pin them here.
                    </p>
                  ) : (
                    favoriteModels.map((model) => (
                      <div
                        className="card collection-favorite-card"
                        key={model.id}
                        data-testid={`collection-favorite-${model.id}`}
                      >
                        <h4>{model.displayName}</h4>
                        <p className="muted">
                          {model.brand} · {model.tierId} ·
                          {` ${getWatchModelOwnedCount(state, model.id)} owned`}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ) : (
              <>
                <CollectionSectionNav
                  sections={navigationSections}
                  onCoachmarkDismiss={handleDismissSectionCoachmark}
                  activeSectionId={activeCollectionSectionId}
                  onSectionSelect={setActiveCollectionSectionId}
                />
                {showSetBonusesTab && (
                  <CollectionInsightsPanel
                    state={state}
                    watchItemLabels={watchItemLabels}
                    onNavigate={onNavigate}
                    showSetBonusesSection={showSetBonusesSection}
                  />
                )}
                {showOverviewTab && (
                  <>
                    <div
                      id="collection-overview"
                      className="collection-section collection-overview"
                    >
                      <h2>Collection</h2>
                      <p className="muted">
                        Manage your owned watches here. Track movement coverage and optimize
                        equipped output.
                      </p>
                      <PrestigeComparisonCard {...prestigeComparisonInfo} />
                      <div
                        className="surface-complication-strip collection-complication-strip"
                        data-testid="collection-complication-strip"
                      >
                        <article
                          className="surface-complication collection-complication"
                          data-testid="collection-complication-vault"
                        >
                          <p className="surface-complication-label">Vault · Collection size</p>
                          <p className="surface-complication-value">
                            {totalOwnedWatches.toLocaleString()} owned
                          </p>
                          <p className="surface-complication-detail">
                            Favorites {favoriteModels.length.toLocaleString()} | Discovered{" "}
                            {discoveredReferenceCount.toLocaleString()}
                          </p>
                        </article>
                        <article
                          className="surface-complication collection-complication"
                          data-testid="collection-complication-chronograph"
                        >
                          <p className="surface-complication-label">Chronograph · Automation</p>
                          <p className="surface-complication-value">
                            {automationComplicationValue}
                          </p>
                          <p className="surface-complication-detail">
                            {autoBuyUnlocked
                              ? "Auto-buy instrumentation is unlocked."
                              : "Unlock automation with Atelier blueprints."}
                          </p>
                        </article>
                        <article
                          className="surface-complication collection-complication"
                          data-testid="collection-complication-date-wheel"
                        >
                          <p className="surface-complication-label">Date wheel · Tier unlocks</p>
                          <p className="surface-complication-value">
                            {catalogTierUnlocks.length} / {catalogTierDefinitions.length} unlocked
                          </p>
                          <p className="surface-complication-detail">
                            {movementComplicationDetail}
                          </p>
                        </article>
                        <article
                          className="surface-complication collection-complication"
                          data-testid="collection-complication-moonphase"
                        >
                          <p className="surface-complication-label">Moonphase · Archive progress</p>
                          <p className="surface-complication-value">{archiveComplicationValue}</p>
                          <p className="surface-complication-detail">{archiveComplicationDetail}</p>
                        </article>
                      </div>
                      <article
                        className="card interaction-feed-card"
                        data-testid="collection-interaction-feed"
                      >
                        <header className="interaction-feed-card__header">
                          <div>
                            <p className="eyebrow">Interaction outcomes</p>
                            <h3>Collection feed</h3>
                          </div>
                          <p className="interaction-feed-card__status">
                            {interactionOutcomeSummary}
                          </p>
                        </header>
                        <dl className="interaction-feed-card__grid">
                          <div>
                            <dt>Perfect runs</dt>
                            <dd>
                              {interactionPerfectRuns.toLocaleString()} /{" "}
                              {interactionRunsTotal.toLocaleString()}
                            </dd>
                          </div>
                          <div>
                            <dt>Precision</dt>
                            <dd>{interactionPrecisionPercent}%</dd>
                          </div>
                          <div>
                            <dt>Best streak</dt>
                            <dd>{interactionBestPerfectStreak.toLocaleString()}</dd>
                          </div>
                        </dl>
                      </article>
                      <div className="inline-icon-button">
                        <ExplainButton
                          sectionId={HELP_SECTION_IDS.interactions}
                          label="Explain interactions"
                        />
                        <span className="muted">Interaction help</span>
                      </div>
                      <div className="collection-setup" data-testid="collection-setup">
                        <fieldset className="automation-toggle" data-testid="automation-controls">
                          <legend className="automation-label">Automation controls</legend>
                          {autoBuyUnlocked ? (
                            <button
                              type="button"
                              className={autoBuyEnabled ? "" : "secondary"}
                              onClick={onToggleAutoBuy}
                            >
                              {autoBuyEnabled ? "Auto-buy on" : "Auto-buy off"}
                            </button>
                          ) : (
                            <p className="muted">Unlock automation with Atelier blueprints.</p>
                          )}
                        </fieldset>
                        {isCompactLayout ? (
                          <details
                            className="collection-mobile-accordion"
                            open={isMobileSectionOpen("movement-bonuses")}
                            onToggle={(event) =>
                              handleMobileSectionToggle(
                                "movement-bonuses",
                                event.currentTarget.open,
                              )
                            }
                            data-testid="collection-movement-bonuses-details"
                          >
                            <summary data-testid="collection-movement-bonuses-toggle">
                              <span>Movement bonuses</span>
                              <span className="muted">
                                {isMobileSectionOpen("movement-bonuses") ? "Collapse" : "Expand"}
                              </span>
                            </summary>
                            <div className="collection-mobile-accordion-body">
                              <div
                                className="panel catalog-tier-panel"
                                data-testid="catalog-tier-panel"
                              >
                                <header className="panel-header">
                                  <div>
                                    <p className="eyebrow">Archive bonuses</p>
                                    <h3>Movement bonuses</h3>
                                    <p className="muted">
                                      Unlock movement groups by discovering watch references.
                                    </p>
                                  </div>
                                  <div className="results-count" data-testid="catalog-tier-count">
                                    {catalogTierUnlocks.length} / {catalogTierDefinitions.length}{" "}
                                    unlocked
                                  </div>
                                </header>
                                {archiveCuratorMilestone && (
                                  <div
                                    className="catalog-tier-curator"
                                    data-testid="catalog-curator-hint"
                                  >
                                    <p className="muted">
                                      Archive curator {archiveCuratorProgress} /{" "}
                                      {archiveCuratorThreshold}
                                      {" · "}Unlock Archive guides to boost collection income.
                                    </p>
                                    <p className="catalog-tier-curator-status">
                                      {archiveCuratorUnlocked
                                        ? "Archive guides are available in Upgrades."
                                        : `Next milestone: ${archiveCuratorMilestone.name}.`}
                                    </p>
                                  </div>
                                )}
                                <div className="card-stack" data-testid="catalog-tier-list">
                                  {catalogTierDefinitions.map((tier) => {
                                    const unlocked = catalogTierUnlocks.includes(tier.id);
                                    const progress = catalogTierProgress[tier.id];
                                    return (
                                      <div
                                        className={`card catalog-tier-card ${
                                          unlocked ? "catalog-tier-unlocked" : ""
                                        }`}
                                        key={tier.id}
                                        data-testid="catalog-tier-card"
                                      >
                                        <div className="card-header">
                                          <div>
                                            <h4>{tier.name}</h4>
                                            <p>{tier.description}</p>
                                          </div>
                                          <div className="muted">
                                            {unlocked
                                              ? "Unlocked"
                                              : `${progress} / ${tier.requiredCount}`}
                                          </div>
                                        </div>
                                        <p className="muted">
                                          Income x{tier.incomeMultiplier.toFixed(2)}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                                <p
                                  className="muted"
                                  aria-live="polite"
                                  data-testid="catalog-tier-status"
                                >
                                  {catalogTierBonuses.length > 0
                                    ? `Active bonus x${catalogTierBonusMultiplier.toFixed(2)}`
                                    : "Discover references to unlock tier bonuses."}
                                </p>
                              </div>
                            </div>
                          </details>
                        ) : (
                          <div
                            className="panel catalog-tier-panel"
                            data-testid="catalog-tier-panel"
                          >
                            <header className="panel-header">
                              <div>
                                <p className="eyebrow">Archive bonuses</p>
                                <h3>Movement bonuses</h3>
                                <p className="muted">
                                  Unlock movement groups by discovering watch references.
                                </p>
                              </div>
                              <div className="results-count" data-testid="catalog-tier-count">
                                {catalogTierUnlocks.length} / {catalogTierDefinitions.length}{" "}
                                unlocked
                              </div>
                            </header>
                            {archiveCuratorMilestone && (
                              <div
                                className="catalog-tier-curator"
                                data-testid="catalog-curator-hint"
                              >
                                <p className="muted">
                                  Archive curator {archiveCuratorProgress} /{" "}
                                  {archiveCuratorThreshold} · Unlock Archive guides to boost
                                  collection income.
                                </p>
                                <p className="catalog-tier-curator-status">
                                  {archiveCuratorUnlocked
                                    ? "Archive guides are available in Upgrades."
                                    : `Next milestone: ${archiveCuratorMilestone.name}.`}
                                </p>
                              </div>
                            )}
                            <div className="card-stack" data-testid="catalog-tier-list">
                              {catalogTierDefinitions.map((tier) => {
                                const unlocked = catalogTierUnlocks.includes(tier.id);
                                const progress = catalogTierProgress[tier.id];
                                return (
                                  <div
                                    className={`card catalog-tier-card ${
                                      unlocked ? "catalog-tier-unlocked" : ""
                                    }`}
                                    key={tier.id}
                                    data-testid="catalog-tier-card"
                                  >
                                    <div className="card-header">
                                      <div>
                                        <h4>{tier.name}</h4>
                                        <p>{tier.description}</p>
                                      </div>
                                      <div className="muted">
                                        {unlocked
                                          ? "Unlocked"
                                          : `${progress} / ${tier.requiredCount}`}
                                      </div>
                                    </div>
                                    <p className="muted">
                                      Income x{tier.incomeMultiplier.toFixed(2)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <p
                              className="muted"
                              aria-live="polite"
                              data-testid="catalog-tier-status"
                            >
                              {catalogTierBonuses.length > 0
                                ? `Active bonus x${catalogTierBonusMultiplier.toFixed(2)}`
                                : "Discover references to unlock tier bonuses."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <section
                      id="collection-catalog-callout"
                      className="panel catalog-panel collection-section"
                      data-testid="catalog-shop-callout"
                    >
                      <header className="panel-header">
                        <div>
                          <p className="eyebrow">Catalog</p>
                          <h3>Shop in Catalog</h3>
                          <p className="muted">
                            Purchases happen in Catalog. Collection focuses on owned-watch
                            management, bonuses, and progression.
                          </p>
                          <p className="muted" data-testid="collection-catalog-linkage">
                            {ownedReferenceCount} owned reference
                            {ownedReferenceCount === 1 ? "" : "s"} · {discoveredReferenceCount}{" "}
                            discovered
                          </p>
                        </div>
                        <div className="card-actions">
                          <button
                            type="button"
                            onClick={() => onNavigate("catalog", "catalog-shop")}
                          >
                            Open Catalog
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            disabled={!hasOwnedReferences}
                            onClick={() => onNavigate("catalog", "catalog-owned")}
                          >
                            Open Owned
                          </button>
                        </div>
                      </header>
                    </section>
                    {showMaisonLines && (
                      <>
                        {isCompactLayout ? (
                          <details
                            id="collection-maison-lines"
                            className="collection-section collection-mobile-accordion"
                            open={isMobileSectionOpen("maison-lines")}
                            onToggle={(event) =>
                              handleMobileSectionToggle("maison-lines", event.currentTarget.open)
                            }
                            data-testid="maison-lines"
                          >
                            <summary data-testid="collection-maison-lines-toggle">
                              <span>Maison lines</span>
                              <span className="muted">
                                {isMobileSectionOpen("maison-lines") ? "Collapse" : "Expand"}
                              </span>
                            </summary>
                            <div className="collection-mobile-accordion-body">
                              <div className="panel maison-lines">
                                <header className="panel-header">
                                  <div>
                                    <p className="eyebrow">Maison expansion</p>
                                    <h3>Maison lines</h3>
                                    <p className="muted">
                                      Invest Heritage or Reputation to expand your house.
                                    </p>
                                  </div>
                                  <div className="results-count" data-testid="maison-lines-count">
                                    {Object.values(state.maisonLines).filter(Boolean).length} /{" "}
                                    {maisonLines.length} active
                                  </div>
                                </header>
                                <div className="card-stack" data-testid="maison-lines-list">
                                  {maisonLines.map((line) => {
                                    const owned = state.maisonLines[line.id] ?? false;
                                    const canAfford = canBuyMaisonLine(state, line.id);
                                    const costLabel =
                                      line.currency === "heritage"
                                        ? `${line.cost} Heritage`
                                        : `${line.cost} Reputation`;
                                    const effectLabel = (() => {
                                      if (line.incomeMultiplier) {
                                        return `+${Math.round((line.incomeMultiplier - 1) * 100)}% enjoyment`;
                                      }
                                      if (line.collectionBonusMultiplier) {
                                        return `+${Math.round((line.collectionBonusMultiplier - 1) * 100)}% enjoyment`;
                                      }
                                      if (line.workshopBlueprintBonus) {
                                        return `+${line.workshopBlueprintBonus} Atelier blueprint per reset`;
                                      }
                                      return "Maison line";
                                    })();

                                    return (
                                      <div
                                        className="card"
                                        key={line.id}
                                        data-testid="maison-line-card"
                                      >
                                        <div className="card-header">
                                          <div>
                                            <h4>{line.name}</h4>
                                            <p>{line.description}</p>
                                          </div>
                                          <div className="muted">
                                            {owned ? "Active" : costLabel}
                                          </div>
                                        </div>
                                        <p>{effectLabel}</p>
                                        <div className="card-actions">
                                          <button
                                            type="button"
                                            className="secondary"
                                            disabled={owned || !canAfford}
                                            onClick={() =>
                                              onPurchase(buyMaisonLine(state, line.id))
                                            }
                                          >
                                            {owned ? "Live" : `Activate (${costLabel})`}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </details>
                        ) : (
                          <div
                            id="collection-maison-lines"
                            className="panel maison-lines collection-section"
                            data-testid="maison-lines"
                          >
                            <header className="panel-header">
                              <div>
                                <p className="eyebrow">Maison expansion</p>
                                <h3>Maison lines</h3>
                                <p className="muted">
                                  Invest Heritage or Reputation to expand your house.
                                </p>
                              </div>
                              <div className="results-count" data-testid="maison-lines-count">
                                {Object.values(state.maisonLines).filter(Boolean).length} /{" "}
                                {maisonLines.length} active
                              </div>
                            </header>
                            <div className="card-stack" data-testid="maison-lines-list">
                              {maisonLines.map((line) => {
                                const owned = state.maisonLines[line.id] ?? false;
                                const canAfford = canBuyMaisonLine(state, line.id);
                                const costLabel =
                                  line.currency === "heritage"
                                    ? `${line.cost} Heritage`
                                    : `${line.cost} Reputation`;
                                const effectLabel = (() => {
                                  if (line.incomeMultiplier) {
                                    return `+${Math.round((line.incomeMultiplier - 1) * 100)}% enjoyment`;
                                  }
                                  if (line.collectionBonusMultiplier) {
                                    return `+${Math.round((line.collectionBonusMultiplier - 1) * 100)}% enjoyment`;
                                  }
                                  if (line.workshopBlueprintBonus) {
                                    return `+${line.workshopBlueprintBonus} Atelier blueprint per reset`;
                                  }
                                  return "Maison line";
                                })();

                                return (
                                  <div
                                    className="card"
                                    key={line.id}
                                    data-testid="maison-line-card"
                                  >
                                    <div className="card-header">
                                      <div>
                                        <h4>{line.name}</h4>
                                        <p>{line.description}</p>
                                      </div>
                                      <div className="muted">{owned ? "Active" : costLabel}</div>
                                    </div>
                                    <p>{effectLabel}</p>
                                    <div className="card-actions">
                                      <button
                                        type="button"
                                        className="secondary"
                                        disabled={owned || !canAfford}
                                        onClick={() => onPurchase(buyMaisonLine(state, line.id))}
                                      >
                                        {owned ? "Live" : `Activate (${costLabel})`}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {isCompactLayout ? (
                      <details
                        className="collection-mobile-accordion"
                        open={isMobileSectionOpen("equipment")}
                        onToggle={(event) =>
                          handleMobileSectionToggle("equipment", event.currentTarget.open)
                        }
                        data-testid="collection-equipment-details"
                      >
                        <summary data-testid="collection-equipment-toggle">
                          <span>Equipment and contribution</span>
                          <span className="muted">
                            {isMobileSectionOpen("equipment") ? "Collapse" : "Expand"}
                          </span>
                        </summary>
                        <div className="collection-mobile-accordion-body">
                          <div className="card-stack">
                            <section className="panel" data-testid="worn-watch-summary">
                              <header className="panel-header">
                                <div>
                                  <p className="eyebrow">Equipment</p>
                                  <h3>Worn watch</h3>
                                  <p className="muted">
                                    {wornModel ? wornModel.displayName : "None"}
                                  </p>
                                </div>
                                <div className="card-actions">
                                  <button
                                    type="button"
                                    className="secondary"
                                    data-testid="worn-watch-change"
                                    onClick={() => setWornPickerOpen(true)}
                                  >
                                    Change
                                  </button>
                                </div>
                              </header>
                              <p className="muted">
                                {wornModel
                                  ? "Equipped. Switching replaces the previous worn watch."
                                  : "Wear one owned watch to gain an enjoyment bonus."}
                              </p>
                            </section>
                          </div>
                          {renderWornWatchPassport()}
                          <section
                            className="panel per-watch-contribution"
                            data-testid="per-watch-contribution"
                          >
                            <header className="panel-header">
                              <div>
                                <p className="eyebrow">Contribution</p>
                                <h3>Equipped watch</h3>
                                <p className="muted">
                                  {wornModel ? wornModel.displayName : "No watch worn"}
                                </p>
                              </div>
                            </header>
                            <div className="per-watch-contribution-body">
                              <div className="per-watch-contribution-metric">
                                <strong data-testid="per-watch-contribution-enjoyment">
                                  {formatMoneyFromCents(
                                    equippedContribution.enjoymentDeltaCentsPerSec,
                                  )}{" "}
                                  /s
                                </strong>
                                <span>
                                  Enjoyment delta (x
                                  {equippedContribution.enjoymentMultiplier.toFixed(2)})
                                </span>
                              </div>
                              <div className="per-watch-contribution-metric">
                                <strong data-testid="per-watch-contribution-cash">
                                  {formatMoneyFromCents(equippedContribution.cashDeltaCentsPerSec)}{" "}
                                  /s
                                </strong>
                                <span>{equippedContribution.cashExplanation}</span>
                              </div>
                              <p
                                className="muted per-watch-contribution-event"
                                data-testid="per-watch-contribution-event"
                              >
                                Event multiplier x{equippedContribution.eventMultiplier.toFixed(2)}
                              </p>
                            </div>
                          </section>
                        </div>
                      </details>
                    ) : (
                      <>
                        <div className="card-stack">
                          <section className="panel" data-testid="worn-watch-summary">
                            <header className="panel-header">
                              <div>
                                <p className="eyebrow">Equipment</p>
                                <h3>Worn watch</h3>
                                <p className="muted">
                                  {wornModel ? wornModel.displayName : "None"}
                                </p>
                              </div>
                              <div className="card-actions">
                                <button
                                  type="button"
                                  className="secondary"
                                  data-testid="worn-watch-change"
                                  onClick={() => setWornPickerOpen(true)}
                                >
                                  Change
                                </button>
                              </div>
                            </header>
                            <p className="muted">
                              {wornModel
                                ? "Equipped. Switching replaces the previous worn watch."
                                : "Wear one owned watch to gain an enjoyment bonus."}
                            </p>
                          </section>
                        </div>
                        {renderWornWatchPassport()}
                        <section
                          className="panel per-watch-contribution"
                          data-testid="per-watch-contribution"
                        >
                          <header className="panel-header">
                            <div>
                              <p className="eyebrow">Contribution</p>
                              <h3>Equipped watch</h3>
                              <p className="muted">
                                {wornModel ? wornModel.displayName : "No watch worn"}
                              </p>
                            </div>
                          </header>
                          <div className="per-watch-contribution-body">
                            <div className="per-watch-contribution-metric">
                              <strong data-testid="per-watch-contribution-enjoyment">
                                {formatMoneyFromCents(
                                  equippedContribution.enjoymentDeltaCentsPerSec,
                                )}{" "}
                                /s
                              </strong>
                              <span>
                                Enjoyment delta (x
                                {equippedContribution.enjoymentMultiplier.toFixed(2)})
                              </span>
                            </div>
                            <div className="per-watch-contribution-metric">
                              <strong data-testid="per-watch-contribution-cash">
                                {formatMoneyFromCents(equippedContribution.cashDeltaCentsPerSec)} /s
                              </strong>
                              <span>{equippedContribution.cashExplanation}</span>
                            </div>
                            <p
                              className="muted per-watch-contribution-event"
                              data-testid="per-watch-contribution-event"
                            >
                              Event multiplier x{equippedContribution.eventMultiplier.toFixed(2)}
                            </p>
                          </div>
                        </section>
                      </>
                    )}
                  </>
                )}
                {!showOverviewTab && (
                  <section
                    id="collection-catalog-callout"
                    className="panel catalog-panel collection-section"
                    data-testid="catalog-shop-callout"
                  >
                    <header className="panel-header">
                      <div>
                        <p className="eyebrow">Catalog</p>
                        <h3>Shop in Catalog</h3>
                        <p className="muted">
                          Purchases happen in Catalog. Collection focuses on owned-watch management,
                          bonuses, and progression.
                        </p>
                        <p className="muted" data-testid="collection-catalog-linkage">
                          {ownedReferenceCount} owned reference
                          {ownedReferenceCount === 1 ? "" : "s"} · {discoveredReferenceCount}{" "}
                          discovered
                        </p>
                      </div>
                      <div className="card-actions">
                        <button type="button" onClick={() => onNavigate("catalog", "catalog-shop")}>
                          Open Catalog
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          disabled={!hasOwnedReferences}
                          onClick={() => onNavigate("catalog", "catalog-owned")}
                        >
                          Open Owned
                        </button>
                      </div>
                    </header>
                  </section>
                )}
              </>
            )}
          </div>

          <aside className="side-panel">
            {activeCoachmarks.length > 0 && (
              <>
                {isCompactLayout ? (
                  <details
                    className="collection-mobile-accordion"
                    open={isMobileSectionOpen("coachmarks")}
                    onToggle={(event) =>
                      handleMobileSectionToggle("coachmarks", event.currentTarget.open)
                    }
                    data-testid="collection-coachmarks-details"
                  >
                    <summary data-testid="collection-coachmarks-toggle">
                      <span>Coachmarks</span>
                      <span className="muted">
                        {isMobileSectionOpen("coachmarks") ? "Collapse" : "Expand"}
                      </span>
                    </summary>
                    <div className="collection-mobile-accordion-body">
                      <div className="panel" data-testid="coachmarks">
                        <h3>Coachmarks</h3>
                        <div className="card-stack">
                          {activeCoachmarks.map((mark) => (
                            <div className="card" key={mark.id} data-testid="coachmark">
                              <div className="card-header">
                                <div>
                                  <h4>{mark.title}</h4>
                                  <p>{mark.text}</p>
                                </div>
                                <button
                                  type="button"
                                  className="secondary"
                                  onClick={() => {
                                    const nextDismissed = {
                                      ...settings.coachmarksDismissed,
                                      [mark.id]: true,
                                    };
                                    persistSettings({
                                      ...settings,
                                      coachmarksDismissed: nextDismissed,
                                    });
                                  }}
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                ) : (
                  <div className="panel" data-testid="coachmarks">
                    <h3>Coachmarks</h3>
                    <div className="card-stack">
                      {activeCoachmarks.map((mark) => (
                        <div className="card" key={mark.id} data-testid="coachmark">
                          <div className="card-header">
                            <div>
                              <h4>{mark.title}</h4>
                              <p>{mark.text}</p>
                            </div>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => {
                                const nextDismissed = {
                                  ...settings.coachmarksDismissed,
                                  [mark.id]: true,
                                };
                                persistSettings({
                                  ...settings,
                                  coachmarksDismissed: nextDismissed,
                                });
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {showOverviewTab &&
              (isCompactLayout ? (
                <details
                  className="collection-mobile-accordion"
                  open={isMobileSectionOpen("upgrades")}
                  onToggle={(event) =>
                    handleMobileSectionToggle("upgrades", event.currentTarget.open)
                  }
                  data-testid="collection-upgrades-details"
                >
                  <summary data-testid="collection-upgrades-toggle">
                    <span>Upgrades callout</span>
                    <span className="muted">
                      {isMobileSectionOpen("upgrades") ? "Collapse" : "Expand"}
                    </span>
                  </summary>
                  <div className="collection-mobile-accordion-body">
                    <div className="panel upgrades-callout" data-testid="upgrades-callout">
                      <h3>Upgrades live in their own tab</h3>
                      <p className="muted">
                        Compare before/after rate changes and buy upgrades from the dedicated
                        Upgrades surface.
                      </p>
                      <div className="card-actions">
                        <button type="button" onClick={() => onNavigate("upgrades")}>
                          Open Upgrades
                        </button>
                      </div>
                    </div>
                  </div>
                </details>
              ) : (
                <div className="panel upgrades-callout" data-testid="upgrades-callout">
                  <h3>Upgrades live in their own tab</h3>
                  <p className="muted">
                    Compare before/after rate changes and buy upgrades from the dedicated Upgrades
                    surface.
                  </p>
                  <div className="card-actions">
                    <button type="button" onClick={() => onNavigate("upgrades")}>
                      Open Upgrades
                    </button>
                  </div>
                </div>
              ))}

            {showMilestonesTab &&
              (isCompactLayout ? (
                <details
                  id="collection-milestones"
                  className="collection-section collection-mobile-accordion"
                  open={isMobileSectionOpen("milestones")}
                  onToggle={(event) =>
                    handleMobileSectionToggle("milestones", event.currentTarget.open)
                  }
                  data-testid="collection-milestones-details"
                >
                  <summary data-testid="collection-milestones-toggle">
                    <span>Milestones</span>
                    <span className="muted">
                      {isMobileSectionOpen("milestones") ? "Collapse" : "Expand"}
                    </span>
                  </summary>
                  <div className="collection-mobile-accordion-body">
                    <div className="panel">
                      <h3>Milestones</h3>
                      <div id="milestone-list" className="card-stack">
                        {milestones.map((milestone) => {
                          const unlocked = state.unlockedMilestones.includes(milestone.id);
                          return (
                            <div className="card" key={milestone.id}>
                              <h3>{milestone.name}</h3>
                              <p>{milestone.description}</p>
                              <p className="muted">{getMilestoneRequirementLabel(milestone.id)}</p>
                              <p>{unlocked ? "Unlocked" : "Locked"}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </details>
              ) : (
                <section id="collection-milestones" className="collection-section">
                  <div className="panel">
                    <h3>Milestones</h3>
                    <div id="milestone-list" className="card-stack">
                      {milestones.map((milestone) => {
                        const unlocked = state.unlockedMilestones.includes(milestone.id);
                        return (
                          <div className="card" key={milestone.id}>
                            <h3>{milestone.name}</h3>
                            <p>{milestone.description}</p>
                            <p className="muted">{getMilestoneRequirementLabel(milestone.id)}</p>
                            <p>{unlocked ? "Unlocked" : "Locked"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}

            {showAchievementsTab &&
              (isCompactLayout ? (
                <details
                  id="collection-achievements"
                  className="collection-section collection-mobile-accordion"
                  open={isMobileSectionOpen("achievements")}
                  onToggle={(event) =>
                    handleMobileSectionToggle("achievements", event.currentTarget.open)
                  }
                  data-testid="collection-achievements-details"
                >
                  <summary data-testid="collection-achievements-toggle">
                    <span>Achievements</span>
                    <span className="muted">
                      {isMobileSectionOpen("achievements") ? "Collapse" : "Expand"}
                    </span>
                  </summary>
                  <div className="collection-mobile-accordion-body">
                    <div className="panel">
                      <h3>Achievements</h3>
                      <p className="muted">Permanent proof of your collection milestones.</p>
                      <div className="card-stack">
                        {achievements
                          .filter((achievement) => {
                            if (!settings.hideCompletedAchievements) {
                              return true;
                            }
                            return !state.achievementUnlocks.includes(achievement.id);
                          })
                          .map((achievement) => {
                            const unlocked = state.achievementUnlocks.includes(achievement.id);
                            const progress = getAchievementUnlockProgressDetail(
                              state,
                              achievement.id,
                            );
                            const categoryLabel =
                              achievement.category === "mini-game"
                                ? "Mini-game"
                                : achievement.category === "career"
                                  ? "Career"
                                  : achievement.category === "prestige"
                                    ? "Prestige"
                                    : "Collection";
                            return (
                              <div className="card" key={achievement.id}>
                                <h3>{achievement.name}</h3>
                                <p>{achievement.description}</p>
                                <p className="muted">{categoryLabel}</p>
                                <p className="muted">
                                  {progress.current.toLocaleString()} /{" "}
                                  {progress.threshold.toLocaleString()}
                                </p>
                                <p className="muted" aria-live="polite">
                                  {unlocked ? "Unlocked" : "Locked"}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </details>
              ) : (
                <section id="collection-achievements" className="collection-section">
                  <div className="panel">
                    <h3>Achievements</h3>
                    <p className="muted">Permanent proof of your collection milestones.</p>
                    <div className="card-stack">
                      {achievements
                        .filter((achievement) => {
                          if (!settings.hideCompletedAchievements) {
                            return true;
                          }
                          return !state.achievementUnlocks.includes(achievement.id);
                        })
                        .map((achievement) => {
                          const unlocked = state.achievementUnlocks.includes(achievement.id);
                          const progress = getAchievementUnlockProgressDetail(
                            state,
                            achievement.id,
                          );
                          const categoryLabel =
                            achievement.category === "mini-game"
                              ? "Mini-game"
                              : achievement.category === "career"
                                ? "Career"
                                : achievement.category === "prestige"
                                  ? "Prestige"
                                  : "Collection";
                          return (
                            <div className="card" key={achievement.id}>
                              <h3>{achievement.name}</h3>
                              <p>{achievement.description}</p>
                              <p className="muted">{categoryLabel}</p>
                              <p className="muted">
                                {progress.current.toLocaleString()} /{" "}
                                {progress.threshold.toLocaleString()}
                              </p>
                              <p className="muted" aria-live="polite">
                                {unlocked ? "Unlocked" : "Locked"}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </section>
              ))}

            {showEventsTab &&
              (isCompactLayout ? (
                <details
                  id="collection-events"
                  className="collection-section collection-mobile-accordion"
                  open={isMobileSectionOpen("events")}
                  onToggle={(event) =>
                    handleMobileSectionToggle("events", event.currentTarget.open)
                  }
                  data-testid="collection-events-details"
                >
                  <summary data-testid="collection-events-toggle">
                    <span>Events</span>
                    <span className="muted">
                      {isMobileSectionOpen("events") ? "Collapse" : "Expand"}
                    </span>
                  </summary>
                  <div className="collection-mobile-accordion-body">
                    <div className="panel">
                      <h3>Events</h3>
                      <p className="muted">
                        Live boosts cycle in and out. Current multiplier x
                        {currentEventMultiplier.toFixed(2)}.
                      </p>
                      <div className="card-stack">
                        {events.map((event) => {
                          const active = isEventActive(state, event.id, nowMs);
                          const effectiveMultiplier = active
                            ? (state.eventStates[event.id]?.incomeMultiplier ??
                              event.incomeMultiplier)
                            : event.incomeMultiplier;
                          const statusLabel = getEventStatusLabel(state, event.id, nowMs);
                          return (
                            <div className="card" key={event.id}>
                              <div className="card-header">
                                <div>
                                  <h3>{event.name}</h3>
                                  <p>{event.description}</p>
                                </div>
                                <div className="muted">{active ? "Live" : "Idle"}</div>
                              </div>
                              <p>Income x{effectiveMultiplier.toFixed(2)}</p>
                              <p className="muted" aria-live="polite">
                                {statusLabel}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </details>
              ) : (
                <section id="collection-events" className="collection-section">
                  <div className="panel">
                    <h3>Events</h3>
                    <p className="muted">
                      Live boosts cycle in and out. Current multiplier x
                      {currentEventMultiplier.toFixed(2)}.
                    </p>
                    <div className="card-stack">
                      {events.map((event) => {
                        const active = isEventActive(state, event.id, nowMs);
                        const effectiveMultiplier = active
                          ? (state.eventStates[event.id]?.incomeMultiplier ??
                            event.incomeMultiplier)
                          : event.incomeMultiplier;
                        const statusLabel = getEventStatusLabel(state, event.id, nowMs);
                        return (
                          <div className="card" key={event.id}>
                            <div className="card-header">
                              <div>
                                <h3>{event.name}</h3>
                                <p>{event.description}</p>
                              </div>
                              <div className="muted">{active ? "Live" : "Idle"}</div>
                            </div>
                            <p>Income x{effectiveMultiplier.toFixed(2)}</p>
                            <p className="muted" aria-live="polite">
                              {statusLabel}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}

            {showCraftingTab &&
              (isCompactLayout ? (
                <details
                  id="collection-crafting"
                  className="collection-section collection-mobile-accordion"
                  open={isMobileSectionOpen("crafting")}
                  onToggle={(event) =>
                    handleMobileSectionToggle("crafting", event.currentTarget.open)
                  }
                  data-testid="collection-crafting-details"
                >
                  <summary data-testid="collection-crafting-toggle">
                    <span>Crafting workshop</span>
                    <span className="muted">
                      {isMobileSectionOpen("crafting") ? "Collapse" : "Expand"}
                    </span>
                  </summary>
                  <div className="collection-mobile-accordion-body">
                    <div className="panel" data-testid="crafting-panel">
                      <h3>Crafting workshop</h3>
                      <p className="muted">
                        Break down watches into parts, then craft permanent collection boosts.
                      </p>
                      <div className="results-count" data-testid="crafting-parts">
                        {craftingParts} parts
                      </div>
                      {renderCraftingRecipes("crafting-recipes")}
                      {renderCraftingBoosts("crafting-boosts")}
                    </div>
                  </div>
                </details>
              ) : (
                <section id="collection-crafting" className="collection-section">
                  <div className="panel" data-testid="crafting-panel">
                    <h3>Crafting workshop</h3>
                    <p className="muted">
                      Break down watches into parts, then craft permanent collection boosts.
                    </p>
                    <div className="results-count" data-testid="crafting-parts">
                      {craftingParts} parts
                    </div>
                    {renderCraftingRecipes("crafting-recipes")}
                    {renderCraftingBoosts("crafting-boosts")}
                  </div>
                </section>
              ))}

            {wornPickerOpen && (
              <div
                className="nostalgia-modal"
                data-testid="worn-watch-picker-modal"
                role="dialog"
                aria-modal="true"
              >
                <div className="nostalgia-modal-card">
                  <h3>Choose a watch to wear</h3>
                  <p className="muted">
                    Wearing a watch applies an enjoyment bonus. Choosing a different watch replaces
                    the previous worn watch.
                  </p>
                  <div className="card-stack">
                    <button
                      type="button"
                      className="secondary"
                      data-testid="worn-watch-option-none"
                      onClick={() => {
                        onPurchase(setWornWatchId(state, null));
                        setWornPickerOpen(false);
                      }}
                    >
                      Wear none
                    </button>
                    {ownedWearableModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        className={state.wornWatchId === model.id ? "" : "secondary"}
                        data-testid={`worn-watch-option-${model.id}`}
                        onClick={() => {
                          onPurchase(setWornWatchId(state, model.id));
                          setWornPickerOpen(false);
                        }}
                      >
                        {model.displayName}
                      </button>
                    ))}
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="secondary"
                      data-testid="worn-watch-picker-close"
                      onClick={() => setWornPickerOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </>
      )}
    </section>
  );
}
