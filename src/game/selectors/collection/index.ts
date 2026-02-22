import { CATALOG_ENTRIES, type CatalogEntry } from "../../catalog";
import { MILESTONES } from "../../data/milestones";
import {
  NOSTALGIA_UNLOCK_COSTS,
  WATCH_ITEMS,
  WATCH_ENJOYMENT_REQUIREMENTS_CENTS,
} from "../../data/items";
import { SET_BONUSES } from "../../data/setBonuses";
import { UPGRADES } from "../../data/upgrades";
import {
  ACHIEVEMENTS,
  CATALOG_TIER_BONUSES,
  CRAFTED_BOOSTS,
  EVENTS,
  MAISON_LINES,
  MAISON_UPGRADES,
  WORKSHOP_UPGRADES,
  getCollectionValueCents,
} from "../../model/state";
import type {
  AchievementDefinition,
  CatalogTierBonusDefinition,
  CatalogTierId,
  CraftedBoostId,
  EventDefinition,
  GameState,
  MaisonLineDefinition,
  MaisonLineId,
  MaisonUpgradeDefinition,
  MaisonUpgradeId,
  MilestoneDefinition,
  SetBonusDefinition,
  UpgradeDefinition,
  UpgradeId,
  WatchItemDefinition,
  WatchItemId,
  WorkshopUpgradeDefinition,
  WorkshopUpgradeId,
} from "../../model/types";

import { getCraftedBoostIncomeMultiplier } from "../incomeMultipliers";

const CRAFTING_RECIPES: ReadonlyArray<{
  id: CraftedBoostId;
  name: string;
  description: string;
  partsCost: number;
}> = [
  {
    id: "polished-tools",
    name: "Polished tools",
    description: "Craft a refined tool kit for an income boost.",
    partsCost: 12,
  },
  {
    id: "heritage-springs",
    name: "Heritage springs",
    description: "Craft springs that raise collection bonuses.",
    partsCost: 18,
  },
  {
    id: "artisan-jig",
    name: "Artisan jig",
    description: "Craft a jig that amplifies prestige gains.",
    partsCost: 24,
  },
];

const CRAFTING_PARTS_PER_WATCH: Record<WatchItemId, number> = {
  quartz: 1,
  automatic: 2,
  manual: 4,
  tourbillon: 8,
};

const CRAFTED_BOOST_MULTIPLIERS: Record<CraftedBoostId, number> = {
  "polished-tools": 1.05,
  "heritage-springs": 1.04,
  "artisan-jig": 1.12,
};

const COLLECTION_BONUS_STEPS: Array<{ thresholdCents: number; multiplier: number }> = [
  { thresholdCents: 7_500, multiplier: 1.02 },
  { thresholdCents: 35_000, multiplier: 1.05 },
  { thresholdCents: 150_000, multiplier: 1.1 },
  { thresholdCents: 700_000, multiplier: 1.2 },
];

