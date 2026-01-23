export type {
  AchievementDefinition,
  AchievementId,
  AchievementRequirement,
  CatalogEntryId,
  CatalogTierBonusDefinition,
  CatalogTierId,
  CraftedBoostId,
  EventDefinition,
  EventId,
  EventState,
  EventTrigger,
  GameState,
  MaisonCurrency,
  MaisonLineDefinition,
  MaisonLineId,
  MaisonUpgradeDefinition,
  MaisonUpgradeId,
  MilestoneDefinition,
  MilestoneId,
  MilestoneRequirement,
  PersistedGameState,
  SetBonusDefinition,
  SetBonusId,
  TherapistCareerState,
  UpgradeDefinition,
  UpgradeId,
  WatchItemDefinition,
  WatchItemId,
  WorkshopUpgradeDefinition,
  WorkshopUpgradeId,
} from "./model/types";

import { CATALOG_ENTRIES, getCatalogEntryTags, type CatalogEntry } from "./catalog";
import { formatMoneyFromCents } from "./format";
import type {
  AchievementDefinition,
  AchievementId,
  CatalogEntryId,
  CatalogTierBonusDefinition,
  CatalogTierId,
  CraftedBoostId,
  EventDefinition,
  EventId,
  EventState,
  GameState,
  MaisonLineDefinition,
  MaisonLineId,
  MaisonUpgradeDefinition,
  MaisonUpgradeId,
  MilestoneDefinition,
  MilestoneId,
  PersistedGameState,
  SetBonusDefinition,
  TherapistCareerState,
  UpgradeDefinition,
  UpgradeId,
  WatchItemDefinition,
  WatchItemId,
  WorkshopUpgradeDefinition,
  WorkshopUpgradeId,
} from "./model/types";

export const ALL_MILESTONE_IDS: MilestoneId[] = [
  "collector-shelf",
  "showcase",
  "atelier",
  "archive-curator",
];

const BASE_INCOME_CENTS_PER_SEC = 10;
const INCOME_SOFTCAP_CENTS_PER_SEC = 60_000;
const INCOME_SOFTCAP_EXPONENT = 0.6;

const THERAPIST_BASE_SALARY_CENTS_PER_SEC = 4;
const THERAPIST_SALARY_CENTS_PER_SEC_PER_LEVEL = 2;

const THERAPIST_BASE_SESSION_COOLDOWN_MS = 30_000;
const THERAPIST_BASE_SESSION_ENJOYMENT_COST_CENTS = 150;
const THERAPIST_BASE_SESSION_CASH_PAYOUT_CENTS = 500;
const THERAPIST_SESSION_XP_GAIN = 10;

const WORKSHOP_UPGRADES: ReadonlyArray<WorkshopUpgradeDefinition> = [
  {
    id: "etched-ledgers",
    name: "Etched ledgers",
    description: "Blueprinted accounting boosts every sale.",
    blueprintCost: 2,
    incomeMultiplier: 1.08,
  },
  {
    id: "vault-calibration",
    name: "Vault calibration",
    description: "Better vault tuning lifts the income softcap.",
    blueprintCost: 4,
    softcapMultiplier: 1.25,
  },
  {
    id: "heritage-templates",
    name: "Heritage templates",
    description: "Prestige patterns keep income stronger under the softcap.",
    blueprintCost: 6,
    softcapExponentBonus: 0.07,
  },
  {
    id: "automation-blueprints",
    name: "Automation blueprints",
    description: "Permanent automation unlocks for future runs.",
    blueprintCost: 8,
    unlocks: { autoBuyEnabled: true },
  },
];

const MAISON_UPGRADES: ReadonlyArray<MaisonUpgradeDefinition> = [
  {
    id: "atelier-charter",
    name: "Atelier charter",
    description: "Legacy charters elevate every collection release.",
    currency: "heritage",
    cost: 3,
    incomeMultiplier: 1.12,
  },
  {
    id: "heritage-loom",
    name: "Heritage loom",
    description: "Woven provenance amplifies collection bonuses.",
    currency: "heritage",
    cost: 6,
    collectionBonusMultiplier: 1.2,
  },
  {
    id: "global-vitrine",
    name: "Global vitrine",
    description: "International vitrines loosen the income softcap.",
    currency: "reputation",
    cost: 4,
    softcapMultiplier: 1.2,
  },
];

const MAISON_LINES: ReadonlyArray<MaisonLineDefinition> = [
  {
    id: "atelier-line",
    name: "Atelier line",
    description: "Unify the atelier workflow for steady cash gains.",
    currency: "heritage",
    cost: 5,
    incomeMultiplier: 1.1,
  },
  {
    id: "heritage-line",
    name: "Heritage line",
    description: "Signature heritage releases amplify collection prestige.",
    currency: "heritage",
    cost: 9,
    collectionBonusMultiplier: 1.1,
  },
  {
    id: "complication-line",
    name: "Complication line",
    description: "Introduce high complications to boost blueprint yields.",
    currency: "reputation",
    cost: 6,
    workshopBlueprintBonus: 1,
  },
];

const COLLECTION_BONUS_STEPS: Array<{ thresholdCents: number; multiplier: number }> = [
  { thresholdCents: 7_500, multiplier: 1.02 },
  { thresholdCents: 35_000, multiplier: 1.05 },
  { thresholdCents: 150_000, multiplier: 1.1 },
  { thresholdCents: 700_000, multiplier: 1.2 },
];

const CATALOG_TIER_BONUSES: CatalogTierBonusDefinition[] = [
  {
    id: "starter",
    name: "Starter archive",
    description: "Archive 3 starter references to boost cash flow.",
    requiredCount: 3,
    incomeMultiplier: 1.03,
  },
  {
    id: "classic",
    name: "Classic index",
    description: "Discover 4 classic icons to amplify vault earnings.",
    requiredCount: 4,
    incomeMultiplier: 1.05,
  },
  {
    id: "chronograph",
    name: "Chronograph dossier",
    description: "Collect 3 chronograph references for a lasting cash lift.",
    requiredCount: 3,
    incomeMultiplier: 1.07,
  },
  {
    id: "tourbillon",
    name: "Tourbillon registry",
    description: "Secure 2 tourbillon references for elite income.",
    requiredCount: 2,
    incomeMultiplier: 1.1,
  },
];

