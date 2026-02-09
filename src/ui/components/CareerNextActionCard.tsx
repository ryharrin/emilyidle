import React from "react";

import { enterPhdProgram, getCareerNextActionCue } from "../../game/state";
import type { GameState } from "../../game/state";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";

type CareerNextActionCardProps = {
  state: GameState;
  nowMs: number;
  statusLabel: string;
  onPurchase: (nextState: GameState) => void;
};

export function CareerNextActionCard({
  state,
  nowMs,
  statusLabel,
  onPurchase,
}: CareerNextActionCardProps) {
  const cue = getCareerNextActionCue(state, nowMs);

  const secondaryHint = (() => {
    if (cue.id === "choose-track" || cue.id === "choose-modality") {
      return "Open deep details and choose the highlighted stage card.";
    }
    if (cue.id === "choose-operating-style" || cue.id === "choose-expansion-focus") {
      return "Open deep details and lock in your next permanent choice.";
    }
    if (cue.id === "perform-session") {
      return "Use Run session in the Sessions card when the action is ready.";
    }
    return null;
  })();

  return (
    <article className="card career-next-action-card" data-testid="career-next-action">
      <header className="career-next-action-header">
        <div>
          <p className="eyebrow">Primary action</p>
          <h4>{cue.label}</h4>
        </div>
        <p
          className="results-count career-next-action-status"
          data-testid="career-next-action-status"
        >
          {statusLabel}
        </p>
      </header>
      <p className="muted">{cue.detail}</p>
      {secondaryHint ? <p className="muted">{secondaryHint}</p> : null}

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
    </article>
  );
}
