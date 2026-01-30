import React from "react";

import { CAREER_STAGES, type CareerStageId } from "../../game/data/careerStages";
import { getTherapistCareer, getTherapistCareerStage } from "../../game/state";
import type { GameState } from "../../game/state";
import { CareerStageChoiceBlocks } from "./CareerStageChoiceBlocks";

type CareerStageChoicesProps = {
  state: GameState;
  onPurchase: (nextState: GameState) => void;
};

function StageTimeline({
  currentStageId,
  level,
}: {
  currentStageId: CareerStageId;
  level: number;
}) {
  const currentIndex = CAREER_STAGES.findIndex((stage) => stage.id === currentStageId);
  const currentLabel = CAREER_STAGES[currentIndex]?.label ?? "Career";

  return (
    <div className="card" data-testid="career-stages-card">
      <div className="career-track-header">
        <div>
          <h4>Career stages</h4>
          <p className="muted">
            Stages unlock at specific career levels and include permanent choices.
          </p>
        </div>
        <div className="career-track-level" data-testid="career-stage-current">
          {currentLabel} - Level {level.toLocaleString()}
        </div>
      </div>

      <div className="card-stack">
        {CAREER_STAGES.map((stage, index) => {
          const isReached = index <= currentIndex;
          return (
            <div
              key={stage.id}
              className={`card ${isReached ? "" : "panel-teaser"}`}
              data-testid={`career-stage-node-${stage.id}`}
            >
              <div className="career-track-header">
                <div>
                  <h4>{stage.label}</h4>
                  <p className="muted">{stage.description}</p>
                </div>
                <div className="career-track-level">Level {stage.unlockLevel}+</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CareerStageChoices({ state, onPurchase }: CareerStageChoicesProps) {
  const career = getTherapistCareer(state);
  const currentStage = getTherapistCareerStage(state);

  return (
    <>
      <StageTimeline currentStageId={currentStage.id} level={career.level} />
      <CareerStageChoiceBlocks state={state} onPurchase={onPurchase} />
    </>
  );
}
