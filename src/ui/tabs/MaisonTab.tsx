import React from "react";

import {
  buyMaisonUpgrade,
  canBuyMaisonUpgrade,
  getEnjoymentThresholdLabel,
  getMaisonPrestigeThresholdCents,
  prestigeMaison,
} from "../../game/state";
import type { GameState, MaisonUpgradeDefinition } from "../../game/state";

type MaisonTabProps = {
  isActive: boolean;
  state: GameState;
  showMaisonSection: boolean;
  showMaisonPanel: boolean;
  maisonPrestigeGain: number;
  maisonReputationGain: number;
  maisonRevealProgress: number;
  maisonResetArmed: boolean;
  onToggleMaisonResetArmed: (next: boolean) => void;
  canPrestigeMaison: boolean;
  onPurchase: (nextState: GameState) => void;
  maisonUpgrades: ReadonlyArray<MaisonUpgradeDefinition>;
};

export function MaisonTab({
  isActive,
  state,
  showMaisonSection,
  showMaisonPanel,
  maisonPrestigeGain,
  maisonReputationGain,
  maisonRevealProgress,
  maisonResetArmed,
  onToggleMaisonResetArmed,
  canPrestigeMaison,
  onPurchase,
  maisonUpgrades,
}: MaisonTabProps) {
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
                    </div>
                    <div className="results-count" data-testid="maison-balance">
                      {state.maisonHeritage.toLocaleString()} Heritage ·{" "}
                      {state.maisonReputation.toLocaleString()} Reputation
                    </div>
                  </header>
                  <div className="workshop-reset maison-reset" data-testid="maison-reset">
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
                  <p className="muted maison-reset-detail">
                    Resets Collection + Atelier progress. Maison lines remain active.
                  </p>
                  <fieldset className="workshop-cta">
                    <legend className="visually-hidden">Reset atelier</legend>
                    {maisonResetArmed ? (
                      <div className="workshop-confirm">
                        <button
                          type="button"
                          disabled={!canPrestigeMaison}
                          onClick={() => {
                            if (!canPrestigeMaison) {
                              return;
                            }
                            onPurchase(prestigeMaison(state));
                            onToggleMaisonResetArmed(false);
                          }}
                        >
                          Confirm prestige
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onToggleMaisonResetArmed(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="secondary"
                        disabled={!canPrestigeMaison}
                        onClick={() => onToggleMaisonResetArmed(true)}
                      >
                        Prestige atelier
                      </button>
                    )}
                    <p className="muted" aria-live="polite">
                      {maisonResetArmed
                        ? "Confirming resets Collection + Atelier and grants Heritage & Reputation."
                        : canPrestigeMaison
                          ? "Prestiging converts your enjoyment engine into Maison legacy."
                          : "Requires reaching the enjoyment threshold."}
                    </p>
                  </fieldset>
                  <div className="workshop-upgrades">
                    <h4>Maison upgrades</h4>
                    <div className="card-stack">
                      {maisonUpgrades.map((upgrade) => {
                        const owned = state.maisonUpgrades[upgrade.id] ?? false;
                        const canAfford = canBuyMaisonUpgrade(state, upgrade.id);
                        const costLabel =
                          upgrade.currency === "heritage"
                            ? `${upgrade.cost} Heritage`
                            : `${upgrade.cost} Reputation`;
                        const effectLabel = (() => {
                          if (upgrade.incomeMultiplier) {
                            return `+${Math.round((upgrade.incomeMultiplier - 1) * 100)}% cash`;
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
