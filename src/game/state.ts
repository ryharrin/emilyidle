export type WatchItemId = "starter" | "classic" | "chronograph" | "tourbillon";
export type UpgradeId = "polishing-tools" | "assembly-jigs" | "guild-contracts";
export type MilestoneId = "collector-shelf" | "showcase" | "atelier";

export const ALL_MILESTONE_IDS: MilestoneId[] = ["collector-shelf", "showcase", "atelier"];
export type SetBonusId = "starter-set" | "precision-set" | "complication-set";
export type WorkshopUpgradeId =
  | "etched-ledgers"
  | "vault-calibration"
  | "heritage-templates"
  | "automation-blueprints";

export type MaisonCurrency = "heritage" | "reputation";
export type MaisonUpgradeId = "atelier-charter" | "heritage-loom" | "global-vitrine";

export type WatchItemDefinition = {
  id: WatchItemId;
  name: string;
  description: string;
  basePriceCents: number;
  priceGrowth: number;
  incomeCentsPerSec: number;
  collectionValueCents: number;
  unlockMilestoneId?: MilestoneId;
};

export type UpgradeDefinition = {
  id: UpgradeId;
  name: string;
  description: string;
  basePriceCents: number;
  priceGrowth: number;
  incomeMultiplierPerLevel: number;
  unlockMilestoneId?: MilestoneId;
};

export type WorkshopUpgradeDefinition = {
  id: WorkshopUpgradeId;
  name: string;
  description: string;
  blueprintCost: number;
  incomeMultiplier?: number;
  softcapMultiplier?: number;
  softcapExponentBonus?: number;
  unlocks?: {
    autoBuyEnabled?: boolean;
  };
};

export type MaisonUpgradeDefinition = {
  id: MaisonUpgradeId;
  name: string;
  description: string;
  currency: MaisonCurrency;
  cost: number;
  incomeMultiplier?: number;
  softcapMultiplier?: number;
  collectionBonusMultiplier?: number;
};

export type MilestoneRequirement =
  | { type: "totalItems"; threshold: number }
  | { type: "collectionValue"; thresholdCents: number };

export type MilestoneDefinition = {
  id: MilestoneId;
  name: string;
  description: string;
  requirement: MilestoneRequirement;
  unlocks: {
    items?: WatchItemId[];
    upgrades?: UpgradeId[];
  };
};

export type AchievementId =
  | "first-drawer"
  | "six-figure-vault"
  | "workshop-reforged"
  | "workshop-veteran";

export type AchievementRequirement =
  | { type: "totalItems"; threshold: number }
  | { type: "collectionValue"; thresholdCents: number }
  | { type: "workshopPrestigeCount"; threshold: number };

export type AchievementDefinition = {
  id: AchievementId;
  name: string;
  description: string;
  requirement: AchievementRequirement;
};

export type EventId = "auction-weekend";

export type EventTrigger = { type: "collectionValue"; thresholdCents: number };

export type EventDefinition = {
  id: EventId;
  name: string;
  description: string;
  trigger: EventTrigger;
  durationMs: number;
  cooldownMs: number;
  incomeMultiplier: number;
};

import { CATALOG_ENTRIES, type CatalogEntry } from "./catalog";

export type SetBonusDefinition = {
  id: SetBonusId;
  name: string;
  description: string;
  requirements: Partial<Record<WatchItemId, number>>;
  incomeMultiplier: number;
};

export type GameState = {
  currencyCents: number;
  items: Record<WatchItemId, number>;
  upgrades: Record<UpgradeId, number>;
  unlockedMilestones: MilestoneId[];
  workshopBlueprints: number;
  workshopPrestigeCount: number;
  workshopUpgrades: Record<WorkshopUpgradeId, boolean>;
  maisonHeritage: number;
  maisonReputation: number;
  maisonUpgrades: Record<MaisonUpgradeId, boolean>;
  achievementUnlocks: AchievementId[];
  eventStates: Record<EventId, { activeUntilMs: number; nextAvailableAtMs: number }>;
};

export type PersistedGameState = {
  currencyCents: number;
  items?: Record<string, number>;
  upgrades?: Record<string, number>;
  unlockedMilestones?: string[];
  workshopBlueprints?: number;
  workshopPrestigeCount?: number;
  workshopUpgrades?: Record<string, boolean>;
  maisonHeritage?: number;
  maisonReputation?: number;
  maisonUpgrades?: Record<string, boolean>;
  achievementUnlocks?: string[];
  eventStates?: Record<string, { activeUntilMs: number; nextAvailableAtMs: number }>;
};

