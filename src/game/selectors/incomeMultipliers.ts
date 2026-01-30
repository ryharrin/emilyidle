import { SET_BONUSES } from "../data/setBonuses";
import { UPGRADES } from "../data/upgrades";
import {
  CATALOG_TIER_BONUSES,
  MAISON_LINES,
  MAISON_UPGRADES,
  WORKSHOP_UPGRADES,
} from "../model/state";
import type { GameState, SetBonusDefinition, WatchItemId } from "../model/types";

const CRAFTED_BOOST_MULTIPLIERS = {
  "polished-tools": 1.05,
  "heritage-springs": 1.04,
  "artisan-jig": 1.12,
};

const getItemCount = (state: GameState, id: WatchItemId): number => state.items[id] ?? 0;

export function getUpgradeIncomeMultiplier(state: GameState): number {
  return UPGRADES.reduce(
    (multiplier, upgrade) =>
      multiplier + (state.upgrades[upgrade.id] ?? 0) * upgrade.incomeMultiplierPerLevel,
    1,
  );
}

export function getActiveSetBonuses(state: GameState): SetBonusDefinition[] {
  return SET_BONUSES.filter((bonus) =>
    Object.entries(bonus.requirements).every(([itemId, required]) => {
      const count = getItemCount(state, itemId as WatchItemId);
      return count >= (required ?? 0);
    }),
  );
}

export function getCatalogTierIncomeMultiplier(state: GameState): number {
  const unlocked = new Set(state.catalogTierUnlocks);
  return CATALOG_TIER_BONUSES.filter((bonus) => unlocked.has(bonus.id)).reduce(
    (multiplier, bonus) => multiplier * bonus.incomeMultiplier,
    1,
  );
}

export function getCraftedBoostIncomeMultiplier(state: GameState): number {
  const polishedBoosts = state.craftedBoosts["polished-tools"] ?? 0;
  return Math.pow(CRAFTED_BOOST_MULTIPLIERS["polished-tools"], polishedBoosts);
}

export function getWatchAbilityIncomeMultiplier(state: GameState): number {
  const starterCount = getItemCount(state, "starter");
  const chronographCount = getItemCount(state, "chronograph");

  const starterBonus = starterCount >= 10 ? 1.02 : 1;
  const chronographBonus = chronographCount >= 5 ? 1.05 : 1;

  return starterBonus * chronographBonus;
}

export function getWorkshopIncomeMultiplier(state: GameState): number {
  return WORKSHOP_UPGRADES.reduce((multiplier, upgrade) => {
    if (!upgrade.incomeMultiplier || !state.workshopUpgrades[upgrade.id]) {
      return multiplier;
    }

    return multiplier * upgrade.incomeMultiplier;
  }, 1);
}

export function getMaisonUpgradeIncomeMultiplier(state: GameState): number {
  return MAISON_UPGRADES.reduce((multiplier, upgrade) => {
    if (!upgrade.incomeMultiplier || !state.maisonUpgrades[upgrade.id]) {
      return multiplier;
    }

    return multiplier * upgrade.incomeMultiplier;
  }, 1);
}

export function getMaisonLineIncomeMultiplier(state: GameState): number {
  return MAISON_LINES.reduce((multiplier, line) => {
    if (!line.incomeMultiplier || !state.maisonLines[line.id]) {
      return multiplier;
    }

    return multiplier * line.incomeMultiplier;
  }, 1);
}

export function getMaisonIncomeMultiplier(state: GameState): number {
  return getMaisonUpgradeIncomeMultiplier(state) * getMaisonLineIncomeMultiplier(state);
}
