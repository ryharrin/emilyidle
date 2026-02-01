import React from "react";

import { formatMoneyFromCents, formatRateFromCentsPerSec } from "../../../game/format";
import type { CareerChoicePreview } from "../../../game/state";

function formatCooldownMs(ms: number): string {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}

export function ChoicePreview({ preview }: { preview: CareerChoicePreview }) {
  const shouldShowSessions = preview.before.supportsSessions || preview.after.supportsSessions;
  const beforeSession = preview.before.session;
  const afterSession = preview.after.session;

  return (
    <div className="career-preview">
      <p className="muted">
        Salary:{" "}
        <span data-testid="career-choice-salary-before">
          {formatRateFromCentsPerSec(preview.before.salaryCentsPerSec)}
        </span>{" "}
        →{" "}
        <span data-testid="career-choice-salary-after">
          {formatRateFromCentsPerSec(preview.after.salaryCentsPerSec)}
        </span>
      </p>

      {shouldShowSessions ? (
        <p className="muted">
          Session payout:{" "}
          <span data-testid="career-choice-session-payout-before">
            {formatMoneyFromCents(beforeSession?.cashPayoutCents ?? 0)}
          </span>{" "}
          →{" "}
          <span data-testid="career-choice-session-payout-after">
            {formatMoneyFromCents(afterSession?.cashPayoutCents ?? 0)}
          </span>
          {" · "}Cooldown:{" "}
          <span data-testid="career-choice-session-cooldown-before">
            {formatCooldownMs(beforeSession?.cooldownMs ?? 0)}
          </span>{" "}
          →{" "}
          <span data-testid="career-choice-session-cooldown-after">
            {formatCooldownMs(afterSession?.cooldownMs ?? 0)}
          </span>
          {" · "}Cost:{" "}
          <span data-testid="career-choice-session-cost-before">
            {formatMoneyFromCents(beforeSession?.enjoymentCostCents ?? 0)}
          </span>{" "}
          →{" "}
          <span data-testid="career-choice-session-cost-after">
            {formatMoneyFromCents(afterSession?.enjoymentCostCents ?? 0)}
          </span>
        </p>
      ) : (
        <p className="muted">Sessions unavailable on this track.</p>
      )}
    </div>
  );
}
