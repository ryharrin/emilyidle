import { CAREER_TRACKS } from "../data/career";
import type {
  CareerExpansionFocusId,
  CareerModalityId,
  CareerOperatingStyleId,
  CareerTrackId,
  GameState,
} from "../model/types";

import { getPrestigeLegacyMultiplier } from "./enjoyment";
import {
  applyTherapistSessionMultipliers,
  getTherapistBaseSessionCashPayoutCents,
  getTherapistBaseSessionCooldownMs,
  getTherapistBaseSessionEnjoymentCostCents,
  getTherapistSalaryCentsPerSec,
  type TherapistSessionTerms,
} from "./therapistPolicy";
import {
  getTherapistCareerEffectMultipliers,
  getTherapistCareerStageId,
  type CareerStageId,
} from "./careerStages";

const CAREER_TRACK_HAS_SESSIONS = new Map<CareerTrackId, boolean>(
  CAREER_TRACKS.map((track) => [track.id, track.hasSessions]),
);

function getTherapistSessionTermsWithEffects(
  state: GameState,
  trackId: CareerTrackId | null,
  stageId: CareerStageId,
): { supportsSessions: boolean; terms: TherapistSessionTerms | null } {
  if (!trackId) {
    return { supportsSessions: false, terms: null };
  }

  if (stageId === "retirement") {
    return { supportsSessions: false, terms: null };
  }

  if (!(CAREER_TRACK_HAS_SESSIONS.get(trackId) ?? false)) {
    return { supportsSessions: false, terms: null };
  }

  const multipliers = getTherapistCareerEffectMultipliers(state);
  const level = state.therapistCareer.level;
  const baseTerms: TherapistSessionTerms = {
    cooldownMs: getTherapistBaseSessionCooldownMs(trackId),
    enjoymentCostCents: getTherapistBaseSessionEnjoymentCostCents(level, trackId),
    cashPayoutCents: getTherapistBaseSessionCashPayoutCents(level, trackId),
  };
  return {
    supportsSessions: true,
    terms: applyTherapistSessionMultipliers(baseTerms, multipliers),
  };
}

export type CareerChoicePreview = {
  before: {
    salaryCentsPerSec: number;
    supportsSessions: boolean;
    session: TherapistSessionTerms | null;
  };
  after: {
    salaryCentsPerSec: number;
    supportsSessions: boolean;
    session: TherapistSessionTerms | null;
  };
};

export function getCareerChoicePreview(
  state: GameState,
  args:
    | { stageId: "licensed-associate"; choiceId: CareerTrackId }
    | { stageId: "specialist-certification"; choiceId: CareerModalityId }
    | { stageId: "practice-builder"; choiceId: CareerOperatingStyleId }
    | { stageId: "private-practice-owner"; choiceId: CareerExpansionFocusId },
): CareerChoicePreview {
  const career = state.therapistCareer;
  const lockedTrackId = career.primaryTrackId ?? career.activeTrackId;
  const stageId = getTherapistCareerStageId(career.level);

  const beforeMultipliers = getTherapistCareerEffectMultipliers(state);
  const beforeSalaryCentsPerSec = getTherapistSalaryCentsPerSec({
    level: career.level,
    prestigeLegacyMultiplier: getPrestigeLegacyMultiplier(state),
    salaryMultiplier: beforeMultipliers.salaryMultiplier,
  });
  const beforeSessions = getTherapistSessionTermsWithEffects(state, lockedTrackId, stageId);

  const nextCareer = (() => {
    if (args.stageId === "licensed-associate") {
      return {
        ...career,
        primaryTrackId: args.choiceId,
        activeTrackId: args.choiceId,
      };
    }
    if (args.stageId === "specialist-certification") {
      return {
        ...career,
        modalityId: args.choiceId,
      };
    }
    if (args.stageId === "practice-builder") {
      return {
        ...career,
        operatingStyleId: args.choiceId,
      };
    }
    return {
      ...career,
      expansionFocusId: args.choiceId,
    };
  })();

  const nextState: GameState = { ...state, therapistCareer: nextCareer };
  const afterMultipliers = getTherapistCareerEffectMultipliers(nextState);
  const afterSalaryCentsPerSec = getTherapistSalaryCentsPerSec({
    level: nextCareer.level,
    prestigeLegacyMultiplier: getPrestigeLegacyMultiplier(nextState),
    salaryMultiplier: afterMultipliers.salaryMultiplier,
  });
  const afterStageId = getTherapistCareerStageId(nextCareer.level);
  const afterSessions = getTherapistSessionTermsWithEffects(
    nextState,
    nextCareer.activeTrackId,
    afterStageId,
  );

  return {
    before: {
      salaryCentsPerSec: beforeSalaryCentsPerSec,
      supportsSessions: beforeSessions.supportsSessions,
      session: beforeSessions.terms,
    },
    after: {
      salaryCentsPerSec: afterSalaryCentsPerSec,
      supportsSessions: afterSessions.supportsSessions,
      session: afterSessions.terms,
    },
  };
}
