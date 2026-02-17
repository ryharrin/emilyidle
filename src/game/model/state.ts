import { CATALOG_ENTRIES, getCatalogEntryTags, type CatalogEntry } from "../catalog";
import { CAREER_NODES, CAREER_TRACKS } from "../data/career";
import { WATCH_MODELS } from "../data/watchModels";
import { MILESTONES } from "../data/milestones";
import { NOSTALGIA_UNLOCK_ORDER, WATCH_ITEMS } from "../data/items";
import { UPGRADES } from "../data/upgrades";
import { getDuplicateRewardSum } from "../selectors/duplicates";
import type {
  AchievementDefinition,
  AchievementId,
  CareerStartId,
  CareerNodeId,
  CareerTrackId,
  CareerExpansionFocusId,
  CareerModalityId,
  CareerOperatingStyleId,
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
  UpgradeId,
  WatchItemId,
  WatchPurchaseSnapshot,
  WorkshopUpgradeDefinition,
  WorkshopUpgradeId,
} from "./types";

export { MILESTONES } from "../data/milestones";
export { NOSTALGIA_UNLOCK_ORDER, WATCH_ITEMS } from "../data/items";
export { UPGRADES } from "../data/upgrades";

const WATCH_ITEM_LOOKUP = new Map(WATCH_ITEMS.map((item) => [item.id, item]));
const WATCH_MODEL_LOOKUP = new Map(WATCH_MODELS.map((model) => [model.id, model]));
const CAREER_TRACK_IDS = new Set(CAREER_TRACKS.map((track) => track.id));
const CAREER_NODE_IDS = new Set(CAREER_NODES.map((node) => node.id));
const CAREER_MODALITY_IDS: ReadonlyArray<CareerModalityId> = ["cbt", "psychodynamic", "act"];
const CAREER_OPERATING_STYLE_IDS: ReadonlyArray<CareerOperatingStyleId> = [
  "boutique",
  "high-volume",
  "group-practice",
];
const CAREER_EXPANSION_FOCUS_IDS: ReadonlyArray<CareerExpansionFocusId> = [
  "referrals",
  "media",
  "supervision",
];
const CAREER_MODALITY_ID_SET = new Set(CAREER_MODALITY_IDS);
const CAREER_OPERATING_STYLE_ID_SET = new Set(CAREER_OPERATING_STYLE_IDS);
const CAREER_EXPANSION_FOCUS_ID_SET = new Set(CAREER_EXPANSION_FOCUS_IDS);
const CAREER_START_ID_SET = new Set<CareerStartId>(["phd-program"]);

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
    description: "Blueprinted accounting boosts collection enjoyment.",
    blueprintCost: 2,
    incomeMultiplier: 1.08,
  },
  {
    id: "vault-calibration",
    name: "Collection calibration",
    description: "Better collection tuning lifts the collection softcap.",
    blueprintCost: 4,
    softcapMultiplier: 1.25,
  },
  {
    id: "heritage-templates",
    name: "Heritage templates",
    description: "Prestige patterns keep enjoyment stronger under the softcap.",
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
    description: "International vitrines loosen the collection softcap.",
    currency: "reputation",
    cost: 4,
    softcapMultiplier: 1.2,
  },
];

