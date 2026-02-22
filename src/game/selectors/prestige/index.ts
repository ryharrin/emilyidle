import { NOSTALGIA_UNLOCK_ORDER, NOSTALGIA_UNLOCK_COSTS } from "../../data/items";
import { getEnjoymentCents, getEnjoymentRateCentsPerSec } from "../enjoyment";
import { hasMaisonLine } from "../collection";
import type { GameState, WatchItemId } from "../../model/types";
import { MAISON_LINES } from "../../model/state";
import { getTherapistCashRateCentsPerSec } from "../therapistSalary";

const WORKSHOP_PRESTIGE_THRESHOLD_CENTS = 800_000;
const MAISON_PRESTIGE_THRESHOLD_CENTS = 4_000_000;
const NOSTALGIA_PRESTIGE_THRESHOLD_CENTS = 12_000_000;
const REVEAL_THRESHOLD_RATIO = 0.7;

const CRAFTED_BOOST_MULTIPLIERS: Record<string, number> = {
  "artisan-jig": 1.12,
};

export type WorkshopNextBlueprintProgress = {
  currentBlueprintGain: number;
  nextBlueprintGain: number;
  nextEnjoymentThresholdCents: number;
  enjoymentRemainingCents: number;
  etaSeconds: number | null;
  cashEarnedDuringEtaCents: number;
};

export type BlueprintCostDetail = {
  currentCostCents: number;
  nextCostCents: number;
  deltaCents: number;
  hasNext: boolean;
};

export function getNostalgiaPrestigeThresholdCents(): number {
  return NOSTALGIA_PRESTIGE_THRESHOLD_CENTS;
}

export function getNostalgiaPrestigeGain(state: GameState): number {
  const earned = Math.max(0, Math.floor(state.nostalgiaEnjoymentEarnedCents));
  if (earned < NOSTALGIA_PRESTIGE_THRESHOLD_CENTS) {
    return 0;
  }
  return Math.max(1, Math.floor((earned / NOSTALGIA_PRESTIGE_THRESHOLD_CENTS) ** 0.5));
}

export function canNostalgiaPrestige(state: GameState): boolean {
  return getNostalgiaPrestigeGain(state) > 0;
}

export function canBuyNostalgiaUnlock(state: GameState, id: WatchItemId): boolean {
  if (state.nostalgiaResets < 1) {
    return false;
  }

  if (!NOSTALGIA_UNLOCK_ORDER.includes(id)) {
    return false;
  }

  if (state.nostalgiaUnlockedItems.includes(id)) {
    return false;
  }

  const nextUnlock = NOSTALGIA_UNLOCK_ORDER.find(
    (entry) => !state.nostalgiaUnlockedItems.includes(entry),
  );
  if (nextUnlock !== id) {
    return false;
  }

  return state.nostalgiaPoints >= (NOSTALGIA_UNLOCK_COSTS[id] ?? 0);
}

export function canRefundNostalgiaUnlock(state: GameState, id: WatchItemId): boolean {
  if (!state.nostalgiaUnlockedItems.includes(id)) {
    return false;
  }

  const lastUnlocked = [...NOSTALGIA_UNLOCK_ORDER]
    .reverse()
    .find((entry) => state.nostalgiaUnlockedItems.includes(entry));
  return lastUnlocked === id;
}

// getNostalgiaUnlockCost is exported from collection/index.ts
// Import from there to avoid circular dependencies

export function getWorkshopPrestigeThresholdCents(): number {
  return WORKSHOP_PRESTIGE_THRESHOLD_CENTS;
}

function getCraftedBoostPrestigeMultiplier(state: GameState): number {
  const jigBoosts = state.craftedBoosts["artisan-jig"] ?? 0;
  return Math.pow(CRAFTED_BOOST_MULTIPLIERS["artisan-jig"], jigBoosts);
}

function getTotalCashRateCentsPerSec(state: GameState, nowMs: number): number {
  // Re-export with proper implementation via therapistSalary
  return getTherapistCashRateCentsPerSec(state, nowMs);
}

export function getWorkshopPrestigeGain(state: GameState): number {
  const enjoyment = getEnjoymentCents(state);
  const baseGain = Math.max(0, Math.floor((enjoyment / WORKSHOP_PRESTIGE_THRESHOLD_CENTS) ** 0.5));
  return Math.floor(
    (baseGain + getMaisonLineBlueprintBonus(state)) * getCraftedBoostPrestigeMultiplier(state),
  );
}

