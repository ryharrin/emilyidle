import { WATCH_ITEMS } from "../../data/items";
import { WATCH_MODELS } from "../../data/watchModels";
import {
  getEnjoymentRateCentsPerSec,
  getWornWatchEnjoymentMultiplier,
  getWatchItemEnjoymentRateCentsPerSec,
} from "../enjoyment";
import { getDuplicateRewardSum } from "../duplicates";
import {
  getActiveSetBonuses,
  getCatalogTierIncomeMultiplier,
  getCraftedBoostIncomeMultiplier,
  getMaisonIncomeMultiplier,
  getMaisonLineIncomeMultiplier,
  getMaisonUpgradeIncomeMultiplier,
  getUpgradeIncomeMultiplier,
  getWatchAbilityIncomeMultiplier,
  getWorkshopIncomeMultiplier,
} from "../incomeMultipliers";
import {
  getCollectionBonusMultiplier,
  getItemCount,
  hasWorkshopUpgrade,
  hasMaisonUpgrade,
} from "../collection";
import { getPrestigeLegacyMultiplier } from "../enjoyment";
import type { GameState, EventId } from "../../model/types";
import { EVENTS, WORKSHOP_UPGRADES, MAISON_UPGRADES } from "../../model/state";

const BASE_INCOME_CENTS_PER_SEC = 10;
const INCOME_SOFTCAP_CENTS_PER_SEC = 60_000;
const INCOME_SOFTCAP_EXPONENT = 0.6;

const WATCH_MODEL_LOOKUP = new Map(WATCH_MODELS.map((model) => [model.id, model]));

export type RateBreakdownMultiplierTerm = {
  id: string;
  label: string;
  multiplier: number;
};

export type RateBreakdownAddendTerm = {
  id: string;
  label: string;
  centsPerSec: number;
};

export type EnjoymentRateBreakdown = {
  baseCentsPerSec: number;
  multiplierTerms: RateBreakdownMultiplierTerm[];
  eventMultiplier: number;
  effectiveCentsPerSec: number;
};

export type CashRateBreakdown = {
  careerAddends: RateBreakdownAddendTerm[];
  sessionCadence: {
    supportsSessions: boolean;
    isFreeSession: boolean;
    payoutCents: number;
    cooldownMs: number;
    cooldownRemainingMs: number;
    enjoymentCostCents: number;
    cadenceCentsPerSec: number;
  };
  multiplierTerms: RateBreakdownMultiplierTerm[];
  eventMultiplier: number;
  totalCentsPerSec: number;
};

export function getRawIncomeRateCentsPerSec(state: GameState): number {
  const itemIncome = WATCH_ITEMS.reduce(
    (total, item) => total + getItemCount(state, item.id) * item.incomeCentsPerSec,
    0,
  );

  const upgradeMultiplier = getUpgradeIncomeMultiplier(state);
  const setBonusMultiplier = getActiveSetBonuses(state).reduce(
    (multiplier, bonus) => multiplier * bonus.incomeMultiplier,
    1,
  );

  const collectionMultiplier = getCollectionBonusMultiplier(state);
  const workshopMultiplier = getWorkshopIncomeMultiplier(state);
  const maisonMultiplier = getMaisonIncomeMultiplier(state);
  const catalogTierMultiplier = getCatalogTierIncomeMultiplier(state);
  const abilityMultiplier = getWatchAbilityIncomeMultiplier(state);
  const craftedMultiplier = getCraftedBoostIncomeMultiplier(state);

  return (
    (BASE_INCOME_CENTS_PER_SEC + itemIncome) *
    upgradeMultiplier *
    setBonusMultiplier *
    collectionMultiplier *
    workshopMultiplier *
    maisonMultiplier *
    catalogTierMultiplier *
    abilityMultiplier *
    craftedMultiplier *
    getPrestigeLegacyMultiplier(state)
  );
}