const WATCH_ITEMS: ReadonlyArray<WatchItemDefinition> = [
  {
    id: "starter",
    name: "Starter Quartz",
    description: "Reliable entry pieces to seed the vault.",
    basePriceCents: 125,
    priceGrowth: 1.145,
    incomeCentsPerSec: 6,
    enjoymentCentsPerSec: 2,
    collectionValueCents: 140,
  },
  {
    id: "classic",
    name: "Classic Automatic",
    description: "Self-winding classics with steady demand.",
    basePriceCents: 1_800,
    priceGrowth: 1.17,
    incomeCentsPerSec: 36,
    enjoymentCentsPerSec: 12,
    collectionValueCents: 2_400,
    unlockMilestoneId: "collector-shelf",
  },
  {
    id: "chronograph",
    name: "Chronograph",
    description: "Complications that attract serious collectors.",
    basePriceCents: 12_500,
    priceGrowth: 1.18,
    incomeCentsPerSec: 185,
    enjoymentCentsPerSec: 60,
    collectionValueCents: 18_000,
    unlockMilestoneId: "showcase",
  },
  {
    id: "tourbillon",
    name: "Tourbillon",
    description: "Prestige pieces for the vault centerpiece.",
    basePriceCents: 150_000,
    priceGrowth: 1.195,
    incomeCentsPerSec: 980,
    enjoymentCentsPerSec: 240,
    collectionValueCents: 210_000,
    unlockMilestoneId: "atelier",
  },
];

export const NOSTALGIA_UNLOCK_ORDER: WatchItemId[] = ["classic", "chronograph", "tourbillon"];
const NOSTALGIA_UNLOCK_COSTS: Record<WatchItemId, number> = {
  starter: 0,
  classic: 1,
  chronograph: 3,
  tourbillon: 6,
};

const WATCH_ENJOYMENT_REQUIREMENTS_CENTS: Record<WatchItemId, number> = {
  starter: 0,
  classic: 2_000,
  chronograph: 15_000,
  tourbillon: 60_000,
};

const UPGRADES: ReadonlyArray<UpgradeDefinition> = [
  {
    id: "polishing-tools",
    name: "Polishing tools",
    description: "Refined finishing yields more revenue per piece.",
    basePriceCents: 500,
    priceGrowth: 1.6,
    incomeMultiplierPerLevel: 0.05,
  },
  {
    id: "assembly-jigs",
    name: "Assembly jigs",
    description: "Speed up production with repeatable fixtures.",
    basePriceCents: 5_000,
    priceGrowth: 1.7,
    incomeMultiplierPerLevel: 0.08,
    unlockMilestoneId: "collector-shelf",
  },
  {
    id: "guild-contracts",
    name: "Guild contracts",
    description: "Exclusive partnerships compound prestige earnings.",
    basePriceCents: 50_000,
    priceGrowth: 1.8,
    incomeMultiplierPerLevel: 0.12,
    unlockMilestoneId: "showcase",
  },
  {
    id: "archive-guides",
    name: "Archive guides",
    description: "Cataloged references deepen vault earnings.",
    basePriceCents: 85_000,
    priceGrowth: 1.85,
    incomeMultiplierPerLevel: 0.1,
    unlockMilestoneId: "archive-curator",
  },
];

const MILESTONES: ReadonlyArray<MilestoneDefinition> = [
  {
    id: "collector-shelf",
    name: "Collector shelf",
    description: "Showcase five pieces to unlock classic automatics.",
    requirement: { type: "totalItems", threshold: 5 },
    unlocks: { items: ["classic"], upgrades: ["assembly-jigs"] },
  },
  {
    id: "showcase",
    name: "Vault showcase",
    description: "Reach $25k Memories to unlock chronographs.",
    requirement: { type: "collectionValue", thresholdCents: 25_000 },
    unlocks: { items: ["chronograph"], upgrades: ["guild-contracts"] },
  },
  {
    id: "atelier",
    name: "Master atelier",
    description: "Collect 50 pieces to unlock tourbillons.",
    requirement: { type: "totalItems", threshold: 50 },
    unlocks: { items: ["tourbillon"] },
  },
  {
    id: "archive-curator",
    name: "Archive curator",
    description: "Discover 12 catalog references to unlock archive guides.",
    requirement: { type: "catalogDiscovery", threshold: 12 },
    unlocks: { upgrades: ["archive-guides"] },
  },
];

const SET_BONUSES: ReadonlyArray<SetBonusDefinition> = [
  {
    id: "starter-set",
    name: "Starter set",
    description: "Own 5 quartz + 1 automatic for a 5% boost.",
    requirements: { starter: 5, classic: 1 },
    incomeMultiplier: 1.05,
  },
  {
    id: "precision-set",
    name: "Precision set",
    description: "Own 5 automatics + 2 chronographs for 10% boost.",
    requirements: { classic: 5, chronograph: 2 },
    incomeMultiplier: 1.1,
  },
  {
    id: "complication-set",
    name: "Complication set",
    description: "Own 3 chronographs + 1 tourbillon for 15% boost.",
    requirements: { chronograph: 3, tourbillon: 1 },
    incomeMultiplier: 1.15,
  },
  {
    id: "oyster-society",
    name: "Oyster society",
    description: "Build 12 quartz + 4 automatics for 8% boost.",
    requirements: { starter: 12, classic: 4 },
    incomeMultiplier: 1.08,
  },
  {
    id: "crown-chronicle",
    name: "Crown chronicle",
    description: "Hold 4 chronographs + 1 tourbillon for 12% boost.",
    requirements: { chronograph: 4, tourbillon: 1 },
    incomeMultiplier: 1.12,
  },
  {
    id: "seamaster-society",
    name: "Seamaster society",
    description: "Keep 8 automatics + 3 chronographs for 9% boost.",
    requirements: { classic: 8, chronograph: 3 },
    incomeMultiplier: 1.09,
  },
  {
    id: "dress-circle",
    name: "Dress circle",
    description: "Maintain 10 quartz + 2 automatics for 7% boost.",
    requirements: { starter: 10, classic: 2 },
    incomeMultiplier: 1.07,
  },
  {
    id: "diver-crew",
    name: "Diver crew",
    description: "Keep 6 automatics + 2 chronographs for 8% boost.",
    requirements: { classic: 6, chronograph: 2 },
    incomeMultiplier: 1.08,
  },
  {
    id: "collector-quartet",
    name: "Collector quartet",
    description: "Hold 18 quartz + 4 automatics + 2 chronographs + 1 tourbillon for 13% boost.",
    requirements: { starter: 18, classic: 4, chronograph: 2, tourbillon: 1 },
    incomeMultiplier: 1.13,
  },
];

