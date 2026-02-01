import React from "react";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../game/format";
import type { CareerChoicePreview } from "../../game/state";

function formatCooldownMs(ms: number): string {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}

export function CareerStageChoicePreview({ preview }: { preview: CareerChoicePreview }) {
  return (
    <div className="career-preview">
      <p className="muted">
        Salary:{" "}
        <span data-testid="career-choice-salary-before">
          {formatRateFromCentsPerSec(preview.before.salaryCentsPerSec)}
        </span>{" "}
        {" -> "}
        <span data-testid="career-choice-salary-after">
          {formatRateFromCentsPerSec(preview.after.salaryCentsPerSec)}
        </span>
      </p>
      {preview.after.supportsSessions && preview.after.session ? (
        <p className="muted">
          Session payout:{" "}
          <span data-testid="career-choice-session-payout-before">
            {formatMoneyFromCents(preview.before.session?.cashPayoutCents ?? 0)}
          </span>{" "}
          {" -> "}
          <span data-testid="career-choice-session-payout-after">
            {formatMoneyFromCents(preview.after.session.cashPayoutCents)}
          </span>
          {" -> "}Cooldown:{" "}
          <span data-testid="career-choice-session-cooldown-before">
            {formatCooldownMs(preview.before.session?.cooldownMs ?? 0)}
          </span>{" "}
          {" -> "}
          <span data-testid="career-choice-session-cooldown-after">
            {formatCooldownMs(preview.after.session.cooldownMs)}
          </span>
          {" -> "}Cost:{" "}
          <span data-testid="career-choice-session-cost-before">
            {formatMoneyFromCents(preview.before.session?.enjoymentCostCents ?? 0)}
          </span>{" "}
          {" -> "}
          <span data-testid="career-choice-session-cost-after">
            {formatMoneyFromCents(preview.after.session.enjoymentCostCents)}
          </span>
        </p>
      ) : (
        <p className="muted">Sessions unavailable.</p>
      )}
    </div>
  );
}
