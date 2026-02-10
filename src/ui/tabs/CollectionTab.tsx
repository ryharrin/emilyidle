import React from "react";

import { type PurchaseMeta } from "./CatalogTab";
import { CollectionInsightsPanel } from "../components/CollectionInsightsPanel";
import {
  CollectionTierSegments,
  type TierSegmentSummary,
} from "../components/CollectionTierSegments";
import {
  CollectionSectionNav,
  type CollectionSectionNavLink,
} from "../components/CollectionSectionNav";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";

import { formatMoneyFromCents } from "../../game/format";
import {
  buyMaisonLine,
  canBuyMaisonLine,
  getAchievementUnlockProgressDetail,
  getEventStatusLabel,
  getMilestoneRequirementLabel,
  getWatchModelOwnedCount,
  getWatchModels,
  getEquippedWatchContribution,
  setWornWatchId,
  isEventActive,
} from "../../game/state";
import { getTierBadgeByCategory, type TierBadgeCategory } from "../../game/tierBadges";
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
    id: "collection-tier-summary",
    label: "Movement summary",
  },
  {
    id: "collection-segment-quartz",
    label: "Quartz",
  },
  {
    id: "collection-segment-automatic",
    label: "Automatic",
  },
  {
    id: "collection-segment-manual",
    label: "Manual",
  },
  {
    id: "collection-segment-tourbillon",
    label: "Tourbillon",
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
};

