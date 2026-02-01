import type { CareerTrackId } from "../model/types";

export const THERAPIST_BASE_SALARY_CENTS_PER_SEC = 4;
export const THERAPIST_SALARY_CENTS_PER_SEC_PER_LEVEL = 2;

export const THERAPIST_PHD_STIPEND_CENTS_PER_SEC = 1;

export const THERAPIST_SALARY_ACTIVE_BASE_WINDOW_MS = 180_000;
export const THERAPIST_SALARY_ACTIVE_WINDOW_MS_PER_CAREER_POINT = 30_000;
export const THERAPIST_SALARY_ACTIVE_WINDOW_MAX_MS = 1_800_000;

export const THERAPIST_BASE_SESSION_COOLDOWN_MS = 30_000;
export const THERAPIST_BASE_SESSION_ENJOYMENT_COST_CENTS = 150;
export const THERAPIST_BASE_SESSION_CASH_PAYOUT_CENTS = 500;

export const THERAPIST_SESSION_TRACK_CONFIG: Record<
  CareerTrackId,
  { enjoymentCostMultiplier: number; cashPayoutMultiplier: number; cooldownMs: number }
> = {
  "private-practice": {
    enjoymentCostMultiplier: 1,
    cashPayoutMultiplier: 1,
    cooldownMs: 30_000,
  },
  "va-hospital": {
    enjoymentCostMultiplier: 0.9,
    cashPayoutMultiplier: 0.8,
    cooldownMs: 45_000,
  },
  "research-teaching": {
    enjoymentCostMultiplier: 0.85,
    cashPayoutMultiplier: 0.75,
    cooldownMs: 60_000,
  },
};
