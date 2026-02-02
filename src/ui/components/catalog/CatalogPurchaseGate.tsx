import React from "react";

import { formatMoneyFromCents } from "../../../game/format";
import type { UnlockProgressDetail, WatchModelPurchaseGate } from "../../../game/state";

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
}: CatalogPurchaseGateProps): JSX.Element {
  if (unlocked && gate.ok) {
    return (
      <button type="button" data-testid={`catalog-buy-${entryId}`} onClick={onBuy}>
        {buyLabel}
      </button>
    );
  }

  let gateCopy: React.ReactNode = "Locked";
  if (unlocked && !gate.ok) {
    if (gate.blocksBy === "enjoyment") {
      gateCopy = (
        <>
          Requires {formatMoneyFromCents(gate.enjoymentRequiredCents)}
          {gate.enjoymentDeficitCents !== undefined && (
            <> ({formatMoneyFromCents(gate.enjoymentDeficitCents)} more)</>
          )}
        </>
      );
    }

    if (gate.blocksBy === "cash") {
      gateCopy = <>Need {formatMoneyFromCents(gate.cashDeficitCents ?? 0)} more</>;
    }
  }

  const reasons: CatalogDisabledReason[] = [];

  if (!discovered) {
    reasons.push({
      title: "Undiscovered reference",
      body: "This entry hasn't been discovered yet. Discovery is tracked separately from buying.",
    });
  }

  if (!unlocked) {
    const progressLabel =
      unlockDetail && unlockCurrentLabel && unlockThresholdLabel
        ? ` (${unlockCurrentLabel} / ${unlockThresholdLabel})`
        : "";
    const detailLabel = unlockDetail?.label ?? "Unlock requirement";
    reasons.push({
      title: "Tier locked",
      body: `${detailLabel}${progressLabel}`,
    });
  }

  if (!gate.ok) {
    if (gate.enjoymentDeficitCents !== undefined) {
      reasons.push({
        title: "Enjoyment requirement",
        body: `Requires ${formatMoneyFromCents(gate.enjoymentRequiredCents)} (${formatMoneyFromCents(
          gate.enjoymentDeficitCents,
        )} more).`,
      });
    }

    if (gate.cashDeficitCents !== undefined) {
      reasons.push({
        title: "Cash requirement",
        body: `Price ${formatMoneyFromCents(gate.cashPriceCents)} (${formatMoneyFromCents(
          gate.cashDeficitCents,
        )} more).`,
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