const BASE_INCOME_CENTS_PER_SEC = 10;
const INCOME_SOFTCAP_CENTS_PER_SEC = 60_000;
const INCOME_SOFTCAP_EXPONENT = 0.6;

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

const COLLECTION_BONUS_STEPS: Array<{ thresholdCents: number; multiplier: number }> = [
  { thresholdCents: 7_500, multiplier: 1.02 },
  { thresholdCents: 35_000, multiplier: 1.05 },
  { thresholdCents: 150_000, multiplier: 1.1 },
  { thresholdCents: 700_000, multiplier: 1.2 },
];

const WATCH_ITEMS: ReadonlyArray<WatchItemDefinition> = [
  {
    id: "starter",
    name: "Starter Quartz",
    description: "Reliable entry pieces to seed the vault.",
    basePriceCents: 100,
    priceGrowth: 1.14,
    incomeCentsPerSec: 6,
    collectionValueCents: 140,
  },
  {
    id: "classic",
    name: "Classic Automatic",
    description: "Self-winding classics with steady demand.",
    basePriceCents: 1_500,
    priceGrowth: 1.165,
    incomeCentsPerSec: 36,
    collectionValueCents: 2_400,
    unlockMilestoneId: "collector-shelf",
  },
  {
    id: "chronograph",
    name: "Chronograph",
    description: "Complications that attract serious collectors.",
    basePriceCents: 10_000,
    priceGrowth: 1.175,
    incomeCentsPerSec: 185,
    collectionValueCents: 18_000,
    unlockMilestoneId: "showcase",
  },
  {
    id: "tourbillon",
    name: "Tourbillon",
    description: "Prestige pieces for the vault centerpiece.",
    basePriceCents: 120_000,
    priceGrowth: 1.19,
    incomeCentsPerSec: 980,
    collectionValueCents: 210_000,
    unlockMilestoneId: "atelier",
  },
];

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
    description: "Reach $25k collection value to unlock chronographs.",
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
    description: "Reach $120k in collection value.",
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
];

