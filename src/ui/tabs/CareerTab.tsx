import React from "react";

import { formatMoneyFromCents } from "../../game/format";
import {
  canPerformTherapistSession,
  getTherapistCareer,
  getTherapistSessionCashPayoutCents,
  getTherapistSessionCooldownMs,
  getTherapistSessionEnjoymentCostCents,
  getTherapistXpRequiredForNextLevel,
  performTherapistSession,
} from "../../game/state";
import type { GameState } from "../../game/state";

type CareerTabProps = {
  isActive: boolean;
  state: GameState;
  nowMs: number;
  onPurchase: (nextState: GameState) => void;
};

export function CareerTab({ isActive, state, nowMs, onPurchase }: CareerTabProps) {
  return (
    <section id="career" role="tabpanel" aria-labelledby="career-tab" hidden={!isActive}>
      {isActive &&
        (() => {
          const career = getTherapistCareer(state);
          const nextXpRequired = getTherapistXpRequiredForNextLevel(career.level);
          const cost = getTherapistSessionEnjoymentCostCents(career.level);
          const payout = getTherapistSessionCashPayoutCents(career.level);
          const cooldownMs = getTherapistSessionCooldownMs(career.level);
          const canPerform = canPerformTherapistSession(state, nowMs);
          const cooldownSeconds = Math.max(0, Math.ceil((career.nextAvailableAtMs - nowMs) / 1000));

          const statusLabel = (() => {
            if (canPerform) {
              return "Ready";
            }
            if (cooldownSeconds > 0) {
              return `Cooldown ${cooldownSeconds}s`;
            }
            if (state.enjoymentCents < cost) {
              return "Need more enjoyment";
            }
            return "Unavailable";
          })();

          return (
            <div className="panel" data-testid="career-panel">
              <header className="panel-header">
                <div>
                  <p className="eyebrow">Money generation</p>
                  <h3 id="career-title">Therapist career</h3>
                  <p className="muted">
                    Spend enjoyment to run sessions that pay cash and advance your career.
                  </p>
                </div>
                <div className="results-count" data-testid="career-status">
                  {statusLabel}
                </div>
              </header>

              <div className="workshop-reset">
                <div>
                  <p className="workshop-label">Level</p>
                  <p className="workshop-value">{career.level.toLocaleString()}</p>
                </div>
                <div>
                  <p className="workshop-label">XP</p>
                  <p className="workshop-value">
                    {career.xp.toLocaleString()} / {nextXpRequired.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="workshop-label">Session cost</p>
                  <p className="workshop-value">{formatMoneyFromCents(cost)} enjoyment</p>
                </div>
                <div>
                  <p className="workshop-label">Session payout</p>
                  <p className="workshop-value">{formatMoneyFromCents(payout)} cash</p>
                </div>
                <div>
                  <p className="workshop-label">Cooldown</p>
                  <p className="workshop-value">{Math.round(cooldownMs / 1000)}s</p>
                </div>
              </div>

              <div className="card-actions">
                <button
                  type="button"
                  className="secondary"
                  data-testid="career-action"
                  disabled={!canPerform}
                  onClick={() => onPurchase(performTherapistSession(state, Date.now()))}
                >
                  Run session
                </button>
              </div>
            </div>
          );
        })()}
    </section>
  );
}
