import type { CatalogBrand } from "../catalog";
import { WATCH_ITEMS } from "../data/items";
import { WATCH_MODELS } from "../data/watchModels";
import { getTierBadgeByCatalogTier, type TierBadgeDefinition } from "../tierBadges";
import type { GameState, WatchItemDefinition, WatchItemId, WatchMovement } from "../model/types";
import { getDuplicateRewardSum } from "./duplicates";
import {
  getActiveSetBonuses,
  getCatalogTierIncomeMultiplier,
  getCraftedBoostIncomeMultiplier,
  getMaisonIncomeMultiplier,
  getUpgradeIncomeMultiplier,
  getWatchAbilityIncomeMultiplier,
  getWorkshopIncomeMultiplier,
} from "./incomeMultipliers";
import {
  getEnjoymentRateCentsPerSec,
  getPrestigeLegacyMultiplier,
  getWatchItemEnjoymentRateCentsPerSec,
  getWornWatchEnjoymentMultiplier,
} from "./enjoyment";
import { getTherapistCashRateCentsPerSec } from "./therapistSalary";

const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));
const CASH_SOURCE_CAREER = "career" as const;
const CASH_EXPLANATION = "Cash is derived from the therapist career salary.";

function sanitizeMultiplier(value: number): number {
  return Number.isFinite(value) ? value : 1;
}

type CashSource = "career";

function getBaseEnjoymentMultiplier(state: GameState): number {
  const upgradeMultiplier = getUpgradeIncomeMultiplier(state);
  const setBonusMultiplier = getActiveSetBonuses(state).reduce(
    (total, bonus) => total * bonus.incomeMultiplier,
    1,
  );
  const workshopMultiplier = getWorkshopIncomeMultiplier(state);
  const maisonMultiplier = getMaisonIncomeMultiplier(state);
  const catalogTierMultiplier = getCatalogTierIncomeMultiplier(state);
  const craftedMultiplier = getCraftedBoostIncomeMultiplier(state);
  const abilityMultiplier = getWatchAbilityIncomeMultiplier(state);

  return (
    upgradeMultiplier *
    setBonusMultiplier *
    workshopMultiplier *
    maisonMultiplier *
    catalogTierMultiplier *
    craftedMultiplier *
    abilityMultiplier
  );
}

function getTotalEnjoymentMultiplier(state: GameState, eventMultiplier: number): number {
  const baseMultipliers = getBaseEnjoymentMultiplier(state);
  const prestigeMultiplier = getPrestigeLegacyMultiplier(state);
  const wornMultiplier = getWornWatchEnjoymentMultiplier(state);

  return baseMultipliers * prestigeMultiplier * wornMultiplier * eventMultiplier;
}

function getReserveMultiplier(state: GameState, item: WatchItemDefinition): number {
  if (item.movement !== "automatic") {
    return 1;
  }

  const reserve = state.powerReserveByItem[item.id] ?? 0;
  if (!Number.isFinite(reserve) || reserve <= 0) {
    return 1;
  }

  return 1 + 0.5 * reserve;
}

export type PerWatchStatsRow = {
  modelId: string;
  displayName: string;
  brand: CatalogBrand;
  model: string;
  tierId: WatchItemId;
  tierLabel: string;
  movement: WatchMovement;
  tierBadge?: TierBadgeDefinition;
  ownedCount: number;
  enjoymentCentsPerSec: number;
  enjoymentBaseCentsPerSec: number;
  totalEnjoymentCentsPerSec: number;
  reserveMultiplier: number;
  cashCentsPerSec: number;
  cashSource: CashSource;
  cashExplanation: string;
  catalogEntryIds: ReadonlyArray<string>;
  eventMultiplier: number;
};

export type EquippedWatchContribution = {
  wornWatchId: string | null;
  enjoymentMultiplier: number;
  enjoymentDeltaCentsPerSec: number;
  cashDeltaCentsPerSec: number;
  cashExplanation: string;
  eventMultiplier: number;
};

export function getPerWatchStatsRows(
  state: GameState,
  nowMs: number,
  eventMultiplier = 1,
): PerWatchStatsRow[] {
  const sanitizedEvent = sanitizeMultiplier(eventMultiplier);
  const enjoymentMultiplier = getTotalEnjoymentMultiplier(state, sanitizedEvent);
  const cashRate = getTherapistCashRateCentsPerSec(state, nowMs) * sanitizedEvent;

  return WATCH_MODELS.map((model) => {
    const item = WATCH_ITEM_LOOKUP.get(model.tierId);
    if (!item) {
      throw new Error(`Missing watch item definition for tier ${model.tierId}`);
    }

    const ownedCount = Math.max(0, Math.floor(state.watchModels[model.id] ?? 0));
    const reserveMultiplier = getReserveMultiplier(state, item);
    const baseEnjoyment = getWatchItemEnjoymentRateCentsPerSec(item) * reserveMultiplier;
    const perCopyEnjoyment = baseEnjoyment * enjoymentMultiplier;
    const totalEnjoyment = getDuplicateRewardSum(ownedCount) * baseEnjoyment * enjoymentMultiplier;

    const safePerCopy = Number.isFinite(perCopyEnjoyment) ? perCopyEnjoyment : 0;
    const safeBase = Number.isFinite(baseEnjoyment) ? baseEnjoyment : 0;
    const safeTotal = Number.isFinite(totalEnjoyment) ? totalEnjoyment : 0;

    return {
      modelId: model.id,
      displayName: model.displayName,
      brand: model.brand,
      model: model.model,
      tierId: item.id,
      tierLabel: item.name,
      movement: item.movement,
      tierBadge: getTierBadgeByCatalogTier(item.id),
      ownedCount,
      enjoymentCentsPerSec: safePerCopy,
      enjoymentBaseCentsPerSec: safeBase,
      totalEnjoymentCentsPerSec: safeTotal,
      reserveMultiplier,
      cashCentsPerSec: Number.isFinite(cashRate) ? cashRate : 0,
      cashSource: CASH_SOURCE_CAREER,
      cashExplanation: CASH_EXPLANATION,
      catalogEntryIds: model.catalogEntryIds,
      eventMultiplier: sanitizedEvent,
    };
  });
}

export function getEquippedWatchContribution(
  state: GameState,
  nowMs: number,
  eventMultiplier = 1,
): EquippedWatchContribution {
  const sanitizedEvent = sanitizeMultiplier(eventMultiplier);
  const withoutWornState = { ...state, wornWatchId: null };
  const withWorn = getEnjoymentRateCentsPerSec(state) * sanitizedEvent;
  const withoutWorn = getEnjoymentRateCentsPerSec(withoutWornState) * sanitizedEvent;
  const delta = withWorn - withoutWorn;
  return {
    wornWatchId: state.wornWatchId,
    enjoymentMultiplier: getWornWatchEnjoymentMultiplier(state),
    enjoymentDeltaCentsPerSec: Number.isFinite(delta) ? delta : 0,
    cashDeltaCentsPerSec: 0,
    cashExplanation: CASH_EXPLANATION,
    eventMultiplier: sanitizedEvent,
  };
}
