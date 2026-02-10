import React from "react";

import { CAREER_STAGES, type CareerStageId } from "../../game/data/careerStages";
import { getTherapistCareer, getTherapistCareerStage } from "../../game/state";
import type { GameState } from "../../game/state";
import { CareerStageChoiceBlocks } from "./CareerStageChoiceBlocks";
import { CareerStageChoiceSummary } from "./CareerStageChoiceSummary";
import { ExplainButton } from "../help/ExplainButton";
import { HELP_SECTION_IDS } from "../help/helpContent";

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
    <div className="card career-stage-timeline-card career-panel-cluster-card" data-testid="career-stages-card">
      <div className="career-track-header">
        <div>
          <h4>Career stages</h4>
          <p className="muted">
            Stages unlock at specific career levels and include permanent choices.
          </p>
        </div>
        <ExplainButton sectionId={HELP_SECTION_IDS.careerStages} label="Explain career stages" />
        <div className="career-track-level career-stage-current-level" data-testid="career-stage-current">
          {currentLabel} - Level {level.toLocaleString()}
        </div>
      </div>

      <div className="card-stack career-stage-timeline-stack">
        {CAREER_STAGES.map((stage, index) => {
          const isReached = index <= currentIndex;
          return (
            <div
              key={stage.id}
              className={`card career-stage-node-card career-panel-cluster-card ${isReached ? "" : "panel-teaser"}`}
              data-testid={`career-stage-node-${stage.id}`}
            >
              <div className="career-track-header">
                <div>
                  <h4>{stage.label}</h4>
                  <p className="muted">{stage.description}</p>
                </div>
                <div className="career-track-level career-stage-node-level">Level {stage.unlockLevel}+</div>
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
      <CareerStageChoiceSummary state={state} />
      <CareerStageChoiceBlocks state={state} onPurchase={onPurchase} />
    </>
  );
}