export function getEffectiveIncomeRateCentsPerSec(state: GameState, eventMultiplier = 1): number {
  const rawIncome = getRawIncomeRateCentsPerSec(state) * eventMultiplier;
  return applySoftcap(rawIncome, getWorkshopSoftcapValue(state), getWorkshopSoftcapExponent(state));
}

// getTotalCashRateCentsPerSec and getEffectiveCashRateCentsPerSec are implemented in the main barrel
// to avoid circular dependencies

export function getEnjoymentRateBreakdown(
  state: GameState,
  eventMultiplier = 1,
): EnjoymentRateBreakdown {
  const baseCentsPerSec = Object.entries(state.watchModels).reduce((total, [modelId, rawOwned]) => {
    if (!Number.isFinite(rawOwned)) {
      return total;
    }

    const model = WATCH_MODEL_LOOKUP.get(modelId);
    if (!model) {
      return total;
    }

    const item = WATCH_ITEMS.find((i) => i.id === model.tierId);
    if (!item) {
      return total;
    }

    const owned = Math.max(0, Math.floor(rawOwned));
    if (owned === 0) {
      return total;
    }

    const reserveMultiplier =
      item.movement === "automatic" ? 1 + 0.5 * (state.powerReserveByItem[item.id] ?? 0) : 1;

    return (
      total +
      getDuplicateRewardSum(owned) * getWatchItemEnjoymentRateCentsPerSec(item) * reserveMultiplier
    );
  }, 0);

  const multiplierTerms: RateBreakdownMultiplierTerm[] = [
    {
      id: "prestige-legacy",
      label: "Prestige legacy",
      multiplier: getPrestigeLegacyMultiplier(state),
    },
  ];

  const upgradeMultiplier = getUpgradeIncomeMultiplier(state);
  if (upgradeMultiplier !== 1) {
    multiplierTerms.push({
      id: "upgrade-levels",
      label: "Upgrade levels",
      multiplier: upgradeMultiplier,
    });
  }

  const workshopMultiplier = getWorkshopIncomeMultiplier(state);
  if (workshopMultiplier !== 1) {
    multiplierTerms.push({
      id: "workshop-upgrades",
      label: "Workshop upgrades",
      multiplier: workshopMultiplier,
    });
  }

  const maisonUpgradeMultiplier = getMaisonUpgradeIncomeMultiplier(state);
  if (maisonUpgradeMultiplier !== 1) {
    multiplierTerms.push({
      id: "maison-upgrades",
      label: "Maison upgrades",
      multiplier: maisonUpgradeMultiplier,
    });
  }

  const maisonLineMultiplier = getMaisonLineIncomeMultiplier(state);
  if (maisonLineMultiplier !== 1) {
    multiplierTerms.push({
      id: "maison-lines",
      label: "Maison lines",
      multiplier: maisonLineMultiplier,
    });
  }

  const setBonusMultiplier = getActiveSetBonuses(state).reduce(
    (multiplier, bonus) => multiplier * bonus.incomeMultiplier,
    1,
  );
  if (setBonusMultiplier !== 1) {
    multiplierTerms.push({
      id: "set-bonuses",
      label: "Set bonuses",
      multiplier: setBonusMultiplier,
    });
  }

  const catalogTierMultiplier = getCatalogTierIncomeMultiplier(state);
  if (catalogTierMultiplier !== 1) {
    multiplierTerms.push({
      id: "catalog-tiers",
      label: "Catalog tiers",
      multiplier: catalogTierMultiplier,
    });
  }

  const craftedMultiplier = getCraftedBoostIncomeMultiplier(state);
  if (craftedMultiplier !== 1) {
    multiplierTerms.push({
      id: "crafted-tools",
      label: "Crafted tools",
      multiplier: craftedMultiplier,
    });
  }

  const abilityMultiplier = getWatchAbilityIncomeMultiplier(state);
  if (abilityMultiplier !== 1) {
    multiplierTerms.push({
      id: "watch-abilities",
      label: "Watch abilities",
      multiplier: abilityMultiplier,
    });
  }

  const wornMultiplier = getWornWatchEnjoymentMultiplier(state);
  if (state.wornWatchId !== null && wornMultiplier !== 1) {
    multiplierTerms.push({ id: "worn-watch", label: "Worn watch", multiplier: wornMultiplier });
  }

  multiplierTerms.push({ id: "event", label: "Event", multiplier: eventMultiplier });

  return {
    baseCentsPerSec,
    multiplierTerms,
    eventMultiplier,
    effectiveCentsPerSec: getEnjoymentRateCentsPerSec(state) * eventMultiplier,
  };
}