const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));
const UPGRADE_LOOKUP = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const WORKSHOP_UPGRADE_LOOKUP = new Map(WORKSHOP_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const MAISON_UPGRADE_LOOKUP = new Map(MAISON_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const MAISON_LINE_LOOKUP = new Map(MAISON_LINES.map((line) => [line.id, line]));
const CRAFTING_RECIPE_LOOKUP = new Map(CRAFTING_RECIPES.map((recipe) => [recipe.id, recipe]));

export function getWatchItems(): ReadonlyArray<WatchItemDefinition> {
  return WATCH_ITEMS;
}

export function getNostalgiaUnlockCost(id: WatchItemId): number {
  return NOSTALGIA_UNLOCK_COSTS[id] ?? 0;
}

export function getUpgrades(): ReadonlyArray<UpgradeDefinition> {
  return UPGRADES;
}

export function getMilestones(): ReadonlyArray<MilestoneDefinition> {
  return MILESTONES;
}

export function getSetBonuses(): ReadonlyArray<SetBonusDefinition> {
  return SET_BONUSES;
}

export function getAchievements(): ReadonlyArray<AchievementDefinition> {
  return ACHIEVEMENTS;
}

export function getEvents(): ReadonlyArray<EventDefinition> {
  return EVENTS;
}

export function getWorkshopUpgrades(): ReadonlyArray<WorkshopUpgradeDefinition> {
  return WORKSHOP_UPGRADES;
}

export function getMaisonUpgrades(): ReadonlyArray<MaisonUpgradeDefinition> {
  return MAISON_UPGRADES;
}

export function getMaisonLines(): ReadonlyArray<MaisonLineDefinition> {
  return MAISON_LINES;
}

export function getCatalogEntries(): ReadonlyArray<CatalogEntry> {
  return CATALOG_ENTRIES;
}

export function getCraftingPartsPerWatch(): Record<WatchItemId, number> {
  return CRAFTING_PARTS_PER_WATCH;
}

export function getCatalogTierDefinitions(): ReadonlyArray<CatalogTierBonusDefinition> {
  return CATALOG_TIER_BONUSES;
}

export function getCatalogTierUnlocks(state: GameState): CatalogTierId[] {
  return state.catalogTierUnlocks;
}

export function getCatalogTierBonuses(state: GameState): CatalogTierBonusDefinition[] {
  const unlocked = new Set(state.catalogTierUnlocks);
  return CATALOG_TIER_BONUSES.filter((bonus) => unlocked.has(bonus.id));
}

export function getCraftingRecipes(): ReadonlyArray<{
  id: CraftedBoostId;
  name: string;
  description: string;
  partsCost: number;
}> {
  return CRAFTING_RECIPES;
}

export function getCraftedBoosts(): ReadonlyArray<{
  id: CraftedBoostId;
  name: string;
  description: string;
}> {
  return CRAFTED_BOOSTS;
}

export function getCraftedBoostCounts(state: GameState): Record<CraftedBoostId, number> {
  return state.craftedBoosts;
}

export function getCraftedBoostCollectionMultiplier(state: GameState): number {
  const springBoosts = state.craftedBoosts["heritage-springs"] ?? 0;
  return Math.pow(CRAFTED_BOOST_MULTIPLIERS["heritage-springs"], springBoosts);
}

export function getCraftedBoostPrestigeMultiplier(state: GameState): number {
  const jigBoosts = state.craftedBoosts["artisan-jig"] ?? 0;
  return Math.pow(CRAFTED_BOOST_MULTIPLIERS["artisan-jig"], jigBoosts);
}

export function getCraftingParts(state: GameState): number {
  return state.craftingParts;
}

export function canCraftBoost(state: GameState, id: CraftedBoostId): boolean {
  const recipe = CRAFTING_RECIPE_LOOKUP.get(id);
  if (!recipe) {
    return false;
  }
  return state.craftingParts >= recipe.partsCost;
}

export function applyCraftedBoostIncome(state: GameState): number {
  return getCraftedBoostIncomeMultiplier(state);
}

export function applyCraftedBoostCollection(state: GameState): number {
  return getCraftedBoostCollectionMultiplier(state);
}

export function getItemCount(state: GameState, id: WatchItemId): number {
  return state.items[id] ?? 0;
}

export function getUpgradeLevel(state: GameState, id: UpgradeId): number {
  return state.upgrades[id] ?? 0;
}

export function hasWorkshopUpgrade(state: GameState, id: WorkshopUpgradeId): boolean {
  return state.workshopUpgrades[id] ?? false;
}

export function getAutoBuyEnabled(state: GameState): boolean {
  return hasWorkshopUpgrade(state, "automation-blueprints");
}

export function canBuyMaisonLine(state: GameState, id: MaisonLineId): boolean {
  const line = MAISON_LINE_LOOKUP.get(id);
  if (!line) {
    return false;
  }

  if (hasMaisonLine(state, id)) {
    return false;
  }

  if (line.currency === "heritage") {
    return state.maisonHeritage >= line.cost;
  }

  return state.maisonReputation >= line.cost;
}

export function hasMaisonLine(state: GameState, id: MaisonLineId): boolean {
  return state.maisonLines[id] ?? false;
}

export function hasMaisonUpgrade(state: GameState, id: MaisonUpgradeId): boolean {
  return state.maisonUpgrades[id] ?? false;
}

export function getCollectionBonusMultiplier(state: GameState): number {
  const value = getCollectionValueCents(state);
  let multiplier = 1;

  for (const step of COLLECTION_BONUS_STEPS) {
    if (value >= step.thresholdCents) {
      multiplier = Math.max(multiplier, step.multiplier);
    }
  }

  return (
    multiplier *
    getMaisonCollectionBonusMultiplier(state) *
    getCraftedBoostCollectionMultiplier(state)
  );
}

export function getMaisonCollectionBonusMultiplier(state: GameState): number {
  const upgradeMultiplier = MAISON_UPGRADES.reduce((multiplier, upgrade) => {
    if (!upgrade.collectionBonusMultiplier || !hasMaisonUpgrade(state, upgrade.id)) {
      return multiplier;
    }

    return multiplier * upgrade.collectionBonusMultiplier;
  }, 1);

  return MAISON_LINES.reduce((multiplier, line) => {
    if (!line.collectionBonusMultiplier || !hasMaisonLine(state, line.id)) {
      return multiplier;
    }

    return multiplier * line.collectionBonusMultiplier;
  }, upgradeMultiplier);
}

export function isItemUnlocked(state: GameState, id: WatchItemId): boolean {
  const item = requireWatchItem(id);
  if (!item.unlockMilestoneId) {
    return true;
  }

  return (
    state.unlockedMilestones.includes(item.unlockMilestoneId) ||
    state.nostalgiaUnlockedItems.includes(id)
  );
}

export function isUpgradeUnlocked(state: GameState, id: UpgradeId): boolean {
  const upgrade = requireUpgrade(id);
  if (!upgrade.unlockMilestoneId) {
    return true;
  }

  return state.unlockedMilestones.includes(upgrade.unlockMilestoneId);
}

export function getItemPriceCents(state: GameState, id: WatchItemId, quantity = 1): number {
  if (quantity <= 0) {
    return 0;
  }

  const item = requireWatchItem(id);
  const owned = getItemCount(state, id);
  const startPrice = item.basePriceCents * item.priceGrowth ** owned;

  return Math.ceil(getSeriesTotal(startPrice, item.priceGrowth, quantity));
}

export type WatchPurchaseGate =
  | { ok: true; cashPriceCents: number; enjoymentRequiredCents: number }
  | {
      ok: false;
      cashPriceCents: number;
      enjoymentRequiredCents: number;
      blocksBy: "enjoyment" | "cash";
      enjoymentDeficitCents?: number;
      cashDeficitCents?: number;
    };

export function getWatchPurchaseGate(
  state: GameState,
  id: WatchItemId,
  quantity = 1,
): WatchPurchaseGate {
  const cashPriceCents = getItemPriceCents(state, id, quantity);
  const enjoymentRequiredCents = WATCH_ENJOYMENT_REQUIREMENTS_CENTS[id] ?? 0;
  const cashDeficitCents = Math.max(0, cashPriceCents - state.currencyCents);
  const enjoymentDeficitCents = Math.max(0, enjoymentRequiredCents - state.enjoymentCents);
  const lacksEnjoyment = enjoymentDeficitCents > 0;
  const lacksCash = cashDeficitCents > 0;

  if (!lacksEnjoyment && !lacksCash) {
    return { ok: true, cashPriceCents, enjoymentRequiredCents };
  }

  const gate: WatchPurchaseGate = {
    ok: false,
    cashPriceCents,
    enjoymentRequiredCents,
    blocksBy: lacksEnjoyment ? "enjoyment" : "cash",
  };

  if (enjoymentDeficitCents > 0) {
    gate.enjoymentDeficitCents = enjoymentDeficitCents;
  }

  if (cashDeficitCents > 0) {
    gate.cashDeficitCents = cashDeficitCents;
  }

  return gate;
}

export function getUpgradePriceCents(state: GameState, id: UpgradeId, quantity = 1): number {
  if (quantity <= 0) {
    return 0;
  }

  const upgrade = requireUpgrade(id);
  const level = getUpgradeLevel(state, id);
  const startPrice = upgrade.basePriceCents * upgrade.priceGrowth ** level;

  return Math.ceil(getSeriesTotal(startPrice, upgrade.priceGrowth, quantity));
}

export function getMaxAffordableItemCount(state: GameState, id: WatchItemId): number {
  if (!isItemUnlocked(state, id)) {
    return 0;
  }

  const gate = getWatchPurchaseGate(state, id, 1);
  if (!gate.ok && gate.blocksBy === "enjoyment") {
    return 0;
  }

  const item = requireWatchItem(id);
  const owned = getItemCount(state, id);
  const startPrice = item.basePriceCents * item.priceGrowth ** owned;

  return getMaxAffordableCount(state.currencyCents, startPrice, item.priceGrowth);
}

export function canBuyItem(state: GameState, id: WatchItemId, quantity = 1): boolean {
  if (!isItemUnlocked(state, id)) {
    return false;
  }

  return getWatchPurchaseGate(state, id, quantity).ok;
}

export function canBuyUpgrade(state: GameState, id: UpgradeId, quantity = 1): boolean {
  return state.currencyCents >= getUpgradePriceCents(state, id, quantity);
}

export function canBuyWorkshopUpgrade(state: GameState, id: WorkshopUpgradeId): boolean {
  const upgrade = WORKSHOP_UPGRADE_LOOKUP.get(id);
  if (!upgrade) {
    return false;
  }

  if (hasWorkshopUpgrade(state, id)) {
    return false;
  }

  return state.workshopBlueprints >= upgrade.blueprintCost;
}

export function canBuyMaisonUpgrade(state: GameState, id: MaisonUpgradeId): boolean {
  const upgrade = MAISON_UPGRADE_LOOKUP.get(id);
  if (!upgrade) {
    return false;
  }

  if (hasMaisonUpgrade(state, id)) {
    return false;
  }

  if (upgrade.currency === "heritage") {
    return state.maisonHeritage >= upgrade.cost;
  }

  return state.maisonReputation >= upgrade.cost;
}

function requireWatchItem(id: WatchItemId): WatchItemDefinition {
  const item = WATCH_ITEM_LOOKUP.get(id);
  if (!item) {
    throw new Error(`Unknown watch item: ${id}`);
  }
  return item;
}

function requireUpgrade(id: UpgradeId): UpgradeDefinition {
  const upgrade = UPGRADE_LOOKUP.get(id);
  if (!upgrade) {
    throw new Error(`Unknown upgrade: ${id}`);
  }
  return upgrade;
}

function getSeriesTotal(startPrice: number, growth: number, quantity: number): number {
  if (quantity <= 1) {
    return startPrice;
  }

  if (growth === 1) {
    return startPrice * quantity;
  }

  return startPrice * ((growth ** quantity - 1) / (growth - 1));
}

function getMaxAffordableCount(currency: number, startPrice: number, growth: number): number {
  if (currency < startPrice) {
    return 0;
  }

  if (growth === 1) {
    return Math.floor(currency / startPrice);
  }

  const max = Math.log((currency * (growth - 1)) / startPrice + 1) / Math.log(growth);
  return Math.max(0, Math.floor(max));
}