export function getWorkshopNextBlueprintProgress(
  state: GameState,
  nowMs: number,
): WorkshopNextBlueprintProgress {
  const enjoyment = getEnjoymentCents(state);
  const currentBlueprintGain = getWorkshopPrestigeGain(state);
  const nextBlueprintGain = currentBlueprintGain + 1;
  const maisonBonus = getMaisonLineBlueprintBonus(state);
  const craftedMultiplier = getCraftedBoostPrestigeMultiplier(state);
  const currentBaseGain = Math.max(
    0,
    Math.floor((enjoyment / WORKSHOP_PRESTIGE_THRESHOLD_CENTS) ** 0.5),
  );

  let nextBaseGain = currentBaseGain;
  while (Math.floor((nextBaseGain + maisonBonus) * craftedMultiplier) < nextBlueprintGain) {
    nextBaseGain += 1;
  }

  const nextEnjoymentThresholdCents = WORKSHOP_PRESTIGE_THRESHOLD_CENTS * nextBaseGain ** 2;
  const enjoymentRemainingCents = Math.max(0, Math.ceil(nextEnjoymentThresholdCents - enjoyment));
  const enjoymentRate = getEnjoymentRateCentsPerSec(state);
  const etaSeconds = enjoymentRate > 0 ? Math.ceil(enjoymentRemainingCents / enjoymentRate) : null;
  const cashEarnedDuringEtaCents =
    etaSeconds === null
      ? 0
      : Math.max(0, Math.floor(getTotalCashRateCentsPerSec(state, nowMs) * etaSeconds));

  return {
    currentBlueprintGain,
    nextBlueprintGain,
    nextEnjoymentThresholdCents,
    enjoymentRemainingCents,
    etaSeconds,
    cashEarnedDuringEtaCents,
  };
}

export function getWorkshopBlueprintCostDetail(state: GameState): BlueprintCostDetail {
  const enjoyment = getEnjoymentCents(state);
  const currentBlueprintGain = getWorkshopPrestigeGain(state);
  const currentBaseGain = Math.max(
    0,
    Math.floor((enjoyment / WORKSHOP_PRESTIGE_THRESHOLD_CENTS) ** 0.5),
  );
  const nextBlueprintGain = currentBlueprintGain + 1;
  const maisonBonus = getMaisonLineBlueprintBonus(state);
  const craftedMultiplier = getCraftedBoostPrestigeMultiplier(state);

  let nextBaseGain = currentBaseGain;
  while (Math.floor((nextBaseGain + maisonBonus) * craftedMultiplier) < nextBlueprintGain) {
    nextBaseGain += 1;
  }

  const currentCostCents = WORKSHOP_PRESTIGE_THRESHOLD_CENTS * currentBaseGain ** 2;
  const nextCostCents = WORKSHOP_PRESTIGE_THRESHOLD_CENTS * nextBaseGain ** 2;
  const deltaCents = Math.max(0, nextCostCents - currentCostCents);

  return {
    currentCostCents,
    nextCostCents,
    deltaCents,
    hasNext: nextBaseGain > currentBaseGain,
  };
}

export function canWorkshopPrestige(state: GameState): boolean {
  return getWorkshopPrestigeGain(state) > 0;
}

export function isWorkshopRevealReady(state: GameState): boolean {
  return state.enjoymentCents >= WORKSHOP_PRESTIGE_THRESHOLD_CENTS * REVEAL_THRESHOLD_RATIO;
}

export function getMaisonPrestigeThresholdCents(): number {
  return MAISON_PRESTIGE_THRESHOLD_CENTS;
}

export function getMaisonPrestigeGain(state: GameState): number {
  const enjoyment = getEnjoymentCents(state);
  const combined = enjoyment / MAISON_PRESTIGE_THRESHOLD_CENTS + state.workshopBlueprints;
  return Math.max(0, Math.floor(combined ** 0.5));
}

export function getMaisonReputationGain(state: GameState): number {
  return Math.max(0, Math.floor(state.workshopPrestigeCount / 2));
}

export function getMaisonLineBlueprintBonus(state: GameState): number {
  return MAISON_LINES.reduce((bonus, line) => {
    if (!line.workshopBlueprintBonus || !hasMaisonLine(state, line.id)) {
      return bonus;
    }

    return bonus + line.workshopBlueprintBonus;
  }, 0);
}

export function canMaisonPrestige(state: GameState): boolean {
  return getMaisonPrestigeGain(state) > 0 || getMaisonReputationGain(state) > 0;
}

export function isMaisonRevealReady(state: GameState): boolean {
  return state.enjoymentCents >= MAISON_PRESTIGE_THRESHOLD_CENTS * REVEAL_THRESHOLD_RATIO;
}

// getPrestigeLegacyMultiplier is exported from enjoyment.ts
// Import from there to avoid circular dependencies
