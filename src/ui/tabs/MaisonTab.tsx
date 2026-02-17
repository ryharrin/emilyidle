import React from "react";

import { PrestigeIcon } from "../icons/coreIcons";
import { PrestigeSummary } from "../components/PrestigeSummary";
import { PrestigeResetMatrix } from "../components/PrestigeResetMatrix";
import { buildMaisonPrestigeSummary } from "../prestigeSummary";

import {
  getAffordabilityEtaSecondsForDeficit,
  buyMaisonUpgrade,
  canBuyMaisonUpgrade,
  getEnjoymentThresholdLabel,
  getEnjoymentRateCentsPerSec,
  getMaisonPrestigeThresholdCents,
  getPrestigeUnlockProgressDetail,
  getResourceDeficit,
  prestigeMaison,
} from "../../game/state";
import type { GameState, MaisonUpgradeDefinition } from "../../game/state";
import { formatMoneyFromCents } from "../../game/format";

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

type PurchaseMeta = {
  prestigeTier?: "workshop" | "maison" | "nostalgia";
};

type MaisonTabProps = {
  isActive: boolean;
  state: GameState;
  showMaisonSection: boolean;
  showMaisonPanel: boolean;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
  maisonPrestigeGain: number;
  maisonReputationGain: number;
  maisonRevealProgress: number;
  maisonResetArmed: boolean;
  onToggleMaisonResetArmed: (next: boolean) => void;
  canPrestigeMaison: boolean;
  onPurchase: (nextState: GameState, meta?: PurchaseMeta) => void;
  maisonUpgrades: ReadonlyArray<MaisonUpgradeDefinition>;
};

