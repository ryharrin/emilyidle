import React from "react";

import { NextUnlockPanel, type NextUnlockItem } from "../components/NextUnlockPanel";
import { UnlockHint } from "../components/UnlockHint";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { LockIcon } from "../icons/coreIcons";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../game/format";
import {
  buyItem,
  buyMaisonLine,
  buyUpgrade,
  canBuyMaisonLine,
  canBuyUpgrade,
  getAchievementUnlockProgressDetail,
  dismantleItem,
  getEventStatusLabel,
  getMaxAffordableItemCount,
  getMilestoneUnlockProgressDetail,
  getMilestoneRequirementLabel,
  getPrestigeUnlockProgressDetail,
  getUpgradePriceCents,
  getUnlockRevealProgressRatio,
  getWatchItemEnjoymentRateCentsPerSec,
  getWatchPurchaseGate,
  isEventActive,
  isItemUnlocked,
  isUpgradeUnlocked,
  shouldShowUnlockTag,
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
  UpgradeDefinition,
  WatchItemDefinition,
  WatchItemId,
} from "../../game/state";

type ThemeMode = "system" | "light" | "dark";

type TabId =
  | "collection"
  | "career"
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
  watchItems: ReadonlyArray<WatchItemDefinition>;
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
  craftingPartsPerWatch: Record<WatchItemId, number>;
  activeCoachmarks: Coachmark[];
  settings: Settings;
  persistSettings: (nextSettings: Settings) => void;
  upgrades: ReadonlyArray<UpgradeDefinition>;
  milestones: ReadonlyArray<MilestoneDefinition>;
  achievements: ReadonlyArray<AchievementDefinition>;
  events: ReadonlyArray<EventDefinition>;
  setBonuses: ReadonlyArray<SetBonusDefinition>;
  currentEventMultiplier: number;
  nowMs: number;
  onPurchase: (nextState: GameState) => void;
  onInteract: (itemId: WatchItemId) => void;
};

