import { CATALOG_ENTRIES, getCatalogEntryTags, type CatalogEntry } from "../catalog";
import { MILESTONES } from "../data/milestones";
import { NOSTALGIA_UNLOCK_ORDER, WATCH_ITEMS } from "../data/items";
import { UPGRADES } from "../data/upgrades";
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
  UpgradeDefinition,
  UpgradeId,
  WatchItemDefinition,
  WatchItemId,
  WorkshopUpgradeDefinition,
  WorkshopUpgradeId,
} from "./types";

export { MILESTONES } from "../data/milestones";
export { NOSTALGIA_UNLOCK_ORDER, WATCH_ITEMS } from "../data/items";
export { UPGRADES } from "../data/upgrades";

export const ALL_MILESTONE_IDS: MilestoneId[] = [
  "collector-shelf",
  "showcase",
  "atelier",
  "archive-curator",
];

export const WORKSHOP_UPGRADES: ReadonlyArray<WorkshopUpgradeDefinition> = [
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

export const MAISON_UPGRADES: ReadonlyArray<MaisonUpgradeDefinition> = [
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

export const MAISON_LINES: ReadonlyArray<MaisonLineDefinition> = [
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

export const CATALOG_TIER_BONUSES: CatalogTierBonusDefinition[] = [
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

export const ACHIEVEMENTS: ReadonlyArray<AchievementDefinition> = [
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

export const EVENTS: ReadonlyArray<EventDefinition> = [
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

export const CRAFTED_BOOSTS: ReadonlyArray<{
  id: CraftedBoostId;
  name: string;
  description: string;
}> = [
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

export function getTotalItemCount(state: GameState): number {
  return WATCH_ITEMS.reduce((total, item) => total + (state.items[item.id] ?? 0), 0);
}

export function getCollectionValueCents(state: GameState): number {
  return WATCH_ITEMS.reduce(
    (total, item) => total + (state.items[item.id] ?? 0) * item.collectionValueCents,
    0,
  );
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

export function getNostalgiaUnlockIds(): WatchItemId[] {
  return NOSTALGIA_UNLOCK_ORDER;
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
  const therapistCareer = {
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

export function createItemCounts(): Record<WatchItemId, number> {
  return WATCH_ITEMS.reduce(
    (counts, item) => ({ ...counts, [item.id]: 0 }),
    {} as Record<WatchItemId, number>,
  );
}

export function createWorkshopUpgradeStates(): Record<WorkshopUpgradeId, boolean> {
  return WORKSHOP_UPGRADES.reduce(
    (states, upgrade) => ({ ...states, [upgrade.id]: false }),
    {} as Record<WorkshopUpgradeId, boolean>,
  );
}

export function createMaisonUpgradeStates(): Record<MaisonUpgradeId, boolean> {
  return MAISON_UPGRADES.reduce(
    (states, upgrade) => ({ ...states, [upgrade.id]: false }),
    {} as Record<MaisonUpgradeId, boolean>,
  );
}

export function createMaisonLineStates(): Record<MaisonLineId, boolean> {
  return MAISON_LINES.reduce(
    (states, line) => ({ ...states, [line.id]: false }),
    {} as Record<MaisonLineId, boolean>,
  );
}

export function createUpgradeLevels(): Record<UpgradeId, number> {
  return UPGRADES.reduce(
    (levels, upgrade) => ({ ...levels, [upgrade.id]: 0 }),
    {} as Record<UpgradeId, number>,
  );
}

export function createEventStates(): Record<EventId, EventState> {
  return EVENTS.reduce(
    (states, event) => ({ ...states, [event.id]: { activeUntilMs: 0, nextAvailableAtMs: 0 } }),
    {} as Record<EventId, EventState>,
  );
}
