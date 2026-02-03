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
import type { GameState, TherapistCareerEffectMultipliers } from "../model/types";
import { getTherapistCareerNodeEffectMultipliers } from "./therapistNodeEffects";

export { type CareerStageId };

const CAREER_STAGE_LOOKUP = new Map<CareerStageId, CareerStageDefinition>(
  CAREER_STAGES.map((stage) => [stage.id, stage]),
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

function multiplyMultipliers(
  base: TherapistCareerEffectMultipliers,
  effect: TherapistCareerEffectMultipliers,
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
  if (career.careerStartId === null) {
    return [
      {
        stageId: "licensed-associate",
        unlocked: false,
        chosen: false,
        available: false,
      },
      {
        stageId: "specialist-certification",
        unlocked: false,
        chosen: false,
        available: false,
      },
      {
        stageId: "practice-builder",
        unlocked: false,
        chosen: false,
        available: false,
      },
      {
        stageId: "private-practice-owner",
        unlocked: false,
        chosen: false,
        available: false,
      },
    ];
  }
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
  const withFocus = focusEffects ? multiplyEffects(withStyle, focusEffects) : withStyle;

  const nodeEffects = getTherapistCareerNodeEffectMultipliers(state);
  const withNodes = multiplyMultipliers(withFocus, nodeEffects);

  const stageId = getTherapistCareerStageId(career.level);
  if (stageId === "retirement") {
    return {
      salaryMultiplier: withNodes.salaryMultiplier * 0.9,
      sessionCashPayoutMultiplier: withNodes.sessionCashPayoutMultiplier,
      sessionCooldownMultiplier: withNodes.sessionCooldownMultiplier,
      sessionEnjoymentCostMultiplier: withNodes.sessionEnjoymentCostMultiplier,
    };
  }

  return withNodes;
}
