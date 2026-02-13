import React from "react";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../game/format";
import {
  getAffordabilityEtaSecondsForDeficit,
  buyMaisonUpgrade,
  buyUpgrade,
  buyWorkshopUpgrade,
  canBuyMaisonUpgrade,
  canBuyUpgrade,
  canBuyWorkshopUpgrade,
  getAutoBuyEnabled,
  getEffectiveCashRateCentsPerSec,
  getEnjoymentRateCentsPerSec,
  getMaisonCollectionBonusMultiplier,
  getMilestoneRequirementLabel,
  getMilestoneUnlockProgressDetail,
  getUpgradePriceCents,
  getResourceDeficit,
  getWorkshopBlueprintCostDetail,
  getWorkshopPrestigeGain,
  getWorkshopSoftcapExponent,
  getWorkshopSoftcapValue,
  isUpgradeUnlocked,
  shouldShowUnlockTag,
} from "../../game/state";
import type {
  GameState,
  MaisonUpgradeDefinition,
  UpgradeDefinition,
  WorkshopUpgradeDefinition,
} from "../../game/state";

import { BlueprintCostDetail } from "../components/BlueprintCostDetail";
import { UnlockHint } from "../components/UnlockHint";
import { buildBlueprintTooltip } from "../helpers/blueprintTooltip";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { UpgradeIcon } from "../icons/coreIcons";

type PurchaseMeta = {
  prestigeTier?: "workshop" | "maison" | "nostalgia";
};

type UpgradesTabProps = {
  isActive: boolean;
  state: GameState;
  currentEventMultiplier: number;
  nowMs: number;
  upgrades: ReadonlyArray<UpgradeDefinition>;
  workshopUpgrades: ReadonlyArray<WorkshopUpgradeDefinition>;
  maisonUpgrades: ReadonlyArray<MaisonUpgradeDefinition>;
  onPurchase: (nextState: GameState, meta?: PurchaseMeta) => void;
};

type RatePreview = {
  beforeCash: number;
  afterCash: number;
  beforeEnjoyment: number;
  afterEnjoyment: number;
};

type EffectPreviewLine = {
  key: string;
  label: string;
  before: string;
  after: string;
};

type UpgradeIntent = "income" | "enjoyment" | "automation" | "meta";

type UpgradeStatus = "actionable" | "locked" | "installed" | "unaffordable" | "no-change";
type UpgradeDensity = "compact" | "expanded";

type UpgradeRecommendation = {
  key: string;
  cardId: string;
  name: string;
  sourceLabel: string;
  intent: UpgradeIntent;
  status: UpgradeStatus;
  costLabel: string;
  preview: RatePreview;
  combinedDelta: number;
  paybackSeconds: number | null;
};

type CollectionUpgradeCard = {
  upgrade: UpgradeDefinition;
  key: string;
  cardId: string;
  level: number;
  price: number;
  unlocked: boolean;
  canAfford: boolean;
  unlockCurrentLabel: string;
  unlockThresholdLabel: string;
  unlockDetail: ReturnType<typeof getMilestoneUnlockProgressDetail> | null;
  preview: RatePreview;
  status: UpgradeStatus;
  intent: UpgradeIntent;
  combinedDelta: number;
  paybackSeconds: number | null;
  cashDeficitCents: number;
  cashAffordabilityEtaSeconds: number | null;
};

type WorkshopUpgradeCard = {
  upgrade: WorkshopUpgradeDefinition;
  key: string;
  cardId: string;
  owned: boolean;
  canAfford: boolean;
  effectLabel: string;
  effectLines: EffectPreviewLine[];
  preview: RatePreview;
  status: UpgradeStatus;
  intent: UpgradeIntent;
  combinedDelta: number;
  blueprintDeficit: number;
};

type MaisonUpgradeCard = {
  upgrade: MaisonUpgradeDefinition;
  key: string;
  cardId: string;
  owned: boolean;
  canAfford: boolean;
  costLabel: string;
  effectLabel: string;
  effectLines: EffectPreviewLine[];
  preview: RatePreview;
  status: UpgradeStatus;
  intent: UpgradeIntent;
  combinedDelta: number;
  resourceDeficit: number;
  resourceLabel: "Heritage" | "Reputation";
};

const UPGRADE_INTENT_META: Record<
  UpgradeIntent,
  {
    label: string;
    summary: string;
  }
> = {
  income: {
    label: "Income",
    summary: "Directly boosts collection output and earning pace.",
  },
  enjoyment: {
    label: "Enjoyment",
    summary: "Improves base enjoyment scaling in current runs.",
  },
  automation: {
    label: "Automation",
    summary: "Reduces manual upkeep and improves flow stability.",
  },
  meta: {
    label: "Meta progression",
    summary: "Strengthens prestige cycles and softcap resilience.",
  },
};

const UPGRADE_STATUS_LABELS: Record<UpgradeStatus, string> = {
  actionable: "Ready",
  locked: "Locked",
  installed: "Installed",
  unaffordable: "Need resources",
  "no-change": "Low impact",
};

