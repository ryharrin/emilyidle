import React from "react";

import { enterPhdProgram, getCareerNextActionCue } from "../../game/state";
import type { GameState } from "../../game/state";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";

type CareerNextActionCardProps = {
  state: GameState;
  nowMs: number;
  onPurchase: (nextState: GameState) => void;
};

export function CareerNextActionCard({ state, nowMs, onPurchase }: CareerNextActionCardProps) {
  const cue = getCareerNextActionCue(state, nowMs);

  return (
    <div className="card" data-testid="career-next-action">
      <div className="career-track-header">
        <div>
          <h4>Next action</h4>
          <p className="muted">{cue.label}</p>
        </div>
      </div>
      <p className="muted">{cue.detail}</p>

      {cue.id === "start-career" ? (
        <div className="card-actions">
          <button
            type="button"
            data-testid="career-next-action-start"
            onClick={() => onPurchase(enterPhdProgram(state, nowMs))}
          >
            Enter program
          </button>
          <ExplainButton
            sectionId={HELP_SECTION_IDS.careerStart}
            label="Explain starting your career"
          />
        </div>
      ) : null}
    </div>
  );
}