// getCashRateBreakdown is implemented in gameLoop.ts to avoid circular dependencies

export function getEventIncomeMultiplier(state: GameState, nowMs: number): number {
  return EVENTS.reduce((multiplier, event) => {
    if (isEventActive(state, event.id, nowMs)) {
      const entry = state.eventStates[event.id];
      return multiplier * (entry?.incomeMultiplier ?? event.incomeMultiplier);
    }
    return multiplier;
  }, 1);
}

export function isEventActive(state: GameState, eventId: EventId, nowMs: number): boolean {
  const entry = state.eventStates[eventId];
  if (!entry) {
    return false;
  }

  return nowMs < entry.activeUntilMs;
}

export function getWorkshopSoftcapValue(state: GameState): number {
  const baseValue = WORKSHOP_UPGRADES.reduce((value, upgrade) => {
    if (!upgrade.softcapMultiplier || !hasWorkshopUpgrade(state, upgrade.id)) {
      return value;
    }

    return value * upgrade.softcapMultiplier;
  }, INCOME_SOFTCAP_CENTS_PER_SEC);

  return MAISON_UPGRADES.reduce((value, upgrade) => {
    if (!upgrade.softcapMultiplier || !hasMaisonUpgrade(state, upgrade.id)) {
      return value;
    }

    return value * upgrade.softcapMultiplier;
  }, baseValue);
}

export function getWorkshopSoftcapExponent(state: GameState): number {
  return WORKSHOP_UPGRADES.reduce((exponent, upgrade) => {
    if (!upgrade.softcapExponentBonus || !hasWorkshopUpgrade(state, upgrade.id)) {
      return exponent;
    }

    return exponent + upgrade.softcapExponentBonus;
  }, INCOME_SOFTCAP_EXPONENT);
}

export function getSoftcapEfficiency(state: GameState): number {
  const rawIncome = getRawIncomeRateCentsPerSec(state);
  if (rawIncome <= 0) {
    return 1;
  }

  return getEffectiveIncomeRateCentsPerSec(state) / rawIncome;
}

export function getResourceDeficit(requiredAmount: number, currentAmount: number): number {
  const safeRequiredAmount = Number.isFinite(requiredAmount) ? Math.max(0, requiredAmount) : 0;
  const safeCurrentAmount = Number.isFinite(currentAmount) ? Math.max(0, currentAmount) : 0;
  return Math.max(0, Math.ceil(safeRequiredAmount - safeCurrentAmount));
}

export function getAffordabilityEtaSecondsForDeficit(
  deficitAmount: number,
  ratePerSecond: number,
): number | null {
  const safeDeficitAmount = Number.isFinite(deficitAmount) ? Math.max(0, deficitAmount) : 0;
  if (safeDeficitAmount <= 0) {
    return 0;
  }

  const safeRatePerSecond = Number.isFinite(ratePerSecond) ? ratePerSecond : 0;
  if (safeRatePerSecond <= 0) {
    return null;
  }

  return Math.ceil(safeDeficitAmount / safeRatePerSecond);
}

function applySoftcap(value: number, softcap: number, exponent: number): number {
  if (value <= softcap) {
    return value;
  }

  return softcap * (value / softcap) ** exponent;
}