const buildRatePreview = (
  state: GameState,
  nextState: GameState,
  nowMs: number,
  eventMultiplier: number,
): RatePreview => {
  const beforeCash = getEffectiveCashRateCentsPerSec(state, nowMs, eventMultiplier);
  const afterCash = getEffectiveCashRateCentsPerSec(nextState, nowMs, eventMultiplier);
  const beforeEnjoyment = getEnjoymentRateCentsPerSec(state) * eventMultiplier;
  const afterEnjoyment = getEnjoymentRateCentsPerSec(nextState) * eventMultiplier;

  return { beforeCash, afterCash, beforeEnjoyment, afterEnjoyment };
};

const formatDelta = (delta: number) =>
  `${delta >= 0 ? "+" : ""}${formatRateFromCentsPerSec(delta)}`;

const formatMultiplierValue = (value: number) => `${value.toFixed(2)}x`;

const formatExponentValue = (value: number) => value.toFixed(2);

const formatAutomationState = (enabled: boolean) => (enabled ? "Enabled" : "Disabled");

const getUpgradeCardClassName = (
  status: UpgradeStatus,
  recommended: boolean,
  compactDensity: boolean,
) => {
  const classNames = ["card", "upgrade-card"];
  classNames.push(compactDensity ? "upgrade-card-compact" : "upgrade-card-expanded");
  if (recommended) {
    classNames.push("upgrade-card--recommended");
  }
  if (status !== "actionable") {
    classNames.push("upgrade-card--deemphasized");
  }
  return classNames.join(" ");
};

const getCombinedDelta = (preview: RatePreview) =>
  preview.afterCash - preview.beforeCash + (preview.afterEnjoyment - preview.beforeEnjoyment);

const getPaybackSeconds = (costCents: number, preview: RatePreview): number | null => {
  const cashDelta = preview.afterCash - preview.beforeCash;
  if (cashDelta <= 0) {
    return null;
  }
  return costCents / cashDelta;
};