export const MAISON_LINES: ReadonlyArray<MaisonLineDefinition> = [
  {
    id: "atelier-line",
    name: "Atelier line",
    description: "Unify the atelier workflow for steady enjoyment gains.",
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
    id: "quartz",
    name: "Starter archive",
    description: "Archive 3 quartz references to boost enjoyment output.",
    requiredCount: 3,
    incomeMultiplier: 1.03,
  },
  {
    id: "automatic",
    name: "Classic index",
    description: "Discover 4 automatic icons to amplify collection earnings.",
    requiredCount: 4,
    incomeMultiplier: 1.05,
  },
  {
    id: "manual",
    name: "Chronograph dossier",
    description: "Collect 3 manual references for a lasting enjoyment lift.",
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
    description: "Hold 12 watches to reveal the Stats tab.",
    category: "collection",
    requirement: { type: "totalItems", threshold: 12 },
  },
  {
    id: "six-figure-vault",
    name: "Six-figure collection",
    description: "Reach $120k in Memories.",
    category: "collection",
    requirement: { type: "collectionValue", thresholdCents: 120_000 },
  },
  {
    id: "workshop-reforged",
    name: "Workshop reforged",
    description: "Prestige the workshop once.",
    category: "prestige",
    requirement: { type: "workshopPrestigeCount", threshold: 1 },
  },
  {
    id: "workshop-veteran",
    name: "Workshop veteran",
    description: "Prestige the workshop three times.",
    category: "prestige",
    requirement: { type: "workshopPrestigeCount", threshold: 3 },
  },
  {
    id: "vault-century",
    name: "Collection century",
    description: "Hold 100 watches in the collection.",
    category: "collection",
    requirement: { type: "totalItems", threshold: 100 },
  },
  {
    id: "million-memories",
    name: "Million memories",
    description: "Reach $1,000,000 in Memories.",
    category: "collection",
    requirement: { type: "collectionValue", thresholdCents: 100_000_000 },
  },
  {
    id: "workshop-decade",
    name: "Workshop decade",
    description: "Prestige the workshop ten times.",
    category: "prestige",
    requirement: { type: "workshopPrestigeCount", threshold: 10 },
  },
  {
    id: "catalog-keeper",
    name: "Catalog keeper",
    description: "Discover 20 catalog references.",
    category: "collection",
    requirement: { type: "catalogDiscovery", threshold: 20 },
  },
  {
    id: "career-clinician",
    name: "Career clinician",
    description: "Reach therapist career level 10.",
    category: "career",
    requirement: { type: "careerLevel", threshold: 10 },
  },
  {
    id: "session-maestro",
    name: "Session maestro",
    description: "Land 10 perfect mini-game outcomes in normal mode.",
    category: "mini-game",
    requirement: { type: "interactionPerfects", threshold: 10 },
  },
  {
    id: "perfect-pulse",
    name: "Perfect pulse",
    description: "Build a 5-perfect streak in normal mode.",
    category: "mini-game",
    requirement: { type: "perfectStreak", threshold: 5 },
  },
  {
    id: "nostalgia-returnee",
    name: "Nostalgia returnee",
    description: "Complete two Nostalgia prestiges.",
    category: "prestige",
    requirement: { type: "nostalgiaResets", threshold: 2 },
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
    description: "A freshly wound crown keeps the collection humming.",
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

export function getCatalogTierProgress(state: GameState): Record<CatalogTierId, number> {
  const progress: Record<CatalogTierId, number> = {
    quartz: 0,
    automatic: 0,
    manual: 0,
    tourbillon: 0,
  };

  // Count owned watches per tier
  for (const model of WATCH_MODELS) {
    const ownedCount = state.watchModels[model.id] ?? 0;
    if (ownedCount > 0) {
      progress[model.tierId] += 1;
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
  return Object.entries(state.watchModels).reduce((total, [modelId, rawOwned]) => {
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

    return total + item.collectionValueCents * getDuplicateRewardSum(owned);
  }, 0);
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
    enjoymentCents: 200,
    nostalgiaPoints: 0,
    nostalgiaResets: 0,
    nostalgiaUnlockedItems: [],
    nostalgiaEnjoymentEarnedCents: 0,
    nostalgiaLastGain: 0,
    nostalgiaLastPrestigedAtMs: 0,
    therapistCareer: {
      careerStartId: null,
      salaryActiveUntilMs: 0,
      level: 1,
      xp: 0,
      nextAvailableAtMs: 0,
      activeTrackId: null,
      primaryTrackId: null,
      modalityId: null,
      operatingStyleId: null,
      expansionFocusId: null,
      pointsAvailable: 0,
      spentNodes: {},
      freeSessionAvailable: true,
      sessionPremiumCount: 0,
      lastSessionAtMs: 0,
    },
    wornWatchId: null,
    interactionNextAvailableAtMsByItem: {},
    powerReserveByItem: {},
    items: createItemCounts(),
    watchModels: {},
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
    catalogTierUnlocks: [],
    craftingParts: 0,
    craftedBoosts: {
      "polished-tools": 0,
      "heritage-springs": 0,
      "artisan-jig": 0,
    },
    favoriteWatchIds: [],
    lastPurchase: null,
    interactionRunsTotal: 0,
    interactionPerfectRuns: 0,
    interactionPerfectStreak: 0,
    interactionBestPerfectStreak: 0,
  };
}

export function createStateFromSave(saved: PersistedGameState): GameState {
  const items = createItemCounts();
  const watchModels: Record<string, number> = {};
  const upgrades = createUpgradeLevels();
  const workshopUpgrades = createWorkshopUpgradeStates();
  const maisonUpgrades = createMaisonUpgradeStates();
  const maisonLines = createMaisonLineStates();
  const eventStates = createEventStates();

  const therapistRaw = saved.therapistCareer;
  const therapistRecord =
    therapistRaw && typeof therapistRaw === "object"
      ? (therapistRaw as Record<string, unknown>)
      : null;
  const levelRaw = therapistRecord?.level;
  const xpRaw = therapistRecord?.xp;
  const nextAvailableAtMsRaw = therapistRecord?.nextAvailableAtMs;
  const pointsAvailableRaw = therapistRecord?.pointsAvailable;
  const activeTrackIdRaw = therapistRecord?.activeTrackId;
  const activeTrackId =
    activeTrackIdRaw === null
      ? null
      : typeof activeTrackIdRaw === "string" &&
          CAREER_TRACK_IDS.has(activeTrackIdRaw as CareerTrackId)
        ? (activeTrackIdRaw as CareerTrackId)
        : null;
  const primaryTrackIdRaw = therapistRecord?.primaryTrackId;
  const primaryTrackIdParsed =
    primaryTrackIdRaw === null
      ? null
      : typeof primaryTrackIdRaw === "string" &&
          CAREER_TRACK_IDS.has(primaryTrackIdRaw as CareerTrackId)
        ? (primaryTrackIdRaw as CareerTrackId)
        : null;
  const primaryTrackId = primaryTrackIdParsed ?? null;
  const migratedPrimaryTrackId =
    primaryTrackId === null && activeTrackId !== null ? activeTrackId : primaryTrackId;
  const pinnedActiveTrackId = migratedPrimaryTrackId ?? null;

  const modalityIdRaw = therapistRecord?.modalityId;
  const modalityId =
    modalityIdRaw === null
      ? null
      : typeof modalityIdRaw === "string" &&
          CAREER_MODALITY_ID_SET.has(modalityIdRaw as CareerModalityId)
        ? (modalityIdRaw as CareerModalityId)
        : null;

  const operatingStyleIdRaw = therapistRecord?.operatingStyleId;
  const operatingStyleId =
    operatingStyleIdRaw === null
      ? null
      : typeof operatingStyleIdRaw === "string" &&
          CAREER_OPERATING_STYLE_ID_SET.has(operatingStyleIdRaw as CareerOperatingStyleId)
        ? (operatingStyleIdRaw as CareerOperatingStyleId)
        : null;

  const expansionFocusIdRaw = therapistRecord?.expansionFocusId;
  const expansionFocusId =
    expansionFocusIdRaw === null
      ? null
      : typeof expansionFocusIdRaw === "string" &&
          CAREER_EXPANSION_FOCUS_ID_SET.has(expansionFocusIdRaw as CareerExpansionFocusId)
        ? (expansionFocusIdRaw as CareerExpansionFocusId)
        : null;
  const spentNodes: Record<CareerNodeId, boolean> = {};
  const spentNodesRaw =
    therapistRecord?.spentNodes && typeof therapistRecord.spentNodes === "object"
      ? (therapistRecord.spentNodes as Record<string, unknown>)
      : null;
  if (spentNodesRaw) {
    for (const [key, value] of Object.entries(spentNodesRaw)) {
      if (CAREER_NODE_IDS.has(key) && Boolean(value)) {
        spentNodes[key as CareerNodeId] = true;
      }
    }
  }
  const careerStartIdRaw = therapistRecord?.careerStartId;
  const parsedCareerStartId: CareerStartId | null =
    careerStartIdRaw === null
      ? null
      : typeof careerStartIdRaw === "string" &&
          CAREER_START_ID_SET.has(careerStartIdRaw as CareerStartId)
        ? (careerStartIdRaw as CareerStartId)
        : null;

  const salaryActiveUntilMsRaw = therapistRecord?.salaryActiveUntilMs;
  const salaryActiveUntilMs =
    typeof salaryActiveUntilMsRaw === "number" && Number.isFinite(salaryActiveUntilMsRaw)
      ? Math.max(0, Math.floor(salaryActiveUntilMsRaw))
      : careerStartIdRaw === null
        ? 0
        : Number.MAX_SAFE_INTEGER;

  const therapistCareer = {
    careerStartId: careerStartIdRaw === undefined ? ("phd-program" as const) : parsedCareerStartId,
    salaryActiveUntilMs,
    level:
      typeof levelRaw === "number" && Number.isFinite(levelRaw)
        ? Math.max(1, Math.floor(levelRaw))
        : 1,
    xp: typeof xpRaw === "number" && Number.isFinite(xpRaw) ? Math.max(0, Math.floor(xpRaw)) : 0,
    nextAvailableAtMs:
      typeof nextAvailableAtMsRaw === "number" && Number.isFinite(nextAvailableAtMsRaw)
        ? Math.max(0, Math.floor(nextAvailableAtMsRaw))
        : 0,
    activeTrackId: pinnedActiveTrackId,
    primaryTrackId: migratedPrimaryTrackId,
    modalityId,
    operatingStyleId,
    expansionFocusId,
    pointsAvailable:
      typeof pointsAvailableRaw === "number" && Number.isFinite(pointsAvailableRaw)
        ? Math.max(0, Math.floor(pointsAvailableRaw))
        : 0,
    spentNodes,
    freeSessionAvailable:
      therapistRecord && typeof therapistRecord.freeSessionAvailable === "boolean"
        ? therapistRecord.freeSessionAvailable
        : true,
    sessionPremiumCount:
      typeof therapistRecord?.sessionPremiumCount === "number" &&
      Number.isFinite(therapistRecord.sessionPremiumCount)
        ? Math.max(0, Math.floor(therapistRecord.sessionPremiumCount))
        : 0,
    lastSessionAtMs:
      typeof therapistRecord?.lastSessionAtMs === "number" &&
      Number.isFinite(therapistRecord.lastSessionAtMs)
        ? Math.max(0, Math.floor(therapistRecord.lastSessionAtMs))
        : 0,
  };

  if (saved.items) {
    for (const [key, value] of Object.entries(saved.items)) {
      if (key in items && Number.isFinite(value)) {
        items[key as WatchItemId] = Math.max(0, Math.floor(value));
      }
    }
  }

  const watchModelsRaw =
    saved.watchModels && typeof saved.watchModels === "object" ? saved.watchModels : undefined;
  const validModelIds = new Set(WATCH_MODELS.map((model) => model.id));
  if (watchModelsRaw) {
    for (const [key, value] of Object.entries(watchModelsRaw)) {
      if (validModelIds.has(key) && Number.isFinite(value)) {
        watchModels[key] = Math.max(0, Math.floor(value));
      }
    }
  }

  const hasWatchModels = Object.values(watchModels).some((value) => value > 0);
  if (!hasWatchModels) {
    const defaultModelIdsByTier = new Map<WatchItemId, string>();
    for (const model of WATCH_MODELS) {
      if (!defaultModelIdsByTier.has(model.tierId)) {
        defaultModelIdsByTier.set(model.tierId, model.id);
      }
    }

    for (const item of WATCH_ITEMS) {
      const owned = items[item.id];
      const defaultModelId = defaultModelIdsByTier.get(item.id);
      if (defaultModelId && owned > 0) {
        watchModels[defaultModelId] = owned;
      }
    }
  }

  const wornWatchIdRaw = saved.wornWatchId;
  const wornWatchIdCandidate =
    wornWatchIdRaw === null ? null : typeof wornWatchIdRaw === "string" ? wornWatchIdRaw : null;
  const wornWatchId =
    wornWatchIdCandidate &&
    validModelIds.has(wornWatchIdCandidate) &&
    (watchModels[wornWatchIdCandidate] ?? 0) > 0
      ? wornWatchIdCandidate
      : null;

  const interactionNextAvailableAtMsByItem: Partial<Record<WatchItemId, number>> = {};
  const cooldownsRaw =
    saved.interactionNextAvailableAtMsByItem &&
    typeof saved.interactionNextAvailableAtMsByItem === "object"
      ? saved.interactionNextAvailableAtMsByItem
      : undefined;
  if (cooldownsRaw) {
    for (const [key, value] of Object.entries(cooldownsRaw)) {
      if (key in items && Number.isFinite(value)) {
        interactionNextAvailableAtMsByItem[key as WatchItemId] = Math.max(0, Math.floor(value));
      }
    }
  }

  const powerReserveByItem: Partial<Record<WatchItemId, number>> = {};
  const reservesRaw =
    saved.powerReserveByItem && typeof saved.powerReserveByItem === "object"
      ? saved.powerReserveByItem
      : undefined;
  if (reservesRaw) {
    for (const [key, value] of Object.entries(reservesRaw)) {
      if (key in items && typeof value === "number" && Number.isFinite(value)) {
        powerReserveByItem[key as WatchItemId] = Math.min(1, Math.max(0, value));
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

  const favoriteWatchIdsRaw = Array.isArray(saved.favoriteWatchIds) ? saved.favoriteWatchIds : [];
  const favoriteWatchIds = favoriteWatchIdsRaw.filter((entry): entry is string =>
    validModelIds.has(entry),
  );

  let lastPurchase: WatchPurchaseSnapshot | null = null;
  const lastPurchaseRaw = saved.lastPurchase;
  if (
    lastPurchaseRaw &&
    typeof lastPurchaseRaw === "object" &&
    typeof lastPurchaseRaw.modelId === "string" &&
    validModelIds.has(lastPurchaseRaw.modelId) &&
    typeof lastPurchaseRaw.tierId === "string" &&
    WATCH_ITEMS.some((item) => item.id === lastPurchaseRaw.tierId) &&
    Number.isFinite(lastPurchaseRaw.costCents) &&
    Number.isFinite(lastPurchaseRaw.quantity) &&
    Number.isFinite(lastPurchaseRaw.purchasedAtMs)
  ) {
    const quantity = Math.max(0, Math.floor(lastPurchaseRaw.quantity));
    if (quantity > 0) {
      lastPurchase = {
        modelId: lastPurchaseRaw.modelId,
        tierId: lastPurchaseRaw.tierId as WatchItemId,
        costCents: Math.max(0, Math.floor(lastPurchaseRaw.costCents)),
        quantity,
        purchasedAtMs: Math.max(0, Math.floor(lastPurchaseRaw.purchasedAtMs)),
      };
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
  const interactionRunsTotal = Number.isFinite(saved.interactionRunsTotal ?? 0)
    ? Math.max(0, Math.floor(saved.interactionRunsTotal ?? 0))
    : 0;
  const interactionPerfectRuns = Number.isFinite(saved.interactionPerfectRuns ?? 0)
    ? Math.max(0, Math.floor(saved.interactionPerfectRuns ?? 0))
    : 0;
  const interactionPerfectStreak = Number.isFinite(saved.interactionPerfectStreak ?? 0)
    ? Math.max(0, Math.floor(saved.interactionPerfectStreak ?? 0))
    : 0;
  const interactionBestPerfectStreakRaw = Number.isFinite(saved.interactionBestPerfectStreak ?? 0)
    ? Math.max(0, Math.floor(saved.interactionBestPerfectStreak ?? 0))
    : 0;
  const interactionBestPerfectStreak = Math.max(
    interactionPerfectStreak,
    interactionBestPerfectStreakRaw,
  );
  const restoredState = applyMilestoneUnlocks({
    currencyCents:
      therapistCareer.careerStartId === null ? 0 : Math.max(0, Math.floor(saved.currencyCents)),
    enjoymentCents,
    nostalgiaPoints,
    nostalgiaResets,
    nostalgiaUnlockedItems,
    nostalgiaEnjoymentEarnedCents,
    nostalgiaLastGain,
    nostalgiaLastPrestigedAtMs,
    therapistCareer,
    wornWatchId,
    interactionNextAvailableAtMsByItem,
    powerReserveByItem,
    items,
    watchModels,
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
    catalogTierUnlocks,
    craftingParts,
    craftedBoosts,
    favoriteWatchIds,
    lastPurchase,
    interactionRunsTotal,
    interactionPerfectRuns,
    interactionPerfectStreak,
    interactionBestPerfectStreak,
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

  // For catalogDiscovery milestone: count unique owned watch models
  const ownedModelCount = Object.values(state.watchModels).filter(
    (count) => typeof count === "number" && count > 0,
  ).length;
  return ownedModelCount >= requirement.threshold;
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
