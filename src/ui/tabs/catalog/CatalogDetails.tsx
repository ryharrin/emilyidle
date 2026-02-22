import React from "react";

import { CatalogCardDetailsSheet } from "../../components/catalog/CatalogCardDetailsSheet";
import type { CatalogEntry } from "../../../game/catalog";
import type { GameState, WatchItemId } from "../../../game/state";
import {
  getWatchModelTierId,
  getWatchItems,
  getWatchModelOwnedCount,
  isItemUnlocked,
  getMilestoneUnlockProgressDetail,
  getWatchModelPurchaseGate,
  getNextDuplicateRewardMultiplier,
  getInteractionMovementGate,
  getInteractionCooldownRemainingMs,
  toggleWatchFavorite,
  setWornWatchId,
  dismantleWatchModel,
  getCraftingPartsPerWatch,
} from "../../../game/state";
import { formatMoneyFromCents } from "../../../game/format";
import {
  buildCatalogDecisionInfo,
  CatalogDetailsContent,
  type CatalogDecisionInfo,
} from "./CatalogDetailsContent";
import { getGateEtaLabel } from "./catalogPresentation";

export interface CatalogDetailsProps {
  entry: CatalogEntry | null;
  state: GameState;
  isOpen: boolean;
  isCompact: boolean;
  showFacts: boolean;
  viewMode: "novice" | "expert";
  nowMs?: number;
  effectiveCashRateCentsPerSec: number;
  effectiveEnjoymentRateCentsPerSec: number;
  onClose: () => void;
  onPurchase: (nextState: GameState) => void;
  onInteract?: (itemId: WatchItemId) => void;
}

export function CatalogDetails({
  entry,
  state,
  isOpen,
  isCompact,
  showFacts,
  viewMode,
  nowMs,
  effectiveCashRateCentsPerSec,
  effectiveEnjoymentRateCentsPerSec,
  onClose,
  onPurchase,
  onInteract,
}: CatalogDetailsProps): React.ReactElement | null {
  const watchItems = React.useMemo(() => getWatchItems(), []);
  const watchItemById = React.useMemo(
    () => new Map(watchItems.map((item) => [item.id, item])),
    [watchItems],
  );

  if (!entry) {
    return null;
  }

  const tierId = getWatchModelTierId(entry.id);
  const tierItem = watchItemById.get(tierId);
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
  const duplicateMultiplier = getNextDuplicateRewardMultiplier(state, entry.id);

  const gateEtaLabel = getGateEtaLabel(
    gate,
    effectiveCashRateCentsPerSec,
    effectiveEnjoymentRateCentsPerSec,
  );

  const formatCount = (value: number) => Math.floor(value).toLocaleString();

  const decisionInfo: CatalogDecisionInfo = React.useMemo(() => {
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
  const craftingPartsPerWatch = getCraftingPartsPerWatch();
  const hasCraftingParts = (craftingPartsPerWatch[tierId] ?? 0) > 0;
  const canDismantle = ownedCount > 1 && hasCraftingParts;

  // Compact actions for mobile
  const renderCompactActions = () => {
    if (!isCompact) return null;

    return (
      <div className="catalog-sheet-actions" data-testid={`catalog-sheet-actions-${entry.id}`}>
        <p className="catalog-sheet-actions-title">Quick actions</p>
        <div className="catalog-sheet-actions-grid">
          <button
            type="button"
            className={`catalog-favorite-toggle secondary ${
              state.favoriteWatchIds?.includes(entry.id) ? "catalog-favorite-toggle--active" : ""
            }`}
            data-testid={`catalog-favorite-toggle-${entry.id}`}
            aria-pressed={state.favoriteWatchIds?.includes(entry.id)}
            onClick={() => onPurchase(toggleWatchFavorite(state, entry.id))}
          >
            {state.favoriteWatchIds?.includes(entry.id) ? "Favorited" : "Favorite"}
          </button>
          {canWear && (
            <button
              type="button"
              className="secondary catalog-secondary-action"
              data-testid={`watch-wear-${entry.id}`}
              onClick={() => {
                onPurchase(setWornWatchId(state, entry.id));
                onClose();
              }}
            >
              Wear
            </button>
          )}
          {canShowInteract && (
            <button
              type="button"
              className="secondary catalog-secondary-action"
              disabled={!canInteract}
              data-testid={`vault-interact-${tierId}`}
              onClick={() => {
                onInteract?.(tierId);
                onClose();
              }}
            >
              {interactionLabel}
            </button>
          )}
          {hasCraftingParts && (
            <button
              type="button"
              className="secondary catalog-secondary-action"
              data-testid={`catalog-dismantle-${entry.id}`}
              disabled={!canDismantle}
              onClick={() => {
                onPurchase(dismantleWatchModel(state, entry.id, 1));
                onClose();
              }}
            >
              Dismantle
            </button>
          )}
        </div>
        {canShowInteract && interactionHint && (
          <p className="muted catalog-interaction-hint">{interactionHint}</p>
        )}
      </div>
    );
  };

  return (
    <CatalogCardDetailsSheet entry={entry} tags={tags} show={isOpen} onClose={onClose}>
      <CatalogDetailsContent
        entry={entry}
        tags={tags}
        showFacts={showFacts}
        decisionInfo={decisionInfo}
        viewMode={viewMode}
      />
      {renderCompactActions()}
    </CatalogCardDetailsSheet>
  );
}

export default CatalogDetails;
