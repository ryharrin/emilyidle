import {
  CAREER_EXPANSION_FOCUSES,
  CAREER_MODALITIES,
  CAREER_OPERATING_STYLES,
  CAREER_STAGES,
  CAREER_TRACK_EFFECTS,
  type CareerChoiceEffect,
  type CareerStageDefinition,
  type CareerStageId,
} from "../data/careerStages";
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
  type TherapistCareerEffectMultipliers,
  type TherapistSessionTerms,
} from "./therapistPolicy";

export { type CareerStageId };

const CAREER_STAGE_LOOKUP = new Map<CareerStageId, CareerStageDefinition>(
  CAREER_STAGES.map((stage) => [stage.id, stage]),
);

const CAREER_TRACK_HAS_SESSIONS = new Map<CareerTrackId, boolean>(
  CAREER_TRACKS.map((track) => [track.id, track.hasSessions]),
);

function multiplyEffects(
  base: TherapistCareerEffectMultipliers,
  effect: CareerChoiceEffect,
): TherapistCareerEffectMultipliers {
  return {
    salaryMultiplier: base.salaryMultiplier * effect.salaryMultiplier,
    sessionCashPayoutMultiplier:
      base.sessionCashPayoutMultiplier * effect.sessionCashPayoutMultiplier,
    sessionCooldownMultiplier: base.sessionCooldownMultiplier * effect.sessionCooldownMultiplier,
    sessionEnjoymentCostMultiplier:
      base.sessionEnjoymentCostMultiplier * effect.sessionEnjoymentCostMultiplier,
  };
}

export function getTherapistCareerStageId(level: number): CareerStageId {
  const clamped = Math.max(1, Math.floor(level));

  let current: CareerStageId = "grad-student";
  for (const stage of CAREER_STAGES) {
    if (clamped >= stage.unlockLevel) {
      current = stage.id;
    }
  }

  return current;
}

export function getTherapistCareerStage(state: GameState): CareerStageDefinition {
  const stageId = getTherapistCareerStageId(state.therapistCareer.level);
  return CAREER_STAGE_LOOKUP.get(stageId) ?? CAREER_STAGES[0];
}

export function getTherapistCareerStageUnlockLevel(stageId: CareerStageId): number {
  return CAREER_STAGE_LOOKUP.get(stageId)?.unlockLevel ?? 1;
}

export type CareerChoiceStatus = {
  stageId: CareerStageId;
  unlocked: boolean;
  chosen: boolean;
  available: boolean;
};

export function getTherapistCareerChoiceStatus(state: GameState): CareerChoiceStatus[] {
  const career = state.therapistCareer;
  const level = Math.max(1, Math.floor(career.level));
  const lockedTrackId = career.primaryTrackId ?? career.activeTrackId;

  const licensedAssociateUnlocked =
    level >= getTherapistCareerStageUnlockLevel("licensed-associate");
  const specialistUnlocked =
    level >= getTherapistCareerStageUnlockLevel("specialist-certification");
  const builderUnlocked = level >= getTherapistCareerStageUnlockLevel("practice-builder");
  const ownerUnlocked = level >= getTherapistCareerStageUnlockLevel("private-practice-owner");

  return [
    {
      stageId: "licensed-associate",
      unlocked: licensedAssociateUnlocked,
      chosen: lockedTrackId !== null,
      available: licensedAssociateUnlocked && lockedTrackId === null,
    },
    {
      stageId: "specialist-certification",
      unlocked: specialistUnlocked,
      chosen: career.modalityId !== null,
      available: specialistUnlocked && career.modalityId === null,
    },
    {
      stageId: "practice-builder",
      unlocked: builderUnlocked,
      chosen: career.operatingStyleId !== null,
      available: builderUnlocked && career.operatingStyleId === null,
    },
    {
      stageId: "private-practice-owner",
      unlocked: ownerUnlocked,
      chosen: career.expansionFocusId !== null,
      available: ownerUnlocked && career.expansionFocusId === null,
    },
  ];
}

export function getTherapistCareerEffectMultipliers(
  state: GameState,
): TherapistCareerEffectMultipliers {
  const career = state.therapistCareer;

  const base: TherapistCareerEffectMultipliers = {
    salaryMultiplier: 1,
    sessionCashPayoutMultiplier: 1,
    sessionCooldownMultiplier: 1,
    sessionEnjoymentCostMultiplier: 1,
  };

  const trackId = career.primaryTrackId ?? career.activeTrackId;
  const trackEffects = trackId
    ? CAREER_TRACK_EFFECTS.find((choice) => choice.id === trackId)?.effects
    : null;

  const withTrack = trackEffects ? multiplyEffects(base, trackEffects) : base;

  const modalityEffects = career.modalityId
    ? CAREER_MODALITIES.find((choice) => choice.id === career.modalityId)?.effects
    : null;
  const withModality = modalityEffects ? multiplyEffects(withTrack, modalityEffects) : withTrack;

  const styleEffects = career.operatingStyleId
    ? CAREER_OPERATING_STYLES.find((choice) => choice.id === career.operatingStyleId)?.effects
    : null;
  const withStyle = styleEffects ? multiplyEffects(withModality, styleEffects) : withModality;

  const focusEffects = career.expansionFocusId
    ? CAREER_EXPANSION_FOCUSES.find((choice) => choice.id === career.expansionFocusId)?.effects
    : null;
  return focusEffects ? multiplyEffects(withStyle, focusEffects) : withStyle;
}

function getTherapistSessionTermsWithEffects(
  state: GameState,
  trackId: CareerTrackId | null,
  multipliers: TherapistCareerEffectMultipliers,
): { supportsSessions: boolean; terms: TherapistSessionTerms | null } {
  if (!trackId) {
    return { supportsSessions: false, terms: null };
  }

  if (!(CAREER_TRACK_HAS_SESSIONS.get(trackId) ?? false)) {
    return { supportsSessions: false, terms: null };
  }

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

  const beforeMultipliers = getTherapistCareerEffectMultipliers(state);
  const beforeSalaryCentsPerSec = getTherapistSalaryCentsPerSec({
    level: career.level,
    prestigeLegacyMultiplier: getPrestigeLegacyMultiplier(state),
    salaryMultiplier: beforeMultipliers.salaryMultiplier,
  });
  const beforeSessions = getTherapistSessionTermsWithEffects(
    state,
    lockedTrackId,
    beforeMultipliers,
  );

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
  const afterSessions = getTherapistSessionTermsWithEffects(
    nextState,
    nextCareer.activeTrackId,
    afterMultipliers,
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