const formatDurationFromSeconds = (seconds: number): string => {
  const roundedSeconds = Math.max(1, Math.round(seconds));
  const minutes = Math.floor(roundedSeconds / 60);
  const remainderSeconds = roundedSeconds % 60;

  if (minutes <= 0) {
    return `${roundedSeconds}s`;
  }

  if (remainderSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainderSeconds}s`;
};

const formatPaybackLabel = (paybackSeconds: number | null): string => {
  if (paybackSeconds === null) {
    return "No direct cash payback";
  }

  return `Payback ${formatDurationFromSeconds(paybackSeconds)}`;
};

const formatEtaLabel = (etaSeconds: number | null): string => {
  if (etaSeconds === null) {
    return "ETA unavailable";
  }
  if (etaSeconds <= 0) {
    return "Ready now";
  }
  if (etaSeconds < 60) {
    return `${etaSeconds}s`;
  }
  if (etaSeconds < 3_600) {
    return `${Math.ceil(etaSeconds / 60)}m`;
  }
  return `${Math.ceil(etaSeconds / 3_600)}h`;
};

const getRecommendationReason = (recommendation: UpgradeRecommendation): string => {
  const intentLabel = UPGRADE_INTENT_META[recommendation.intent].label;

  if (recommendation.paybackSeconds !== null) {
    return `${intentLabel} focus - ${formatPaybackLabel(recommendation.paybackSeconds)}`;
  }

  return `${intentLabel} focus - ${formatPaybackLabel(recommendation.paybackSeconds)}`;
};

const compareRecommendations = (
  left: UpgradeRecommendation,
  right: UpgradeRecommendation,
): number => {
  const leftPayback = left.paybackSeconds ?? Number.POSITIVE_INFINITY;
  const rightPayback = right.paybackSeconds ?? Number.POSITIVE_INFINITY;

  if (leftPayback !== rightPayback) {
    return leftPayback - rightPayback;
  }

  if (left.combinedDelta !== right.combinedDelta) {
    return right.combinedDelta - left.combinedDelta;
  }

  return left.name.localeCompare(right.name);
};

const resolveCollectionStatus = (unlocked: boolean, canAfford: boolean, combinedDelta: number) => {
  if (!unlocked) {
    return "locked";
  }
  if (!canAfford) {
    return "unaffordable";
  }
  if (combinedDelta <= 0) {
    return "no-change";
  }
  return "actionable";
};

const resolvePersistentUpgradeStatus = (
  owned: boolean,
  canAfford: boolean,
  combinedDelta: number,
  hasNonRateEffect: boolean,
): UpgradeStatus => {
  if (owned) {
    return "installed";
  }
  if (!canAfford) {
    return "unaffordable";
  }
  if (combinedDelta <= 0 && !hasNonRateEffect) {
    return "no-change";
  }
  return "actionable";
};

const resolveWorkshopIntent = (upgrade: WorkshopUpgradeDefinition): UpgradeIntent => {
  if (upgrade.unlocks?.autoBuyEnabled) {
    return "automation";
  }
  if (upgrade.softcapMultiplier || upgrade.softcapExponentBonus) {
    return "meta";
  }
  if (upgrade.incomeMultiplier) {
    return "income";
  }
  return "meta";
};

const resolveMaisonIntent = (upgrade: MaisonUpgradeDefinition): UpgradeIntent => {
  if (upgrade.softcapMultiplier) {
    return "meta";
  }
  if (upgrade.collectionBonusMultiplier || upgrade.incomeMultiplier) {
    return "income";
  }
  return "meta";
};

const buildSoftcapValueLine = (
  state: GameState,
  nextState: GameState,
): EffectPreviewLine | null => {
  const before = getWorkshopSoftcapValue(state);
  const after = getWorkshopSoftcapValue(nextState);
  if (before === after) {
    return null;
  }

  return {
    key: "softcap-value",
    label: "Softcap",
    before: formatRateFromCentsPerSec(before),
    after: formatRateFromCentsPerSec(after),
  };
};

const buildSoftcapExponentLine = (
  state: GameState,
  nextState: GameState,
): EffectPreviewLine | null => {
  const before = getWorkshopSoftcapExponent(state);
  const after = getWorkshopSoftcapExponent(nextState);
  if (before === after) {
    return null;
  }

  return {
    key: "softcap-exponent",
    label: "Softcap exponent",
    before: formatExponentValue(before),
    after: formatExponentValue(after),
  };
};

const buildCollectionBonusLine = (
  state: GameState,
  nextState: GameState,
): EffectPreviewLine | null => {
  const before = getMaisonCollectionBonusMultiplier(state);
  const after = getMaisonCollectionBonusMultiplier(nextState);
  if (before === after) {
    return null;
  }

  return {
    key: "collection-bonus",
    label: "Collection bonus",
    before: formatMultiplierValue(before),
    after: formatMultiplierValue(after),
  };
};

const buildAutomationLine = (state: GameState, nextState: GameState): EffectPreviewLine | null => {
  const before = getAutoBuyEnabled(state);
  const after = getAutoBuyEnabled(nextState);
  if (before === after) {
    return null;
  }

  return {
    key: "automation",
    label: "Automation",
    before: formatAutomationState(before),
    after: formatAutomationState(after),
  };
};

const buildWorkshopEffectLines = (
  state: GameState,
  nextState: GameState,
  upgrade: WorkshopUpgradeDefinition,
): EffectPreviewLine[] => {
  const lines: EffectPreviewLine[] = [];

  if (upgrade.softcapMultiplier) {
    const softcapLine = buildSoftcapValueLine(state, nextState);
    if (softcapLine) {
      lines.push(softcapLine);
    }
  }

  if (upgrade.softcapExponentBonus) {
    const exponentLine = buildSoftcapExponentLine(state, nextState);
    if (exponentLine) {
      lines.push(exponentLine);
    }
  }

  if (upgrade.unlocks?.autoBuyEnabled) {
    const automationLine = buildAutomationLine(state, nextState);
    if (automationLine) {
      lines.push(automationLine);
    }
  }

  return lines;
};

const buildMaisonEffectLines = (
  state: GameState,
  nextState: GameState,
  upgrade: MaisonUpgradeDefinition,
): EffectPreviewLine[] => {
  const lines: EffectPreviewLine[] = [];

  if (upgrade.collectionBonusMultiplier) {
    const collectionLine = buildCollectionBonusLine(state, nextState);
    if (collectionLine) {
      lines.push(collectionLine);
    }
  }

  if (upgrade.softcapMultiplier) {
    const softcapLine = buildSoftcapValueLine(state, nextState);
    if (softcapLine) {
      lines.push(softcapLine);
    }
  }

  return lines;
};

const renderEffectLines = (lines: EffectPreviewLine[]) => {
  if (lines.length === 0) {
    return null;
  }

  return (
    <div data-testid="upgrade-effect-lines" className="upgrade-effect-lines">
      {lines.map((line) => (
        <div
          key={line.key}
          data-testid={`upgrade-effect-${line.key}`}
          className="upgrade-effect-line"
        >
          <span className="muted">{line.label}</span>
          <div className="upgrade-effect-values">
            <span data-testid="upgrade-effect-value-before" className="upgrade-effect-value">
              {line.before}
            </span>
            <span className="upgrade-effect-arrow" aria-hidden="true">
              {"->"}
            </span>
            <span data-testid="upgrade-effect-value-after" className="upgrade-effect-value">
              {line.after}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const renderDeltaChips = (preview: RatePreview) => {
  const cashDelta = preview.afterCash - preview.beforeCash;
  const enjoymentDelta = preview.afterEnjoyment - preview.beforeEnjoyment;
  const chips: Array<JSX.Element> = [];

  if (cashDelta !== 0) {
    chips.push(
      <span className="upgrade-delta" key="cash">
        Cash {formatDelta(cashDelta)}
      </span>,
    );
  }

  if (enjoymentDelta !== 0) {
    chips.push(
      <span className="upgrade-delta" key="enjoyment">
        Enjoyment {formatDelta(enjoymentDelta)}
      </span>,
    );
  }

  if (chips.length === 0) {
    return <p className="muted">No rate change.</p>;
  }

  return <div className="upgrade-deltas">{chips}</div>;
};

const renderImpactSummary = (preview: RatePreview) => (
  <div className="upgrade-impact-summary" data-testid="upgrade-impact-summary">
    <p className="muted">Before {"->"} After</p>
    <div className="upgrade-impact-row" data-testid="upgrade-impact-row-cash">
      <span>Cash</span>
      <span>
        {formatRateFromCentsPerSec(preview.beforeCash)} {"->"}{" "}
        {formatRateFromCentsPerSec(preview.afterCash)}
      </span>
    </div>
    <div className="upgrade-impact-row" data-testid="upgrade-impact-row-enjoyment">
      <span>Enjoyment</span>
      <span>
        {formatRateFromCentsPerSec(preview.beforeEnjoyment)} {"->"}{" "}
        {formatRateFromCentsPerSec(preview.afterEnjoyment)}
      </span>
    </div>
  </div>
);

const renderRoiSummary = (
  costLabel: string,
  paybackSeconds: number | null,
  status: UpgradeStatus,
  intent: UpgradeIntent,
) => {
  if (status === "locked") {
    return (
      <p className="upgrade-roi-summary" data-testid="upgrade-roi-summary">
        Cost {costLabel} {"->"} locked until requirement is met.
      </p>
    );
  }

  return (
    <p className="upgrade-roi-summary" data-testid="upgrade-roi-summary">
      Cost {costLabel} {"->"} {formatPaybackLabel(paybackSeconds)} {"->"}{" "}
      {UPGRADE_INTENT_META[intent].label}
    </p>
  );
};

const renderPreviewDetails = (preview: RatePreview) => {
  const showCash = preview.beforeCash !== preview.afterCash;

  return (
    <details className="card upgrade-preview-details">
      <summary>Deep diagnostics</summary>
      <div className="upgrade-preview-grid">
        <div>
          <p className="muted">Before</p>
          {showCash && <p>Cash {formatRateFromCentsPerSec(preview.beforeCash)}</p>}
          <p>Enjoyment {formatRateFromCentsPerSec(preview.beforeEnjoyment)}</p>
        </div>
        <div>
          <p className="muted">After</p>
          {showCash && <p>Cash {formatRateFromCentsPerSec(preview.afterCash)}</p>}
          <p>Enjoyment {formatRateFromCentsPerSec(preview.afterEnjoyment)}</p>
        </div>
      </div>
    </details>
  );
};

export function UpgradesTab({
  isActive,
  state,
  currentEventMultiplier,
  nowMs,
  upgrades,
  workshopUpgrades,
  maisonUpgrades,
  onPurchase,
}: UpgradesTabProps) {
  const [upgradeDensity, setUpgradeDensity] = React.useState<UpgradeDensity>("expanded");
  const isCompactDensity = upgradeDensity === "compact";
  const toggleUpgradeDensity = React.useCallback(() => {
    setUpgradeDensity((value) => (value === "compact" ? "expanded" : "compact"));
  }, []);

  const openUpgradeGroup = (
    testId: "upgrades-group-collection" | "upgrades-group-workshop" | "upgrades-group-maison",
  ) => {
    if (typeof document === "undefined") {
      return;
    }

    const target = document.querySelector(`[data-testid="${testId}"]`);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target instanceof HTMLDetailsElement && !target.open) {
      target.open = true;
    }

    target.scrollIntoView({ block: "start", behavior: "auto" });
  };

  const formatCount = (value: number) => Math.floor(value).toLocaleString();
  const blueprintCostDetail = getWorkshopBlueprintCostDetail(state);
  const blueprintTooltip = buildBlueprintTooltip(state, getWorkshopPrestigeGain(state));
  const currentCashRateCentsPerSec = getEffectiveCashRateCentsPerSec(
    state,
    nowMs,
    currentEventMultiplier,
  );

  const collectionUpgradeCards: CollectionUpgradeCard[] = upgrades.map((upgrade) => {
    const level = state.upgrades[upgrade.id] ?? 0;
    const price = getUpgradePriceCents(state, upgrade.id, 1);
    const unlocked = isUpgradeUnlocked(state, upgrade.id);
    const canAfford = canBuyUpgrade(state, upgrade.id, 1);
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
    const nextState = buyUpgrade(state, upgrade.id);
    const preview = buildRatePreview(state, nextState, nowMs, currentEventMultiplier);
    const combinedDelta = getCombinedDelta(preview);
    const cashDeficitCents = getResourceDeficit(price, state.currencyCents);
    const cashAffordabilityEtaSeconds = getAffordabilityEtaSecondsForDeficit(
      cashDeficitCents,
      currentCashRateCentsPerSec,
    );

    return {
      upgrade,
      key: `collection:${upgrade.id}`,
      cardId: `upgrade-card-${upgrade.id}`,
      level,
      price,
      unlocked,
      canAfford,
      unlockCurrentLabel,
      unlockThresholdLabel,
      unlockDetail,
      preview,
      status: resolveCollectionStatus(unlocked, canAfford, combinedDelta),
      intent: "enjoyment",
      combinedDelta,
      paybackSeconds: getPaybackSeconds(price, preview),
      cashDeficitCents,
      cashAffordabilityEtaSeconds,
    };
  });

  const workshopUpgradeCards: WorkshopUpgradeCard[] = workshopUpgrades.map((upgrade) => {
    const owned = state.workshopUpgrades[upgrade.id] ?? false;
    const canAfford = canBuyWorkshopUpgrade(state, upgrade.id);
    const effectLabel = (() => {
      if (upgrade.incomeMultiplier) {
        return `+${Math.round((upgrade.incomeMultiplier - 1) * 100)}% enjoyment`;
      }
      if (upgrade.softcapMultiplier) {
        return `+${Math.round((upgrade.softcapMultiplier - 1) * 100)}% softcap`;
      }
      if (upgrade.softcapExponentBonus) {
        return `Softcap exponent +${upgrade.softcapExponentBonus}`;
      }
      if (upgrade.unlocks?.autoBuyEnabled) {
        return "Unlocks automation";
      }
      return "Permanent upgrade";
    })();
    const nextState = buyWorkshopUpgrade(state, upgrade.id);
    const preview = buildRatePreview(state, nextState, nowMs, currentEventMultiplier);
    const effectLines = buildWorkshopEffectLines(state, nextState, upgrade);
    const combinedDelta = getCombinedDelta(preview);
    const blueprintDeficit = Math.max(0, upgrade.blueprintCost - state.workshopBlueprints);

    return {
      upgrade,
      key: `workshop:${upgrade.id}`,
      cardId: `upgrade-card-${upgrade.id}`,
      owned,
      canAfford,
      effectLabel,
      effectLines,
      preview,
      status: resolvePersistentUpgradeStatus(
        owned,
        canAfford,
        combinedDelta,
        effectLines.length > 0,
      ),
      intent: resolveWorkshopIntent(upgrade),
      combinedDelta,
      blueprintDeficit,
    };
  });

  const maisonUpgradeCards: MaisonUpgradeCard[] = maisonUpgrades.map((upgrade) => {
    const owned = state.maisonUpgrades[upgrade.id] ?? false;
    const canAfford = canBuyMaisonUpgrade(state, upgrade.id);
    const costLabel =
      upgrade.currency === "heritage" ? `${upgrade.cost} Heritage` : `${upgrade.cost} Reputation`;
    const effectLabel = (() => {
      if (upgrade.incomeMultiplier) {
        return `+${Math.round((upgrade.incomeMultiplier - 1) * 100)}% enjoyment`;
      }
      if (upgrade.collectionBonusMultiplier) {
        return `+${Math.round((upgrade.collectionBonusMultiplier - 1) * 100)}% enjoyment`;
      }
      if (upgrade.softcapMultiplier) {
        return `+${Math.round((upgrade.softcapMultiplier - 1) * 100)}% softcap`;
      }
      return "Permanent upgrade";
    })();
    const nextState = buyMaisonUpgrade(state, upgrade.id);
    const preview = buildRatePreview(state, nextState, nowMs, currentEventMultiplier);
    const effectLines = buildMaisonEffectLines(state, nextState, upgrade);
    const combinedDelta = getCombinedDelta(preview);
    const resourceLabel = upgrade.currency === "heritage" ? "Heritage" : "Reputation";
    const currentResource = upgrade.currency === "heritage" ? state.maisonHeritage : state.maisonReputation;
    const resourceDeficit = Math.max(0, upgrade.cost - currentResource);

    return {
      upgrade,
      key: `maison:${upgrade.id}`,
      cardId: `upgrade-card-${upgrade.id}`,
      owned,
      canAfford,
      costLabel,
      effectLabel,
      effectLines,
      preview,
      status: resolvePersistentUpgradeStatus(
        owned,
        canAfford,
        combinedDelta,
        effectLines.length > 0,
      ),
      intent: resolveMaisonIntent(upgrade),
      combinedDelta,
      resourceDeficit,
      resourceLabel,
    };
  });

  const recommendations: UpgradeRecommendation[] = [
    ...collectionUpgradeCards.map((card) => ({
      key: card.key,
      cardId: card.cardId,
      name: card.upgrade.name,
      sourceLabel: "Collection",
      intent: card.intent,
      status: card.status,
      costLabel: formatMoneyFromCents(card.price),
      preview: card.preview,
      combinedDelta: card.combinedDelta,
      paybackSeconds: card.paybackSeconds,
    })),
    ...workshopUpgradeCards.map((card) => ({
      key: card.key,
      cardId: card.cardId,
      name: card.upgrade.name,
      sourceLabel: "Workshop",
      intent: card.intent,
      status: card.status,
      costLabel: `${card.upgrade.blueprintCost} Blueprints`,
      preview: card.preview,
      combinedDelta: card.combinedDelta,
      paybackSeconds: null,
    })),
    ...maisonUpgradeCards.map((card) => ({
      key: card.key,
      cardId: card.cardId,
      name: card.upgrade.name,
      sourceLabel: "Maison",
      intent: card.intent,
      status: card.status,
      costLabel: card.costLabel,
      preview: card.preview,
      combinedDelta: card.combinedDelta,
      paybackSeconds: null,
    })),
  ];

  const topRecommendations = recommendations
    .filter((recommendation) => recommendation.status === "actionable")
    .sort(compareRecommendations)
    .slice(0, 3);
  const recommendedKeys = new Set(topRecommendations.map((recommendation) => recommendation.key));
  const collectionActionableCount = collectionUpgradeCards.filter(
    (card) => card.status === "actionable",
  ).length;
  const workshopActionableCount = workshopUpgradeCards.filter(
    (card) => card.status === "actionable",
  ).length;
  const maisonActionableCount = maisonUpgradeCards.filter(
    (card) => card.status === "actionable",
  ).length;
  const workshopInstalledCount = workshopUpgradeCards.filter((card) => card.owned).length;
  const maisonInstalledCount = maisonUpgradeCards.filter((card) => card.owned).length;
  const recommendationLead = topRecommendations[0]?.name ?? "No actionable recommendations";

  return (
    <section
      id="upgrades"
      role="tabpanel"
      aria-labelledby="upgrades-tab"
      hidden={!isActive}
      data-testid="upgrades-panel"
    >
      {isActive && (
        <div className="upgrades-layout">
          <header className="panel upgrades-header">
            <div>
              <p className="eyebrow inline-icon-button">
                <UpgradeIcon className="inline-icon" />
                Upgrades
              </p>
              <h2>Collection improvements</h2>
              <p className="muted">
                Compare rate changes before committing to collection, Atelier, or Maison upgrades.
              </p>
              <div
                className="surface-complication-strip upgrades-complication-strip"
                data-testid="upgrades-complication-strip"
              >
                <article
                  className="surface-complication upgrades-complication"
                  data-testid="upgrades-complication-power-reserve"
                >
                  <p className="surface-complication-label">Power reserve · Recommendations</p>
                  <p className="surface-complication-value">
                    {topRecommendations.length} recommended
                  </p>
                  <p className="surface-complication-detail">{recommendationLead}</p>
                </article>
                <article
                  className="surface-complication upgrades-complication"
                  data-testid="upgrades-complication-chronograph"
                >
                  <p className="surface-complication-label">Chronograph · Collection lane</p>
                  <p className="surface-complication-value">
                    {collectionActionableCount} collection upgrades ready
                  </p>
                  <p className="surface-complication-detail">
                    Cash lane upgrades currently actionable
                  </p>
                </article>
                <article
                  className="surface-complication upgrades-complication"
                  data-testid="upgrades-complication-date-wheel"
                >
                  <p className="surface-complication-label">Date wheel · Atelier lane</p>
                  <p className="surface-complication-value">
                    {workshopInstalledCount} / {workshopUpgradeCards.length} Atelier installed
                  </p>
                  <p className="surface-complication-detail">
                    {workshopActionableCount} Atelier upgrades ready to install
                  </p>
                </article>
                <article
                  className="surface-complication upgrades-complication"
                  data-testid="upgrades-complication-moonphase"
                >
                  <p className="surface-complication-label">Moonphase · Maison lane</p>
                  <p className="surface-complication-value">
                    {maisonInstalledCount} / {maisonUpgradeCards.length} Maison installed
                  </p>
                  <p className="surface-complication-detail">
                    {maisonActionableCount} Maison upgrades ready to install
                  </p>
                </article>
              </div>
              <div className="inline-icon-button">
                <ExplainButton sectionId={HELP_SECTION_IDS.upgrades} label="Explain upgrades" />
                <span className="muted">Upgrade help</span>
              </div>
              <div className="card-actions" data-testid="upgrades-hub-actions">
                <button
                  type="button"
                  className="secondary"
                  data-testid="upgrades-jump-collection"
                  onClick={() => openUpgradeGroup("upgrades-group-collection")}
                >
                  Open Collection lane
                </button>
                <button
                  type="button"
                  className="secondary"
                  data-testid="upgrades-jump-workshop"
                  onClick={() => openUpgradeGroup("upgrades-group-workshop")}
                >
                  Open Atelier lane
                </button>
                <button
                  type="button"
                  className="secondary"
                  data-testid="upgrades-jump-maison"
                  onClick={() => openUpgradeGroup("upgrades-group-maison")}
                >
                  Open Maison lane
                </button>
                <button
                  type="button"
                  className="secondary"
                  data-testid="upgrades-density-toggle"
                  aria-pressed={isCompactDensity}
                  onClick={toggleUpgradeDensity}
                >
                  Card density · {isCompactDensity ? "Compact" : "Expanded"}
                </button>
              </div>
              <p className="muted">
                Upgrades is the canonical hub for comparing and buying Collection, Atelier, and
                Maison improvements.
              </p>
            </div>
          </header>

          <section className="panel upgrades-group" aria-labelledby="upgrades-cash-title">
            <details
              className="upgrades-group-disclosure"
              data-testid="upgrades-group-collection"
              open
            >
              <summary className="upgrades-group-summary">
                <div>
                  <p className="eyebrow">Collection enjoyment</p>
                  <h3 id="upgrades-cash-title">Collection upgrades</h3>
                  <p className="muted">Spend cash to lift enjoyment growth with clear previews.</p>
                </div>
                <span className="upgrade-disclosure-hint">Expand/collapse</span>
              </summary>
              <div className="upgrades-group-content">
                <div
                  className="card-stack"
                  data-testid="upgrades-cash-list"
                  data-density={upgradeDensity}
                >
                  {collectionUpgradeCards.map((card) => {
                    const recommendation = recommendations.find(
                      (candidate) => candidate.key === card.key,
                    );
                    const isRecommended = recommendedKeys.has(card.key);
                    return (
                      <div
                        className={getUpgradeCardClassName(
                          card.status,
                          isRecommended,
                          isCompactDensity,
                        )}
                        key={card.upgrade.id}
                        data-testid="upgrade-card"
                        id={card.cardId}
                      >
                        <div className="card-header">
                          <div>
                            <h4>{card.upgrade.name}</h4>
                            <p>{card.upgrade.description}</p>
                          </div>
                          <div className="upgrade-card-meta">
                            <div className="muted">Level {card.level}</div>
                            <span className={`upgrade-status upgrade-status--${card.status}`}>
                              {isRecommended ? "Recommended" : UPGRADE_STATUS_LABELS[card.status]}
                            </span>
                          </div>
                        </div>
                        <p>
                          +{Math.round(card.upgrade.incomeMultiplierPerLevel * 100)}% enjoyment per
                          level
                        </p>
                        <p className="upgrade-intent-label">
                          Intent: {UPGRADE_INTENT_META[card.intent].label}
                        </p>
                        {renderDeltaChips(card.preview)}
                        {!isCompactDensity && renderImpactSummary(card.preview)}
                        {renderRoiSummary(
                          formatMoneyFromCents(card.price),
                          card.paybackSeconds,
                          card.status,
                          card.intent,
                        )}
                        {card.status === "actionable" && recommendation && (
                          <p className="upgrade-recommendation-note">
                            {getRecommendationReason(recommendation)}
                          </p>
                        )}
                        {!isCompactDensity && renderPreviewDetails(card.preview)}
                        {!card.unlocked && card.unlockDetail && (
                          <div data-testid={`locked-upgrade-hint-${card.upgrade.id}`}>
                            <UnlockHint
                              eyebrow="Locked"
                              title="Unlock requirement"
                              detail={card.unlockDetail.label}
                              currentLabel={card.unlockCurrentLabel}
                              thresholdLabel={card.unlockThresholdLabel}
                              ratio={card.unlockDetail.ratio}
                            />
                          </div>
                        )}
                        <div className="card-actions">
                          <button
                            type="button"
                            disabled={!card.canAfford || !card.unlocked}
                            onClick={() => onPurchase(buyUpgrade(state, card.upgrade.id))}
                          >
                            Upgrade ({formatMoneyFromCents(card.price)})
                          </button>
                          {!card.unlocked &&
                            card.upgrade.unlockMilestoneId &&
                            shouldShowUnlockTag(state, card.upgrade.unlockMilestoneId) && (
                              <div className="unlock-tag">
                                Unlocking soon {"->"}{" "}
                                {getMilestoneRequirementLabel(card.upgrade.unlockMilestoneId)}
                              </div>
                            )}
                        </div>
                        {!card.unlocked && card.unlockDetail && (
                          <p className="muted">
                            Blocked: {card.unlockDetail.label} ({card.unlockCurrentLabel} /{" "}
                            {card.unlockThresholdLabel}).
                          </p>
                        )}
                        {card.unlocked && !card.canAfford && (
                          <p className="muted">
                            Blocked: need {formatMoneyFromCents(card.cashDeficitCents)} more cash
                            (ETA {formatEtaLabel(card.cashAffordabilityEtaSeconds)}).
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          </section>

          <section className="panel upgrades-group" aria-labelledby="upgrades-workshop-title">
            <details className="upgrades-group-disclosure" data-testid="upgrades-group-workshop">
              <summary className="upgrades-group-summary">
                <div>
                  <p className="eyebrow">Atelier</p>
                  <h3 id="upgrades-workshop-title">Workshop upgrades</h3>
                  <p className="muted">Spend Blueprints to compound collection efficiency.</p>
                </div>
                <span className="upgrade-disclosure-hint">Expand/collapse</span>
              </summary>
              <div className="upgrades-group-content">
                <BlueprintCostDetail
                  detail={blueprintCostDetail}
                  tooltipContent={blueprintTooltip}
                  testId="upgrades-blueprint-cost"
                />
                <div
                  className="card-stack"
                  data-testid="upgrades-workshop-list"
                  data-density={upgradeDensity}
                >
                  {workshopUpgradeCards.map((card) => {
                    const recommendation = recommendations.find(
                      (candidate) => candidate.key === card.key,
                    );
                    const isRecommended = recommendedKeys.has(card.key);

                    return (
                      <div
                        className={getUpgradeCardClassName(
                          card.status,
                          isRecommended,
                          isCompactDensity,
                        )}
                        key={card.upgrade.id}
                        data-testid="workshop-upgrade-card"
                        id={card.cardId}
                      >
                        <div className="card-header">
                          <div>
                            <h4>{card.upgrade.name}</h4>
                            <p>{card.upgrade.description}</p>
                          </div>
                          <div className="upgrade-card-meta">
                            <div className="muted">
                              {card.owned ? "Owned" : `${card.upgrade.blueprintCost} Blueprints`}
                            </div>
                            <span className={`upgrade-status upgrade-status--${card.status}`}>
                              {isRecommended ? "Recommended" : UPGRADE_STATUS_LABELS[card.status]}
                            </span>
                          </div>
                        </div>
                        <p>{card.effectLabel}</p>
                        <p className="upgrade-intent-label">
                          Intent: {UPGRADE_INTENT_META[card.intent].label}
                        </p>
                        {renderDeltaChips(card.preview)}
                        {!isCompactDensity && renderImpactSummary(card.preview)}
                        {renderRoiSummary(
                          `${card.upgrade.blueprintCost} Blueprints`,
                          null,
                          card.status,
                          card.intent,
                        )}
                        {card.status === "actionable" && recommendation && (
                          <p className="upgrade-recommendation-note">
                            {getRecommendationReason(recommendation)}
                          </p>
                        )}
                        {renderEffectLines(card.effectLines)}
                        {!isCompactDensity && renderPreviewDetails(card.preview)}
                        <div className="card-actions">
                          <button
                            type="button"
                            className="secondary"
                            disabled={card.owned || !card.canAfford}
                            onClick={() => onPurchase(buyWorkshopUpgrade(state, card.upgrade.id))}
                          >
                            {card.owned
                              ? "Installed"
                              : `Buy (${card.upgrade.blueprintCost} Blueprints)`}
                          </button>
                        </div>
                        {card.owned ? (
                          <p className="muted">Installed: this Atelier upgrade is already active.</p>
                        ) : !card.canAfford ? (
                          <p className="muted">
                            Blocked: need {card.blueprintDeficit.toLocaleString()} more Blueprints.
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          </section>

          <section className="panel upgrades-group" aria-labelledby="upgrades-maison-title">
            <details className="upgrades-group-disclosure" data-testid="upgrades-group-maison">
              <summary className="upgrades-group-summary">
                <div>
                  <p className="eyebrow">Maison</p>
                  <h3 id="upgrades-maison-title">Maison upgrades</h3>
                  <p className="muted">Heritage and Reputation upgrades stack across prestiges.</p>
                </div>
                <span className="upgrade-disclosure-hint">Expand/collapse</span>
              </summary>
              <div className="upgrades-group-content">
                <div
                  className="card-stack"
                  data-testid="upgrades-maison-list"
                  data-density={upgradeDensity}
                >
                  {maisonUpgradeCards.map((card) => {
                    const recommendation = recommendations.find(
                      (candidate) => candidate.key === card.key,
                    );
                    const isRecommended = recommendedKeys.has(card.key);

                    return (
                      <div
                        className={getUpgradeCardClassName(
                          card.status,
                          isRecommended,
                          isCompactDensity,
                        )}
                        key={card.upgrade.id}
                        data-testid="maison-upgrade-card"
                        id={card.cardId}
                      >
                        <div className="card-header">
                          <div>
                            <h4>{card.upgrade.name}</h4>
                            <p>{card.upgrade.description}</p>
                          </div>
                          <div className="upgrade-card-meta">
                            <div className="muted">{card.owned ? "Owned" : card.costLabel}</div>
                            <span className={`upgrade-status upgrade-status--${card.status}`}>
                              {isRecommended ? "Recommended" : UPGRADE_STATUS_LABELS[card.status]}
                            </span>
                          </div>
                        </div>
                        <p>{card.effectLabel}</p>
                        <p className="upgrade-intent-label">
                          Intent: {UPGRADE_INTENT_META[card.intent].label}
                        </p>
                        {renderDeltaChips(card.preview)}
                        {!isCompactDensity && renderImpactSummary(card.preview)}
                        {renderRoiSummary(card.costLabel, null, card.status, card.intent)}
                        {card.status === "actionable" && recommendation && (
                          <p className="upgrade-recommendation-note">
                            {getRecommendationReason(recommendation)}
                          </p>
                        )}
                        {renderEffectLines(card.effectLines)}
                        {!isCompactDensity && renderPreviewDetails(card.preview)}
                        <div className="card-actions">
                          <button
                            type="button"
                            className="secondary"
                            disabled={card.owned || !card.canAfford}
                            onClick={() => onPurchase(buyMaisonUpgrade(state, card.upgrade.id))}
                          >
                            {card.owned ? "Installed" : `Buy (${card.costLabel})`}
                          </button>
                        </div>
                        {card.owned ? (
                          <p className="muted">Installed: this Maison upgrade is already active.</p>
                        ) : !card.canAfford ? (
                          <p className="muted">
                            Blocked: need {card.resourceDeficit.toLocaleString()} more{" "}
                            {card.resourceLabel}.
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          </section>
        </div>
      )}
    </section>
  );
}