const ACHIEVEMENTS: ReadonlyArray<AchievementDefinition> = [
  {
    id: "first-drawer",
    name: "First drawer",
    description: "Hold 12 watches in the vault.",
    requirement: { type: "totalItems", threshold: 12 },
  },
  {
    id: "six-figure-vault",
    name: "Six-figure vault",
    description: "Reach $120k in Memories.",
    requirement: { type: "collectionValue", thresholdCents: 120_000 },
  },
  {
    id: "workshop-reforged",
    name: "Workshop reforged",
    description: "Prestige the workshop once.",
    requirement: { type: "workshopPrestigeCount", threshold: 1 },
  },
  {
    id: "workshop-veteran",
    name: "Workshop veteran",
    description: "Prestige the workshop three times.",
    requirement: { type: "workshopPrestigeCount", threshold: 3 },
  },
  {
    id: "vault-century",
    name: "Vault century",
    description: "Hold 100 watches in the vault.",
    requirement: { type: "totalItems", threshold: 100 },
  },
  {
    id: "million-memories",
    name: "Million memories",
    description: "Reach $1,000,000 in Memories.",
    requirement: { type: "collectionValue", thresholdCents: 100_000_000 },
  },
  {
    id: "workshop-decade",
    name: "Workshop decade",
    description: "Prestige the workshop ten times.",
    requirement: { type: "workshopPrestigeCount", threshold: 10 },
  },
  {
    id: "catalog-keeper",
    name: "Catalog keeper",
    description: "Discover 20 catalog references.",
    requirement: { type: "catalogDiscovery", threshold: 20 },
  },
];

const EVENTS: ReadonlyArray<EventDefinition> = [
  {
    id: "auction-weekend",
    name: "Auction weekend",
    description: "Collectors bid fiercely, doubling income for a short sprint.",
    trigger: { type: "collectionValue", thresholdCents: 90_000 },
    durationMs: 90_000,
    cooldownMs: 240_000,
    incomeMultiplier: 1.6,
  },
  {
    id: "emily-birthday",
    name: "Emily's birthday",
    description: "A once-a-year boost in honor of the day.",
    trigger: { type: "calendarDate", month: 4, day: 27, timezone: "local" },
    durationMs: 86_400_000,
    cooldownMs: 0,
    incomeMultiplier: 1.27,
  },
  {
    id: "wind-up",
    name: "Wind-up",
    description: "A freshly wound crown keeps the vault humming.",
    trigger: { type: "manual" },
    durationMs: 60_000,
    cooldownMs: 120_000,
    incomeMultiplier: 1.05,
  },
];

