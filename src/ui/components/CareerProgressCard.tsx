import React from "react";

import { getCareerNextStageProgress, getCareerNextUnlock } from "../../game/state";
import type { GameState } from "../../game/state";

type CareerProgressCardProps = {
  state: GameState;
};

export function CareerProgressCard({ state }: CareerProgressCardProps) {
  const nextUnlock = getCareerNextUnlock(state);
  const progress = getCareerNextStageProgress(state);
  const levelsRemaining = Math.max(0, Math.ceil(progress.levelsRemaining));

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
    </div>
  );
}
