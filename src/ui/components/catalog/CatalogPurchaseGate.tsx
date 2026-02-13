import React from "react";

import { formatMoneyFromCents } from "../../../game/format";
import type { GameState, UnlockProgressDetail, WatchModelPurchaseGate } from "../../../game/state";

import {
  CatalogDisabledExplanation,
  type CatalogDisabledReason,
} from "./CatalogDisabledExplanation";

type CatalogPurchaseGateProps = {
  entryId: string;
  discovered: boolean;
  unlocked: boolean;
  unlockDetail?: UnlockProgressDetail | null;
  unlockCurrentLabel?: string;
  unlockThresholdLabel?: string;
  gate: WatchModelPurchaseGate;
  buyLabel: string;
  onBuy: () => void;
  extraReasons?: CatalogDisabledReason[];
  state?: GameState;
};

export function CatalogPurchaseGate({
  entryId,
  discovered,
  unlocked,
  unlockDetail,
  unlockCurrentLabel,
  unlockThresholdLabel,
  gate,
  buyLabel,
  onBuy,
  extraReasons = [],
  state,
}: CatalogPurchaseGateProps): JSX.Element {
  if (unlocked && gate.ok) {
    return (
      <button
        type="button"
        className="catalog-primary-action"
        data-testid={`catalog-buy-${entryId}`}
        onClick={onBuy}
      >
        {buyLabel}
      </button>
    );
  }

  let gateCopy: React.ReactNode = "Locked";
  if (unlocked && !gate.ok) {
    if (gate.blocksBy === "enjoyment") {
      const haveAmount = state ? formatMoneyFromCents(state.enjoymentCents) : null;
      const needAmount = formatMoneyFromCents(gate.enjoymentRequiredCents);
      gateCopy = (
        <>
          {haveAmount !== null ? (
            <p className="catalog-gate-comparison">
              <span>Have: {haveAmount}</span>
              <span>Need: {needAmount}</span>
            </p>
          ) : (
            <>
              Requires {needAmount}
              {gate.enjoymentDeficitCents !== undefined && (
                <> ({formatMoneyFromCents(gate.enjoymentDeficitCents)} more)</>
              )}
            </>
          )}
        </>
      );
    }

    if (gate.blocksBy === "cash") {
      const haveAmount = state ? formatMoneyFromCents(state.currencyCents) : null;
      const needAmount = formatMoneyFromCents(gate.cashPriceCents);
      const deficit = gate.cashDeficitCents ?? 0;
      gateCopy = (
        <>
          {haveAmount !== null ? (
            <p className="catalog-gate-comparison">
              <span>Have: {haveAmount}</span>
              <span>Need: {needAmount}</span>
            </p>
          ) : (
            <>Need {formatMoneyFromCents(deficit)} more</>
          )}
        </>
      );
    }
  }

  const reasons: CatalogDisabledReason[] = [];

  if (!discovered) {
    reasons.push({
      code: "undiscovered",
      label: "Undiscovered",
      detail: "Reference data is still hidden for this entry.",
      nextStep: "Buy watches to expand discovery progress.",
    });
  }

  if (!unlocked) {
    const progressLabel =
      unlockDetail && unlockCurrentLabel && unlockThresholdLabel
        ? ` (${unlockCurrentLabel} / ${unlockThresholdLabel})`
        : "";
    const detailLabel = unlockDetail?.label ?? "Unlock requirement";
    reasons.push({
      code: "locked",
      label: "Locked",
      detail: `${detailLabel}${progressLabel}`,
      nextStep: "Hit the threshold shown above to unlock this tier.",
    });
  }

  if (!gate.ok) {
    if (gate.enjoymentDeficitCents !== undefined) {
      reasons.push({
        code: "enjoyment",
        label: "Enjoyment",
        detail: `Need ${formatMoneyFromCents(gate.enjoymentDeficitCents)} more enjoyment.`,
        nextStep: `Target ${formatMoneyFromCents(gate.enjoymentRequiredCents)} enjoyment.`,
      });
    }

    if (gate.cashDeficitCents !== undefined) {
      reasons.push({
        code: "funds",
        label: "Funds",
        detail: `Need ${formatMoneyFromCents(gate.cashDeficitCents)} more cash.`,
        nextStep: `Price is ${formatMoneyFromCents(gate.cashPriceCents)}.`,
      });
    }
  }

  if (extraReasons.length > 0) {
    reasons.push(...extraReasons);
  }

  return (
    <div className="catalog-gate-stack">
      <div className="catalog-gate" data-testid={`catalog-gate-${entryId}`}>
        {gateCopy}
      </div>
      <CatalogDisabledExplanation entryId={entryId} reasons={reasons} />
    </div>
  );
}
