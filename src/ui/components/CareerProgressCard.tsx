import React from "react";

import { formatMoneyFromCents } from "../../game/format";
import {
  getCareerNextActionCue,
  getCareerNextStageProgress,
  getTherapistSessionValueDeltaSummary,
} from "../../game/state";
import type { GameState } from "../../game/state";

type CareerProgressCardProps = {
  state: GameState;
  nowMs: number;
};

export function CareerProgressCard({ state, nowMs }: CareerProgressCardProps) {
  const progress = getCareerNextStageProgress(state);
  const nextActionCue = getCareerNextActionCue(state, nowMs);
  const sessionSummary = getTherapistSessionValueDeltaSummary(state, nowMs);
  const levelsRemaining = Math.max(0, Math.ceil(progress.levelsRemaining));
  const lastSessionAtMs = state.therapistCareer.lastSessionAtMs;
  const recentSessionAgeMs = Math.max(0, nowMs - lastSessionAtMs);
  const showRecentSessionFeedback = lastSessionAtMs > 0 && recentSessionAgeMs <= 45_000;

  const message = (() => {
    if (levelsRemaining === 0) {
      return "Career threshold reached. Continue sessions to keep momentum.";
    }
    return `Progress toward career level ${progress.nextUnlockLevel}.`;
  })();

  const feedbackPrimary = showRecentSessionFeedback
    ? `Last session: +${formatMoneyFromCents(sessionSummary.cashPayoutCents)} cash`
    : `Next step: ${nextActionCue.label}`;
  const feedbackSecondary = showRecentSessionFeedback
    ? sessionSummary.isFreeSession
      ? "Cost 0 enjoyment (free)"
      : `Cost ${formatMoneyFromCents(sessionSummary.enjoymentCostCents)} enjoyment`
    : levelsRemaining === 0
      ? "Threshold reached"
      : `Current target: level ${progress.nextUnlockLevel}`;

  return (
    <div className="card career-progress-card" data-testid="career-progress-card">
      <div className="career-track-header">
        <div>
          <p className="eyebrow">Power reserve</p>
          <h4>Progress</h4>
          <p className="muted" data-testid="career-progress-message">
            {message}
          </p>
        </div>
        <div className="career-track-level" data-testid="career-progress-levels">
          {levelsRemaining === 0
            ? "Ready"
            : `${levelsRemaining} level${levelsRemaining === 1 ? "" : "s"}`}
        </div>
      </div>
      <progress
        className="career-progress-meter"
        data-testid="career-progress-bar"
        value={progress.progress01}
        max={1}
        aria-label="Career progress"
      />
      <div className="career-feedback-strip" data-testid="career-feedback-strip">
        <p data-testid="career-feedback-primary">{feedbackPrimary}</p>
        <p className="muted" data-testid="career-feedback-secondary">
          {feedbackSecondary}
        </p>
      </div>
    </div>
  );
}
