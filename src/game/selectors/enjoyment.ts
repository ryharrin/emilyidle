import { WATCH_ITEMS, getWatchBucket } from "../data/items";
import { WATCH_MODELS } from "../data/watchModels";
import { formatMoneyFromCents } from "../format";
import type { GameState, WatchItemDefinition, WatchItemId } from "../model/types";
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

const WATCH_MODEL_LOOKUP = new Map(WATCH_MODELS.map((model) => [model.id, model]));
const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));

const WORN_WATCH_ENJOYMENT_MULTIPLIERS: Record<WatchItemId, number> = {
  starter: 1.02,
  classic: 1.05,
  chronograph: 1.08,
  tourbillon: 1.12,
};

function getWornWatchBucketId(state: GameState): WatchItemId | null {
  const wornId = state.wornWatchId;
  if (wornId === null) {
    return null;
  }

  const model = WATCH_MODEL_LOOKUP.get(wornId);
  if (model) {
    return model.tierId;
  }

  return getWatchBucket(wornId);
}

export function getWornWatchEnjoymentMultiplier(state: GameState): number {
  const bucketId = getWornWatchBucketId(state);
  if (!bucketId) {
    return 1;
  }

  return WORN_WATCH_ENJOYMENT_MULTIPLIERS[bucketId];
}

export function getWatchItemEnjoymentRateCentsPerSec(item: WatchItemDefinition): number {
  return item.enjoymentCentsPerSec;
}

export function getEnjoymentCents(state: GameState): number {
  return state.enjoymentCents;
}

export type PrestigeLegacyMultiplierComponent = {
  id: string;
  label: string;
  description: string;
  value: number;
};

export type PrestigeLegacyMultiplierBreakdown = {
  multiplier01: number;
  rawMultiplier: number;
  capApplied: boolean;
  components: ReadonlyArray<PrestigeLegacyMultiplierComponent>;
};

export function getPrestigeLegacyMultiplierBreakdown(
  state: GameState,
): PrestigeLegacyMultiplierBreakdown {
  const workshopPrestigeCount = Number.isFinite(state.workshopPrestigeCount)
    ? Math.max(0, Math.floor(state.workshopPrestigeCount))
    : 0;
  const maisonHeritage = Number.isFinite(state.maisonHeritage)
    ? Math.max(0, Math.floor(state.maisonHeritage))
    : 0;

  const firstPrestigeBoost = workshopPrestigeCount >= 1 ? 2.3 : 1;
  const compoundingMultiplier = Math.pow(1.045, Math.max(0, workshopPrestigeCount - 1));
  const maisonLegacy = Math.pow(1.03, maisonHeritage);

  const components: PrestigeLegacyMultiplierComponent[] = [
    {
      id: "atelier-first",
      label: "First Atelier prestige",
      description: "Jump that fires on the first reset",
      value: firstPrestigeBoost,
    },
    {
      id: "atelier-compound",
      label: "Additional Atelier prestiges",
      description: "Each extra reset stacks a smaller multiplier",
      value: compoundingMultiplier,
    },
    {
      id: "maison-heritage",
      label: "Maison heritage",
      description: "Maison resets amplify the same multiplier",
      value: maisonLegacy,
    },
  ];

  const rawMultiplier = components.reduce((product, component) => product * component.value, 1);
  const multiplier01 = Math.min(10, rawMultiplier);
  const capApplied = rawMultiplier > 10;

  return {
    multiplier01,
    rawMultiplier,
    capApplied,
    components,
  };
}

export function getPrestigeLegacyMultiplier(state: GameState): number {
  return getPrestigeLegacyMultiplierBreakdown(state).multiplier01;
}

export function getEnjoymentRateCentsPerSec(state: GameState): number {
  const baseRate = Object.entries(state.watchModels).reduce((total, [modelId, rawOwned]) => {
    if (!Number.isFinite(rawOwned)) {
      return total;
    }

    const model = WATCH_MODEL_LOOKUP.get(modelId);
    if (!model) {
      return total;
    }

    const tier = WATCH_ITEM_LOOKUP.get(model.tierId);
    if (!tier) {
      return total;
    }

    const owned = Math.max(0, Math.floor(rawOwned));
    if (owned === 0) {
      return total;
    }

    const reserveMultiplier =
      tier.movement === "automatic" ? 1 + 0.5 * (state.powerReserveByItem[tier.id] ?? 0) : 1;

    return (
      total +
      getDuplicateRewardSum(owned) * getWatchItemEnjoymentRateCentsPerSec(tier) * reserveMultiplier
    );
  }, 0);

  const upgradeMultiplier = getUpgradeIncomeMultiplier(state);
  const setBonusMultiplier = getActiveSetBonuses(state).reduce(
    (multiplier, bonus) => multiplier * bonus.incomeMultiplier,
    1,
  );
  const workshopMultiplier = getWorkshopIncomeMultiplier(state);
  const maisonMultiplier = getMaisonIncomeMultiplier(state);
  const catalogTierMultiplier = getCatalogTierIncomeMultiplier(state);
  const craftedMultiplier = getCraftedBoostIncomeMultiplier(state);
  const abilityMultiplier = getWatchAbilityIncomeMultiplier(state);
  const enjoymentMultiplier =
    upgradeMultiplier *
    setBonusMultiplier *
    workshopMultiplier *
    maisonMultiplier *
    catalogTierMultiplier *
    craftedMultiplier *
    abilityMultiplier;

  return (
    baseRate *
    enjoymentMultiplier *
    getPrestigeLegacyMultiplier(state) *
    getWornWatchEnjoymentMultiplier(state)
  );
}

export function getEnjoymentThresholdLabel(cents: number): string {
  return `${formatMoneyFromCents(cents)} enjoyment`;
}
