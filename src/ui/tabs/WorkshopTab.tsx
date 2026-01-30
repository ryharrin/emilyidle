import React from "react";

import { PrestigeIcon } from "../icons/coreIcons";
import { PrestigeSummary } from "../components/PrestigeSummary";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { WorkshopCraftingSection } from "./WorkshopCraftingSection";
import { buildWorkshopPrestigeSummary } from "../prestigeSummary";

import {
  buyWorkshopUpgrade,
  canBuyWorkshopUpgrade,
  getEnjoymentThresholdLabel,
  getWorkshopNextBlueprintProgress,
  getWorkshopPrestigeThresholdCents,
  prestigeWorkshop,
} from "../../game/state";
import { formatMoneyFromCents } from "../../game/format";
import type {
  GameState,
  WatchItemDefinition,
  WatchItemId,
  WorkshopUpgradeDefinition,
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

type PurchaseMeta = {
  prestigeTier?: "workshop" | "maison" | "nostalgia";
};

type WorkshopTabProps = {
  isActive: boolean;
  state: GameState;
  showWorkshopSection: boolean;
  showWorkshopPanel: boolean;
  onNavigate: (tabId: TabId, scrollTargetId?: string) => void;
  workshopPrestigeGain: number;
  workshopRevealProgress: number;
  workshopResetArmed: boolean;
  onToggleWorkshopResetArmed: (next: boolean) => void;
  canPrestigeWorkshop: boolean;
  onPurchase: (nextState: GameState, meta?: PurchaseMeta) => void;
  workshopUpgrades: ReadonlyArray<WorkshopUpgradeDefinition>;
  craftingParts: number;
  watchItems: ReadonlyArray<WatchItemDefinition>;
  craftingPartsPerWatch: Record<WatchItemId, number>;
  renderCraftingRecipes: (testId: string) => React.ReactNode;
  renderCraftingBoosts: (testId: string) => React.ReactNode;
};

export function WorkshopTab({
  isActive,
  state,
  showWorkshopSection,
  showWorkshopPanel,
  workshopPrestigeGain,
  workshopRevealProgress,
  workshopResetArmed,
  onToggleWorkshopResetArmed,
  canPrestigeWorkshop,
  onPurchase,
  workshopUpgrades,
  craftingParts,
  watchItems,
  craftingPartsPerWatch,
  renderCraftingRecipes,
  renderCraftingBoosts,
}: WorkshopTabProps) {
  const nextBlueprintProgress = getWorkshopNextBlueprintProgress(state);
  const etaLabel =
    nextBlueprintProgress.etaSeconds === null
      ? "ETA unavailable"
      : nextBlueprintProgress.etaSeconds < 60
        ? `${nextBlueprintProgress.etaSeconds}s`
        : `${Math.ceil(nextBlueprintProgress.etaSeconds / 60)}m`;
  return (
    <section id="workshop" role="tabpanel" aria-labelledby="workshop-tab" hidden={!isActive}>
      {isActive && (
        <div className="workshop-layout">
          {showWorkshopSection && (
            <section
              className={`panel workshop-panel ${showWorkshopPanel ? "" : "panel-teaser"}`}
              data-testid="workshop-panel"
              aria-labelledby="workshop-title"
            >
              {showWorkshopPanel ? (
                <>
                  <header className="panel-header">
                    <div>
                      <p className="eyebrow">Reset loop</p>
                      <h3 id="workshop-title">Atelier</h3>
                      <p className="muted">Trade enjoyment for Blueprints and permanent boosts.</p>
                    </div>
                    <div className="results-count" data-testid="workshop-balance">
                      {state.workshopBlueprints.toLocaleString()} Blueprints
                    </div>
                  </header>
                  <div className="workshop-reset" data-testid="workshop-reset">
                    <div>
                      <p className="workshop-label">Reset threshold</p>
                      <p className="workshop-value">
                        {getEnjoymentThresholdLabel(getWorkshopPrestigeThresholdCents())}
                      </p>
                    </div>
                    <div>
                      <p className="workshop-label">Current gain</p>
                      <p className="workshop-value">+{workshopPrestigeGain} Blueprints</p>
                    </div>
                    <div>
                      <p className="workshop-label">Next blueprint</p>
                      <p className="workshop-value">
                        {formatMoneyFromCents(nextBlueprintProgress.enjoymentRemainingCents)}{" "}
                        enjoyment remaining
                      </p>
                      <p className="muted">
                        {etaLabel} · Cash during ETA{" "}
                        {formatMoneyFromCents(nextBlueprintProgress.cashEarnedDuringEtaCents)}
                      </p>
                    </div>
                  </div>
                  <div className="inline-icon-button">
                    <ExplainButton
                      sectionId={HELP_SECTION_IDS.atelierReset}
                      label="Explain Atelier reset"
                    />
                    <span className="muted">Faster run: Atelier upgrades + Prestige legacy.</span>
                  </div>
                  <fieldset className="workshop-cta">
                    <legend className="visually-hidden">Reset atelier</legend>
                    {workshopResetArmed ? (
                      <div className="workshop-confirm">
                        <button
                          type="button"
                          disabled={!canPrestigeWorkshop}
                          onClick={() => {
                            if (!canPrestigeWorkshop) {
                              return;
                            }
                            onPurchase(prestigeWorkshop(state, workshopPrestigeGain), {
                              prestigeTier: "workshop",
                            });
                            onToggleWorkshopResetArmed(false);
                          }}
                        >
                          Confirm reset
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onToggleWorkshopResetArmed(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`${canPrestigeWorkshop ? "" : "secondary "}inline-icon-button`}
                        disabled={!canPrestigeWorkshop}
                        onClick={() => onToggleWorkshopResetArmed(true)}
                      >
                        <PrestigeIcon className="inline-icon" />
                        Reset atelier
                      </button>
                    )}
                    <p className="muted" aria-live="polite">
                      {workshopResetArmed
                        ? "Confirming will reset progress and grant Blueprints."
                        : canPrestigeWorkshop
                          ? "Resetting trades your enjoyment for Blueprints and permanent boosts."
                          : "Requires reaching the enjoyment threshold."}
                    </p>
                  </fieldset>

                  {workshopResetArmed && (
                    <PrestigeSummary
                      summary={buildWorkshopPrestigeSummary(workshopPrestigeGain)}
                      testId="workshop-prestige-summary"
                    />
                  )}

                  <div className="workshop-upgrades">
                    <h4>Upgrades</h4>
                    <div className="card-stack">
                      {workshopUpgrades.map((upgrade) => {
                        const owned = state.workshopUpgrades[upgrade.id] ?? false;
                        const canAfford = canBuyWorkshopUpgrade(state, upgrade.id);
                        const effectLabel = (() => {
                          if (upgrade.incomeMultiplier) {
                            return `+${Math.round((upgrade.incomeMultiplier - 1) * 100)}% cash`;
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

                        return (
                          <div
                            className="card workshop-upgrade-card"
                            key={upgrade.id}
                            data-testid="workshop-upgrade-card"
                          >
                            <div className="card-header">
                              <div>
                                <h3>{upgrade.name}</h3>
                                <p>{upgrade.description}</p>
                              </div>
                              <div>{owned ? "Owned" : `${upgrade.blueprintCost} Blueprints`}</div>
                            </div>
                            <p>{effectLabel}</p>
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
                  </div>
                </>
              ) : (
                <div className="panel-teaser-content" data-testid="workshop-teaser">
                  <p className="eyebrow">Reset loop</p>
                  <h3>Atelier</h3>
                  <p className="muted">Your vault is close to yielding Blueprints.</p>
                  <div className="teaser-progress">
                    <div className="teaser-track">
                      <div
                        className="teaser-fill"
                        style={{ width: `${Math.round(workshopRevealProgress * 100)}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(workshopRevealProgress * 100)}% to first reset</span>
                  </div>
                </div>
              )}
            </section>
          )}
          <WorkshopCraftingSection
            state={state}
            showWorkshopPanel={showWorkshopPanel}
            craftingParts={craftingParts}
            watchItems={watchItems}
            craftingPartsPerWatch={craftingPartsPerWatch}
            onPurchase={onPurchase}
            renderCraftingRecipes={renderCraftingRecipes}
            renderCraftingBoosts={renderCraftingBoosts}
          />
        </div>
      )}
    </section>
  );
}
