import React from "react";

import { EmptyStateCTA } from "../../components/EmptyStateCTA";
import { UnlockHint } from "../../components/UnlockHint";
import { PowerReserveHint } from "../../components/PowerReserveHint";
import { TierBadge } from "../../components/TierBadge";
import { LockIcon } from "../../icons/coreIcons";
import { CatalogPurchaseGate } from "../../components/catalog/CatalogPurchaseGate";
import { ExplainButton } from "../../help/ExplainButton";
import { HELP_SECTION_IDS } from "../../help/helpContent";
import { formatMoneyFromCents } from "../../../game/format";
import {
  getCatalogFallbackImageUrl,
  getCatalogImageUrl,
  getWatchModelTierBadge,
  type CatalogEntry,
} from "../../../game/catalog";
import type { CatalogTierId } from "../../../game/model/types";
import {
  getWatchModelOwnedCount,
  getWatchModelPurchaseGate,
  getWatchModelTierId,
  isItemUnlocked,
  getNextDuplicateRewardMultiplier,
  getInteractionMovementGate,
  getInteractionCooldownRemainingMs,
  toggleWatchFavorite,
  setWornWatchId,
  dismantleWatchModel,
  buyWatchModelWithUndo,
  getMilestoneUnlockProgressDetail,
  getWatchItems,
  type GameState,
  type WatchItemId,
} from "../../../game/state";
import {
  buildCatalogDecisionInfo,
  CatalogDetailsContent,
  type CatalogDecisionInfo,
} from "./CatalogDetailsContent";
import { formatEtaLabel, getGateEtaLabel } from "./catalogPresentation";

export interface CatalogCardProps {
  entry: CatalogEntry;
  state: GameState;
  isCompact: boolean;
  isExpertMode: boolean;
  isHighlighted: boolean;
  isExpanded: boolean;
  isDetailsOpen: boolean;
  isFavorite: boolean;
  showFacts: boolean;
  nowMs?: number;
  effectiveCashRateCentsPerSec: number;
  effectiveEnjoymentRateCentsPerSec: number;
  craftingPartsPerWatch: Record<string, number>;
  atelierUnlocked: boolean;
  onPurchase: (nextState: GameState) => void;
  onToggleExpand: (isOpen: boolean) => void;
  onOpenDetails: (trigger: HTMLButtonElement | null) => void;
  onInteract?: (itemId: WatchItemId) => void;
}

