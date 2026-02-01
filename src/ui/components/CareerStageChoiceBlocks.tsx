import React, { useMemo } from "react";

import {
  CAREER_EXPANSION_FOCUSES,
  CAREER_MODALITIES,
  CAREER_OPERATING_STYLES,
  CAREER_STAGES,
  CAREER_TRACK_EFFECTS,
  type CareerStageId,
} from "../../game/data/careerStages";
import { CAREER_TRACKS } from "../../game/data/career";
import {
  chooseCareerExpansionFocus,
  chooseCareerModality,
  chooseCareerOperatingStyle,
  getCareerChoicePreview,
  getTherapistCareer,
  getTherapistCareerChoiceStatus,
  getTherapistCareerStageUnlockLevel,
  selectPrimaryCareerTrack,
} from "../../game/state";
import type { GameState } from "../../game/state";
import { CareerStageChoicePreview } from "./CareerStageChoicePreview";

type CareerStageChoiceBlocksProps = {
  state: GameState;
  onPurchase: (nextState: GameState) => void;
};

function LockedStageCard({
  stageId,
  heading,
  label,
}: {
  stageId: CareerStageId;
  heading: string;
  label: string;
}) {
  return (
    <div className="card" data-testid={`career-stage-block-${stageId}`}>
      <div className="career-track-header">
        <div>
          <h4>{heading}</h4>
          <p className="muted">Permanent choice locked in.</p>
        </div>
        <div className="career-track-level" data-testid={`career-choice-locked-${stageId}`}>
          {label}
        </div>
      </div>
    </div>
  );
}

function LockedStageTeaser({
  stageId,
  heading,
  unlockLevel,
}: {
  stageId: CareerStageId;
  heading: string;
  unlockLevel: number;
}) {
  return (
    <div className="card" data-testid={`career-stage-block-${stageId}`}>
      <div className="career-track-header">
        <div>
          <h4>{heading}</h4>
          <p className="muted">Unlocks at level {unlockLevel}.</p>
        </div>
        <div className="career-track-level" data-testid={`career-choice-locked-${stageId}`}>
          Locked
        </div>
      </div>
    </div>
  );
}

export function CareerStageChoiceBlocks({ state, onPurchase }: CareerStageChoiceBlocksProps) {
  const career = getTherapistCareer(state);

  if (career.careerStartId === null) {
    return null;
  }

  const choiceStatus = getTherapistCareerChoiceStatus(state);
  const nextAvailable = choiceStatus.find((status) => status.available) ?? null;
  const nextLocked = choiceStatus.find((status) => !status.unlocked) ?? null;

  const status = nextAvailable ?? nextLocked;
  if (!status) {
    return null;
  }

  const unlockLevel = getTherapistCareerStageUnlockLevel(status.stageId);
  const heading =
    CAREER_STAGES.find((stage) => stage.id === status.stageId)?.label ?? status.stageId;
  if (!status.unlocked) {
    return (
      <LockedStageTeaser stageId={status.stageId} heading={heading} unlockLevel={unlockLevel} />
    );
  }

  if (status.stageId === "licensed-associate") {
    return (
      <div className="card" data-testid={`career-stage-block-${status.stageId}`}>
        <div className="career-track-header">
          <div>
            <h4>{heading}</h4>
            <p className="muted">Pick your primary track (permanent).</p>
          </div>
          <div className="career-track-level">Level {career.level.toLocaleString()}</div>
        </div>

        <div className="career-track-grid">
          {CAREER_TRACKS.map((track) => {
            const effects = CAREER_TRACK_EFFECTS.find((choice) => choice.id === track.id);
            const preview = getCareerChoicePreview(state, {
              stageId: "licensed-associate",
              choiceId: track.id,
            });
            return (
              <button
                key={track.id}
                type="button"
                className="career-track-card"
                data-testid={`career-choice-option-${track.id}`}
                onClick={() => onPurchase(selectPrimaryCareerTrack(state, track.id))}
              >
                <h5>{track.label}</h5>
                <p className="muted">{track.description}</p>
                {effects ? (
                  <p className="muted">
                    Salary multiplier: x{effects.effects.salaryMultiplier.toFixed(2)}
                  </p>
                ) : null}
                <CareerStageChoicePreview preview={preview} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (status.stageId === "specialist-certification") {
    return (
      <div className="card" data-testid={`career-stage-block-${status.stageId}`}>
        <div className="career-track-header">
          <div>
            <h4>{heading}</h4>
            <p className="muted">Pick a modality (permanent).</p>
          </div>
          <div className="career-track-level">Level {career.level.toLocaleString()}</div>
        </div>
        <div className="career-track-grid">
          {CAREER_MODALITIES.map((choice) => {
            const preview = getCareerChoicePreview(state, {
              stageId: "specialist-certification",
              choiceId: choice.id,
            });
            return (
              <button
                key={choice.id}
                type="button"
                className="career-track-card"
                data-testid={`career-choice-option-${choice.id}`}
                onClick={() => onPurchase(chooseCareerModality(state, choice.id))}
              >
                <h5>{choice.label}</h5>
                <p className="muted">{choice.description}</p>
                <CareerStageChoicePreview preview={preview} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (status.stageId === "practice-builder") {
    return (
      <div className="card" data-testid={`career-stage-block-${status.stageId}`}>
        <div className="career-track-header">
          <div>
            <h4>{heading}</h4>
            <p className="muted">Pick an operating style (permanent).</p>
          </div>
          <div className="career-track-level">Level {career.level.toLocaleString()}</div>
        </div>
        <div className="career-track-grid">
          {CAREER_OPERATING_STYLES.map((choice) => {
            const preview = getCareerChoicePreview(state, {
              stageId: "practice-builder",
              choiceId: choice.id,
            });
            return (
              <button
                key={choice.id}
                type="button"
                className="career-track-card"
                data-testid={`career-choice-option-${choice.id}`}
                onClick={() => onPurchase(chooseCareerOperatingStyle(state, choice.id))}
              >
                <h5>{choice.label}</h5>
                <p className="muted">{choice.description}</p>
                <CareerStageChoicePreview preview={preview} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card" data-testid={`career-stage-block-${status.stageId}`}>
      <div className="career-track-header">
        <div>
          <h4>{heading}</h4>
          <p className="muted">Pick an expansion focus (permanent).</p>
        </div>
        <div className="career-track-level">Level {career.level.toLocaleString()}</div>
      </div>
      <div className="career-track-grid">
        {CAREER_EXPANSION_FOCUSES.map((choice) => {
          const preview = getCareerChoicePreview(state, {
            stageId: "private-practice-owner",
            choiceId: choice.id,
          });
          return (
            <button
              key={choice.id}
              type="button"
              className="career-track-card"
              data-testid={`career-choice-option-${choice.id}`}
              onClick={() => onPurchase(chooseCareerExpansionFocus(state, choice.id))}
            >
              <h5>{choice.label}</h5>
              <p className="muted">{choice.description}</p>
              <CareerStageChoicePreview preview={preview} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
