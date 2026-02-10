import React from "react";

import "./careerTimelineDepth.css";

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
import {
  getCareerNextStageProgress,
  getTherapistCareer,
  getTherapistCareerStageId,
  getTherapistCareerChoiceStatus,
  type CareerChoiceStatus,
} from "../../game/state";
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

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatLevelsRemaining = (levelsRemaining: number) => {
  if (levelsRemaining <= 0) {
    return "Ready for next threshold";
  }
  const remaining = Math.max(1, Math.ceil(levelsRemaining));
  return `${remaining} level${remaining === 1 ? "" : "s"} remaining`;
};

const getChoiceStatusLabel = (status: CareerChoiceStatus, stage: CareerStageDefinition) => {
  if (status.available) {
    return "Choose now";
  }
  if (status.unlocked) {
    return "Unlocked";
  }
  return `Unlocks at level ${stage.unlockLevel}`;
};

type UpcomingChoice = {
  stage: CareerStageDefinition;
  status: CareerChoiceStatus;
  context: ChoiceContextDefinition;
};

const isUpcomingChoice = (entry: UpcomingChoice | null): entry is UpcomingChoice => Boolean(entry);

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
  const currentStage = CAREER_STAGES[currentIndex] ?? CAREER_STAGES[0];
  const progress = getCareerNextStageProgress(state);
  const progressPercent = clampPercent(progress.progress01 * 100);
  const levelsRemainingCopy = formatLevelsRemaining(progress.levelsRemaining);
  const nextUnlockLabel =
    progress.nextUnlockLevel > progress.currentLevel
      ? `Next target level ${progress.nextUnlockLevel}`
      : "Final stage reached";
  const upcomingChoices = getTherapistCareerChoiceStatus(state)
    .map((status) => {
      const stage = CAREER_STAGES.find((entry) => entry.id === status.stageId) ?? null;
      const context = STAGE_CHOICE_CONTEXT[status.stageId] ?? null;
      if (!stage || !context || status.chosen) {
        return null;
      }
      return { stage, status, context };
    })
    .filter(isUpcomingChoice)
    .sort((a, b) => a.stage.unlockLevel - b.stage.unlockLevel);

  return (
    <section
      className="career-timeline"
      aria-label="Career progression timeline"
      data-testid="career-timeline"
    >
      <div className="career-timeline-meta career-timeline-meta-grid">
        <article
          className="career-timeline-current"
          id="career-timeline-current"
          data-testid="career-timeline-current"
        >
          <div className="career-timeline-current__header">
            <p className="eyebrow">Current position</p>
            <h3>{currentStage.label}</h3>
            <p className="muted">{currentStage.description}</p>
          </div>
          <div className="career-timeline-current__body">
            <div className="career-timeline-current__level">
              <strong>Level {progress.currentLevel}</strong>
              <span className="career-timeline-current__target">{nextUnlockLabel}</span>
            </div>
            <div className="career-timeline-current__progress">
              <div className="career-timeline-current__progress-track">
                <span
                  className="career-timeline-current__progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="career-timeline-current__progress-caption">
                <span>{progressPercent}% progress</span>
                <span>{levelsRemainingCopy}</span>
              </div>
            </div>
          </div>
        </article>
        <div
          className="career-timeline-upcoming"
          id="career-timeline-upcoming"
          data-testid="career-timeline-upcoming"
        >
          <div className="career-timeline-upcoming__header">
            <p className="eyebrow">Upcoming choices</p>
            <h3>Plan your next trade-offs</h3>
          </div>
          <div className="career-timeline-upcoming__list">
            {upcomingChoices.length === 0 ? (
              <p className="muted">
                No pending choices. Keep progressing through the current stage.
              </p>
            ) : (
              upcomingChoices.map((entry) => (
                <article
                  key={entry.stage.id}
                  className="career-upcoming-choice"
                  data-testid={`career-upcoming-choice-${entry.stage.id}`}
                >
                  <header className="career-upcoming-choice__header">
                    <div>
                      <p className="career-upcoming-choice__context">{entry.context.label}</p>
                      <h4>{entry.stage.label}</h4>
                    </div>
                    <span className="career-upcoming-choice__status">
                      {getChoiceStatusLabel(entry.status, entry.stage)}
                    </span>
                  </header>
                  <p className="career-upcoming-choice__level">
                    Unlock level {entry.stage.unlockLevel}
                  </p>
                  <ul className="career-upcoming-choice__effects">
                    {entry.context.choices.slice(0, 2).map((choice) => (
                      <li key={choice.id}>
                        <span className="career-upcoming-choice__effect-name">{choice.label}</span>
                        <span className="career-upcoming-choice__effect-summary">
                          {formatChoiceImpact(choice.effects)}
                        </span>
                      </li>
                    ))}
                    {entry.context.choices.length > 2 && (
                      <li className="career-upcoming-choice__more">
                        +{entry.context.choices.length - 2} more tradeoff
                        {entry.context.choices.length - 2 > 1 ? "s" : ""}
                      </li>
                    )}
                  </ul>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="career-timeline-scroll">
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
                data-stage-index={index}
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
      </div>
    </section>
  );
}
