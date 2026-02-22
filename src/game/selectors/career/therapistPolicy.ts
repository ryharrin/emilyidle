import type { CareerTrackId, TherapistCareerEffectMultipliers } from "../../model/types";

import {
  THERAPIST_BASE_SALARY_CENTS_PER_SEC,
  THERAPIST_BASE_SESSION_CASH_PAYOUT_CENTS,
  THERAPIST_BASE_SESSION_COOLDOWN_MS,
  THERAPIST_BASE_SESSION_ENJOYMENT_COST_CENTS,
  THERAPIST_SALARY_CENTS_PER_SEC_PER_LEVEL,
  THERAPIST_SESSION_TRACK_CONFIG,
} from "./therapistConstants";

export type TherapistSessionTerms = {
  cooldownMs: number;
  enjoymentCostCents: number;
  cashPayoutCents: number;
};

export function getTherapistBaseSalaryCentsPerSec(level: number): number {
  const clampedLevel = Math.max(1, Math.floor(level));
  return (
    THERAPIST_BASE_SALARY_CENTS_PER_SEC +
    (clampedLevel - 1) * THERAPIST_SALARY_CENTS_PER_SEC_PER_LEVEL
  );
}

export function getTherapistSalaryCentsPerSec(args: {
  level: number;
  prestigeLegacyMultiplier: number;
  salaryMultiplier: number;
}): number {
  const baseSalary = getTherapistBaseSalaryCentsPerSec(args.level);
  return Math.max(
    0,
    Math.floor(baseSalary * args.prestigeLegacyMultiplier * args.salaryMultiplier),
  );
}

export function getTherapistBaseSessionCooldownMs(trackId: CareerTrackId | null): number {
  if (!trackId) {
    return 0;
  }

  return THERAPIST_SESSION_TRACK_CONFIG[trackId]?.cooldownMs ?? THERAPIST_BASE_SESSION_COOLDOWN_MS;
}

export function getTherapistBaseSessionEnjoymentCostCents(
  level: number,
  trackId: CareerTrackId | null,
): number {
  if (!trackId) {
    return 0;
  }

  const clampedLevel = Math.max(1, Math.floor(level));
  const multiplier = THERAPIST_SESSION_TRACK_CONFIG[trackId]?.enjoymentCostMultiplier ?? 1;
  return Math.max(
    0,
    Math.floor(
      THERAPIST_BASE_SESSION_ENJOYMENT_COST_CENTS * (1 + 0.12 * (clampedLevel - 1)) * multiplier,
    ),
  );
}

export function getTherapistBaseSessionCashPayoutCents(
  level: number,
  trackId: CareerTrackId | null,
): number {
  if (!trackId) {
    return 0;
  }

  const clampedLevel = Math.max(1, Math.floor(level));
  const multiplier = THERAPIST_SESSION_TRACK_CONFIG[trackId]?.cashPayoutMultiplier ?? 1;
  return Math.max(
    0,
    Math.floor(
      THERAPIST_BASE_SESSION_CASH_PAYOUT_CENTS * (1 + 0.18 * (clampedLevel - 1)) * multiplier,
    ),
  );
}

export function applyTherapistSessionMultipliers(
  terms: TherapistSessionTerms,
  multipliers: TherapistCareerEffectMultipliers,
): TherapistSessionTerms {
  return {
    cooldownMs: Math.max(0, Math.floor(terms.cooldownMs * multipliers.sessionCooldownMultiplier)),
    enjoymentCostCents: Math.max(
      0,
      Math.floor(terms.enjoymentCostCents * multipliers.sessionEnjoymentCostMultiplier),
    ),
    cashPayoutCents: Math.max(
      0,
      Math.floor(terms.cashPayoutCents * multipliers.sessionCashPayoutMultiplier),
    ),
  };
}

export function getTherapistXpRequiredForNextLevel(level: number): number {
  const clampedLevel = Math.max(1, Math.floor(level));
  const baseRequirement = 80 * 1.25 ** (clampedLevel - 1);
  const earlyLevelDiscount = clampedLevel <= 5 ? Math.min(1, 0.78 + (clampedLevel - 1) * 0.05) : 1;
  return Math.max(20, Math.floor(baseRequirement * earlyLevelDiscount));
}
