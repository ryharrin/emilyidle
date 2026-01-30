import React from "react";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../game/format";
import {
  buyMaisonUpgrade,
  buyUpgrade,
  buyWorkshopUpgrade,
  canBuyMaisonUpgrade,
  canBuyUpgrade,
  canBuyWorkshopUpgrade,
  getEffectiveCashRateCentsPerSec,
  getEnjoymentRateCentsPerSec,
  getMilestoneRequirementLabel,
  getMilestoneUnlockProgressDetail,
  getUpgradePriceCents,
  isUpgradeUnlocked,
  shouldShowUnlockTag,
} from "../../game/state";
import type {
  GameState,
  MaisonUpgradeDefinition,
  UpgradeDefinition,
  WorkshopUpgradeDefinition,
} from "../../game/state";

import { UnlockHint } from "../components/UnlockHint";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";

type PurchaseMeta = {
  prestigeTier?: "workshop" | "maison" | "nostalgia";
};

type UpgradesTabProps = {
  isActive: boolean;
  state: GameState;
  currentEventMultiplier: number;
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

const buildRatePreview = (
  state: GameState,
  nextState: GameState,
  eventMultiplier: number,
): RatePreview => {
  const beforeCash = getEffectiveCashRateCentsPerSec(state, eventMultiplier);
  const afterCash = getEffectiveCashRateCentsPerSec(nextState, eventMultiplier);
  const beforeEnjoyment = getEnjoymentRateCentsPerSec(state) * eventMultiplier;
  const afterEnjoyment = getEnjoymentRateCentsPerSec(nextState) * eventMultiplier;

  return { beforeCash, afterCash, beforeEnjoyment, afterEnjoyment };
};

const formatDelta = (delta: number) =>
  `${delta >= 0 ? "+" : ""}${formatRateFromCentsPerSec(delta)}`;

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

const renderPreviewDetails = (preview: RatePreview) => (
  <details className="card upgrade-preview-details">
    <summary>Rate preview</summary>
    <div className="upgrade-preview-grid">
      <div>
        <p className="muted">Before</p>
        <p>Cash {formatRateFromCentsPerSec(preview.beforeCash)}</p>
        <p>Enjoyment {formatRateFromCentsPerSec(preview.beforeEnjoyment)}</p>
      </div>
      <div>
        <p className="muted">After</p>
        <p>Cash {formatRateFromCentsPerSec(preview.afterCash)}</p>
        <p>Enjoyment {formatRateFromCentsPerSec(preview.afterEnjoyment)}</p>
      </div>
    </div>
  </details>
);

export function UpgradesTab({
  isActive,
  state,
  currentEventMultiplier,
  upgrades,
  workshopUpgrades,
  maisonUpgrades,
  onPurchase,
}: UpgradesTabProps) {
  const formatCount = (value: number) => Math.floor(value).toLocaleString();

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
              <p className="eyebrow">Upgrades</p>
              <h2>Vault improvements</h2>
              <p className="muted">
                Compare rate changes before committing to vault, Atelier, or Maison upgrades.
              </p>
              <div className="inline-icon-button">
                <ExplainButton sectionId={HELP_SECTION_IDS.upgrades} label="Explain upgrades" />
                <span className="muted">Upgrade help</span>
              </div>
            </div>
          </header>

          <section className="panel upgrades-group" aria-labelledby="upgrades-cash-title">
            <header className="panel-header">
              <div>
                <p className="eyebrow">Vault enjoyment</p>
                <h3 id="upgrades-cash-title">Vault upgrades</h3>
                <p className="muted">Spend cash to lift enjoyment growth with clear previews.</p>
              </div>
            </header>
            <div className="card-stack" data-testid="upgrades-cash-list">
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
                const nextState = buyUpgrade(state, upgrade.id);
                const preview = buildRatePreview(state, nextState, currentEventMultiplier);

                return (
                  <div className="card upgrade-card" key={upgrade.id} data-testid="upgrade-card">
                    <div className="card-header">
                      <div>
                        <h4>{upgrade.name}</h4>
                        <p>{upgrade.description}</p>
                      </div>
                      <div className="muted">Level {level}</div>
                    </div>
                    <p>
                      +{Math.round(upgrade.incomeMultiplierPerLevel * 100)}% enjoyment per level
                    </p>
                    {renderDeltaChips(preview)}
                    {renderPreviewDetails(preview)}
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
          </section>

          <section className="panel upgrades-group" aria-labelledby="upgrades-workshop-title">
            <header className="panel-header">
              <div>
                <p className="eyebrow">Atelier</p>
                <h3 id="upgrades-workshop-title">Workshop upgrades</h3>
                <p className="muted">Spend Blueprints to compound vault efficiency.</p>
              </div>
            </header>
            <div className="card-stack" data-testid="upgrades-workshop-list">
              {workshopUpgrades.map((upgrade) => {
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
                const preview = buildRatePreview(state, nextState, currentEventMultiplier);

                return (
                  <div
                    className="card upgrade-card"
                    key={upgrade.id}
                    data-testid="workshop-upgrade-card"
                  >
                    <div className="card-header">
                      <div>
                        <h4>{upgrade.name}</h4>
                        <p>{upgrade.description}</p>
                      </div>
                      <div className="muted">
                        {owned ? "Owned" : `${upgrade.blueprintCost} Blueprints`}
                      </div>
                    </div>
                    <p>{effectLabel}</p>
                    {renderDeltaChips(preview)}
                    {renderPreviewDetails(preview)}
                    <div className="card-actions">
                      <button
                        type="button"
                        className="secondary"
                        disabled={owned || !canAfford}
                        onClick={() => onPurchase(buyWorkshopUpgrade(state, upgrade.id))}
                      >
                        {owned ? "Installed" : `Buy (${upgrade.blueprintCost} Blueprints)`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel upgrades-group" aria-labelledby="upgrades-maison-title">
            <header className="panel-header">
              <div>
                <p className="eyebrow">Maison</p>
                <h3 id="upgrades-maison-title">Maison upgrades</h3>
                <p className="muted">Heritage and Reputation upgrades stack across prestiges.</p>
              </div>
            </header>
            <div className="card-stack" data-testid="upgrades-maison-list">
              {maisonUpgrades.map((upgrade) => {
                const owned = state.maisonUpgrades[upgrade.id] ?? false;
                const canAfford = canBuyMaisonUpgrade(state, upgrade.id);
                const costLabel =
                  upgrade.currency === "heritage"
                    ? `${upgrade.cost} Heritage`
                    : `${upgrade.cost} Reputation`;
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
                const preview = buildRatePreview(state, nextState, currentEventMultiplier);

                return (
                  <div
                    className="card upgrade-card"
                    key={upgrade.id}
                    data-testid="maison-upgrade-card"
                  >
                    <div className="card-header">
                      <div>
                        <h4>{upgrade.name}</h4>
                        <p>{upgrade.description}</p>
                      </div>
                      <div className="muted">{owned ? "Owned" : costLabel}</div>
                    </div>
                    <p>{effectLabel}</p>
                    {renderDeltaChips(preview)}
                    {renderPreviewDetails(preview)}
                    <div className="card-actions">
                      <button
                        type="button"
                        className="secondary"
                        disabled={owned || !canAfford}
                        onClick={() => onPurchase(buyMaisonUpgrade(state, upgrade.id))}
                      >
                        {owned ? "Installed" : `Buy (${costLabel})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
