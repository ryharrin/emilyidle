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

const SESSION_PREMIUM_WINDOW_MULTIPLIER = 2;
const SESSION_PREMIUM_STEP = 0.2;
const SESSION_PREMIUM_MAX_COUNT = 3;
const SESSION_PREMIUM_LABELS = [
  "Second session premium",
  "Third session premium",
  "Back-to-back premium",
];
const SESSION_PREMIUM_NOTE = "Waiting twice the cooldown resets the premium.";

function normalizeNowMs(nowMs: number): number {
  return Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
}

const CAREER_TRACK_LOOKUP = new Map(CAREER_TRACKS.map((track) => [track.id, track] as const));
const PRE_TRACK_FALLBACK_TRACK_ID: CareerTrackId = "private-practice";

export type TherapistSessionPolicy = {
  supportsSessions: boolean;
  enjoymentCostCents: number;
  premiumEnjoymentCostCents: number;
  premiumMultiplier: number;
  premiumCount: number;
  premiumLabel: string;
  premiumNote: string;
  premiumWindowMs: number;
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

export function getTherapistSessionPolicy(state: GameState, nowMs: number): TherapistSessionPolicy {
  const trackId = resolveTherapistSessionTrackId(state);
  const supportsSessions = trackId
    ? (CAREER_TRACK_LOOKUP.get(trackId)?.hasSessions ?? false)
    : false;

  if (!supportsSessions) {
    return {
      supportsSessions: false,
      enjoymentCostCents: 0,
      premiumEnjoymentCostCents: 0,
      premiumMultiplier: 1,
      premiumCount: 0,
      premiumLabel: "",
      premiumNote: "",
      premiumWindowMs: 0,
      cashPayoutCents: 0,
      cooldownMs: 0,
    };
  }

  const clampedNowMs = normalizeNowMs(nowMs);
  const baseEnjoymentCost = getTherapistSessionEnjoymentCostCents(state, trackId);
  const cooldownMs = getTherapistSessionCooldownMs(state, trackId);
  const cashPayoutCents = getTherapistSessionCashPayoutCents(state, trackId);
  const premiumWindowMs = Math.max(0, Math.floor(cooldownMs * SESSION_PREMIUM_WINDOW_MULTIPLIER));
  const lastSessionAtMs = state.therapistCareer.lastSessionAtMs;
  const withinWindow =
    premiumWindowMs > 0 &&
    lastSessionAtMs > 0 &&
    clampedNowMs >= lastSessionAtMs &&
    clampedNowMs - lastSessionAtMs < premiumWindowMs;
  const storedPremiumCount = Math.max(0, Math.floor(state.therapistCareer.sessionPremiumCount));
  const premiumCount = withinWindow ? Math.min(SESSION_PREMIUM_MAX_COUNT, storedPremiumCount) : 0;
  const premiumMultiplier = 1 + premiumCount * SESSION_PREMIUM_STEP;
  const premiumEnjoymentCostCents = Math.max(0, Math.floor(baseEnjoymentCost * premiumMultiplier));
  const premiumLabel =
    premiumCount > 0
      ? SESSION_PREMIUM_LABELS[Math.min(premiumCount - 1, SESSION_PREMIUM_LABELS.length - 1)]
      : "";
  const premiumNote = premiumCount > 0 ? SESSION_PREMIUM_NOTE : "";

  return {
    supportsSessions,
    enjoymentCostCents: baseEnjoymentCost,
    premiumEnjoymentCostCents,
    premiumMultiplier,
    premiumCount,
    premiumLabel,
    premiumNote,
    premiumWindowMs,
    cashPayoutCents,
    cooldownMs,
  };
}

export function getTherapistSessionCostLabel(state: GameState, nowMs: number): string {
  const career = state.therapistCareer;
  const policy = getTherapistSessionPolicy(state, nowMs);
  if (!policy.supportsSessions) {
    return "Sessions unavailable";
  }
  if (career.freeSessionAvailable) {
    return "Free first session";
  }
  return `${formatMoneyFromCents(policy.premiumEnjoymentCostCents)} enjoyment`;
}

export function canPerformTherapistSession(state: GameState, nowMs: number): boolean {
  const career = state.therapistCareer;
  const policy = getTherapistSessionPolicy(state, nowMs);
  if (!policy.supportsSessions) {
    return false;
  }
  if (nowMs < career.nextAvailableAtMs) {
    return false;
  }

  if (career.freeSessionAvailable) {
    return true;
  }

  return state.enjoymentCents >= policy.premiumEnjoymentCostCents;
}
