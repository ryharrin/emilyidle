import React from "react";

import { formatMoneyFromCents } from "../../game/format";
import {
  getCareerNextActionCue,
  getCareerNextStageProgress,
  getCareerNextUnlock,
  getTherapistSessionValueDeltaSummary,
} from "../../game/state";
import type { GameState } from "../../game/state";

type CareerProgressCardProps = {
  state: GameState;
  nowMs: number;
};

export function CareerProgressCard({ state, nowMs }: CareerProgressCardProps) {
  const nextUnlock = getCareerNextUnlock(state);
  const progress = getCareerNextStageProgress(state);
  const nextActionCue = getCareerNextActionCue(state, nowMs);
  const sessionSummary = getTherapistSessionValueDeltaSummary(state, nowMs);
  const levelsRemaining = Math.max(0, Math.ceil(progress.levelsRemaining));
  const lastSessionAtMs = state.therapistCareer.lastSessionAtMs;
  const recentSessionAgeMs = Math.max(0, nowMs - lastSessionAtMs);
  const showRecentSessionFeedback = lastSessionAtMs > 0 && recentSessionAgeMs <= 45_000;

  const message = (() => {
    if (!nextUnlock) {
      return "All career stages unlocked.";
    }
    if (nextUnlock.kind === "start") {
      return "Start your career: enter the PhD program to begin earning salary.";
    }
    if (nextUnlock.kind === "choice") {
      return `Permanent choice available: ${nextUnlock.label}.`;
    }
    return `Next stage: ${nextUnlock.label} (level ${nextUnlock.unlockLevel}+).`;
  })();

  const feedbackPrimary = showRecentSessionFeedback
    ? `Last session: +${formatMoneyFromCents(sessionSummary.cashPayoutCents)} cash`
    : `Next step: ${nextActionCue.label}`;
  const feedbackSecondary = showRecentSessionFeedback
    ? sessionSummary.isFreeSession
      ? "Cost 0 enjoyment (free)"
      : `Cost ${formatMoneyFromCents(sessionSummary.enjoymentCostCents)} enjoyment`
    : nextUnlock
      ? levelsRemaining === 0
        ? "Threshold reached"
        : `Next threshold: level ${Math.max(1, Math.ceil(state.therapistCareer.level + levelsRemaining))}`
      : "All thresholds complete";

  return (
    <div className="card" data-testid="career-progress-card">
      <div className="career-track-header">
        <div>
          <h4>Progress</h4>
          <p className="muted" data-testid="career-next-unlock">
            {message}
          </p>
        </div>
        {nextUnlock ? (
          <div className="career-track-level" data-testid="career-next-unlock-levels">
            {levelsRemaining === 0
              ? "Ready"
              : `${levelsRemaining} level${levelsRemaining === 1 ? "" : "s"}`}
          </div>
        ) : null}
      </div>
      <progress
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
