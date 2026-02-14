import { CATALOG_ENTRIES, getCatalogEntryTags, type CatalogEntry } from "../catalog";
import { MILESTONES } from "../data/milestones";
import {
  NOSTALGIA_UNLOCK_COSTS,
  NOSTALGIA_UNLOCK_ORDER,
  WATCH_ENJOYMENT_REQUIREMENTS_CENTS,
  WATCH_ITEMS,
} from "../data/items";
import { WATCH_MODELS } from "../data/watchModels";
import { SET_BONUSES } from "../data/setBonuses";
import { UPGRADES } from "../data/upgrades";
import { formatMoneyFromCents } from "../format";
import { getEnjoymentThresholdLabel } from "./enjoyment";
import {
  ACHIEVEMENTS,
  CATALOG_TIER_BONUSES,
  CRAFTED_BOOSTS,
  EVENTS,
  MAISON_LINES,
  MAISON_UPGRADES,
  WORKSHOP_UPGRADES,
  getCollectionValueCents,
  getTotalItemCount,
} from "../model/state";
import type {
  AchievementDefinition,
  AchievementId,
  CatalogEntryId,
  CatalogTierBonusDefinition,
  CatalogTierId,
  CraftedBoostId,
  CareerTrackId,
  EventDefinition,
  EventId,
  GameState,
  MaisonLineDefinition,
  MaisonLineId,
  MaisonUpgradeDefinition,
  MaisonUpgradeId,
  MilestoneDefinition,
  MilestoneId,
  SetBonusDefinition,
  TherapistCareerState,
  UpgradeDefinition,
  UpgradeId,
  WatchItemDefinition,
  WatchItemId,
  WorkshopUpgradeDefinition,
  WorkshopUpgradeId,
} from "../model/types";

import {
  getEnjoymentCents,
  getEnjoymentRateCentsPerSec,
  getPrestigeLegacyMultiplier,
  getWornWatchEnjoymentMultiplier,
  getWatchItemEnjoymentRateCentsPerSec,
} from "./enjoyment";
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
} from "./incomeMultipliers";
import { getDuplicateRewardSum } from "./duplicates";
import { getTherapistCashRateCentsPerSec as getTherapistCashRateWithWindowCentsPerSec } from "./therapistSalary";
import { canPerformTherapistSession, getTherapistSessionPolicy } from "./therapistSessions";

export * from "./enjoyment";
export * from "./incomeMultipliers";
export * from "./interactions";
export * from "./watchModels";
export * from "./perWatchStats";
export * from "./careerStages";
export * from "./careerChoicePreview";
export * from "./careerProgress";
export * from "./careerNextAction";
export * from "./therapistSessions";
export * from "./therapistSalary";
export * from "./therapistEconomySummary";
export * from "./statsBreakdown";
export * from "./therapistNodeEffects";
export * from "./collectionInsights";
export { getTherapistXpRequiredForNextLevel } from "./therapistPolicy";

const BASE_INCOME_CENTS_PER_SEC = 10;
const INCOME_SOFTCAP_CENTS_PER_SEC = 60_000;
const INCOME_SOFTCAP_EXPONENT = 0.6;

// Therapist economy constants live in therapistConstants.ts; formulas in therapistPolicy.ts.

const COLLECTION_BONUS_STEPS: Array<{ thresholdCents: number; multiplier: number }> = [
  { thresholdCents: 7_500, multiplier: 1.02 },
  { thresholdCents: 35_000, multiplier: 1.05 },
  { thresholdCents: 150_000, multiplier: 1.1 },
  { thresholdCents: 700_000, multiplier: 1.2 },
];

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

const WORKSHOP_PRESTIGE_THRESHOLD_CENTS = 800_000;
const MAISON_PRESTIGE_THRESHOLD_CENTS = 4_000_000;
const NOSTALGIA_PRESTIGE_THRESHOLD_CENTS = 12_000_000;
const REVEAL_THRESHOLD_RATIO = 0.7;

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

const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));
const WATCH_MODEL_LOOKUP = new Map(WATCH_MODELS.map((model) => [model.id, model]));
const UPGRADE_LOOKUP = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const MILESTONE_LOOKUP = new Map(MILESTONES.map((milestone) => [milestone.id, milestone]));
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

