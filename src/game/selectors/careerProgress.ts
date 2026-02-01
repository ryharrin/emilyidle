import { CAREER_STAGES, type CareerStageId } from "../data/careerStages";
import type { GameState } from "../model/types";
import {
  getTherapistCareerChoiceStatus,
  getTherapistCareerStage,
  getTherapistCareerStageUnlockLevel,
} from "./careerStages";
import { getTherapistXpRequiredForNextLevel } from "./therapistPolicy";

export type CareerNextUnlock =
  | { kind: "start"; label: string }
  | { kind: "choice"; stageId: CareerStageId; label: string }
  | { kind: "stage"; stageId: CareerStageId; label: string; unlockLevel: number }
  | null;

export type CareerNextStageProgress = {
  currentLevel: number;
  nextUnlockLevel: number;
  progress01: number;
  levelsRemaining: number;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function getChoiceLabel(stageId: CareerStageId): string {
  switch (stageId) {
    case "licensed-associate":
      return "Choose your primary track";
    case "specialist-certification":
      return "Choose a modality";
    case "practice-builder":
      return "Choose an operating style";
    case "private-practice-owner":
      return "Choose an expansion focus";
    default:
      return "Choose";
  }
}

export function getCareerNextUnlock(state: GameState): CareerNextUnlock {
  if (state.therapistCareer.careerStartId === null) {
    return { kind: "start", label: "Enter the PhD program" };
  }

  const choice = getTherapistCareerChoiceStatus(state).find((status) => status.available);
  if (choice) {
    return { kind: "choice", stageId: choice.stageId, label: getChoiceLabel(choice.stageId) };
  }

  const level = Math.max(1, Math.floor(state.therapistCareer.level));
  const nextStage = CAREER_STAGES.find((stage) => stage.unlockLevel > level) ?? null;
  if (!nextStage) {
    return null;
  }

  return {
    kind: "stage",
    stageId: nextStage.id,
    label: nextStage.label,
    unlockLevel: nextStage.unlockLevel,
  };
}

export function getCareerNextStageProgress(state: GameState): CareerNextStageProgress {
  const nextUnlock = getCareerNextUnlock(state);
  const level = Math.max(1, Math.floor(state.therapistCareer.level));
  const xpRequired = Math.max(1, getTherapistXpRequiredForNextLevel(level));
  const xpProgress01 = clamp01(state.therapistCareer.xp / xpRequired);
  const fractionalLevel = level + xpProgress01;

  if (nextUnlock?.kind === "start") {
    return {
      currentLevel: level,
      nextUnlockLevel: level,
      progress01: 0,
      levelsRemaining: 0,
    };
  }

  if (nextUnlock?.kind === "choice") {
    return {
      currentLevel: level,
      nextUnlockLevel: level,
      progress01: 1,
      levelsRemaining: 0,
    };
  }

  const currentStage = getTherapistCareerStage(state);
  const stageStartLevel = getTherapistCareerStageUnlockLevel(currentStage.id);
  const nextUnlockLevel = nextUnlock?.kind === "stage" ? nextUnlock.unlockLevel : level;
  const span = Math.max(1, nextUnlockLevel - stageStartLevel);
  const progress01 = clamp01((fractionalLevel - stageStartLevel) / span);

  return {
    currentLevel: level,
    nextUnlockLevel,
    progress01,
    levelsRemaining: Math.max(0, nextUnlockLevel - fractionalLevel),
  };
}
