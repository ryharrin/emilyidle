import React from "react";

import {
  buyWorkshopUpgrade,
  canBuyWorkshopUpgrade,
  dismantleItem,
  getEnjoymentThresholdLabel,
  getItemCount,
  getWorkshopPrestigeThresholdCents,
  prestigeWorkshop,
} from "../../game/state";
import type {
  GameState,
  WatchItemDefinition,
  WatchItemId,
  WorkshopUpgradeDefinition,
} from "../../game/state";

type WorkshopTabProps = {
  isActive: boolean;
  state: GameState;
  showWorkshopSection: boolean;
  showWorkshopPanel: boolean;
  workshopPrestigeGain: number;
  workshopRevealProgress: number;
  workshopResetArmed: boolean;
  onToggleWorkshopResetArmed: (next: boolean) => void;
  canPrestigeWorkshop: boolean;
  onPurchase: (nextState: GameState) => void;
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
                            onPurchase(prestigeWorkshop(state, workshopPrestigeGain));
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
                        className="secondary"
                        disabled={!canPrestigeWorkshop}
                        onClick={() => onToggleWorkshopResetArmed(true)}
                      >
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
          <section className="panel workshop-crafting" data-testid="workshop-crafting">
            <h3>Crafting workshop</h3>
            <p className="muted">
              Break down watches into parts, then craft permanent vault boosts.
            </p>
            <div className="results-count" data-testid="workshop-crafting-parts">
              {craftingParts} parts
            </div>
            <div className="workshop-crafting-section" data-testid="workshop-dismantle">
              <p className="workshop-label">Dismantle watches</p>
              <p className="muted">Convert owned watches into parts for recipes.</p>
              <div className="card-stack" data-testid="workshop-dismantle-list">
                {watchItems.map((item) => {
                  const owned = getItemCount(state, item.id);
                  const partsPerWatch = craftingPartsPerWatch[item.id] ?? 0;
                  const canDismantle = owned > 0 && partsPerWatch > 0;
                  return (
                    <div
                      className="card"
                      key={item.id}
                      data-testid="workshop-dismantle-card"
                      data-item-id={item.id}
                    >
                      <div className="card-header">
                        <div>
                          <h4>{item.name}</h4>
                          <p>{partsPerWatch} parts per watch</p>
                        </div>
                        <div>{owned} owned</div>
                      </div>
                      <div className="card-actions">
                        <button
                          type="button"
                          className="secondary"
                          disabled={!canDismantle}
                          onClick={() => onPurchase(dismantleItem(state, item.id, 1))}
                        >
                          Dismantle
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="workshop-crafting-section">
              <p className="workshop-label">Recipes</p>
              {renderCraftingRecipes("workshop-crafting-recipes")}
            </div>
            <div className="workshop-crafting-section">
              <p className="workshop-label">Active boosts</p>
              {renderCraftingBoosts("workshop-crafting-boosts")}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
