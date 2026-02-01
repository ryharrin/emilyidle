import { CAREER_NODES } from "../data/career";
import type { GameState } from "../model/types";

import {
  THERAPIST_PHD_STIPEND_CENTS_PER_SEC,
  THERAPIST_SALARY_ACTIVE_BASE_WINDOW_MS,
  THERAPIST_SALARY_ACTIVE_WINDOW_MAX_MS,
  THERAPIST_SALARY_ACTIVE_WINDOW_MS_PER_CAREER_POINT,
} from "./therapistConstants";
import { getPrestigeLegacyMultiplier } from "./enjoyment";
import { getTherapistCareerEffectMultipliers, getTherapistCareerStageId } from "./careerStages";
import { getTherapistSalaryCentsPerSec } from "./therapistPolicy";

export function getTherapistSalaryActiveWindowMs(state: GameState): number {
  const career = state.therapistCareer;
  const spentPoints = CAREER_NODES.reduce(
    (total, node) => total + (career.spentNodes[node.id] ? node.costPoints : 0),
    0,
  );

  const windowMs =
    THERAPIST_SALARY_ACTIVE_BASE_WINDOW_MS +
    spentPoints * THERAPIST_SALARY_ACTIVE_WINDOW_MS_PER_CAREER_POINT;

  return Math.max(
    THERAPIST_SALARY_ACTIVE_BASE_WINDOW_MS,
    Math.min(THERAPIST_SALARY_ACTIVE_WINDOW_MAX_MS, Math.floor(windowMs)),
  );
}

export function isTherapistSalaryActive(state: GameState, nowMs: number): boolean {
  const career = state.therapistCareer;
  if (career.careerStartId === null) {
    return false;
  }

  if (getTherapistCareerStageId(career.level) === "retirement") {
    return true;
  }

  return nowMs < career.salaryActiveUntilMs;
}

export function getTherapistCashRateCentsPerSec(state: GameState, nowMs: number): number {
  if (!isTherapistSalaryActive(state, nowMs)) {
    return 0;
  }

  const career = state.therapistCareer;
  const prestigeLegacyMultiplier = getPrestigeLegacyMultiplier(state);

  if (career.primaryTrackId === null) {
    return Math.max(0, Math.floor(THERAPIST_PHD_STIPEND_CENTS_PER_SEC * prestigeLegacyMultiplier));
  }

  const effects = getTherapistCareerEffectMultipliers(state);
  return getTherapistSalaryCentsPerSec({
    level: career.level,
    prestigeLegacyMultiplier,
    salaryMultiplier: effects.salaryMultiplier,
  });
}