export function MaisonTab({
  isActive,
  state,
  showMaisonSection,
  showMaisonPanel,
  onNavigate,
  maisonPrestigeGain,
  maisonReputationGain,
  maisonRevealProgress,
  maisonResetArmed,
  onToggleMaisonResetArmed,
  canPrestigeMaison,
  onPurchase,
  maisonUpgrades,
}: MaisonTabProps) {
  const resetProgress = getPrestigeUnlockProgressDetail(state, "maison");
  const enjoymentRate = getEnjoymentRateCentsPerSec(state);
  const resetDeficitCents = getResourceDeficit(resetProgress.threshold, resetProgress.current);
  const resetEtaSeconds = getAffordabilityEtaSecondsForDeficit(resetDeficitCents, enjoymentRate);
  const resetEtaLabel =
    resetEtaSeconds === null
      ? "ETA unavailable"
      : resetEtaSeconds < 60
        ? `${resetEtaSeconds}s`
        : `${Math.ceil(resetEtaSeconds / 60)}m`;

  return (
    <section id="maison" role="tabpanel" aria-labelledby="maison-tab" hidden={!isActive}>
      {isActive && (
        <>
          {showMaisonSection && (
            <section
              className={`panel maison-panel ${showMaisonPanel ? "" : "panel-teaser"}`}
              data-testid="maison-panel"
              aria-labelledby="maison-title"
            >
              {showMaisonPanel ? (
                <>
                  <header className="panel-header">
                    <div>
                      <p className="eyebrow">Meta progression</p>
                      <h3 id="maison-title">Maison</h3>
                      <p className="muted">
                        Prestige the atelier to earn Heritage and strengthen long-term enjoyment.
                      </p>
                      <div
                        className="surface-complication-strip maison-complication-strip"
                        data-testid="maison-complication-strip"
                      >
                        <article
                          className="surface-complication maison-complication"
                          data-testid="maison-complication-power-reserve"
                        >
                          <p className="surface-complication-label maison-complication-label">
                            Power reserve · Heritage bank
                          </p>
                          <p className="surface-complication-value maison-complication-value">
                            {state.maisonHeritage.toLocaleString()} Heritage
                          </p>
                          <p className="surface-complication-detail maison-complication-detail">
                            Current gain +{maisonPrestigeGain}
                          </p>
                        </article>
                        <article
                          className="surface-complication maison-complication"
                          data-testid="maison-complication-chronograph"
                        >
                          <p className="surface-complication-label maison-complication-label">
                            Chronograph · Reputation bank
                          </p>
                          <p className="surface-complication-value maison-complication-value">
                            {state.maisonReputation.toLocaleString()} Reputation
                          </p>
                          <p className="surface-complication-detail maison-complication-detail">
                            Legacy credit +{maisonReputationGain}
                          </p>
                        </article>
                        <article
                          className="surface-complication maison-complication"
                          data-testid="maison-complication-date-wheel"
                        >
                          <p className="surface-complication-label maison-complication-label">
                            Date wheel · Reset readiness
                          </p>
                          <p className="surface-complication-value maison-complication-value">
                            {Math.round(resetProgress.ratio * 100)}% ready
                          </p>
                          <p className="surface-complication-detail maison-complication-detail">
                            Recovery ETA {resetEtaLabel}
                          </p>
                        </article>
                        <article
                          className="surface-complication maison-complication"
                          data-testid="maison-complication-moonphase"
                        >
                          <p className="surface-complication-label maison-complication-label">
                            Moonphase · Reset threshold
                          </p>
                          <p className="surface-complication-value maison-complication-value">
                            {getEnjoymentThresholdLabel(getMaisonPrestigeThresholdCents())}
                          </p>
                          <p className="surface-complication-detail maison-complication-detail">
                            Maison reset threshold
                          </p>
                        </article>
                      </div>
                    </div>
                    <div className="results-count" data-testid="maison-balance">
                      {state.maisonHeritage.toLocaleString()} Heritage ·{" "}
                      {state.maisonReputation.toLocaleString()} Reputation
                    </div>
                  </header>
                  <div
                    className="workshop-reset maison-reset"
                    data-testid="maison-reset"
                    id="maison-reset"
                  >
                    <div>
                      <p className="workshop-label">Reset threshold</p>
                      <p className="workshop-value">
                        {getEnjoymentThresholdLabel(getMaisonPrestigeThresholdCents())}
                      </p>
                    </div>
                    <div>
                      <p className="workshop-label">Current gain</p>
                      <p className="workshop-value">+{maisonPrestigeGain} Heritage</p>
                    </div>
                    <div>
                      <p className="workshop-label">Legacy credit</p>
                      <p className="workshop-value">+{maisonReputationGain} Reputation</p>
                    </div>
                  </div>
                  <div className="card workshop-recovery-guide" data-testid="maison-recovery-guide">
                    <h4>Recovery guide</h4>
                    <p className="muted">
                      Reset readiness {Math.round(resetProgress.ratio * 100)}% (
                      {formatMoneyFromCents(resetProgress.current)} /{" "}
                      {getEnjoymentThresholdLabel(resetProgress.threshold)}).
                    </p>
                    <p className="muted">
                      At current enjoyment pace, maison reset recovery ETA: {resetEtaLabel}.
                    </p>
                  </div>
                  <p className="muted maison-reset-detail">
                    Resets Collection + Atelier progress. Maison lines remain active.
                  </p>
                  <div className="card-actions" data-testid="maison-handoff-actions">
                    <button
                      type="button"
                      className="secondary"
                      data-testid="maison-open-catalog"
                      onClick={() => onNavigate("catalog", "catalog-shop")}
                    >
                      Open Catalog shop
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      data-testid="maison-open-upgrades-hub"
                      onClick={() => onNavigate("upgrades")}
                    >
                      Open Upgrades hub
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      data-testid="maison-open-lines"
                      onClick={() => onNavigate("collection", "collection-maison-lines")}
                    >
                      Open Maison lines in Collection
                    </button>
                  </div>
                  <fieldset className="workshop-cta">
                    <legend className="visually-hidden">Reset atelier</legend>
                    <p className="muted workshop-persistence-copy">
                      Collection and Atelier run-state reset. Maison legacy, Nostalgia progression,
                      and catalog achievements carry forward.
                    </p>
                    <PrestigeResetMatrix
                      testId="maison-reset-matrix"
                      resets={[
                        "Collection run cash, enjoyment, and owned watches",
                        "Atelier run-state progress and current loop momentum",
                        "Short-term run automation momentum",
                      ]}
                      carries={[
                        "Maison Heritage and Reputation",
                        "Maison upgrades and Maison lines",
                        "Nostalgia progression and catalog achievements",
                      ]}
                    />
                    {maisonResetArmed ? (
                      <div className="workshop-confirm meta-action-controls">
                        <button
                          type="button"
                          disabled={!canPrestigeMaison}
                          onClick={() => {
                            if (!canPrestigeMaison) {
                              return;
                            }
                            onPurchase(prestigeMaison(state), { prestigeTier: "maison" });
                            onToggleMaisonResetArmed(false);
                          }}
                        >
                          Confirm reset
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onToggleMaisonResetArmed(false)}
                        >
                          Keep current run
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`${canPrestigeMaison ? "" : "secondary "}inline-icon-button`}
                        disabled={!canPrestigeMaison}
                        onClick={() => onToggleMaisonResetArmed(true)}
                      >
                        <PrestigeIcon className="inline-icon" />
                        Review reset
                      </button>
                    )}
                    <p className="muted" aria-live="polite">
                      {maisonResetArmed
                        ? "Review Current run, Next run keeps, and Delta, then confirm reset."
                        : canPrestigeMaison
                          ? "Open reset checklist to compare what resets against what carries forward."
                          : `Blocked: need ${formatMoneyFromCents(resetDeficitCents)} more enjoyment-equivalent progress (ETA ${resetEtaLabel}).`}
                    </p>
                  </fieldset>

                  {maisonResetArmed && (
                    <PrestigeSummary
                      summary={buildMaisonPrestigeSummary(maisonPrestigeGain, maisonReputationGain)}
                      testId="maison-prestige-summary"
                    />
                  )}

                  <div className="workshop-upgrades">
                    <h4>Maison upgrades</h4>
                    <div className="card-stack">
                      {maisonUpgrades.map((upgrade) => {
                        const owned = state.maisonUpgrades[upgrade.id] ?? false;
                        const canAfford = canBuyMaisonUpgrade(state, upgrade.id);
                        const currentResource =
                          upgrade.currency === "heritage"
                            ? state.maisonHeritage
                            : state.maisonReputation;
                        const resourceDeficit = Math.max(0, upgrade.cost - currentResource);
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

                        return (
                          <div
                            className="card workshop-upgrade-card"
                            key={upgrade.id}
                            data-testid="maison-upgrade-card"
                          >
                            <div className="card-header">
                              <div>
                                <h3>{upgrade.name}</h3>
                                <p>{upgrade.description}</p>
                              </div>
                              <div>{owned ? "Owned" : costLabel}</div>
                            </div>
                            <p>{effectLabel}</p>
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
                            {owned ? (
                              <p className="muted">
                                Installed: this Maison upgrade is already active.
                              </p>
                            ) : !canAfford ? (
                              <p className="muted">
                                Blocked: need {resourceDeficit.toLocaleString()} more{" "}
                                {upgrade.currency === "heritage" ? "Heritage" : "Reputation"}.
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="panel-teaser-content" data-testid="maison-teaser">
                  <p className="eyebrow">Meta progression</p>
                  <h3>Maison</h3>
                  <p className="muted">Your maison is almost ready for legacy prestige.</p>
                  <div className="teaser-progress">
                    <div className="teaser-track">
                      <div
                        className="teaser-fill"
                        style={{ width: `${Math.round(maisonRevealProgress * 100)}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(maisonRevealProgress * 100)}% to Maison reset</span>
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </section>
  );
}
