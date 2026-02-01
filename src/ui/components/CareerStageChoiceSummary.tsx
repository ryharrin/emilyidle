import React from "react";

import {
  CAREER_EXPANSION_FOCUSES,
  CAREER_MODALITIES,
  CAREER_OPERATING_STYLES,
} from "../../game/data/careerStages";
import { CAREER_TRACKS } from "../../game/data/career";
import { getTherapistCareer } from "../../game/state";
import type { GameState } from "../../game/state";

type CareerStageChoiceSummaryProps = {
  state: GameState;
};

export function CareerStageChoiceSummary({ state }: CareerStageChoiceSummaryProps) {
  const career = getTherapistCareer(state);

  const trackId = career.primaryTrackId ?? career.activeTrackId;
  const trackLabel = trackId ? CAREER_TRACKS.find((track) => track.id === trackId)?.label : null;

  const modalityLabel = career.modalityId
    ? CAREER_MODALITIES.find((choice) => choice.id === career.modalityId)?.label
    : null;

  const operatingStyleLabel = career.operatingStyleId
    ? CAREER_OPERATING_STYLES.find((choice) => choice.id === career.operatingStyleId)?.label
    : null;

  const expansionFocusLabel = career.expansionFocusId
    ? CAREER_EXPANSION_FOCUSES.find((choice) => choice.id === career.expansionFocusId)?.label
    : null;

  const hasAny = Boolean(trackLabel || modalityLabel || operatingStyleLabel || expansionFocusLabel);
  if (!hasAny) {
    return null;
  }

  return (
    <div className="card" data-testid="career-permanent-choices">
      <div className="career-track-header">
        <div>
          <h4>Permanent choices</h4>
          <p className="muted">These choices are locked in.</p>
        </div>
      </div>

      {trackLabel ? (
        <p className="muted" data-testid="career-choice-locked-licensed-associate">
          Track: {trackLabel}
        </p>
      ) : null}
      {modalityLabel ? (
        <p className="muted" data-testid="career-choice-locked-specialist-certification">
          Modality: {modalityLabel}
        </p>
      ) : null}
      {operatingStyleLabel ? (
        <p className="muted" data-testid="career-choice-locked-practice-builder">
          Operating style: {operatingStyleLabel}
        </p>
      ) : null}
      {expansionFocusLabel ? (
        <p className="muted" data-testid="career-choice-locked-private-practice-owner">
          Expansion focus: {expansionFocusLabel}
        </p>
      ) : null}
    </div>
  );
}