export function CatalogCard({
  entry,
  state,
  isCompact,
  isExpertMode,
  isHighlighted,
  isExpanded,
  isDetailsOpen,
  isFavorite,
  showFacts,
  nowMs,
  effectiveCashRateCentsPerSec,
  effectiveEnjoymentRateCentsPerSec,
  craftingPartsPerWatch,
  atelierUnlocked,
  onPurchase,
  onToggleExpand,
  onOpenDetails,
  onInteract,
}: CatalogCardProps): React.ReactElement {
  const watchItems = React.useMemo(() => getWatchItems(), []);
  const watchItemById = React.useMemo(
    () => new Map(watchItems.map((item) => [item.id, item])),
    [watchItems],
  );

  const tierId = getWatchModelTierId(entry.id);
  const tierItem = watchItemById.get(tierId);
  const tierBadge = getWatchModelTierBadge(entry.id);
  const ownedCount = getWatchModelOwnedCount(state, entry.id);
  const isWorn = state.wornWatchId === entry.id;
  const canWear = ownedCount > 0 && !isWorn;

  const unlocked = isItemUnlocked(state, tierId);
  const unlockMilestoneId = tierItem?.unlockMilestoneId;
  const unlockDetail = unlockMilestoneId
    ? getMilestoneUnlockProgressDetail(state, unlockMilestoneId)
    : null;
  const unlockUsesCents = unlockMilestoneId === "showcase";

  const gate = getWatchModelPurchaseGate(state, entry.id);
  const isActionable = unlocked && gate.ok;
  const hasAffordabilityHighlight = ownedCount === 0 && isActionable;
  const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entry.id);
  const buyLabel = ownedCount > 0 ? "Buy another" : "Buy";

  // Movement gate for interactions
  const movementGate = getInteractionMovementGate(tierId);
  const movementReason = ownedCount > 0 ? (movementGate.reason ?? null) : null;
  const interactionLabel =
    tierItem?.movement === "manual"
      ? "Wind crown"
      : tierItem?.movement === "automatic"
        ? "Charge rotor"
        : "Set time";

  const cooldownRemainingMs =
    typeof nowMs === "number" ? getInteractionCooldownRemainingMs(state, tierId, nowMs) : 0;
  const cooldownSeconds = Math.ceil(cooldownRemainingMs / 1_000);
  const interactionHint =
    movementReason ??
    (ownedCount <= 0
      ? "Own one to interact"
      : cooldownSeconds > 0
        ? `Cooldown ${cooldownSeconds}s`
        : null);
  const canInteract = movementGate.available && interactionHint === null;
  const canShowInteract = Boolean(onInteract) && typeof nowMs === "number";

  // Dismantle
  const hasCraftingParts = (craftingPartsPerWatch[tierId] ?? 0) > 0;
  const canDismantle = ownedCount > 1 && hasCraftingParts;
  const showDismantleAction = atelierUnlocked && hasCraftingParts;

  const formatCount = (value: number) => Math.floor(value).toLocaleString();

  const gateEtaLabel = getGateEtaLabel(
    gate,
    effectiveCashRateCentsPerSec,
    effectiveEnjoymentRateCentsPerSec,
  );

  // Build decision info
  const decisionInfo = React.useMemo((): CatalogDecisionInfo => {
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

    return buildCatalogDecisionInfo({
      tierId,
      movement: tierItem?.movement,
      unlocked,
      ownedCount,
      unlockRequirementLabel: unlockDetail?.label ?? null,
      unlockProgressLabel: unlockDetail ? `${unlockCurrentLabel} / ${unlockThresholdLabel}` : null,
      gateReady: gate.ok,
      gateEtaLabel,
      duplicateMultiplier,
    });
  }, [
    tierId,
    tierItem?.movement,
    unlocked,
    ownedCount,
    unlockDetail,
    unlockUsesCents,
    gate.ok,
    gateEtaLabel,
    duplicateMultiplier,
  ]);

  // Tags
  const tags = React.useMemo(
    () => [
      ...(entry.movementType ? [entry.movementType] : []),
      ...(entry.windingSystem ? [entry.windingSystem] : []),
      ...(entry.tags ?? []),
    ],
    [entry],
  );

  const handlePurchase = React.useCallback(() => {
    const effectiveNowMs = typeof nowMs === "number" ? nowMs : Date.now();
    onPurchase(buyWatchModelWithUndo(state, entry.id, effectiveNowMs));
  }, [entry.id, nowMs, onPurchase, state]);

  const showInlineSecondaryActions = !isCompact;
  const showExpertCardDetails = !isCompact && isExpertMode;
  const showSecondaryActions = showInlineSecondaryActions;
  const showExpertSecondaryActions = showInlineSecondaryActions && isExpertMode;

  return (
    <article
      className={`catalog-card catalog-discovered ${isHighlighted ? "purchase-flash" : ""} ${
        hasAffordabilityHighlight ? "catalog-actionable" : ""
      } ${isActionable ? "" : "catalog-nonactionable"} ${
        isCompact ? "catalog-card-compact" : "catalog-card-expanded"
      }`}
      data-testid="catalog-card"
    >
      <div className="catalog-media">
        <img
          src={getCatalogImageUrl(entry)}
          alt={`${entry.brand} ${entry.model}`}
          loading="lazy"
          onError={(event) => {
            const target = event.currentTarget;
            const tierFallback = getCatalogFallbackImageUrl(entry);
            const finalFallback =
              "data:image/svg+xml;utf8," +
              encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='480'>` +
                  `<defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#161b24'/><stop offset='1' stop-color='#0f131b'/></linearGradient></defs>` +
                  `<rect width='100%' height='100%' fill='url(#bg)'/>` +
                  `<path d='M126 294c42-68 94-112 194-112s152 44 194 112' stroke='#3a4150' stroke-width='10' fill='none' stroke-linecap='round'/>` +
                  `<circle cx='320' cy='252' r='68' fill='none' stroke='#3a4150' stroke-width='9'/>` +
                  `<rect x='248' y='354' width='144' height='28' rx='14' fill='rgba(232,198,147,0.12)' stroke='rgba(232,198,147,0.35)'/>` +
                  `<text x='320' y='372' dominant-baseline='middle' text-anchor='middle' fill='#d5c4a8' font-size='16' font-family='Arial, sans-serif'>Reference pending</text>` +
                  `</svg>`,
              );

            if (target.dataset.fallbackStage !== "tier") {
              target.dataset.fallbackStage = "tier";
              target.src = tierFallback;
              return;
            }

            target.dataset.fallbackStage = "final";
            target.src = finalFallback;
          }}
        />
      </div>
      <div className="catalog-content">
        <div className="catalog-title">
          <div className="catalog-title-primary">
            {tierBadge && (
              <TierBadge
                tier={tierBadge.category}
                showLabel
                label={tierBadge.label}
                description={tierBadge.description}
                backgroundVar={tierBadge.backgroundVar}
                textVar={tierBadge.textVar}
              />
            )}
            <div>
              <p className="catalog-brand">{entry.brand}</p>
              <h3>{entry.model}</h3>
            </div>
          </div>
          <p className="catalog-year">{entry.year}</p>
        </div>

        {showExpertCardDetails && (
          <details
            className="catalog-details"
            open={isExpanded}
            onToggle={(event) => onToggleExpand(event.currentTarget.open)}
            data-testid="catalog-details"
          >
            <summary>Details</summary>
            <CatalogDetailsContent
              entry={entry}
              tags={tags}
              showFacts={showFacts}
              decisionInfo={decisionInfo}
              viewMode={isExpertMode ? "expert" : "novice"}
            />
          </details>
        )}

        {!unlocked && unlockDetail && (
          <div data-testid={`locked-item-hint-${entry.id}`}>
            <UnlockHint
              eyebrow="Locked"
              title="Unlock requirement"
              detail={unlockDetail.label}
              currentLabel={
                unlockUsesCents
                  ? formatMoneyFromCents(unlockDetail.current)
                  : formatCount(unlockDetail.current)
              }
              thresholdLabel={
                unlockUsesCents
                  ? formatMoneyFromCents(unlockDetail.threshold)
                  : formatCount(unlockDetail.threshold)
              }
              ratio={unlockDetail.ratio}
            />
          </div>
        )}

        {/* Power reserve hint removed - would require getPowerReserveDetail from state */}

        {isExpertMode && hasCraftingParts && (
          <p className="muted">Dismantle value: {craftingPartsPerWatch[tierId] ?? 0} parts</p>
        )}

        <div className="catalog-action-bar">
          <div className="catalog-action-meta">
            {isWorn && (
              <span className="catalog-equipped" data-testid={`watch-equipped-${entry.id}`}>
                Equipped
              </span>
            )}
            <span className="catalog-owned">{ownedCount} owned</span>
            <span className="catalog-price">{formatMoneyFromCents(gate.cashPriceCents)}</span>
            {isExpertMode && (
              <span className="catalog-duplicate">Next x{duplicateMultiplier.toFixed(2)}</span>
            )}
          </div>
          <div className="catalog-primary-actions">
            <CatalogPurchaseGate
              entryId={entry.id}
              discovered={true}
              unlocked={unlocked}
              unlockDetail={unlockDetail}
              unlockCurrentLabel={
                unlockUsesCents
                  ? formatMoneyFromCents(unlockDetail?.current ?? 0)
                  : formatCount(unlockDetail?.current ?? 0)
              }
              unlockThresholdLabel={
                unlockUsesCents
                  ? formatMoneyFromCents(unlockDetail?.threshold ?? 0)
                  : formatCount(unlockDetail?.threshold ?? 0)
              }
              gate={gate}
              buyLabel={buyLabel}
              onBuy={handlePurchase}
              state={state}
              extraReasons={
                gateEtaLabel
                  ? [
                      {
                        code: "prerequisite",
                        label: "Affordability ETA",
                        detail: gateEtaLabel,
                      },
                    ]
                  : []
              }
            />
            <button
              type="button"
              className="catalog-card-details-button catalog-secondary-action"
              data-testid={`catalog-details-button-${entry.id}`}
              aria-haspopup="dialog"
              aria-controls="catalog-details-sheet"
              aria-expanded={isDetailsOpen}
              onClick={(event) => onOpenDetails(event.currentTarget as HTMLButtonElement)}
            >
              Details
            </button>
          </div>
        </div>

        {gateEtaLabel && <p className="muted catalog-gate-eta">{gateEtaLabel}</p>}

        <details
          className="catalog-economics-disclosure"
          data-testid={`catalog-advanced-economics-${entry.id}`}
        >
          <summary>Advanced economics</summary>
          <div className="catalog-economics-disclosure__body">
            <p className="catalog-duplicate">
              Next duplicate multiplier x{duplicateMultiplier.toFixed(2)}
            </p>
            {hasCraftingParts && (
              <p className="muted">
                Dismantle yield: {craftingPartsPerWatch[tierId] ?? 0} parts per watch
              </p>
            )}
          </div>
        </details>

        {showSecondaryActions && (
          <div className="catalog-secondary-actions">
            {showInlineSecondaryActions && (
              <>
                <button
                  type="button"
                  className={`catalog-favorite-toggle secondary ${
                    isFavorite ? "catalog-favorite-toggle--active" : ""
                  }`}
                  data-testid={`catalog-favorite-toggle-${entry.id}`}
                  aria-pressed={isFavorite}
                  onClick={() => onPurchase(toggleWatchFavorite(state, entry.id))}
                >
                  {isFavorite ? "Favorited" : "Favorite"}
                </button>
                {canWear && (
                  <button
                    type="button"
                    className="secondary catalog-secondary-action"
                    data-testid={`watch-wear-${entry.id}`}
                    onClick={() => onPurchase(setWornWatchId(state, entry.id))}
                  >
                    Wear
                  </button>
                )}
                {canShowInteract && ownedCount > 0 && (
                  <button
                    type="button"
                    className="secondary catalog-secondary-action"
                    disabled={!canInteract}
                    data-testid={`vault-interact-${tierId}`}
                    onClick={() => onInteract?.(tierId)}
                  >
                    {interactionLabel}
                  </button>
                )}
                {showDismantleAction && (
                  <button
                    type="button"
                    className="secondary catalog-secondary-action"
                    data-testid={`catalog-dismantle-${entry.id}`}
                    disabled={!canDismantle}
                    onClick={() => onPurchase(dismantleWatchModel(state, entry.id, 1))}
                  >
                    Dismantle
                  </button>
                )}
              </>
            )}
            {showExpertSecondaryActions && canShowInteract && ownedCount > 0 && interactionHint && (
              <span className="muted catalog-interaction-hint">{interactionHint}</span>
            )}
            {showExpertSecondaryActions && canShowInteract && (
              <ExplainButton
                sectionId={HELP_SECTION_IDS.interactions}
                label="Explain interactions"
                className="help-open-button catalog-secondary-help"
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default CatalogCard;
