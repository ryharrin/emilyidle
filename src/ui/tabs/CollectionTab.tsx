import React from "react";

import { type PurchaseMeta } from "./CatalogTab";
import { NextUnlockPanel, type NextUnlockItem } from "../components/NextUnlockPanel";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";

import { formatMoneyFromCents } from "../../game/format";
import {
  buyMaisonLine,
  canBuyMaisonLine,
  getAchievementUnlockProgressDetail,
  getEventStatusLabel,
  getMilestoneUnlockProgressDetail,
  getMilestoneRequirementLabel,
  getPrestigeUnlockProgressDetail,
  getUnlockRevealProgressRatio,
  getWatchModelOwnedCount,
  getWatchModels,
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
  SetBonusDefinition,
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
};

type Coachmark = {
  id: string;
  title: string;
  text: string;
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
  setBonuses: ReadonlyArray<SetBonusDefinition>;
  currentEventMultiplier: number;
  nowMs: number;
  onPurchase: (nextState: GameState, meta?: PurchaseMeta) => void;
};

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
  setBonuses,
  currentEventMultiplier,
  nowMs,
  onPurchase,
}: CollectionTabProps) {
  const formatCount = (value: number) => Math.floor(value).toLocaleString();
  const watchModels = getWatchModels();
  const watchModelById = new Map(watchModels.map((model) => [model.id, model]));
  const wornModel = state.wornWatchId ? (watchModelById.get(state.wornWatchId) ?? null) : null;
  const [wornPickerOpen, setWornPickerOpen] = React.useState(false);
  const ownedWearableModels = watchModels
    .filter((model) => getWatchModelOwnedCount(state, model.id) > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const nextUnlockItems: NextUnlockItem[] = [];
  const collectionListCta = {
    tabId: "catalog" as const,
    scrollTargetId: "catalog-shop",
  };

  if (!state.unlockedMilestones.includes("collector-shelf")) {
    const detail = getMilestoneUnlockProgressDetail(state, "collector-shelf");

    nextUnlockItems.push({
      id: "career",
      eyebrow: "Next unlock",
      title: "Career",
      detail: detail.label,
      currentLabel: formatCount(detail.current),
      thresholdLabel: formatCount(detail.threshold),
      ratio: detail.ratio,
      cta: {
        label: "Buy watches",
        testId: "next-unlock-cta-career",
        onClick: () => onNavigate(collectionListCta.tabId, collectionListCta.scrollTargetId),
      },
    });
  }

  {
    const detail = getMilestoneUnlockProgressDetail(state, "showcase");
    if (detail.ratio < 1) {
      nextUnlockItems.push({
        id: "catalog",
        eyebrow: "Next unlock",
        title: "Shop",
        detail: detail.label,
        currentLabel: formatMoneyFromCents(detail.current),
        thresholdLabel: formatMoneyFromCents(detail.threshold),
        ratio: getUnlockRevealProgressRatio(detail.ratio),
        cta: {
          label: "Buy watches",
          testId: "next-unlock-cta-catalog",
          onClick: () => onNavigate(collectionListCta.tabId, collectionListCta.scrollTargetId),
        },
      });
    }
  }

  {
    const detail = getAchievementUnlockProgressDetail(state, "first-drawer");
    if (detail.ratio < 1) {
      nextUnlockItems.push({
        id: "stats",
        eyebrow: "Next unlock",
        title: "Stats",
        detail: detail.label,
        currentLabel: formatCount(detail.current),
        thresholdLabel: formatCount(detail.threshold),
        ratio: getUnlockRevealProgressRatio(detail.ratio),
        cta: {
          label: "Buy watches",
          testId: "next-unlock-cta-stats",
          onClick: () => onNavigate(collectionListCta.tabId, collectionListCta.scrollTargetId),
        },
      });
    }
  }

  {
    const detail = getPrestigeUnlockProgressDetail(state, "workshop");
    if (detail.ratio < 1) {
      nextUnlockItems.push({
        id: "workshop",
        eyebrow: "Next unlock",
        title: "Workshop",
        detail: detail.label,
        currentLabel: formatMoneyFromCents(detail.current),
        thresholdLabel: formatMoneyFromCents(detail.threshold),
        ratio: getUnlockRevealProgressRatio(detail.ratio),
        cta: {
          label: "Build collection",
          testId: "next-unlock-cta-workshop",
          onClick: () => onNavigate(collectionListCta.tabId, collectionListCta.scrollTargetId),
        },
      });
    }
  }

  {
    const detail = getPrestigeUnlockProgressDetail(state, "maison");
    if (detail.ratio < 1) {
      nextUnlockItems.push({
        id: "maison",
        eyebrow: "Next unlock",
        title: "Maison",
        detail: detail.label,
        currentLabel: formatMoneyFromCents(detail.current),
        thresholdLabel: formatMoneyFromCents(detail.threshold),
        ratio: getUnlockRevealProgressRatio(detail.ratio),
        cta: {
          label: "Build collection",
          testId: "next-unlock-cta-maison",
          onClick: () => onNavigate(collectionListCta.tabId, collectionListCta.scrollTargetId),
        },
      });
    }
  }

  {
    const detail = getPrestigeUnlockProgressDetail(state, "nostalgia");
    if (detail.ratio < 1) {
      nextUnlockItems.push({
        id: "nostalgia",
        eyebrow: "Next unlock",
        title: "Nostalgia",
        detail: detail.label,
        currentLabel: formatMoneyFromCents(detail.current),
        thresholdLabel: formatMoneyFromCents(detail.threshold),
        ratio: getUnlockRevealProgressRatio(detail.ratio),
        cta: {
          label: "Build collection",
          testId: "next-unlock-cta-nostalgia",
          onClick: () => onNavigate(collectionListCta.tabId, collectionListCta.scrollTargetId),
        },
      });
    }
  }

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
          <div>
            <h2>Collection</h2>
            <p className="muted">Build your collection: buy, wear, and interact with watches.</p>
            <div className="inline-icon-button">
              <ExplainButton
                sectionId={HELP_SECTION_IDS.interactions}
                label="Explain interactions"
              />
              <span className="muted">Interaction help</span>
            </div>
            <NextUnlockPanel items={nextUnlockItems} />
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
                    <h3>Tier bonuses</h3>
                    <p className="muted">Unlock archive tiers by discovering references.</p>
                  </div>
                  <div className="results-count" data-testid="catalog-tier-count">
                    {catalogTierUnlocks.length} / {catalogTierDefinitions.length} unlocked
                  </div>
                </header>
                {archiveCuratorMilestone && (
                  <div className="catalog-tier-curator" data-testid="catalog-curator-hint">
                    <p className="muted">
                      Archive curator {archiveCuratorProgress} / {archiveCuratorThreshold} · Unlock
                      Archive guides to boost collection income.
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
            </div>
            <section className="panel catalog-panel" data-testid="catalog-shop-callout">
              <header className="panel-header">
                <div>
                  <p className="eyebrow">Catalog</p>
                  <h3>Shop in Catalog</h3>
                  <p className="muted">
                    Buy watches directly from catalog cards. The Collection focuses on owned watches
                    and upgrades once you own them.
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
              <div className="panel maison-lines" data-testid="maison-lines">
                <header className="panel-header">
                  <div>
                    <p className="eyebrow">Maison expansion</p>
                    <h3>Maison lines</h3>
                    <p className="muted">Invest Heritage or Reputation to expand your house.</p>
                  </div>
                  <div className="results-count" data-testid="maison-lines-count">
                    {Object.values(state.maisonLines).filter(Boolean).length} / {maisonLines.length}{" "}
                    active
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
                    return (
                      <div className="card" key={achievement.id}>
                        <h3>{achievement.name}</h3>
                        <p>{achievement.description}</p>
                        <p className="muted" aria-live="polite">
                          {unlocked ? "Unlocked" : "Locked"}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
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
            <div className="panel">
              <h3>Set bonuses</h3>
              <div id="set-bonus-list" className="card-stack" data-testid="set-bonus-list">
                {setBonuses.map((bonus) => {
                  const requirements = Object.entries(bonus.requirements) as Array<
                    [keyof GameState["items"], number]
                  >;
                  const progress = requirements.map(([itemId, required]) => {
                    const requiredCount = required ?? 0;
                    const currentCount = state.items[itemId] ?? 0;
                    return {
                      itemId,
                      label: watchItemLabels.get(itemId) ?? itemId,
                      currentCount,
                      requiredCount,
                      met: currentCount >= requiredCount,
                    };
                  });
                  const active = progress.every((entry) => entry.met);
                  const bonusPercent = Math.round((bonus.incomeMultiplier - 1) * 100);
                  return (
                    <div
                      className="card"
                      key={bonus.id}
                      data-testid="set-bonus-card"
                      data-bonus-id={bonus.id}
                    >
                      <div className="card-header">
                        <div>
                          <h3>{bonus.name}</h3>
                          <p>{bonus.description}</p>
                        </div>
                        <div className="muted">{active ? "Active" : "Inactive"}</div>
                      </div>
                      <div className="set-bonus-progress">
                        {progress.map((entry) => (
                          <p className={entry.met ? "" : "muted"} key={entry.itemId}>
                            {entry.label} {entry.currentCount} / {entry.requiredCount}
                          </p>
                        ))}
                      </div>
                      <p className="muted">Income +{bonusPercent}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
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