const CRAFTED_BOOSTS: ReadonlyArray<{ id: CraftedBoostId; name: string; description: string }> = [
  {
    id: "polished-tools",
    name: "Polished tools",
    description: "Restored finishing gear that keeps production refined.",
  },
  {
    id: "heritage-springs",
    name: "Heritage springs",
    description: "Clockwork springs tuned for consistent output.",
  },
  {
    id: "artisan-jig",
    name: "Artisan jig",
    description: "Precision jigs that keep prestige gains steady.",
  },
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
const REVEAL_THRESHOLD_RATIO = 0.8;

const CRAFTING_PARTS_PER_WATCH: Record<WatchItemId, number> = {
  starter: 1,
  classic: 2,
  chronograph: 4,
  tourbillon: 8,
};

const CRAFTED_BOOST_MULTIPLIERS: Record<CraftedBoostId, number> = {
  "polished-tools": 1.05,
  "heritage-springs": 1.04,
  "artisan-jig": 1.12,
};

const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));
const UPGRADE_LOOKUP = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const MILESTONE_LOOKUP = new Map(MILESTONES.map((milestone) => [milestone.id, milestone]));
const WORKSHOP_UPGRADE_LOOKUP = new Map(WORKSHOP_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const MAISON_UPGRADE_LOOKUP = new Map(MAISON_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const MAISON_LINE_LOOKUP = new Map(MAISON_LINES.map((line) => [line.id, line]));
const CRAFTING_RECIPE_LOOKUP = new Map(CRAFTING_RECIPES.map((recipe) => [recipe.id, recipe]));

export function getWatchItems(): ReadonlyArray<WatchItemDefinition> {
  return WATCH_ITEMS;
}

export function getNostalgiaUnlockIds(): WatchItemId[] {
  return NOSTALGIA_UNLOCK_ORDER;
}

export function getNostalgiaUnlockCost(id: WatchItemId): number {
  return NOSTALGIA_UNLOCK_COSTS[id] ?? 0;
}

export function getWatchItemEnjoymentRateCentsPerSec(item: WatchItemDefinition): number {
  return item.enjoymentCentsPerSec;
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

export function discoverCatalogEntries(state: GameState, ids: CatalogEntryId[]): GameState {
  if (ids.length === 0) {
    return state;
  }

  const discovered = new Set(state.discoveredCatalogEntries);
  let changed = false;

  for (const id of ids) {
    if (!discovered.has(id) && CATALOG_ENTRIES.some((entry) => entry.id === id)) {
      discovered.add(id);
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  const nextState = {
    ...state,
    discoveredCatalogEntries: Array.from(discovered),
  };

  return updateCatalogTierUnlocks(nextState);
}

export function getDiscoveredCatalogEntries(state: GameState): CatalogEntry[] {
  if (state.discoveredCatalogEntries.length === 0) {
    return [];
  }

  const discovered = new Set(state.discoveredCatalogEntries);
  return CATALOG_ENTRIES.filter((entry) => discovered.has(entry.id));
}

export function getCatalogTierProgress(state: GameState): Record<CatalogTierId, number> {
  const progress: Record<CatalogTierId, number> = {
    starter: 0,
    classic: 0,
    chronograph: 0,
    tourbillon: 0,
  };

  for (const entry of getDiscoveredCatalogEntries(state)) {
    const tags = getCatalogEntryTags(entry);
    for (const tier of CATALOG_TIER_BONUSES) {
      if (tags.includes(tier.id)) {
        progress[tier.id] += 1;
      }
    }
  }

  return progress;
}

export function updateCatalogTierUnlocks(state: GameState): GameState {
  const progress = getCatalogTierProgress(state);
  const unlocks = new Set(state.catalogTierUnlocks);
  let changed = false;

  for (const bonus of CATALOG_TIER_BONUSES) {
    if (!unlocks.has(bonus.id) && progress[bonus.id] >= bonus.requiredCount) {
      unlocks.add(bonus.id);
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    catalogTierUnlocks: Array.from(unlocks),
  };
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

export function getCraftedBoostIncomeMultiplier(state: GameState): number {
  const polishedBoosts = state.craftedBoosts["polished-tools"] ?? 0;
  return Math.pow(CRAFTED_BOOST_MULTIPLIERS["polished-tools"], polishedBoosts);
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

export function dismantleItem(state: GameState, id: WatchItemId, quantity = 1): GameState {
  if (quantity <= 0) {
    return state;
  }

  const owned = getItemCount(state, id);
  if (owned < quantity) {
    return state;
  }

  const partsGain = (CRAFTING_PARTS_PER_WATCH[id] ?? 0) * quantity;
  if (partsGain <= 0) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    items: {
      ...state.items,
      [id]: owned - quantity,
    },
    craftingParts: state.craftingParts + partsGain,
  };

  return applyAchievementUnlocks(applyMilestoneUnlocks(nextState));
}

export function canCraftBoost(state: GameState, id: CraftedBoostId): boolean {
  const recipe = CRAFTING_RECIPE_LOOKUP.get(id);
  if (!recipe) {
    return false;
  }
  return state.craftingParts >= recipe.partsCost;
}

export function craftBoost(state: GameState, id: CraftedBoostId): GameState {
  const recipe = CRAFTING_RECIPE_LOOKUP.get(id);
  if (!recipe || state.craftingParts < recipe.partsCost) {
    return state;
  }

  const currentCount = state.craftedBoosts[id] ?? 0;
  const nextState: GameState = {
    ...state,
    craftingParts: state.craftingParts - recipe.partsCost,
    craftedBoosts: {
      ...state.craftedBoosts,
      [id]: currentCount + 1,
    },
  };

  return applyAchievementUnlocks(applyMilestoneUnlocks(nextState));
}

export function getCatalogTierIncomeMultiplier(state: GameState): number {
  return getCatalogTierBonuses(state).reduce(
    (multiplier, bonus) => multiplier * bonus.incomeMultiplier,
    1,
  );
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

export function createInitialState(): GameState {
  return {
    currencyCents: 0,
    enjoymentCents: 0,
    nostalgiaPoints: 0,
    nostalgiaResets: 0,
    nostalgiaUnlockedItems: [],
    nostalgiaEnjoymentEarnedCents: 0,
    nostalgiaLastGain: 0,
    nostalgiaLastPrestigedAtMs: 0,
    therapistCareer: {
      level: 1,
      xp: 0,
      nextAvailableAtMs: 0,
    },
    items: createItemCounts(),
    upgrades: createUpgradeLevels(),
    unlockedMilestones: [],
    workshopBlueprints: 0,
    workshopPrestigeCount: 0,
    workshopUpgrades: createWorkshopUpgradeStates(),
    maisonHeritage: 0,
    maisonReputation: 0,
    maisonUpgrades: createMaisonUpgradeStates(),
    maisonLines: createMaisonLineStates(),
    achievementUnlocks: [],
    eventStates: createEventStates(),
    discoveredCatalogEntries: [],
    catalogTierUnlocks: [],
    craftingParts: 0,
    craftedBoosts: {
      "polished-tools": 0,
      "heritage-springs": 0,
      "artisan-jig": 0,
    },
  };
}

export function createStateFromSave(saved: PersistedGameState): GameState {
  const items = createItemCounts();
  const upgrades = createUpgradeLevels();
  const workshopUpgrades = createWorkshopUpgradeStates();
  const maisonUpgrades = createMaisonUpgradeStates();
  const maisonLines = createMaisonLineStates();
  const eventStates = createEventStates();

  const therapistRaw = saved.therapistCareer;
  const therapistCareer: TherapistCareerState = {
    level:
      therapistRaw && typeof therapistRaw === "object" && Number.isFinite(therapistRaw.level)
        ? Math.max(1, Math.floor(therapistRaw.level ?? 1))
        : 1,
    xp:
      therapistRaw && typeof therapistRaw === "object" && Number.isFinite(therapistRaw.xp)
        ? Math.max(0, Math.floor(therapistRaw.xp ?? 0))
        : 0,
    nextAvailableAtMs:
      therapistRaw &&
      typeof therapistRaw === "object" &&
      Number.isFinite(therapistRaw.nextAvailableAtMs)
        ? Math.max(0, Math.floor(therapistRaw.nextAvailableAtMs ?? 0))
        : 0,
  };

  if (saved.items) {
    for (const [key, value] of Object.entries(saved.items)) {
      if (key in items && Number.isFinite(value)) {
        items[key as WatchItemId] = Math.max(0, Math.floor(value));
      }
    }
  }

  if (saved.upgrades) {
    for (const [key, value] of Object.entries(saved.upgrades)) {
      if (key in upgrades && Number.isFinite(value)) {
        upgrades[key as UpgradeId] = Math.max(0, Math.floor(value));
      }
    }
  }

  if (saved.workshopUpgrades) {
    for (const [key, value] of Object.entries(saved.workshopUpgrades)) {
      if (key in workshopUpgrades) {
        workshopUpgrades[key as WorkshopUpgradeId] = Boolean(value);
      }
    }
  }

  if (saved.maisonUpgrades) {
    for (const [key, value] of Object.entries(saved.maisonUpgrades)) {
      if (key in maisonUpgrades) {
        maisonUpgrades[key as MaisonUpgradeId] = Boolean(value);
      }
    }
  }

  if (saved.maisonLines) {
    for (const [key, value] of Object.entries(saved.maisonLines)) {
      if (key in maisonLines) {
        maisonLines[key as MaisonLineId] = Boolean(value);
      }
    }
  }

  if (saved.eventStates) {
    for (const [key, value] of Object.entries(saved.eventStates)) {
      const stateValue = value as {
        activeUntilMs: number;
        nextAvailableAtMs: number;
        incomeMultiplier?: number;
      };
      if (key in eventStates && Number.isFinite(stateValue?.activeUntilMs)) {
        eventStates[key as EventId] = {
          activeUntilMs: Math.max(0, Math.floor(stateValue.activeUntilMs)),
          nextAvailableAtMs: Number.isFinite(stateValue.nextAvailableAtMs)
            ? Math.max(0, Math.floor(stateValue.nextAvailableAtMs))
            : 0,
          incomeMultiplier:
            Number.isFinite(stateValue.incomeMultiplier) &&
            typeof stateValue.incomeMultiplier === "number"
              ? Math.max(0, stateValue.incomeMultiplier)
              : undefined,
        };
      }
    }
  }

  const unlockedMilestones = Array.isArray(saved.unlockedMilestones)
    ? saved.unlockedMilestones.filter((entry): entry is MilestoneId =>
        ALL_MILESTONE_IDS.includes(entry as MilestoneId),
      )
    : [];
  const nostalgiaUnlockIds = getNostalgiaUnlockIds();
  const nostalgiaUnlockedItemsRaw = Array.isArray(saved.nostalgiaUnlockedItems)
    ? saved.nostalgiaUnlockedItems.filter((entry): entry is WatchItemId =>
        nostalgiaUnlockIds.includes(entry as WatchItemId),
      )
    : [];
  const nostalgiaUnlockedItemsSet = new Set(nostalgiaUnlockedItemsRaw);
  const nostalgiaUnlockedItems = NOSTALGIA_UNLOCK_ORDER.filter((id) =>
    nostalgiaUnlockedItemsSet.has(id),
  );

  const workshopBlueprints = Number.isFinite(saved.workshopBlueprints ?? 0)
    ? Math.max(0, Math.floor(saved.workshopBlueprints ?? 0))
    : 0;
  const workshopPrestigeCount = Number.isFinite(saved.workshopPrestigeCount ?? 0)
    ? Math.max(0, Math.floor(saved.workshopPrestigeCount ?? 0))
    : 0;
  const enjoymentCents = Number.isFinite(saved.enjoymentCents ?? 0)
    ? Math.max(0, Math.floor(saved.enjoymentCents ?? 0))
    : 0;
  const nostalgiaPoints = Number.isFinite(saved.nostalgiaPoints ?? 0)
    ? Math.max(0, Math.floor(saved.nostalgiaPoints ?? 0))
    : 0;
  const nostalgiaResets = Number.isFinite(saved.nostalgiaResets ?? 0)
    ? Math.max(0, Math.floor(saved.nostalgiaResets ?? 0))
    : 0;
  const nostalgiaEnjoymentEarnedCents = Number.isFinite(saved.nostalgiaEnjoymentEarnedCents ?? 0)
    ? Math.max(0, Math.floor(saved.nostalgiaEnjoymentEarnedCents ?? 0))
    : 0;
  const nostalgiaLastGain = Number.isFinite(saved.nostalgiaLastGain ?? 0)
    ? Math.max(0, Math.floor(saved.nostalgiaLastGain ?? 0))
    : 0;
  const nostalgiaLastPrestigedAtMs = Number.isFinite(saved.nostalgiaLastPrestigedAtMs ?? 0)
    ? Math.max(0, Math.floor(saved.nostalgiaLastPrestigedAtMs ?? 0))
    : 0;
  const achievementUnlocks = Array.isArray(saved.achievementUnlocks)
    ? saved.achievementUnlocks.filter((entry): entry is AchievementId =>
        ACHIEVEMENTS.some((achievement) => achievement.id === entry),
      )
    : [];
  const discoveredCatalogEntries = Array.isArray(saved.discoveredCatalogEntries)
    ? saved.discoveredCatalogEntries.filter((entry): entry is CatalogEntryId =>
        CATALOG_ENTRIES.some((catalogEntry) => catalogEntry.id === entry),
      )
    : [];
  const catalogTierUnlocks = Array.isArray(saved.catalogTierUnlocks)
    ? saved.catalogTierUnlocks.filter((entry): entry is CatalogTierId =>
        CATALOG_TIER_BONUSES.some((bonus) => bonus.id === entry),
      )
    : [];
  const craftingParts = Number.isFinite(saved.craftingParts ?? 0)
    ? Math.max(0, Math.floor(saved.craftingParts ?? 0))
    : 0;
  const craftedBoostsBase =
    saved.craftedBoosts && typeof saved.craftedBoosts === "object" ? saved.craftedBoosts : {};
  const craftedBoosts = CRAFTED_BOOSTS.reduce<Record<CraftedBoostId, number>>(
    (acc, boost) => {
      const rawValue = craftedBoostsBase[boost.id as keyof typeof craftedBoostsBase];
      acc[boost.id] = Number.isFinite(rawValue) ? Math.max(0, Math.floor(rawValue as number)) : 0;
      return acc;
    },
    {
      "polished-tools": 0,
      "heritage-springs": 0,
      "artisan-jig": 0,
    },
  );
  const restoredState = applyMilestoneUnlocks({
    currencyCents: Math.max(0, saved.currencyCents),
    enjoymentCents,
    nostalgiaPoints,
    nostalgiaResets,
    nostalgiaUnlockedItems,
    nostalgiaEnjoymentEarnedCents,
    nostalgiaLastGain,
    nostalgiaLastPrestigedAtMs,
    therapistCareer,
    items,
    upgrades,
    unlockedMilestones,
    workshopBlueprints,
    workshopPrestigeCount,
    workshopUpgrades,
    maisonHeritage: Number.isFinite(saved.maisonHeritage ?? 0)
      ? Math.max(0, Math.floor(saved.maisonHeritage ?? 0))
      : 0,
    maisonReputation: Number.isFinite(saved.maisonReputation ?? 0)
      ? Math.max(0, Math.floor(saved.maisonReputation ?? 0))
      : 0,
    maisonUpgrades,
    maisonLines,
    achievementUnlocks,
    eventStates,
    discoveredCatalogEntries,
    catalogTierUnlocks,
    craftingParts,
    craftedBoosts,
  });

  return updateCatalogTierUnlocks(restoredState);
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

export function buyNostalgiaUnlock(state: GameState, id: WatchItemId): GameState {
  if (!canBuyNostalgiaUnlock(state, id)) {
    return state;
  }

  const cost = getNostalgiaUnlockCost(id);
  const unlocked = new Set([...state.nostalgiaUnlockedItems, id]);

  return {
    ...state,
    nostalgiaPoints: state.nostalgiaPoints - cost,
    nostalgiaUnlockedItems: NOSTALGIA_UNLOCK_ORDER.filter((entry) => unlocked.has(entry)),
  };
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

export function refundNostalgiaUnlock(state: GameState, id: WatchItemId): GameState {
  if (!canRefundNostalgiaUnlock(state, id)) {
    return state;
  }

  const cost = getNostalgiaUnlockCost(id);
  const unlocked = new Set(state.nostalgiaUnlockedItems);
  unlocked.delete(id);

  return {
    ...state,
    nostalgiaPoints: state.nostalgiaPoints + cost,
    nostalgiaUnlockedItems: NOSTALGIA_UNLOCK_ORDER.filter((entry) => unlocked.has(entry)),
  };
}

export function prestigeNostalgia(state: GameState, nowMs: number): GameState {
  const gain = getNostalgiaPrestigeGain(state);
  if (gain <= 0) {
    return state;
  }

  return {
    ...state,
    currencyCents: 0,
    enjoymentCents: 0,
    nostalgiaPoints: state.nostalgiaPoints + gain,
    nostalgiaResets: state.nostalgiaResets + 1,
    nostalgiaUnlockedItems: state.nostalgiaUnlockedItems,
    nostalgiaEnjoymentEarnedCents: 0,
    nostalgiaLastGain: gain,
    nostalgiaLastPrestigedAtMs: Math.max(0, Math.floor(nowMs)),
    therapistCareer: {
      level: 1,
      xp: 0,
      nextAvailableAtMs: 0,
    },
    upgrades: createUpgradeLevels(),
    workshopBlueprints: 0,
    workshopPrestigeCount: 0,
    workshopUpgrades: createWorkshopUpgradeStates(),
    maisonHeritage: 0,
    maisonReputation: 0,
    maisonUpgrades: createMaisonUpgradeStates(),
    maisonLines: createMaisonLineStates(),
    eventStates: createEventStates(),
    craftingParts: 0,
    craftedBoosts: {
      "polished-tools": 0,
      "heritage-springs": 0,
      "artisan-jig": 0,
    },
  };
}

export function prestigeWorkshop(state: GameState, earnedPrestigeCurrency = 0): GameState {
  const nextState: GameState = {
    ...state,
    currencyCents: 0,
    enjoymentCents: 0,
    items: createItemCounts(),
    upgrades: createUpgradeLevels(),
    workshopBlueprints: state.workshopBlueprints + Math.max(0, Math.floor(earnedPrestigeCurrency)),
    workshopPrestigeCount: state.workshopPrestigeCount + 1,
    workshopUpgrades: { ...state.workshopUpgrades },
    craftingParts: state.craftingParts,
    craftedBoosts: { ...state.craftedBoosts },
  };

  return applyMilestoneUnlocks(applyAchievementUnlocks(nextState));
}

export function getWorkshopPrestigeGain(state: GameState): number {
  const enjoyment = getEnjoymentCents(state);
  const baseGain = Math.max(0, Math.floor((enjoyment / WORKSHOP_PRESTIGE_THRESHOLD_CENTS) ** 0.5));
  return Math.floor(
    (baseGain + getMaisonLineBlueprintBonus(state)) * getCraftedBoostPrestigeMultiplier(state),
  );
}

export function canWorkshopPrestige(state: GameState): boolean {
  return getWorkshopPrestigeGain(state) > 0;
}

export function prestigeMaison(state: GameState): GameState {
  const heritageGain = getMaisonPrestigeGain(state);
  const reputationGain = getMaisonReputationGain(state);
  const nextState: GameState = {
    ...state,
    currencyCents: 0,
    enjoymentCents: 0,
    items: createItemCounts(),
    upgrades: createUpgradeLevels(),
    workshopBlueprints: 0,
    workshopPrestigeCount: 0,
    workshopUpgrades: createWorkshopUpgradeStates(),
    maisonHeritage: state.maisonHeritage + heritageGain,
    maisonReputation: state.maisonReputation + reputationGain,
    maisonUpgrades: { ...state.maisonUpgrades },
    maisonLines: { ...state.maisonLines },
    craftingParts: state.craftingParts,
    craftedBoosts: { ...state.craftedBoosts },
  };

  return applyMilestoneUnlocks(applyAchievementUnlocks(nextState));
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

export function buyMaisonLine(state: GameState, id: MaisonLineId): GameState {
  const line = MAISON_LINE_LOOKUP.get(id);
  if (!line || !canBuyMaisonLine(state, id)) {
    return state;
  }

  const heritageCost = line.currency === "heritage" ? line.cost : 0;
  const reputationCost = line.currency === "reputation" ? line.cost : 0;

  return {
    ...state,
    maisonHeritage: state.maisonHeritage - heritageCost,
    maisonReputation: state.maisonReputation - reputationCost,
    maisonLines: {
      ...state.maisonLines,
      [id]: true,
    },
  };
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

  return requirement.threshold > 0
    ? state.discoveredCatalogEntries.length / requirement.threshold
    : 0;
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

export function getTotalItemCount(state: GameState): number {
  return WATCH_ITEMS.reduce((total, item) => total + getItemCount(state, item.id), 0);
}

export function getCollectionValueCents(state: GameState): number {
  return WATCH_ITEMS.reduce(
    (total, item) => total + getItemCount(state, item.id) * item.collectionValueCents,
    0,
  );
}

export function getEnjoymentCents(state: GameState): number {
  return state.enjoymentCents;
}

export function getPrestigeLegacyMultiplier(state: GameState): number {
  const workshopPrestigeCount = Number.isFinite(state.workshopPrestigeCount)
    ? Math.max(0, Math.floor(state.workshopPrestigeCount))
    : 0;
  const maisonHeritage = Number.isFinite(state.maisonHeritage)
    ? Math.max(0, Math.floor(state.maisonHeritage))
    : 0;

  const atelierLegacy = Math.pow(1.05, workshopPrestigeCount);
  const maisonLegacy = Math.pow(1.03, maisonHeritage);

  return Math.min(10, atelierLegacy * maisonLegacy);
}

export function getEnjoymentRateCentsPerSec(state: GameState): number {
  const baseRate = WATCH_ITEMS.reduce(
    (total, item) =>
      total + getItemCount(state, item.id) * getWatchItemEnjoymentRateCentsPerSec(item),
    0,
  );
  return baseRate * getPrestigeLegacyMultiplier(state);
}

export function getEnjoymentThresholdLabel(cents: number): string {
  return `${formatMoneyFromCents(cents)} enjoyment`;
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

export function getWatchAbilityIncomeMultiplier(state: GameState): number {
  const starterCount = getItemCount(state, "starter");
  const chronographCount = getItemCount(state, "chronograph");

  const starterBonus = starterCount >= 10 ? 1.02 : 1;
  const chronographBonus = chronographCount >= 5 ? 1.05 : 1;

  return starterBonus * chronographBonus;
}

export function getActiveSetBonuses(state: GameState): SetBonusDefinition[] {
  return SET_BONUSES.filter((bonus) =>
    Object.entries(bonus.requirements).every(([itemId, required]) => {
      const count = getItemCount(state, itemId as WatchItemId);
      return count >= (required ?? 0);
    }),
  );
}

export function getRawIncomeRateCentsPerSec(state: GameState): number {
  const itemIncome = WATCH_ITEMS.reduce(
    (total, item) => total + getItemCount(state, item.id) * item.incomeCentsPerSec,
    0,
  );

  const upgradeMultiplier = UPGRADES.reduce(
    (multiplier, upgrade) =>
      multiplier + getUpgradeLevel(state, upgrade.id) * upgrade.incomeMultiplierPerLevel,
    1,
  );

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

export function applyEventState(
  state: GameState,
  nowMs: number,
  collectionValueCents: number,
): GameState {
  let changed = false;
  const nextStates: Record<EventId, EventState> = {
    ...state.eventStates,
  };

  const now = new Date(nowMs);
  const currentYear = now.getFullYear();

  const getLocalStartMs = (year: number, month: number, day: number) =>
    new Date(year, month - 1, day, 0, 0, 0, 0).getTime();

  for (const event of EVENTS) {
    const entry = nextStates[event.id] ?? { activeUntilMs: 0, nextAvailableAtMs: 0 };
    if (nowMs < entry.activeUntilMs) {
      continue;
    }

    if (event.trigger.type !== "calendarDate" && nowMs < entry.nextAvailableAtMs) {
      if (!nextStates[event.id]) {
        nextStates[event.id] = entry;
        changed = true;
      }
      continue;
    }

    if (event.trigger.type === "manual") {
      continue;
    }

    if (
      event.trigger.type === "collectionValue" &&
      collectionValueCents >= event.trigger.thresholdCents
    ) {
      nextStates[event.id] = {
        activeUntilMs: nowMs + event.durationMs,
        nextAvailableAtMs: nowMs + event.durationMs + event.cooldownMs,
      };
      changed = true;
      continue;
    }

    if (event.trigger.type === "calendarDate") {
      const startMs = getLocalStartMs(currentYear, event.trigger.month, event.trigger.day);
      const endMs = startMs + event.durationMs;
      const nextYearStartMs = getLocalStartMs(
        currentYear + 1,
        event.trigger.month,
        event.trigger.day,
      );

      if (nowMs >= startMs && nowMs < endMs) {
        const next = { activeUntilMs: endMs, nextAvailableAtMs: endMs };
        if (
          entry.activeUntilMs !== next.activeUntilMs ||
          entry.nextAvailableAtMs !== next.nextAvailableAtMs
        ) {
          nextStates[event.id] = next;
          changed = true;
        }
        continue;
      }

      if (nowMs >= endMs) {
        const next = { activeUntilMs: 0, nextAvailableAtMs: nextYearStartMs };
        if (
          entry.activeUntilMs !== next.activeUntilMs ||
          entry.nextAvailableAtMs !== next.nextAvailableAtMs
        ) {
          nextStates[event.id] = next;
          changed = true;
        }
        continue;
      }

      const next = { activeUntilMs: 0, nextAvailableAtMs: 0 };
      if (
        entry.activeUntilMs !== next.activeUntilMs ||
        entry.nextAvailableAtMs !== next.nextAvailableAtMs
      ) {
        nextStates[event.id] = next;
        changed = true;
      }
      continue;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    eventStates: nextStates,
  };
}

export function getEffectiveIncomeRateCentsPerSec(state: GameState, eventMultiplier = 1): number {
  const rawIncome = getRawIncomeRateCentsPerSec(state) * eventMultiplier;
  return applySoftcap(rawIncome, getWorkshopSoftcapValue(state), getWorkshopSoftcapExponent(state));
}

export function getTherapistCashRateCentsPerSec(state: GameState): number {
  const clampedLevel = Math.max(1, Math.floor(state.therapistCareer.level));
  const baseSalary =
    THERAPIST_BASE_SALARY_CENTS_PER_SEC +
    (clampedLevel - 1) * THERAPIST_SALARY_CENTS_PER_SEC_PER_LEVEL;
  return Math.max(0, Math.floor(baseSalary)) * getPrestigeLegacyMultiplier(state);
}

export function getTotalCashRateCentsPerSec(state: GameState, eventMultiplier = 1): number {
  return (
    getEffectiveIncomeRateCentsPerSec(state, eventMultiplier) +
    getTherapistCashRateCentsPerSec(state) * eventMultiplier
  );
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

export function activateManualEvent(
  state: GameState,
  eventId: EventId,
  nowMs: number,
  options?: { incomeMultiplier?: number },
): GameState {
  const event = EVENTS.find((entry) => entry.id === eventId);
  if (!event || event.trigger.type !== "manual") {
    return state;
  }

  const entry = state.eventStates[eventId] ?? { activeUntilMs: 0, nextAvailableAtMs: 0 };
  if (nowMs < entry.activeUntilMs || nowMs < entry.nextAvailableAtMs) {
    return state;
  }

  const resolvedMultiplier =
    typeof options?.incomeMultiplier === "number" && Number.isFinite(options.incomeMultiplier)
      ? Math.max(0, options.incomeMultiplier)
      : event.incomeMultiplier;

  const nextStates: Record<EventId, EventState> = {
    ...state.eventStates,
    [eventId]: {
      activeUntilMs: nowMs + event.durationMs,
      nextAvailableAtMs: nowMs + event.durationMs + event.cooldownMs,
      incomeMultiplier: resolvedMultiplier,
    },
  };

  return {
    ...state,
    eventStates: nextStates,
  };
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

export function applyWindSessionRewards(
  state: GameState,
  itemId: WatchItemId,
  tension: number,
  nowMs: number,
): GameState {
  const cashPayout = getWindSessionCashPayoutCents(state, itemId, tension);
  const withCash =
    cashPayout > 0 ? { ...state, currencyCents: state.currencyCents + cashPayout } : state;
  return activateManualEvent(withCash, "wind-up", nowMs, {
    incomeMultiplier: getWindUpIncomeMultiplierForTension(tension),
  });
}

export function getTherapistCareer(state: GameState): TherapistCareerState {
  return state.therapistCareer;
}

export function getTherapistSessionCooldownMs(level: number): number {
  void level;
  return THERAPIST_BASE_SESSION_COOLDOWN_MS;
}

export function getTherapistSessionEnjoymentCostCents(level: number): number {
  const clampedLevel = Math.max(1, Math.floor(level));
  return Math.max(
    0,
    Math.floor(THERAPIST_BASE_SESSION_ENJOYMENT_COST_CENTS * (1 + 0.12 * (clampedLevel - 1))),
  );
}

export function getTherapistSessionCashPayoutCents(level: number): number {
  const clampedLevel = Math.max(1, Math.floor(level));
  return Math.max(
    0,
    Math.floor(THERAPIST_BASE_SESSION_CASH_PAYOUT_CENTS * (1 + 0.18 * (clampedLevel - 1))),
  );
}

export function getTherapistXpRequiredForNextLevel(level: number): number {
  const clampedLevel = Math.max(1, Math.floor(level));
  return Math.max(10, Math.floor(50 * 1.22 ** (clampedLevel - 1)));
}

export function canPerformTherapistSession(state: GameState, nowMs: number): boolean {
  const career = state.therapistCareer;
  if (nowMs < career.nextAvailableAtMs) {
    return false;
  }

  const cost = getTherapistSessionEnjoymentCostCents(career.level);
  return state.enjoymentCents >= cost;
}

export function performTherapistSession(state: GameState, nowMs: number): GameState {
  if (!canPerformTherapistSession(state, nowMs)) {
    return state;
  }

  const career = state.therapistCareer;
  const cost = getTherapistSessionEnjoymentCostCents(career.level);
  const payout = getTherapistSessionCashPayoutCents(career.level);

  let nextLevel = career.level;
  let nextXp = career.xp + THERAPIST_SESSION_XP_GAIN;

  while (nextXp >= getTherapistXpRequiredForNextLevel(nextLevel)) {
    nextXp -= getTherapistXpRequiredForNextLevel(nextLevel);
    nextLevel += 1;
  }

  return {
    ...state,
    currencyCents: state.currencyCents + payout,
    enjoymentCents: state.enjoymentCents - cost,
    therapistCareer: {
      level: nextLevel,
      xp: nextXp,
      nextAvailableAtMs: nowMs + getTherapistSessionCooldownMs(nextLevel),
    },
  };
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

export function buyItem(state: GameState, id: WatchItemId, quantity = 1): GameState {
  if (quantity <= 0 || !isItemUnlocked(state, id)) {
    return state;
  }

  const gate = getWatchPurchaseGate(state, id, quantity);
  if (!gate.ok) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    currencyCents: state.currencyCents - gate.cashPriceCents,
    items: {
      ...state.items,
      [id]: getItemCount(state, id) + quantity,
    },
  };

  const withDiscovery = discoverCatalogEntries(nextState, getCatalogEntryIdsForItems(nextState));
  return applyAchievementUnlocks(applyMilestoneUnlocks(withDiscovery));
}

export function buyUpgrade(state: GameState, id: UpgradeId): GameState {
  if (!isUpgradeUnlocked(state, id)) {
    return state;
  }

  const priceCents = getUpgradePriceCents(state, id, 1);
  if (state.currencyCents < priceCents) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    currencyCents: state.currencyCents - priceCents,
    upgrades: {
      ...state.upgrades,
      [id]: getUpgradeLevel(state, id) + 1,
    },
  };

  const withDiscovery = discoverCatalogEntries(nextState, getCatalogEntryIdsForItems(nextState));
  return applyAchievementUnlocks(applyMilestoneUnlocks(withDiscovery));
}

export function applyMilestoneUnlocks(state: GameState): GameState {
  const unlocked = new Set(state.unlockedMilestones);
  let changed = false;

  for (const milestone of MILESTONES) {
    if (!unlocked.has(milestone.id) && isMilestoneMet(state, milestone)) {
      unlocked.add(milestone.id);
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    unlockedMilestones: MILESTONES.filter((milestone) => unlocked.has(milestone.id)).map(
      (milestone) => milestone.id,
    ),
  };
}

export function applyAchievementUnlocks(state: GameState): GameState {
  const unlocked = new Set(state.achievementUnlocks);
  let changed = false;

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id) && isAchievementMet(state, achievement)) {
      unlocked.add(achievement.id);
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    achievementUnlocks: ACHIEVEMENTS.filter((achievement) => unlocked.has(achievement.id)).map(
      (achievement) => achievement.id,
    ),
  };
}

export function getWorkshopIncomeMultiplier(state: GameState): number {
  return WORKSHOP_UPGRADES.reduce((multiplier, upgrade) => {
    if (!upgrade.incomeMultiplier || !hasWorkshopUpgrade(state, upgrade.id)) {
      return multiplier;
    }

    return multiplier * upgrade.incomeMultiplier;
  }, 1);
}

export function getMaisonIncomeMultiplier(state: GameState): number {
  const upgradeMultiplier = MAISON_UPGRADES.reduce((multiplier, upgrade) => {
    if (!upgrade.incomeMultiplier || !hasMaisonUpgrade(state, upgrade.id)) {
      return multiplier;
    }

    return multiplier * upgrade.incomeMultiplier;
  }, 1);

  return MAISON_LINES.reduce((multiplier, line) => {
    if (!line.incomeMultiplier || !hasMaisonLine(state, line.id)) {
      return multiplier;
    }

    return multiplier * line.incomeMultiplier;
  }, upgradeMultiplier);
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

export function buyWorkshopUpgrade(state: GameState, id: WorkshopUpgradeId): GameState {
  const upgrade = WORKSHOP_UPGRADE_LOOKUP.get(id);
  if (!upgrade || !canBuyWorkshopUpgrade(state, id)) {
    return state;
  }

  return {
    ...state,
    workshopBlueprints: state.workshopBlueprints - upgrade.blueprintCost,
    workshopUpgrades: {
      ...state.workshopUpgrades,
      [id]: true,
    },
  };
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

export function buyMaisonUpgrade(state: GameState, id: MaisonUpgradeId): GameState {
  const upgrade = MAISON_UPGRADE_LOOKUP.get(id);
  if (!upgrade || !canBuyMaisonUpgrade(state, id)) {
    return state;
  }

  const heritageCost = upgrade.currency === "heritage" ? upgrade.cost : 0;
  const reputationCost = upgrade.currency === "reputation" ? upgrade.cost : 0;

  return {
    ...state,
    maisonHeritage: state.maisonHeritage - heritageCost,
    maisonReputation: state.maisonReputation - reputationCost,
    maisonUpgrades: {
      ...state.maisonUpgrades,
      [id]: true,
    },
  };
}

function createItemCounts(): Record<WatchItemId, number> {
  return WATCH_ITEMS.reduce(
    (counts, item) => ({ ...counts, [item.id]: 0 }),
    {} as Record<WatchItemId, number>,
  );
}

function createWorkshopUpgradeStates(): Record<WorkshopUpgradeId, boolean> {
  return WORKSHOP_UPGRADES.reduce(
    (states, upgrade) => ({ ...states, [upgrade.id]: false }),
    {} as Record<WorkshopUpgradeId, boolean>,
  );
}

function createMaisonUpgradeStates(): Record<MaisonUpgradeId, boolean> {
  return MAISON_UPGRADES.reduce(
    (states, upgrade) => ({ ...states, [upgrade.id]: false }),
    {} as Record<MaisonUpgradeId, boolean>,
  );
}

function createMaisonLineStates(): Record<MaisonLineId, boolean> {
  return MAISON_LINES.reduce(
    (states, line) => ({ ...states, [line.id]: false }),
    {} as Record<MaisonLineId, boolean>,
  );
}

function createUpgradeLevels(): Record<UpgradeId, number> {
  return UPGRADES.reduce(
    (levels, upgrade) => ({ ...levels, [upgrade.id]: 0 }),
    {} as Record<UpgradeId, number>,
  );
}

function createEventStates(): Record<EventId, EventState> {
  return EVENTS.reduce(
    (states, event) => ({ ...states, [event.id]: { activeUntilMs: 0, nextAvailableAtMs: 0 } }),
    {} as Record<EventId, EventState>,
  );
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

function isMilestoneMet(state: GameState, milestone: MilestoneDefinition): boolean {
  const requirement = milestone.requirement;

  if (requirement.type === "totalItems") {
    return getTotalItemCount(state) >= requirement.threshold;
  }

  if (requirement.type === "collectionValue") {
    return getCollectionValueCents(state) >= requirement.thresholdCents;
  }

  return state.discoveredCatalogEntries.length >= requirement.threshold;
}

function isAchievementMet(state: GameState, achievement: AchievementDefinition): boolean {
  const requirement = achievement.requirement;

  if (requirement.type === "totalItems") {
    return getTotalItemCount(state) >= requirement.threshold;
  }

  if (requirement.type === "collectionValue") {
    return getCollectionValueCents(state) >= requirement.thresholdCents;
  }

  if (requirement.type === "catalogDiscovery") {
    return state.discoveredCatalogEntries.length >= requirement.threshold;
  }

  return state.workshopPrestigeCount >= requirement.threshold;
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
