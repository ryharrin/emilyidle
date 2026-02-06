import React from "react";

import {
  CAREER_EXPANSION_FOCUSES,
  CAREER_MODALITIES,
  CAREER_OPERATING_STYLES,
  CAREER_STAGES,
  CAREER_TRACK_EFFECTS,
  type CareerChoiceEffect,
  type CareerStageDefinition,
  type CareerStageId,
  type CareerStageChoiceDefinition,
} from "../../game/data/careerStages";
import { getTherapistCareer, getTherapistCareerStageId } from "../../game/state";
import type { GameState } from "../../game/state";
import type { TherapistCareerState } from "../../game/model/types";

type ChoiceContextDefinition = {
  label: string;
  choices: ReadonlyArray<CareerStageChoiceDefinition<string>>;
  selector: (career: TherapistCareerState) => string | null;
};

const STAGE_CHOICE_CONTEXT: Partial<Record<CareerStageId, ChoiceContextDefinition>> = {
  "licensed-associate": {
    label: "Track",
    choices: CAREER_TRACK_EFFECTS,
    selector: (career) => career.primaryTrackId ?? career.activeTrackId,
  },
  "specialist-certification": {
    label: "Modality",
    choices: CAREER_MODALITIES,
    selector: (career) => career.modalityId,
  },
  "practice-builder": {
    label: "Operating style",
    choices: CAREER_OPERATING_STYLES,
    selector: (career) => career.operatingStyleId,
  },
  "private-practice-owner": {
    label: "Expansion focus",
    choices: CAREER_EXPANSION_FOCUSES,
    selector: (career) => career.expansionFocusId,
  },
};

const formatPercent = (value: number) => {
  const percent = Math.round((value - 1) * 100);
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}%`;
};

const formatChoiceImpact = (effects: CareerChoiceEffect) =>
  [
    `Salary ${formatPercent(effects.salaryMultiplier)}`,
    `Payout ${formatPercent(effects.sessionCashPayoutMultiplier)}`,
    `Cooldown ${formatPercent(effects.sessionCooldownMultiplier)}`,
    `Cost ${formatPercent(effects.sessionEnjoymentCostMultiplier)}`,
  ].join(" · ");

const statusLabelMap: Record<"complete" | "current" | "upcoming", string> = {
  complete: "Complete",
  current: "Now",
  upcoming: "Next",
};

type TimelineStatus = "complete" | "current" | "upcoming";

type CareerTimelineProps = {
  state: GameState;
};

function renderChoiceCopy(
  stage: CareerStageDefinition,
  status: TimelineStatus,
  career: TherapistCareerState,
): React.ReactNode {
  const context = STAGE_CHOICE_CONTEXT[stage.id];
  if (!context) {
    return null;
  }

  const chosenId = context.selector(career);
  const chosen = context.choices.find((choice) => choice.id === chosenId) ?? null;

  if (chosen) {
    return (
      <div className="career-timeline-node-choice">
        <p className="career-timeline-node-choice-title">
          Permanent {context.label.toLowerCase()}: {chosen.label}
        </p>
        <p className="career-timeline-node-choice-body">
          {chosen.description} Impact: {formatChoiceImpact(chosen.effects)}.
        </p>
      </div>
    );
  }

  const unlockText =
    status === "upcoming"
      ? `Unlocks at level ${stage.unlockLevel}.`
      : `Choose a ${context.label.toLowerCase()} to lock in salary, payout, and cooldown trade-offs.`;

  return (
    <div className="career-timeline-node-choice">
      <p className="career-timeline-node-choice-body">
        Permanent {context.label.toLowerCase()} {unlockText}
      </p>
    </div>
  );
}

export function CareerTimeline({ state }: CareerTimelineProps) {
  const career = getTherapistCareer(state);
  const currentStageId = getTherapistCareerStageId(career.level);
  const currentIndex = Math.max(
    0,
    CAREER_STAGES.findIndex((stage) => stage.id === currentStageId),
  );

  return (
    <section
      className="career-timeline"
      aria-label="Career progression timeline"
      data-testid="career-timeline"
    >
      <ol className="career-timeline-list">
        {CAREER_STAGES.map((stage, index) => {
          const status: TimelineStatus =
            index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";
          return (
            <li
              key={stage.id}
              className={`career-timeline-node career-timeline-${status}`}
              data-status={status}
              data-stage-id={stage.id}
              data-testid="career-timeline-node"
            >
              <div
                className="career-timeline-node-header"
                data-testid={`career-timeline-node-${stage.id}`}
              >
                <span className="career-timeline-node-status" aria-hidden>
                  {statusLabelMap[status]}
                </span>
                <div>
                  <p className="career-timeline-node-label">{stage.label}</p>
                  <p className="career-timeline-node-description">{stage.description}</p>
                </div>
              </div>
              <div className="career-timeline-node-meta">
                <span className="career-timeline-node-level">Level {stage.unlockLevel}</span>
                {renderChoiceCopy(stage, status, career)}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
