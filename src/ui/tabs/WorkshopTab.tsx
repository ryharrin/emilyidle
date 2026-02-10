import React from "react";

import { PrestigeIcon } from "../icons/coreIcons";
import { PrestigeSummary } from "../components/PrestigeSummary";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";
import { WorkshopCraftingSection } from "./WorkshopCraftingSection";
import { buildWorkshopPrestigeSummary } from "../prestigeSummary";
import { BlueprintCostDetail } from "../components/BlueprintCostDetail";
import { AnchoredTooltip, type AnchoredTooltipContent } from "../components/AnchoredTooltip";
import { buildBlueprintTooltip } from "../helpers/blueprintTooltip";

import {
  buyWorkshopUpgrade,
  canBuyWorkshopUpgrade,
  getEnjoymentThresholdLabel,
  getEnjoymentRateCentsPerSec,
  getPrestigeUnlockProgressDetail,
  getWorkshopBlueprintCostDetail,
  getWorkshopNextBlueprintProgress,
  getWorkshopPrestigeThresholdCents,
  getPrestigeLegacyMultiplierBreakdown,
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
  const nextBlueprintProgress = getWorkshopNextBlueprintProgress(state, Date.now());
  const blueprintCostDetail = getWorkshopBlueprintCostDetail(state);
  const blueprintTooltip = buildBlueprintTooltip(state, workshopPrestigeGain);
  const atelierBonus = getPrestigeLegacyMultiplierBreakdown(state);
  const [bonusTooltipOpen, setBonusTooltipOpen] = React.useState(false);
  const bonusAnchorRef = React.useRef<HTMLButtonElement | null>(null);
  const showBonusTooltip = React.useCallback(() => setBonusTooltipOpen(true), []);
  const hideBonusTooltip = React.useCallback(() => setBonusTooltipOpen(false), []);
  const bonusLines = React.useMemo(
    () =>
      atelierBonus.components.map((component) => {
        const percent = Math.round((component.value - 1) * 100);
        const percentLabel = percent >= 0 ? `+${percent}%` : `${percent}%`;
        return `${component.label}: ${percentLabel}`;
      }),
    [atelierBonus],
  );
  const bonusTooltipContent = React.useMemo<AnchoredTooltipContent>(
    () => ({
      title: `Atelier bonus ×${atelierBonus.multiplier01.toFixed(2)}`,
      description: bonusLines.join(" · "),
      meta: atelierBonus.capApplied ? "Capped at 10×" : undefined,
    }),
    [atelierBonus, bonusLines],
  );
  const etaLabel =
    nextBlueprintProgress.etaSeconds === null
      ? "ETA unavailable"
      : nextBlueprintProgress.etaSeconds < 60
        ? `${nextBlueprintProgress.etaSeconds}s`
        : `${Math.ceil(nextBlueprintProgress.etaSeconds / 60)}m`;
  const resetProgress = getPrestigeUnlockProgressDetail(state, "workshop");
  const enjoymentRate = getEnjoymentRateCentsPerSec(state);
  const resetEtaSeconds =
    enjoymentRate > 0
      ? Math.ceil(Math.max(0, resetProgress.threshold - resetProgress.current) / enjoymentRate)
      : null;
  const resetEtaLabel =
    resetEtaSeconds === null
      ? "ETA unavailable"
      : resetEtaSeconds < 60
        ? `${resetEtaSeconds}s`
        : `${Math.ceil(resetEtaSeconds / 60)}m`;
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
                      <div
                        className="surface-complication-strip workshop-complication-strip"
                        data-testid="workshop-complication-strip"
                      >
                        <article
                          className="surface-complication workshop-complication"
                          data-testid="workshop-complication-power-reserve"
                        >
                          <p className="surface-complication-label workshop-complication-label">
                            Power reserve
                          </p>
                          <p className="surface-complication-value workshop-complication-value">
                            {state.workshopBlueprints.toLocaleString()} banked
                          </p>
                          <p className="surface-complication-detail workshop-complication-detail">
                            Current gain +{workshopPrestigeGain} Blueprints
                          </p>
                        </article>
                        <article
                          className="surface-complication workshop-complication"
                          data-testid="workshop-complication-chronograph"
                        >
                          <p className="surface-complication-label workshop-complication-label">
                            Chronograph
                          </p>
                          <p className="surface-complication-value workshop-complication-value">
                            {Math.round(resetProgress.ratio * 100)}% ready
                          </p>
                          <p className="surface-complication-detail workshop-complication-detail">
                            Reset ETA {resetEtaLabel}
                          </p>
                        </article>
                        <article
                          className="surface-complication workshop-complication"
                          data-testid="workshop-complication-date-wheel"
                        >
                          <p className="surface-complication-label workshop-complication-label">
                            Date wheel
                          </p>
                          <p className="surface-complication-value workshop-complication-value">
                            {formatMoneyFromCents(nextBlueprintProgress.enjoymentRemainingCents)}
                          </p>
                          <p className="surface-complication-detail workshop-complication-detail">
                            Next blueprint ETA {etaLabel}
                          </p>
                        </article>
                        <article
                          className="surface-complication workshop-complication"
                          data-testid="workshop-complication-moonphase"
                        >
                          <p className="surface-complication-label workshop-complication-label">
                            Moonphase
                          </p>
                          <p className="surface-complication-value workshop-complication-value">
                            ×{atelierBonus.multiplier01.toFixed(2)}
                          </p>
                          <p className="surface-complication-detail workshop-complication-detail">
                            {atelierBonus.capApplied
                              ? "Atelier bonus cap active"
                              : "Atelier bonus live"}
                          </p>
                        </article>
                      </div>
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
                  <div
                    className="card workshop-recovery-guide"
                    data-testid="workshop-recovery-guide"
                  >
                    <h4>Recovery guide</h4>
                    <p className="muted">
                      Reset readiness {Math.round(resetProgress.ratio * 100)}% (
                      {formatMoneyFromCents(resetProgress.current)} /{" "}
                      {getEnjoymentThresholdLabel(resetProgress.threshold)}).
                    </p>
                    <p className="muted">
                      At current enjoyment pace, workshop reset recovery ETA: {resetEtaLabel}.
                    </p>
                    <p className="muted">Next blueprint ETA after rebuild: {etaLabel}.</p>
                  </div>
                  <BlueprintCostDetail
                    detail={blueprintCostDetail}
                    tooltipContent={blueprintTooltip}
                    testId="workshop-blueprint-cost"
                  />
                  <div className="workshop-bonus" data-testid="workshop-bonus">
                    <span className="workshop-label">Atelier bonus</span>
                    <button
                      type="button"
                      ref={bonusAnchorRef}
                      className="secondary small workshop-bonus-button"
                      onMouseEnter={showBonusTooltip}
                      onMouseLeave={hideBonusTooltip}
                      onFocus={showBonusTooltip}
                      onBlur={hideBonusTooltip}
                      aria-haspopup="true"
                      aria-expanded={bonusTooltipOpen}
                    >
                      ×{atelierBonus.multiplier01.toFixed(2)}
                    </button>
                    <AnchoredTooltip
                      open={bonusTooltipOpen}
                      anchorEl={bonusAnchorRef.current}
                      content={bonusTooltipContent}
                      preferredPlacement="bottom"
                      testId="workshop-bonus-tooltip"
                    />
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
                    <p className="muted workshop-persistence-copy">
                      Current run resources reset. Atelier upgrades, crafting progress, Maison
                      legacy, and Nostalgia progression carry forward.
                    </p>
                    {workshopResetArmed ? (
                      <div className="workshop-confirm meta-action-controls">
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
                          Keep current run
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
                        Review reset
                      </button>
                    )}
                    <p className="muted" aria-live="polite">
                      {workshopResetArmed
                        ? "Review Current run, Next run keeps, and Delta, then confirm reset."
                        : canPrestigeWorkshop
                          ? "Open reset review to compare what resets against what carries forward."
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
                  <p className="muted">Your collection is close to yielding Blueprints.</p>
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