export function CollectionTab({
  isActive,
  state,
  onNavigate,
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
}: CollectionTabProps) {
  const watchModels = getWatchModels();
  const watchModelById = new Map(watchModels.map((model) => [model.id, model]));
  const wornModel = state.wornWatchId ? (watchModelById.get(state.wornWatchId) ?? null) : null;
  const [wornPickerOpen, setWornPickerOpen] = React.useState(false);
  const ownedWearableModels = watchModels
    .filter((model) => getWatchModelOwnedCount(state, model.id) > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const { discoveredCatalogEntries } = state;
  const [collectionFavoritesOnly, setCollectionFavoritesOnly] = React.useState(false);
  const favoriteSet = React.useMemo(
    () => new Set(state.favoriteWatchIds ?? []),
    [state.favoriteWatchIds],
  );
  const favoriteModels = React.useMemo(
    () => watchModels.filter((model) => favoriteSet.has(model.id)),
    [favoriteSet, watchModels],
  );

  const tierCategories: ReadonlyArray<TierBadgeCategory> = [
    "quartz",
    "automatic",
    "manual",
    "tourbillon",
  ];
  const tierSummary = React.useMemo<TierSegmentSummary[]>(() => {
    const discoveredSet = new Set(discoveredCatalogEntries);
    return tierCategories.map((category) => {
      const modelsForCategory = watchModels.filter(
        (model) => model.tierBadge.category === category,
      );
      const totalModels = modelsForCategory.length;
      const ownedCount = modelsForCategory.reduce(
        (count, model) => count + (getWatchModelOwnedCount(state, model.id) > 0 ? 1 : 0),
        0,
      );
      const discoveredCount = modelsForCategory.filter((model) =>
        discoveredSet.has(model.id),
      ).length;
      const badge = modelsForCategory[0]?.tierBadge ?? getTierBadgeByCategory(category);
      return { category, badge, totalModels, ownedCount, discoveredCount };
    });
  }, [watchModels, discoveredCatalogEntries, state]);

  const coachmarksDismissed = settings.coachmarksDismissed;
  const activeCoachmarkSection = React.useMemo(() => {
    return COLLECTION_SECTION_NAV_LINKS.find(
      (link) => link.coachmark && !coachmarksDismissed[link.coachmark.id],
    );
  }, [coachmarksDismissed]);
  const navigationSections = React.useMemo<CollectionSectionNavLink[]>(() => {
    return COLLECTION_SECTION_NAV_LINKS.map((link) => {
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
  }, [activeCoachmarkSection]);
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

  const equippedContribution = getEquippedWatchContribution(state, nowMs, currentEventMultiplier);
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
                />
                <CollectionInsightsPanel state={state} />
                <div id="collection-overview" className="collection-section collection-overview">
                  <h2>Collection</h2>
                  <p className="muted">
                    Manage your owned watches here. Track movement coverage and optimize equipped
                    output.
                  </p>
                  <div
                    className="surface-complication-strip collection-complication-strip"
                    data-testid="collection-complication-strip"
                  >
                    <article
                      className="surface-complication collection-complication"
                      data-testid="collection-complication-vault"
                    >
                      <p className="surface-complication-label">Vault</p>
                      <p className="surface-complication-value">
                        {totalOwnedWatches.toLocaleString()} owned
                      </p>
                      <p className="surface-complication-detail">
                        Favorites {favoriteModels.length.toLocaleString()} | Discovered{" "}
                        {discoveredCatalogEntries.length.toLocaleString()}
                      </p>
                    </article>
                    <article
                      className="surface-complication collection-complication"
                      data-testid="collection-complication-chronograph"
                    >
                      <p className="surface-complication-label">Chronograph</p>
                      <p className="surface-complication-value">{automationComplicationValue}</p>
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
                      <p className="surface-complication-label">Date wheel</p>
                      <p className="surface-complication-value">
                        {catalogTierUnlocks.length} / {catalogTierDefinitions.length} unlocked
                      </p>
                      <p className="surface-complication-detail">{movementComplicationDetail}</p>
                    </article>
                    <article
                      className="surface-complication collection-complication"
                      data-testid="collection-complication-moonphase"
                    >
                      <p className="surface-complication-label">Moonphase</p>
                      <p className="surface-complication-value">{archiveComplicationValue}</p>
                      <p className="surface-complication-detail">{archiveComplicationDetail}</p>
                    </article>
                  </div>
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
                    <div className="panel catalog-tier-panel" data-testid="catalog-tier-panel">
                      <header className="panel-header">
                        <div>
                          <p className="eyebrow">Archive bonuses</p>
                          <h3>Movement bonuses</h3>
                          <p className="muted">
                            Unlock movement groups by discovering watch references.
                          </p>
                        </div>
                        <div className="results-count" data-testid="catalog-tier-count">
                          {catalogTierUnlocks.length} / {catalogTierDefinitions.length} unlocked
                        </div>
                      </header>
                      {archiveCuratorMilestone && (
                        <div className="catalog-tier-curator" data-testid="catalog-curator-hint">
                          <p className="muted">
                            Archive curator {archiveCuratorProgress} / {archiveCuratorThreshold} ·
                            Unlock Archive guides to boost collection income.
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
                                  {unlocked ? "Unlocked" : `${progress} / ${tier.requiredCount}`}
                                </div>
                              </div>
                              <p className="muted">Income x{tier.incomeMultiplier.toFixed(2)}</p>
                            </div>
                          );
                        })}
                      </div>
                      <p className="muted" aria-live="polite" data-testid="catalog-tier-status">
                        {catalogTierBonuses.length > 0
                          ? `Active bonus x${catalogTierBonusMultiplier.toFixed(2)}`
                          : "Discover references to unlock tier bonuses."}
                      </p>
                    </div>
                    <section
                      id="collection-tier-summary"
                      className="panel collection-tier-summary collection-section"
                      data-testid="collection-tier-summary"
                    >
                      <header className="panel-header collection-tier-summary-header">
                        <div>
                          <p className="eyebrow">Tier badges</p>
                          <h3>Catalog variety</h3>
                          <p className="muted">
                            Quartz, Automatic, Manual, and Tourbillon badges summarize movement
                            variety across your collection.
                          </p>
                        </div>
                        <div className="collection-tier-summary-help">
                          <ExplainButton
                            sectionId={HELP_SECTION_IDS.tierBadges}
                            label="Explain tier badges"
                            className="help-open-button"
                          />
                          <span className="muted">Badge help</span>
                        </div>
                      </header>
                      <CollectionTierSegments segments={tierSummary} />
                    </section>
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
                        Purchases happen in Catalog. Collection focuses on owned-watch management,
                        bonuses, and progression.
                      </p>
                    </div>
                    <div className="card-actions">
                      <button type="button" onClick={() => onNavigate("catalog", "catalog-shop")}>
                        Open Catalog
                      </button>
                    </div>
                  </header>
                </section>
                {showMaisonLines && (
                  <div
                    id="collection-maison-lines"
                    className="panel maison-lines collection-section"
                    data-testid="maison-lines"
                  >
                    <header className="panel-header">
                      <div>
                        <p className="eyebrow">Maison expansion</p>
                        <h3>Maison lines</h3>
                        <p className="muted">Invest Heritage or Reputation to expand your house.</p>
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
                          <div className="card" key={line.id} data-testid="maison-line-card">
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
                <div className="card-stack">
                  <section className="panel" data-testid="worn-watch-summary">
                    <header className="panel-header">
                      <div>
                        <p className="eyebrow">Equipment</p>
                        <h3>Worn watch</h3>
                        <p className="muted">{wornModel ? wornModel.displayName : "None"}</p>
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
                <section
                  className="panel per-watch-contribution"
                  data-testid="per-watch-contribution"
                >
                  <header className="panel-header">
                    <div>
                      <p className="eyebrow">Contribution</p>
                      <h3>Equipped watch</h3>
                      <p className="muted">{wornModel ? wornModel.displayName : "No watch worn"}</p>
                    </div>
                  </header>
                  <div className="per-watch-contribution-body">
                    <div className="per-watch-contribution-metric">
                      <strong data-testid="per-watch-contribution-enjoyment">
                        {formatMoneyFromCents(equippedContribution.enjoymentDeltaCentsPerSec)} /s
                      </strong>
                      <span>
                        Enjoyment delta (x{equippedContribution.enjoymentMultiplier.toFixed(2)})
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
          </div>

          <aside className="side-panel">
            {activeCoachmarks.length > 0 && (
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
                      const progress = getAchievementUnlockProgressDetail(state, achievement.id);
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
                      ? (state.eventStates[event.id]?.incomeMultiplier ?? event.incomeMultiplier)
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
