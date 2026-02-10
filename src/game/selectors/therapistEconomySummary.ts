import { CAREER_STAGES } from "../data/careerStages";
import type { GameState } from "../model/types";

import { getCareerNextUnlock } from "./careerProgress";
import { getTherapistXpRequiredForNextLevel } from "./therapistPolicy";
import {
  getTherapistSalaryActiveWindowMs,
  getTherapistSalaryExpirationAlert,
} from "./therapistSalary";
import { getTherapistSessionPolicy } from "./therapistSessions";

export type TherapistSessionValueDeltaSummary = {
  supportsSessions: boolean;
  isFreeSession: boolean;
  cashPayoutCents: number;
  enjoymentCostCents: number;
  effectiveEnjoymentCostCents: number;
  cooldownMs: number;
  cooldownRemainingMs: number;
  cooldownRushMultiplier: number;
  cooldownRushExtraCents: number;
  premiumCount: number;
  premiumMultiplier: number;
};

export type TherapistSalaryWindowSummary = {
  isActive: boolean;
  remainingMs: number;
  windowMs: number;
  expiresAtMs: number;
  alertLevel: "none" | "soon" | "urgent";
  statusLabel: "active" | "inactive";
};

export type TherapistNearTermUnlockImpact = {
  kind: "start" | "choice" | "stage" | "none";
  title: string;
  detail: string;
  levelsRemaining: number;
  xpToNextLevel: number;
  summaryText: string;
};

export function getTherapistSessionValueDeltaSummary(
  state: GameState,
  nowMs: number,
): TherapistSessionValueDeltaSummary {
  const policy = getTherapistSessionPolicy(state, nowMs);
  if (!policy.supportsSessions) {
    return {
      supportsSessions: false,
      isFreeSession: false,
      cashPayoutCents: 0,
      enjoymentCostCents: 0,
      effectiveEnjoymentCostCents: 0,
      cooldownMs: 0,
      cooldownRemainingMs: 0,
      cooldownRushMultiplier: 1,
      cooldownRushExtraCents: 0,
      premiumCount: 0,
      premiumMultiplier: 1,
    };
  }

  const isFreeSession = state.therapistCareer.freeSessionAvailable;
  return {
    supportsSessions: true,
    isFreeSession,
    cashPayoutCents: policy.cashPayoutCents,
    enjoymentCostCents: isFreeSession ? 0 : policy.premiumEnjoymentCostCents,
    effectiveEnjoymentCostCents: isFreeSession ? 0 : policy.effectiveEnjoymentCostCents,
    cooldownMs: policy.cooldownMs,
    cooldownRemainingMs: policy.cooldownRemainingMs,
    cooldownRushMultiplier: policy.cooldownRushMultiplier,
    cooldownRushExtraCents: policy.cooldownRushExtraCents,
    premiumCount: policy.premiumCount,
    premiumMultiplier: policy.premiumMultiplier,
  };
}

export function getTherapistSalaryWindowSummary(
  state: GameState,
  nowMs: number,
): TherapistSalaryWindowSummary {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const windowMs = getTherapistSalaryActiveWindowMs(state);
  const expiresAtMs = Math.max(0, state.therapistCareer.salaryActiveUntilMs);
  const remainingMs = Math.max(0, expiresAtMs - clampedNowMs);
  const alert = getTherapistSalaryExpirationAlert(state, clampedNowMs);
  const isActive = remainingMs > 0;
  return {
    isActive,
    remainingMs,
    windowMs,
    expiresAtMs,
    alertLevel: alert.level,
    statusLabel: isActive ? "active" : "inactive",
  };
}

export function getTherapistNearTermUnlockImpact(state: GameState): TherapistNearTermUnlockImpact {
  const career = state.therapistCareer;
  if (career.careerStartId === null) {
    return {
      kind: "start",
      title: "Start career",
      detail: "Enter the PhD program to begin salary windows and session payouts.",
      levelsRemaining: 0,
      xpToNextLevel: 0,
      summaryText: "Start the PhD program",
    };
  }

  const level = Math.max(1, Math.floor(career.level));
  const xpToNextLevel = Math.max(0, getTherapistXpRequiredForNextLevel(level) - career.xp);
  const nextUnlock = getCareerNextUnlock(state);

  if (nextUnlock?.kind === "choice") {
    return {
      kind: "choice",
      title: "Choice ready",
      detail: `${nextUnlock.label}. Spend points to lock in your next multiplier package.`,
      levelsRemaining: 0,
      xpToNextLevel,
      summaryText: nextUnlock.label,
    };
  }

  if (nextUnlock?.kind === "stage") {
    const stageLabel = CAREER_STAGES.find((stage) => stage.id === nextUnlock.stageId)?.label;
    const levelsRemaining = Math.max(0, nextUnlock.unlockLevel - level);
    return {
      kind: "stage",
      title: "Stage unlock",
      detail: `Reach level ${nextUnlock.unlockLevel} to unlock ${stageLabel ?? nextUnlock.label}.`,
      levelsRemaining,
      xpToNextLevel,
      summaryText: `Reach level ${nextUnlock.unlockLevel}`,
    };
  }

  if (nextUnlock?.kind === "start") {
    return {
      kind: "start",
      title: "Start career",
      detail: nextUnlock.label,
      levelsRemaining: 0,
      xpToNextLevel,
      summaryText: nextUnlock.label,
    };
  }

  return {
    kind: "none",
    title: "Max stage reached",
    detail: "Current career stage is capped. Use sessions and upgrades to optimize payout cadence.",
    levelsRemaining: 0,
    xpToNextLevel,
    summaryText: "Career stage maxed",
  };
}