export function getCatalogDiscovery(state: GameState): CatalogEntryId[] {
  return state.discoveredCatalogEntries;
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

export function getCatalogEntryIdsForItems(state: GameState): CatalogEntryId[] {
  const ownedItems = WATCH_ITEMS.filter((item) => getItemCount(state, item.id) > 0);

  if (ownedItems.length === 0) {
    return [];
  }

  const queryTerms = ownedItems.flatMap((item) => [item.id, item.name]);

  return CATALOG_ENTRIES.filter((entry) => {
    const entryTags = getCatalogEntryTags(entry);
    const haystack = `${entry.brand} ${entry.model} ${entry.description} ${entryTags.join(" ")}`
      .toLowerCase()
      .trim();
    return queryTerms.some((term) => haystack.includes(term.toLowerCase()));
  }).map((entry) => entry.id);
}

export function applyCraftedBoostIncome(state: GameState): number {
  return getCraftedBoostIncomeMultiplier(state);
}

export function applyCraftedBoostCollection(state: GameState): number {
  return getCraftedBoostCollectionMultiplier(state);
}

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

  return state.nostalgiaPoints >= getNostalgiaUnlockCost(id);
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

export function getWorkshopPrestigeGain(state: GameState): number {
  const enjoyment = getEnjoymentCents(state);
  const baseGain = Math.max(0, Math.floor((enjoyment / WORKSHOP_PRESTIGE_THRESHOLD_CENTS) ** 0.5));
  return Math.floor(
    (baseGain + getMaisonLineBlueprintBonus(state)) * getCraftedBoostPrestigeMultiplier(state),
  );
}

export type WorkshopNextBlueprintProgress = {
  currentBlueprintGain: number;
  nextBlueprintGain: number;
  nextEnjoymentThresholdCents: number;
  enjoymentRemainingCents: number;
  etaSeconds: number | null;
  cashEarnedDuringEtaCents: number;
};

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

export type BlueprintCostDetail = {
  currentCostCents: number;
  nextCostCents: number;
  deltaCents: number;
  hasNext: boolean;
};

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

export function getWorkshopPrestigeThresholdCents(): number {
  return WORKSHOP_PRESTIGE_THRESHOLD_CENTS;
}

export function getMaisonPrestigeThresholdCents(): number {
  return MAISON_PRESTIGE_THRESHOLD_CENTS;
}

export function isWorkshopRevealReady(state: GameState): boolean {
  return state.enjoymentCents >= WORKSHOP_PRESTIGE_THRESHOLD_CENTS * REVEAL_THRESHOLD_RATIO;
}

export function isMaisonRevealReady(state: GameState): boolean {
  return state.enjoymentCents >= MAISON_PRESTIGE_THRESHOLD_CENTS * REVEAL_THRESHOLD_RATIO;
}

export function getUnlockVisibilityRatio(state: GameState, milestoneId: MilestoneId): number {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  if (!milestone) {
    return 0;
  }

  if (milestone.requirement.type === "totalItems") {
    const owned = getTotalItemCount(state);
    return milestone.requirement.threshold > 0 ? owned / milestone.requirement.threshold : 0;
  }

  if (milestone.requirement.type === "collectionValue") {
    return milestone.requirement.thresholdCents > 0
      ? getCollectionValueCents(state) / milestone.requirement.thresholdCents
      : 0;
  }

  return milestone.requirement.threshold > 0
    ? state.discoveredCatalogEntries.length / milestone.requirement.threshold
    : 0;
}

export function getAchievementProgressRatio(
  state: GameState,
  achievementId: AchievementId,
): number {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  if (!achievement) {
    return 0;
  }

  const requirement = achievement.requirement;
  if (requirement.type === "totalItems") {
    const owned = getTotalItemCount(state);
    return requirement.threshold > 0 ? owned / requirement.threshold : 0;
  }

  if (requirement.type === "collectionValue") {
    return requirement.thresholdCents > 0
      ? getCollectionValueCents(state) / requirement.thresholdCents
      : 0;
  }

  if (requirement.type === "workshopPrestigeCount") {
    return requirement.threshold > 0 ? state.workshopPrestigeCount / requirement.threshold : 0;
  }

  if (requirement.type === "careerLevel") {
    return requirement.threshold > 0 ? state.therapistCareer.level / requirement.threshold : 0;
  }

  if (requirement.type === "interactionPerfects") {
    return requirement.threshold > 0 ? state.interactionPerfectRuns / requirement.threshold : 0;
  }

  if (requirement.type === "perfectStreak") {
    return requirement.threshold > 0
      ? state.interactionBestPerfectStreak / requirement.threshold
      : 0;
  }

  if (requirement.type === "nostalgiaResets") {
    return requirement.threshold > 0 ? state.nostalgiaResets / requirement.threshold : 0;
  }

  return requirement.threshold > 0
    ? state.discoveredCatalogEntries.length / requirement.threshold
    : 0;
}

export type UnlockProgressDetail = {
  label: string;
  current: number;
  threshold: number;
  ratio: number;
};

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getUnlockRevealProgressRatio(rawRatio: number): number {
  return clampNumber(rawRatio / REVEAL_THRESHOLD_RATIO, 0, 1);
}

export function getMilestoneUnlockProgressDetail(
  state: GameState,
  milestoneId: MilestoneId,
): UnlockProgressDetail {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  if (!milestone) {
    return { label: "", current: 0, threshold: 0, ratio: 0 };
  }

  const requirement = milestone.requirement;
  const threshold =
    requirement.type === "collectionValue" ? requirement.thresholdCents : requirement.threshold;

  const rawCurrent =
    requirement.type === "totalItems"
      ? getTotalItemCount(state)
      : requirement.type === "collectionValue"
        ? getCollectionValueCents(state)
        : state.discoveredCatalogEntries.length;

  const current = clampNumber(rawCurrent, 0, threshold);
  const ratio = threshold > 0 ? clampNumber(rawCurrent / threshold, 0, 1) : 0;

  return {
    label: getMilestoneRequirementLabel(milestoneId),
    current,
    threshold,
    ratio,
  };
}

export function getMilestoneEffectSummary(milestoneId: MilestoneId): string {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  return milestone?.description ?? "";
}

export function getAchievementRequirementLabel(achievementId: AchievementId): string {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  if (!achievement) {
    return "";
  }

  const requirement = achievement.requirement;
  if (requirement.type === "totalItems") {
    return `Hold ${requirement.threshold} watches in the collection`;
  }

  if (requirement.type === "collectionValue") {
    return `Reach ${formatMoneyFromCents(requirement.thresholdCents)} Memories`;
  }

  if (requirement.type === "workshopPrestigeCount") {
    return `Prestige the Atelier ${requirement.threshold} time${requirement.threshold === 1 ? "" : "s"}`;
  }

  if (requirement.type === "careerLevel") {
    return `Reach career level ${requirement.threshold}`;
  }

  if (requirement.type === "interactionPerfects") {
    return `Land ${requirement.threshold} perfect mini-game outcomes`;
  }

  if (requirement.type === "perfectStreak") {
    return `Build a ${requirement.threshold}-perfect streak`;
  }

  if (requirement.type === "nostalgiaResets") {
    return `Complete ${requirement.threshold} Nostalgia reset${requirement.threshold === 1 ? "" : "s"}`;
  }

  return `Discover ${requirement.threshold} catalog references`;
}

export function getAchievementUnlockProgressDetail(
  state: GameState,
  achievementId: AchievementId,
): UnlockProgressDetail {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  if (!achievement) {
    return { label: "", current: 0, threshold: 0, ratio: 0 };
  }

  const requirement = achievement.requirement;
  const threshold =
    requirement.type === "collectionValue" ? requirement.thresholdCents : requirement.threshold;

  const rawCurrent =
    requirement.type === "totalItems"
      ? getTotalItemCount(state)
      : requirement.type === "collectionValue"
        ? getCollectionValueCents(state)
        : requirement.type === "workshopPrestigeCount"
          ? state.workshopPrestigeCount
          : requirement.type === "careerLevel"
            ? state.therapistCareer.level
            : requirement.type === "interactionPerfects"
              ? state.interactionPerfectRuns
              : requirement.type === "perfectStreak"
                ? state.interactionBestPerfectStreak
                : requirement.type === "nostalgiaResets"
                  ? state.nostalgiaResets
                  : state.discoveredCatalogEntries.length;

  const current = clampNumber(rawCurrent, 0, threshold);
  const ratio = threshold > 0 ? clampNumber(rawCurrent / threshold, 0, 1) : 0;

  return {
    label: getAchievementRequirementLabel(achievementId),
    current,
    threshold,
    ratio,
  };
}

export function getAchievementEffectSummary(achievementId: AchievementId): string {
  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
  return achievement?.description ?? "";
}

const PRESTIGE_UNLOCK_EFFECT_SUMMARIES: Record<"workshop" | "maison" | "nostalgia", string> = {
  workshop: "Prestige the Atelier to earn Blueprints and unlock Workshop bonuses.",
  maison: "Prestige again for Heritage, Reputation, and Maison perks.",
  nostalgia: "Prestige for Nostalgia to gain permanent Nostalgia points.",
};

export function getPrestigeUnlockProgressDetail(
  state: GameState,
  prestigeId: "workshop" | "maison" | "nostalgia",
): UnlockProgressDetail {
  const threshold =
    prestigeId === "workshop"
      ? getWorkshopPrestigeThresholdCents()
      : prestigeId === "maison"
        ? getMaisonPrestigeThresholdCents()
        : getNostalgiaPrestigeThresholdCents();

  const rawCurrent =
    prestigeId === "workshop"
      ? state.enjoymentCents
      : prestigeId === "maison"
        ? state.enjoymentCents + state.workshopBlueprints * threshold
        : state.nostalgiaEnjoymentEarnedCents;
  const current = clampNumber(rawCurrent, 0, threshold);
  const ratio = threshold > 0 ? clampNumber(rawCurrent / threshold, 0, 1) : 0;

  return {
    label: `Reach ${getEnjoymentThresholdLabel(threshold)}`,
    current,
    threshold,
    ratio,
  };
}

export function getPrestigeUnlockEffectSummary(
  prestigeId: "workshop" | "maison" | "nostalgia",
): string {
  return PRESTIGE_UNLOCK_EFFECT_SUMMARIES[prestigeId];
}

export function shouldShowUnlockTag(state: GameState, milestoneId: MilestoneId): boolean {
  return getUnlockVisibilityRatio(state, milestoneId) >= REVEAL_THRESHOLD_RATIO;
}

export function hasMaisonUpgrade(state: GameState, id: MaisonUpgradeId): boolean {
  return state.maisonUpgrades[id] ?? false;
}

export function hasMaisonLine(state: GameState, id: MaisonLineId): boolean {
  return state.maisonLines[id] ?? false;
}

export function getMilestoneRequirementLabel(milestoneId: MilestoneId): string {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  if (!milestone) {
    return "";
  }

  if (milestone.requirement.type === "totalItems") {
    return `Own ${milestone.requirement.threshold} total items`;
  }

  if (milestone.requirement.type === "collectionValue") {
    return `Reach ${formatMoneyFromCents(milestone.requirement.thresholdCents)} Memories`;
  }

  return `Discover ${milestone.requirement.threshold} catalog references`;
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

export function getTherapistCashRateCentsPerSec(state: GameState, nowMs: number): number {
  return getTherapistCashRateWithWindowCentsPerSec(state, nowMs);
}

export function getTotalCashRateCentsPerSec(state: GameState, nowMs: number): number {
  return getTherapistCashRateCentsPerSec(state, nowMs);
}

export function getEffectiveCashRateCentsPerSec(
  state: GameState,
  nowMs: number,
  eventMultiplier = 1,
): number {
  return getTotalCashRateCentsPerSec(state, nowMs) * eventMultiplier;
}

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

    const item = WATCH_ITEM_LOOKUP.get(model.tierId);
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

export function getCashRateBreakdown(
  state: GameState,
  nowMs: number,
  eventMultiplier = 1,
): CashRateBreakdown {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const therapistSalaryCentsPerSec = getTherapistCashRateCentsPerSec(state, clampedNowMs);
  const sessionPolicy = getTherapistSessionPolicy(state, clampedNowMs);
  const sessionCadenceCentsPerSec =
    sessionPolicy.supportsSessions && sessionPolicy.cooldownMs > 0
      ? (sessionPolicy.cashPayoutCents * 1_000) / sessionPolicy.cooldownMs
      : 0;
  const careerAddends: RateBreakdownAddendTerm[] = [
    {
      id: "career-salary",
      label: "Career salary (passive)",
      centsPerSec: therapistSalaryCentsPerSec,
    },
  ];
  const multiplierTerms: RateBreakdownMultiplierTerm[] = [
    { id: "event", label: "Event", multiplier: eventMultiplier },
  ];

  return {
    careerAddends,
    sessionCadence: {
      supportsSessions: sessionPolicy.supportsSessions,
      isFreeSession: state.therapistCareer.freeSessionAvailable && sessionPolicy.supportsSessions,
      payoutCents: sessionPolicy.cashPayoutCents,
      cooldownMs: sessionPolicy.cooldownMs,
      cooldownRemainingMs: sessionPolicy.cooldownRemainingMs,
      enjoymentCostCents: state.therapistCareer.freeSessionAvailable
        ? 0
        : sessionPolicy.effectiveEnjoymentCostCents,
      cadenceCentsPerSec: sessionCadenceCentsPerSec,
    },
    multiplierTerms,
    eventMultiplier,
    totalCentsPerSec: getEffectiveCashRateCentsPerSec(state, clampedNowMs, eventMultiplier),
  };
}

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

export function getWindUpIncomeMultiplierForTension(tension: number): number {
  const clamped = Math.max(0, Math.min(10, Math.floor(tension)));
  return Math.min(1.25, 1.05 + 0.02 * clamped);
}

export function getWindSessionCashPayoutCents(
  state: GameState,
  itemId: WatchItemId,
  tension: number,
): number {
  const item = requireWatchItem(itemId);
  const clamped = Math.max(0, Math.min(10, Math.floor(tension)));
  const base = Math.max(1_000, item.incomeCentsPerSec * 10);
  return Math.max(0, Math.round(base * (1 + clamped / 10)));
}

export function getTherapistCareer(state: GameState): TherapistCareerState {
  return state.therapistCareer;
}

export function getActiveCareerTrackId(state: GameState): CareerTrackId | null {
  return state.therapistCareer.activeTrackId;
}

export function getEventStatusLabel(state: GameState, eventId: EventId, nowMs: number): string {
  const event = EVENTS.find((entry) => entry.id === eventId);
  if (!event) {
    return "";
  }

  const entry = state.eventStates[eventId];
  if (!entry) {
    return "";
  }

  if (nowMs < entry.activeUntilMs) {
    const secondsLeft = Math.max(0, Math.ceil((entry.activeUntilMs - nowMs) / 1000));
    return `Active for ${secondsLeft}s`;
  }

  if (nowMs < entry.nextAvailableAtMs) {
    const secondsLeft = Math.max(0, Math.ceil((entry.nextAvailableAtMs - nowMs) / 1000));
    return `Cooldown ${secondsLeft}s`;
  }

  return "Ready";
}

function formatEventCountdownLabel(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.ceil(safeMs / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.ceil(totalSeconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const totalHours = Math.ceil(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours}h`;
  }

  const totalDays = Math.ceil(totalHours / 24);
  return `${totalDays}d`;
}

export type EventCalendarEntry = {
  id: EventId;
  name: string;
  description: string;
  status: "active" | "upcoming" | "ready";
  countdownMs: number;
  countdownLabel: string;
  bonusMultiplier: number;
  bonusLabel: string;
  bonusExplanation: string;
};

export type EventCalendarModel = {
  active: EventCalendarEntry[];
  upcoming: EventCalendarEntry[];
  ready: EventCalendarEntry[];
};

export function getEventCalendar(state: GameState, nowMs: number): EventCalendarModel {
  const model: EventCalendarModel = {
    active: [],
    upcoming: [],
    ready: [],
  };

  for (const event of EVENTS) {
    const eventState = state.eventStates[event.id] ?? { activeUntilMs: 0, nextAvailableAtMs: 0 };
    const effectiveMultiplier = eventState.incomeMultiplier ?? event.incomeMultiplier;

    if (nowMs < eventState.activeUntilMs) {
      const countdownMs = Math.max(0, eventState.activeUntilMs - nowMs);
      model.active.push({
        id: event.id,
        name: event.name,
        description: event.description,
        status: "active",
        countdownMs,
        countdownLabel: formatEventCountdownLabel(countdownMs),
        bonusMultiplier: effectiveMultiplier,
        bonusLabel: `Income x${effectiveMultiplier.toFixed(2)}`,
        bonusExplanation: "Event is live now. Earnings include the active event multiplier.",
      });
      continue;
    }

    if (nowMs < eventState.nextAvailableAtMs) {
      const countdownMs = Math.max(0, eventState.nextAvailableAtMs - nowMs);
      model.upcoming.push({
        id: event.id,
        name: event.name,
        description: event.description,
        status: "upcoming",
        countdownMs,
        countdownLabel: formatEventCountdownLabel(countdownMs),
        bonusMultiplier: effectiveMultiplier,
        bonusLabel: `Income x${effectiveMultiplier.toFixed(2)}`,
        bonusExplanation: "Event returns after cooldown. Countdown shows time until it reopens.",
      });
      continue;
    }

    model.ready.push({
      id: event.id,
      name: event.name,
      description: event.description,
      status: "ready",
      countdownMs: 0,
      countdownLabel: "Ready",
      bonusMultiplier: effectiveMultiplier,
      bonusLabel: `Income x${effectiveMultiplier.toFixed(2)}`,
      bonusExplanation: "Event can trigger immediately once its activation condition is met.",
    });
  }

  const sortByCountdown = (a: EventCalendarEntry, b: EventCalendarEntry) =>
    a.countdownMs - b.countdownMs;
  model.active.sort(sortByCountdown);
  model.upcoming.sort(sortByCountdown);
  model.ready.sort((a, b) => a.name.localeCompare(b.name));

  return model;
}

export type LoopUrgency = "critical" | "high" | "medium" | "low";

export type LoopActionTarget = {
  tabId:
    | "collection"
    | "career"
    | "upgrades"
    | "workshop"
    | "maison"
    | "nostalgia"
    | "catalog"
    | "stats"
    | "save";
  scrollTargetId?: string;
};

export type LoopActionCard = {
  id: string;
  label: string;
  detail: string;
  actionLabel: string;
  whyNow: string;
  target: LoopActionTarget;
};

export type FirstRunChecklistItem = {
  id: "career-start" | "first-session" | "first-watch" | "atelier-unlocked" | "first-atelier-reset";
  label: string;
  complete: boolean;
};

export type FirstRunChecklist = {
  visible: boolean;
  completedCount: number;
  totalCount: number;
  items: ReadonlyArray<FirstRunChecklistItem>;
};

export type EconomyForecastPoint = {
  id: "plus-1m" | "plus-5m" | "plus-10m";
  label: "+1m" | "+5m" | "+10m";
  horizonMs: number;
  projectedCashDeltaCents: number;
  projectedEnjoymentDeltaCents: number;
  averageEventMultiplier: number;
};

export type EconomyForecastStrip = {
  points: ReadonlyArray<EconomyForecastPoint>;
  reason: string;
};

export type PrimaryLoopAction = {
  urgency: LoopUrgency;
  urgencyReason: string;
  primary: LoopActionCard;
  secondary: LoopActionCard;
  checklist: FirstRunChecklist;
  forecast: EconomyForecastStrip;
};

export function getFirstRunChecklist(state: GameState): FirstRunChecklist {
  const items: FirstRunChecklistItem[] = [
    {
      id: "career-start",
      label: "Start the therapist career",
      complete: state.therapistCareer.careerStartId !== null,
    },
    {
      id: "first-session",
      label: "Complete your first therapist session",
      complete: state.therapistCareer.lastSessionAtMs > 0 || state.therapistCareer.level > 0,
    },
    {
      id: "first-watch",
      label: "Buy your first watch model",
      complete: getTotalItemCount(state) > 0,
    },
    {
      id: "atelier-unlocked",
      label: "Reach Atelier reveal threshold",
      complete: isWorkshopRevealReady(state) || state.unlockedMilestones.includes("atelier"),
    },
    {
      id: "first-atelier-reset",
      label: "Complete one Atelier prestige reset",
      complete: state.workshopPrestigeCount > 0,
    },
  ];
  const completedCount = items.reduce((count, item) => count + (item.complete ? 1 : 0), 0);
  const firstLoopComplete = state.workshopPrestigeCount > 0 || state.nostalgiaResets > 0;

  return {
    visible: !firstLoopComplete && completedCount < items.length,
    completedCount,
    totalCount: items.length,
    items,
  };
}

function getAverageActiveEventMultiplier(state: GameState, nowMs: number, horizonMs: number): number {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const clampedHorizonMs = Number.isFinite(horizonMs) ? Math.max(0, Math.floor(horizonMs)) : 0;
  if (clampedHorizonMs <= 0) {
    return getEventIncomeMultiplier(state, clampedNowMs);
  }

  const horizonEndMs = clampedNowMs + clampedHorizonMs;
  const activeEvents = EVENTS.map((event) => {
    const eventState = state.eventStates[event.id] ?? { activeUntilMs: 0, nextAvailableAtMs: 0 };
    const effectiveMultiplier = eventState.incomeMultiplier ?? event.incomeMultiplier;

    return {
      activeUntilMs: Math.max(0, Math.floor(eventState.activeUntilMs)),
      multiplier: Math.max(1, effectiveMultiplier),
    };
  }).filter((event) => event.activeUntilMs > clampedNowMs);

  if (activeEvents.length === 0) {
    return 1;
  }

  const boundaries = new Set<number>([clampedNowMs, horizonEndMs]);
  for (const event of activeEvents) {
    if (event.activeUntilMs > clampedNowMs && event.activeUntilMs < horizonEndMs) {
      boundaries.add(event.activeUntilMs);
    }
  }

  const sorted = Array.from(boundaries).sort((a, b) => a - b);
  if (sorted.length <= 1) {
    return 1;
  }

  let weightedMultiplierMs = 0;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const segmentStartMs = sorted[index];
    const segmentEndMs = sorted[index + 1];
    const segmentDurationMs = Math.max(0, segmentEndMs - segmentStartMs);
    if (segmentDurationMs <= 0) {
      continue;
    }

    const segmentMultiplier = activeEvents.reduce((multiplier, event) => {
      if (event.activeUntilMs > segmentStartMs) {
        return multiplier * event.multiplier;
      }
      return multiplier;
    }, 1);
    weightedMultiplierMs += segmentMultiplier * segmentDurationMs;
  }

  return weightedMultiplierMs > 0 ? weightedMultiplierMs / clampedHorizonMs : 1;
}

export function getEconomyForecastStrip(state: GameState, nowMs: number): EconomyForecastStrip {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const baseCashRateCentsPerSec = getEffectiveCashRateCentsPerSec(state, clampedNowMs, 1);
  const baseEnjoymentRateCentsPerSec = getEnjoymentRateCentsPerSec(state);
  const pointsConfig: ReadonlyArray<{ id: EconomyForecastPoint["id"]; label: EconomyForecastPoint["label"]; horizonMs: number }> = [
    { id: "plus-1m", label: "+1m", horizonMs: 60_000 },
    { id: "plus-5m", label: "+5m", horizonMs: 5 * 60_000 },
    { id: "plus-10m", label: "+10m", horizonMs: 10 * 60_000 },
  ];

  const points: EconomyForecastPoint[] = pointsConfig.map((config) => {
    const averageEventMultiplier = getAverageActiveEventMultiplier(state, clampedNowMs, config.horizonMs);
    const projectedCashDeltaCents = Math.max(
      0,
      Math.floor((baseCashRateCentsPerSec * averageEventMultiplier * config.horizonMs) / 1000),
    );
    const projectedEnjoymentDeltaCents = Math.max(
      0,
      Math.floor((baseEnjoymentRateCentsPerSec * averageEventMultiplier * config.horizonMs) / 1000),
    );

    return {
      id: config.id,
      label: config.label,
      horizonMs: config.horizonMs,
      projectedCashDeltaCents,
      projectedEnjoymentDeltaCents,
      averageEventMultiplier,
    };
  });

  const activeEventCount = EVENTS.reduce(
    (count, event) => count + (isEventActive(state, event.id, clampedNowMs) ? 1 : 0),
    0,
  );

  return {
    points,
    reason:
      activeEventCount > 0
        ? "Includes active event bonuses and their expiry windows."
        : "Uses current baseline rates with no active event bonus.",
  };
}

export function getPrimaryLoopAction(state: GameState, nowMs: number): PrimaryLoopAction {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const checklist = getFirstRunChecklist(state);
  const forecast = getEconomyForecastStrip(state, clampedNowMs);
  const careerStarted = state.therapistCareer.careerStartId !== null;
  const careerSessionReady = canPerformTherapistSession(state, clampedNowMs);
  const nostalgiaGain = getNostalgiaPrestigeGain(state);
  const maisonGain = getMaisonPrestigeGain(state);
  const atelierGain = getWorkshopPrestigeGain(state);
  const activeEventCount = EVENTS.reduce(
    (count, event) => count + (isEventActive(state, event.id, clampedNowMs) ? 1 : 0),
    0,
  );

  if (!careerStarted) {
    return {
      urgency: "critical",
      urgencyReason: "Career is the opening gate for salary, sessions, and long-loop progression.",
      primary: {
        id: "start-career",
        label: "Start your therapist career",
        detail: "Enter the PhD path to unlock salary cadence, sessions, and progression tracks.",
        actionLabel: "Open Career",
        whyNow: "Without career start, your main cash loop stays blocked.",
        target: { tabId: "career" },
      },
      secondary: {
        id: "review-save-settings",
        label: "Review core settings",
        detail: "Set theme, notifications, and tab visibility before your first run.",
        actionLabel: "Open Settings",
        whyNow: "Establishing controls early prevents accidental friction during onboarding.",
        target: { tabId: "save", scrollTargetId: "settings-visibility" },
      },
      checklist,
      forecast,
    };
  }

  if (canNostalgiaPrestige(state)) {
    return {
      urgency: "critical",
      urgencyReason: "Nostalgia is ready and converts this run into permanent account power.",
      primary: {
        id: "claim-nostalgia",
        label: "Claim Nostalgia prestige",
        detail: "Reset at peak and bank permanent points for future runs.",
        actionLabel: "Open Nostalgia",
        whyNow: `You can claim +${nostalgiaGain.toLocaleString()} Nostalgia right now.`,
        target: { tabId: "nostalgia", scrollTargetId: "nostalgia-preview" },
      },
      secondary: {
        id: "audit-reset-preferences",
        label: "Audit reset preferences",
        detail: "Confirm unlock prompts and visibility settings before reset.",
        actionLabel: "Open Settings",
        whyNow: "A quick check prevents accidental unlock flow mistakes post-reset.",
        target: { tabId: "save", scrollTargetId: "settings-visibility" },
      },
      checklist,
      forecast,
    };
  }

  if (canMaisonPrestige(state)) {
    return {
      urgency: "high",
      urgencyReason: "Maison prestige is available and can lock in legacy multipliers this run.",
      primary: {
        id: "prepare-maison-prestige",
        label: "Prepare Maison prestige",
        detail: "Review the reset to claim Heritage and Reputation.",
        actionLabel: "Open Maison",
        whyNow: `Current reset yields +${maisonGain.toLocaleString()} Heritage.`,
        target: { tabId: "maison", scrollTargetId: "maison-reset" },
      },
      secondary: {
        id: "finalize-prestige-buys",
        label: "Finalize pre-reset purchases",
        detail: "Spend remaining cash on compounding purchases before resetting.",
        actionLabel: "Open Collection",
        whyNow: "Last-minute buys can improve your restart velocity.",
        target: { tabId: "collection", scrollTargetId: "collection-overview" },
      },
      checklist,
      forecast,
    };
  }

  if (canWorkshopPrestige(state)) {
    return {
      urgency: "high",
      urgencyReason: "Atelier prestige is ready, enabling blueprint progression and compounding boosts.",
      primary: {
        id: "prepare-atelier-prestige",
        label: "Prepare Atelier prestige",
        detail: "Reset when ready to convert enjoyment into blueprints.",
        actionLabel: "Open Workshop",
        whyNow: `This reset currently yields +${atelierGain.toLocaleString()} blueprints.`,
        target: { tabId: "workshop", scrollTargetId: "workshop-reset" },
      },
      secondary: {
        id: "tighten-upgrade-path",
        label: "Tighten your upgrade path",
        detail: "Spend cash on value upgrades to improve your next loop start.",
        actionLabel: "Open Upgrades",
        whyNow: "Spending before reset can increase immediate post-reset output.",
        target: { tabId: "upgrades", scrollTargetId: "collection-upgrades" },
      },
      checklist,
      forecast,
    };
  }

  if (careerSessionReady) {
    return {
      urgency: "high",
      urgencyReason: "A session is currently actionable and directly boosts salary progression.",
      primary: {
        id: "run-career-session",
        label: "Run your next therapist session",
        detail: "Sessions generate cash and accelerate career milestones.",
        actionLabel: "Go to Career",
        whyNow: "Session availability is a high-leverage career progression window.",
        target: { tabId: "career" },
      },
      secondary: {
        id: "convert-cash-into-collection",
        label: "Convert cash into collection growth",
        detail: "Buy catalog watches to scale enjoyment and unlocks.",
        actionLabel: "Open Catalog",
        whyNow: "New purchases raise baseline rates for every subsequent tick.",
        target: { tabId: "catalog", scrollTargetId: "catalog-shop" },
      },
      checklist,
      forecast,
    };
  }

  return {
    urgency: activeEventCount > 0 ? "high" : "medium",
    urgencyReason:
      activeEventCount > 0
        ? "An active event bonus is running; prioritize actions that capitalize on current rates."
        : "No immediate gate is blocking progression, so prioritize steady compounding.",
    primary: {
      id: "expand-collection",
      label: "Expand your collection",
      detail: "Buy affordable watches to push enjoyment and memory growth.",
      actionLabel: "Open Catalog",
      whyNow:
        activeEventCount > 0
          ? "Active event bonuses amplify each purchase's short-term return."
          : "Baseline compounding is strongest when you keep ownership growing.",
      target: { tabId: "catalog", scrollTargetId: "catalog-shop" },
    },
    secondary: {
      id: "review-live-diagnostics",
      label: "Review live diagnostics",
      detail: "Check rates and event timing to pick the next high-value investment.",
      actionLabel: "Open Stats",
      whyNow: "Use current rates and event timing before committing your next spend.",
      target: { tabId: "stats" },
    },
    checklist,
    forecast,
  };
}

export function getSoftcapEfficiency(state: GameState): number {
  const rawIncome = getRawIncomeRateCentsPerSec(state);
  if (rawIncome <= 0) {
    return 1;
  }

  return getEffectiveIncomeRateCentsPerSec(state) / rawIncome;
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

function applySoftcap(value: number, softcap: number, exponent: number): number {
  if (value <= softcap) {
    return value;
  }

  return softcap * (value / softcap) ** exponent;
}