export function CollectionTab({
  isActive,
  state,
  onNavigate,
  watchItems,
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
  craftingPartsPerWatch,
  activeCoachmarks,
  settings,
  persistSettings,
  upgrades,
  milestones,
  achievements,
  events,
  setBonuses,
  currentEventMultiplier,
  nowMs,
  onPurchase,
  onInteract,
}: CollectionTabProps) {
  const formatCount = (value: number) => Math.floor(value).toLocaleString();

  const nextUnlockItems: NextUnlockItem[] = [];
  const collectionListCta = {
    tabId: "collection" as const,
    scrollTargetId: "collection-list",
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
        title: "Catalog",
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
            <p className="muted">Acquire pieces to grow enjoyment and cash.</p>
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
                    <p className="eyebrow">Catalog bonuses</p>
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
                      Archive guides to boost vault income.
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
                        return `+${Math.round((line.incomeMultiplier - 1) * 100)}% cash`;
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
            <div id="collection-list" className="card-stack">
              {watchItems.map((item) => {
                const owned = state.items[item.id] ?? 0;
                const maxAffordable = getMaxAffordableItemCount(state, item.id);
                const bulkQty = Math.min(10, Math.max(1, maxAffordable));
                const unlocked = isItemUnlocked(state, item.id);
                const unlockMilestoneId = item.unlockMilestoneId;
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
                const partsPerWatch = craftingPartsPerWatch[item.id] ?? 0;
                const singleGate = getWatchPurchaseGate(state, item.id, 1);
                const bulkGate = getWatchPurchaseGate(state, item.id, bulkQty);

                return (
                  <div className="card" key={item.id}>
                    <div className="card-header">
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="muted">{owned} owned</div>
                    </div>
                    <p>
                      {formatRateFromCentsPerSec(getWatchItemEnjoymentRateCentsPerSec(item))}{" "}
                      enjoyment each · {formatRateFromCentsPerSec(item.incomeCentsPerSec)} dollars
                      each · Memories {formatMoneyFromCents(item.collectionValueCents)}
                    </p>
                    <p className="muted">Dismantle value: {partsPerWatch} parts</p>
                    {!unlocked && unlockDetail && (
                      <div data-testid={`locked-item-hint-${item.id}`}>
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
                    <div className="card-actions">
                      <button
                        type="button"
                        className="secondary"
                        disabled={owned <= 0}
                        onClick={() => onInteract(item.id)}
                      >
                        Interact
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        disabled={owned <= 0 || partsPerWatch <= 0}
                        onClick={() => onPurchase(dismantleItem(state, item.id, 1))}
                      >
                        Dismantle
                      </button>
                      <button
                        type="button"
                        data-testid={`vault-buy-${item.id}`}
                        disabled={!unlocked || !singleGate.ok}
                        onClick={() => onPurchase(buyItem(state, item.id, 1))}
                      >
                        Buy ({formatMoneyFromCents(singleGate.cashPriceCents)})
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        data-testid={`vault-buy-bulk-${item.id}`}
                        disabled={!unlocked || bulkQty <= 1 || !bulkGate.ok}
                        onClick={() => onPurchase(buyItem(state, item.id, bulkQty))}
                      >
                        Buy {bulkQty} ({formatMoneyFromCents(bulkGate.cashPriceCents)})
                      </button>
                      {unlocked && !singleGate.ok && (
                        <div className="purchase-locked" data-testid={`purchase-gate-${item.id}`}>
                          <LockIcon className="inline-icon" />
                          {singleGate.blocksBy === "enjoyment" && (
                            <>
                              Requires {formatMoneyFromCents(singleGate.enjoymentRequiredCents)}{" "}
                              enjoyment
                              {singleGate.enjoymentDeficitCents !== undefined && (
                                <>
                                  {" "}
                                  (need {formatMoneyFromCents(
                                    singleGate.enjoymentDeficitCents,
                                  )}{" "}
                                  more)
                                </>
                              )}
                            </>
                          )}
                          {singleGate.blocksBy === "cash" && (
                            <>
                              Need {formatMoneyFromCents(singleGate.cashDeficitCents ?? 0)} more
                              dollars
                            </>
                          )}
                          <ExplainButton sectionId={HELP_SECTION_IDS.gates} label="Explain gates" />
                        </div>
                      )}
                      {!unlocked &&
                        item.unlockMilestoneId &&
                        shouldShowUnlockTag(state, item.unlockMilestoneId) && (
                          <div className="unlock-tag">
                            Unlocking soon · {getMilestoneRequirementLabel(item.unlockMilestoneId)}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
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
            <div className="panel">
              <h3>Upgrades</h3>
              <div id="upgrade-list" className="card-stack">
                {upgrades.map((upgrade) => {
                  const level = state.upgrades[upgrade.id] ?? 0;
                  const price = getUpgradePriceCents(state, upgrade.id, 1);
                  const unlocked = isUpgradeUnlocked(state, upgrade.id);
                  const unlockMilestoneId = upgrade.unlockMilestoneId;
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

                  return (
                    <div className="card" key={upgrade.id}>
                      <div className="card-header">
                        <div>
                          <h3>{upgrade.name}</h3>
                          <p>{upgrade.description}</p>
                        </div>
                        <div className="muted">Level {level}</div>
                      </div>
                      <p>+{Math.round(upgrade.incomeMultiplierPerLevel * 100)}% cash per level</p>
                      {!unlocked && unlockDetail && (
                        <div data-testid={`locked-upgrade-hint-${upgrade.id}`}>
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
                      <div className="card-actions">
                        <button
                          type="button"
                          disabled={!canBuyUpgrade(state, upgrade.id, 1) || !unlocked}
                          onClick={() => onPurchase(buyUpgrade(state, upgrade.id))}
                        >
                          Upgrade ({formatMoneyFromCents(price)})
                        </button>
                        {!unlocked &&
                          upgrade.unlockMilestoneId &&
                          shouldShowUnlockTag(state, upgrade.unlockMilestoneId) && (
                            <div className="unlock-tag">
                              Unlocking soon ·{" "}
                              {getMilestoneRequirementLabel(upgrade.unlockMilestoneId)}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
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
              <p className="muted">Permanent proof of your vault milestones.</p>
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
                Break down watches into parts, then craft permanent vault boosts.
              </p>
              <div className="results-count" data-testid="crafting-parts">
                {craftingParts} parts
              </div>
              {renderCraftingRecipes("crafting-recipes")}
              {renderCraftingBoosts("crafting-boosts")}
            </div>
          </aside>
        </>
      )}
    </section>
  );
}