const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));
const UPGRADE_LOOKUP = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const MILESTONE_LOOKUP = new Map(MILESTONES.map((milestone) => [milestone.id, milestone]));
const WORKSHOP_UPGRADE_LOOKUP = new Map(WORKSHOP_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
const MAISON_UPGRADE_LOOKUP = new Map(MAISON_UPGRADES.map((upgrade) => [upgrade.id, upgrade]));

export function getWatchItems(): ReadonlyArray<WatchItemDefinition> {
  return WATCH_ITEMS;
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

export function getCatalogEntries(): ReadonlyArray<CatalogEntry> {
  return CATALOG_ENTRIES;
}

export function createInitialState(): GameState {
  return {
    currencyCents: 0,
    items: createItemCounts(),
    upgrades: createUpgradeLevels(),
    unlockedMilestones: [],
    workshopBlueprints: 0,
    workshopPrestigeCount: 0,
    workshopUpgrades: createWorkshopUpgradeStates(),
    maisonHeritage: 0,
    maisonReputation: 0,
    maisonUpgrades: createMaisonUpgradeStates(),
    achievementUnlocks: [],
    eventStates: createEventStates(),
  };
}

export function createStateFromSave(saved: PersistedGameState): GameState {
  const items = createItemCounts();
  const upgrades = createUpgradeLevels();

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

  const unlockedMilestones = Array.isArray(saved.unlockedMilestones)
    ? saved.unlockedMilestones.filter((entry): entry is MilestoneId =>
        ALL_MILESTONE_IDS.includes(entry as MilestoneId),
      )
    : [];

  const workshopBlueprints = Number.isFinite(saved.workshopBlueprints ?? 0)
    ? Math.max(0, Math.floor(saved.workshopBlueprints ?? 0))
    : 0;
  const workshopPrestigeCount = Number.isFinite(saved.workshopPrestigeCount ?? 0)
    ? Math.max(0, Math.floor(saved.workshopPrestigeCount ?? 0))
    : 0;
  const workshopUpgrades = createWorkshopUpgradeStates();

  if (saved.workshopUpgrades) {
    for (const [key, value] of Object.entries(saved.workshopUpgrades)) {
      if (key in workshopUpgrades) {
        workshopUpgrades[key as WorkshopUpgradeId] = value === true;
      }
    }
  }

  const maisonUpgrades = createMaisonUpgradeStates();

  if (saved.maisonUpgrades) {
    for (const [key, value] of Object.entries(saved.maisonUpgrades)) {
      if (key in maisonUpgrades) {
        maisonUpgrades[key as MaisonUpgradeId] = value === true;
      }
    }
  }

  const achievementUnlocks = Array.isArray(saved.achievementUnlocks)
    ? saved.achievementUnlocks.filter((entry): entry is AchievementId =>
        ACHIEVEMENTS.some((achievement) => achievement.id === entry),
      )
    : [];

  const eventStates = createEventStates();
  if (saved.eventStates) {
    for (const [key, value] of Object.entries(saved.eventStates)) {
      if (key in eventStates && value) {
        const record = value as { activeUntilMs?: number; nextAvailableAtMs?: number };
        const activeUntilMs = Number.isFinite(record.activeUntilMs)
          ? (record.activeUntilMs ?? 0)
          : 0;
        const nextAvailableAtMs = Number.isFinite(record.nextAvailableAtMs)
          ? (record.nextAvailableAtMs ?? 0)
          : 0;
        eventStates[key as EventId] = {
          activeUntilMs: Math.max(0, Math.floor(activeUntilMs)),
          nextAvailableAtMs: Math.max(0, Math.floor(nextAvailableAtMs)),
        };
      }
    }
  }

  return applyMilestoneUnlocks({
    currencyCents: Math.max(0, saved.currencyCents),
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
    achievementUnlocks,
    eventStates,
  });
}

export function prestigeWorkshop(state: GameState, earnedPrestigeCurrency = 0): GameState {
  const nextState: GameState = {
    ...state,
    currencyCents: 0,
    items: createItemCounts(),
    upgrades: createUpgradeLevels(),
    workshopBlueprints: state.workshopBlueprints + Math.max(0, Math.floor(earnedPrestigeCurrency)),
    workshopPrestigeCount: state.workshopPrestigeCount + 1,
    workshopUpgrades: { ...state.workshopUpgrades },
  };

  return applyMilestoneUnlocks(applyAchievementUnlocks(nextState));
}

export function getWorkshopPrestigeGain(state: GameState): number {
  const collectionValue = getCollectionValueCents(state);
  return Math.max(0, Math.floor((collectionValue / 800_000) ** 0.5));
}

export function canWorkshopPrestige(state: GameState): boolean {
  return getWorkshopPrestigeGain(state) > 0;
}

export function prestigeMaison(state: GameState): GameState {
  const maisonGain = getMaisonPrestigeGain(state);
  const nextState: GameState = {
    ...state,
    currencyCents: 0,
    items: createItemCounts(),
    upgrades: createUpgradeLevels(),
    workshopBlueprints: 0,
    workshopPrestigeCount: 0,
    workshopUpgrades: createWorkshopUpgradeStates(),
    maisonHeritage: state.maisonHeritage + maisonGain,
    maisonReputation: state.maisonReputation,
    maisonUpgrades: { ...state.maisonUpgrades },
  };

  return applyMilestoneUnlocks(applyAchievementUnlocks(nextState));
}

export function getMaisonPrestigeGain(state: GameState): number {
  const collectionValue = getCollectionValueCents(state);
  const combined = collectionValue / 4_000_000 + state.workshopBlueprints;
  return Math.max(0, Math.floor(combined ** 0.5));
}

export function canMaisonPrestige(state: GameState): boolean {
  return getMaisonPrestigeGain(state) > 0;
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

export function hasMaisonUpgrade(state: GameState, id: MaisonUpgradeId): boolean {
  return state.maisonUpgrades[id] ?? false;
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

export function getCollectionBonusMultiplier(state: GameState): number {
  const value = getCollectionValueCents(state);
  let multiplier = 1;

  for (const step of COLLECTION_BONUS_STEPS) {
    if (value >= step.thresholdCents) {
      multiplier = Math.max(multiplier, step.multiplier);
    }
  }

  return multiplier * getMaisonCollectionBonusMultiplier(state);
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

  return (
    (BASE_INCOME_CENTS_PER_SEC + itemIncome) *
    upgradeMultiplier *
    setBonusMultiplier *
    collectionMultiplier *
    workshopMultiplier *
    maisonMultiplier
  );
}

export function applyEventState(
  state: GameState,
  nowMs: number,
  collectionValueCents: number,
): GameState {
  let changed = false;
  const nextStates: Record<EventId, { activeUntilMs: number; nextAvailableAtMs: number }> = {
    ...state.eventStates,
  };

  for (const event of EVENTS) {
    const entry = nextStates[event.id] ?? { activeUntilMs: 0, nextAvailableAtMs: 0 };
    if (nowMs < entry.activeUntilMs) {
      continue;
    }

    if (nowMs < entry.nextAvailableAtMs) {
      if (!nextStates[event.id]) {
        nextStates[event.id] = entry;
        changed = true;
      }
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

export function getEventIncomeMultiplier(state: GameState, nowMs: number): number {
  return EVENTS.reduce((multiplier, event) => {
    if (isEventActive(state, event.id, nowMs)) {
      return multiplier * event.incomeMultiplier;
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

  return state.unlockedMilestones.includes(item.unlockMilestoneId);
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
  const item = requireWatchItem(id);
  const owned = getItemCount(state, id);
  const startPrice = item.basePriceCents * item.priceGrowth ** owned;

  return getMaxAffordableCount(state.currencyCents, startPrice, item.priceGrowth);
}

export function canBuyItem(state: GameState, id: WatchItemId, quantity = 1): boolean {
  return state.currencyCents >= getItemPriceCents(state, id, quantity);
}

export function canBuyUpgrade(state: GameState, id: UpgradeId, quantity = 1): boolean {
  return state.currencyCents >= getUpgradePriceCents(state, id, quantity);
}

export function buyItem(state: GameState, id: WatchItemId, quantity = 1): GameState {
  if (quantity <= 0 || !isItemUnlocked(state, id)) {
    return state;
  }

  const priceCents = getItemPriceCents(state, id, quantity);
  if (state.currencyCents < priceCents) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    currencyCents: state.currencyCents - priceCents,
    items: {
      ...state.items,
      [id]: getItemCount(state, id) + quantity,
    },
  };

  return applyAchievementUnlocks(applyMilestoneUnlocks(nextState));
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

  return applyAchievementUnlocks(applyMilestoneUnlocks(nextState));
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

export function getMilestoneRequirementLabel(milestoneId: MilestoneId): string {
  const milestone = MILESTONE_LOOKUP.get(milestoneId);
  if (!milestone) {
    return "";
  }

  if (milestone.requirement.type === "totalItems") {
    return `Own ${milestone.requirement.threshold} total items`;
  }

  return `Reach $${(milestone.requirement.thresholdCents / 100).toLocaleString()} collection value`;
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
  return MAISON_UPGRADES.reduce((multiplier, upgrade) => {
    if (!upgrade.incomeMultiplier || !hasMaisonUpgrade(state, upgrade.id)) {
      return multiplier;
    }

    return multiplier * upgrade.incomeMultiplier;
  }, 1);
}

export function getMaisonCollectionBonusMultiplier(state: GameState): number {
  return MAISON_UPGRADES.reduce((multiplier, upgrade) => {
    if (!upgrade.collectionBonusMultiplier || !hasMaisonUpgrade(state, upgrade.id)) {
      return multiplier;
    }

    return multiplier * upgrade.collectionBonusMultiplier;
  }, 1);
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

function createUpgradeLevels(): Record<UpgradeId, number> {
  return UPGRADES.reduce(
    (levels, upgrade) => ({ ...levels, [upgrade.id]: 0 }),
    {} as Record<UpgradeId, number>,
  );
}

function createEventStates(): Record<
  EventId,
  { activeUntilMs: number; nextAvailableAtMs: number }
> {
  return EVENTS.reduce(
    (states, event) => ({ ...states, [event.id]: { activeUntilMs: 0, nextAvailableAtMs: 0 } }),
    {} as Record<EventId, { activeUntilMs: number; nextAvailableAtMs: number }>,
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

  return getCollectionValueCents(state) >= requirement.thresholdCents;
}

function isAchievementMet(state: GameState, achievement: AchievementDefinition): boolean {
  const requirement = achievement.requirement;

  if (requirement.type === "totalItems") {
    return getTotalItemCount(state) >= requirement.threshold;
  }

  if (requirement.type === "collectionValue") {
    return getCollectionValueCents(state) >= requirement.thresholdCents;
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
