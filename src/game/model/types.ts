export type WatchItemId = "starter" | "classic" | "chronograph" | "tourbillon";
export type UpgradeId = "polishing-tools" | "assembly-jigs" | "guild-contracts" | "archive-guides";
export type MilestoneId = "collector-shelf" | "showcase" | "atelier" | "archive-curator";

export type SetBonusId =
  | "starter-set"
  | "precision-set"
  | "complication-set"
  | "oyster-society"
  | "crown-chronicle"
  | "seamaster-society"
  | "dress-circle"
  | "diver-crew"
  | "collector-quartet";
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
  enjoymentCentsPerSec: number;
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

export type MaisonLineId = "atelier-line" | "heritage-line" | "complication-line";

export type MaisonLineDefinition = {
  id: MaisonLineId;
  name: string;
  description: string;
  currency: MaisonCurrency;
  cost: number;
  incomeMultiplier?: number;
  collectionBonusMultiplier?: number;
  workshopBlueprintBonus?: number;
};

export type MilestoneRequirement =
  | { type: "totalItems"; threshold: number }
  | { type: "collectionValue"; thresholdCents: number }
  | { type: "catalogDiscovery"; threshold: number };

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
  | "workshop-veteran"
  | "vault-century"
  | "million-memories"
  | "workshop-decade"
  | "catalog-keeper";

export type AchievementRequirement =
  | { type: "totalItems"; threshold: number }
  | { type: "collectionValue"; thresholdCents: number }
  | { type: "workshopPrestigeCount"; threshold: number }
  | { type: "catalogDiscovery"; threshold: number };

export type AchievementDefinition = {
  id: AchievementId;
  name: string;
  description: string;
  requirement: AchievementRequirement;
};

export type EventId = "auction-weekend" | "emily-birthday" | "wind-up";

export type CraftedBoostId = "polished-tools" | "heritage-springs" | "artisan-jig";

export type CatalogTierId = "starter" | "classic" | "chronograph" | "tourbillon";

export type EventTrigger =
  | { type: "collectionValue"; thresholdCents: number }
  | { type: "manual" }
  | { type: "calendarDate"; month: number; day: number; timezone: "local" };

export type EventDefinition = {
  id: EventId;
  name: string;
  description: string;
  trigger: EventTrigger;
  durationMs: number;
  cooldownMs: number;
  incomeMultiplier: number;
};

export type EventState = {
  activeUntilMs: number;
  nextAvailableAtMs: number;
  incomeMultiplier?: number;
};

export type TherapistCareerState = {
  level: number;
  xp: number;
  nextAvailableAtMs: number;
};

export type CatalogTierBonusDefinition = {
  id: CatalogTierId;
  name: string;
  description: string;
  requiredCount: number;
  incomeMultiplier: number;
};

export type SetBonusDefinition = {
  id: SetBonusId;
  name: string;
  description: string;
  requirements: Partial<Record<WatchItemId, number>>;
  incomeMultiplier: number;
};

export type CatalogEntryId = string;

export type GameState = {
  currencyCents: number;
  enjoymentCents: number;
  nostalgiaPoints: number;
  nostalgiaResets: number;
  nostalgiaUnlockedItems: WatchItemId[];
  nostalgiaEnjoymentEarnedCents: number;
  nostalgiaLastGain: number;
  nostalgiaLastPrestigedAtMs: number;
  therapistCareer: TherapistCareerState;
  items: Record<WatchItemId, number>;
  upgrades: Record<UpgradeId, number>;
  unlockedMilestones: MilestoneId[];
  workshopBlueprints: number;
  workshopPrestigeCount: number;
  workshopUpgrades: Record<WorkshopUpgradeId, boolean>;
  maisonHeritage: number;
  maisonReputation: number;
  maisonUpgrades: Record<MaisonUpgradeId, boolean>;
  maisonLines: Record<MaisonLineId, boolean>;
  achievementUnlocks: AchievementId[];
  eventStates: Record<EventId, EventState>;
  discoveredCatalogEntries: CatalogEntryId[];
  catalogTierUnlocks: CatalogTierId[];
  craftingParts: number;
  craftedBoosts: Record<CraftedBoostId, number>;
};

export type PersistedGameState = {
  currencyCents: number;
  enjoymentCents?: number;
  nostalgiaPoints?: number;
  nostalgiaResets?: number;
  nostalgiaUnlockedItems?: string[];
  nostalgiaEnjoymentEarnedCents?: number;
  nostalgiaLastGain?: number;
  nostalgiaLastPrestigedAtMs?: number;
  therapistCareer?: { level?: number; xp?: number; nextAvailableAtMs?: number };
  items?: Record<string, number>;
  upgrades?: Record<string, number>;
  unlockedMilestones?: string[];
  workshopBlueprints?: number;
  workshopPrestigeCount?: number;
  workshopUpgrades?: Record<string, boolean>;
  maisonHeritage?: number;
  maisonReputation?: number;
  maisonUpgrades?: Record<string, boolean>;
  maisonLines?: Record<string, boolean>;
  achievementUnlocks?: string[];
  eventStates?: Record<
    string,
    { activeUntilMs: number; nextAvailableAtMs: number; incomeMultiplier?: number }
  >;
  discoveredCatalogEntries?: string[];
  catalogTierUnlocks?: string[];
  craftingParts?: number;
  craftedBoosts?: Record<string, number>;
};
