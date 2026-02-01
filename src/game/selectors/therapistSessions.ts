import { CAREER_TRACKS, TRACK_CHOICE_UNLOCK_LEVEL } from "../data/career";
import { formatMoneyFromCents } from "../format";
import type { CareerTrackId, GameState } from "../model/types";

import { getTherapistCareerEffectMultipliers } from "./careerStages";
import {
  getTherapistBaseSessionCashPayoutCents,
  getTherapistBaseSessionCooldownMs,
  getTherapistBaseSessionEnjoymentCostCents,
} from "./therapistPolicy";
import { getTherapistCareerStageId } from "./careerStages";

const CAREER_TRACK_LOOKUP = new Map(CAREER_TRACKS.map((track) => [track.id, track] as const));
const PRE_TRACK_FALLBACK_TRACK_ID: CareerTrackId = "private-practice";

export type TherapistSessionPolicy = {
  supportsSessions: boolean;
  enjoymentCostCents: number;
  cashPayoutCents: number;
  cooldownMs: number;
};

function resolveTherapistSessionTrackId(state: GameState): CareerTrackId | null {
  const career = state.therapistCareer;
  if (career.activeTrackId) {
    return career.activeTrackId;
  }
  if (career.careerStartId === null) {
    return null;
  }
  if (getTherapistCareerStageId(career.level) === "retirement") {
    return null;
  }
  if (career.level >= TRACK_CHOICE_UNLOCK_LEVEL) {
    return null;
  }
  return PRE_TRACK_FALLBACK_TRACK_ID;
}

export function doesActiveCareerTrackSupportSessions(state: GameState): boolean {
  const trackId = resolveTherapistSessionTrackId(state);
  if (!trackId) {
    return false;
  }
  return CAREER_TRACK_LOOKUP.get(trackId)?.hasSessions ?? false;
}

export function getTherapistSessionCooldownMs(
  state: GameState,
  trackId: CareerTrackId | null,
): number {
  if (!trackId) {
    return 0;
  }
  const effects = getTherapistCareerEffectMultipliers(state);
  const base = getTherapistBaseSessionCooldownMs(trackId);
  return Math.max(0, Math.floor(base * effects.sessionCooldownMultiplier));
}

export function getTherapistSessionEnjoymentCostCents(
  state: GameState,
  trackId: CareerTrackId | null,
): number {
  if (!trackId) {
    return 0;
  }
  const effects = getTherapistCareerEffectMultipliers(state);
  const base = getTherapistBaseSessionEnjoymentCostCents(state.therapistCareer.level, trackId);
  return Math.max(0, Math.floor(base * effects.sessionEnjoymentCostMultiplier));
}

export function getTherapistSessionCashPayoutCents(
  state: GameState,
  trackId: CareerTrackId | null,
): number {
  if (!trackId) {
    return 0;
  }
  const effects = getTherapistCareerEffectMultipliers(state);
  const base = getTherapistBaseSessionCashPayoutCents(state.therapistCareer.level, trackId);
  return Math.max(0, Math.floor(base * effects.sessionCashPayoutMultiplier));
}

export function getTherapistSessionPolicy(state: GameState): TherapistSessionPolicy {
  const trackId = resolveTherapistSessionTrackId(state);
  const supportsSessions = trackId
    ? (CAREER_TRACK_LOOKUP.get(trackId)?.hasSessions ?? false)
    : false;

  if (!supportsSessions) {
    return {
      supportsSessions: false,
      enjoymentCostCents: 0,
      cashPayoutCents: 0,
      cooldownMs: 0,
    };
  }

  return {
    supportsSessions,
    enjoymentCostCents: getTherapistSessionEnjoymentCostCents(state, trackId),
    cashPayoutCents: getTherapistSessionCashPayoutCents(state, trackId),
    cooldownMs: getTherapistSessionCooldownMs(state, trackId),
  };
}

export function getTherapistSessionCostLabel(state: GameState): string {
  const career = state.therapistCareer;
  const policy = getTherapistSessionPolicy(state);
  if (!policy.supportsSessions) {
    return "Sessions unavailable";
  }
  if (career.freeSessionAvailable) {
    return "Free first session";
  }
  return `${formatMoneyFromCents(policy.enjoymentCostCents)} enjoyment`;
}

export function canPerformTherapistSession(state: GameState, nowMs: number): boolean {
  const career = state.therapistCareer;
  const policy = getTherapistSessionPolicy(state);
  if (!policy.supportsSessions) {
    return false;
  }
  if (nowMs < career.nextAvailableAtMs) {
    return false;
  }

  if (career.freeSessionAvailable) {
    return true;
  }

  return state.enjoymentCents >= policy.enjoymentCostCents;
}
