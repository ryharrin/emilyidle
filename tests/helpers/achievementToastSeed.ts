import {
  createInitialState,
  getCatalogModelPurchaseReachability,
  getWatchModels,
  type GameState,
} from "../../src/game/state";

// Canonical achievement-toast preconditions for catalog buy-button reachability.
// The ownedCount value is intentional because these tests execute the purchase from the "Owned" view.
export const ACHIEVEMENT_TOAST_SEED_CONTRACT = {
  discovered: true,
  ownedCount: 11,
  gateOpen: true,
  affordable: true,
} as const;

export type AchievementToastSeed = {
  state: GameState;
  starterModelId: string;
};

export function buildAchievementToastSeed(): AchievementToastSeed {
  const base = createInitialState();
  const starterModel = getWatchModels().find((model) => model.tierId === "quartz");
  if (!starterModel) {
    throw new Error("Missing quartz model");
  }

  const state: GameState = {
    ...base,
    currencyCents: Math.max(base.currencyCents, 500_000),
    enjoymentCents: Math.max(base.enjoymentCents, 50_000),
    unlockedMilestones: ["collector-shelf", "showcase"],
    catalogTierUnlocks: ["quartz"],
    items: {
      ...base.items,
      quartz: 11,
    },
    watchModels: {
      ...base.watchModels,
      [starterModel.id]: 11,
    },
    discoveredCatalogEntries: [starterModel.id],
    achievementUnlocks: [],
  };

  const reachability = getCatalogModelPurchaseReachability(state, starterModel.id);
  const contractMatches =
    reachability.discovered === ACHIEVEMENT_TOAST_SEED_CONTRACT.discovered &&
    reachability.ownedCount === ACHIEVEMENT_TOAST_SEED_CONTRACT.ownedCount &&
    reachability.gate.ok === ACHIEVEMENT_TOAST_SEED_CONTRACT.gateOpen &&
    reachability.gate.ok === ACHIEVEMENT_TOAST_SEED_CONTRACT.affordable &&
    reachability.buyActionReachable;
  if (!contractMatches) {
    throw new Error("Achievement-toast seed preconditions are out of sync with contract");
  }

  return { state, starterModelId: starterModel.id };
}

export function buildAchievementToastSettings(achievementsEnabled: boolean) {
  return {
    themeMode: "system",
    hideCompletedAchievements: false,
    hiddenTabs: [],
    coachmarksDismissed: {},
    confirmNostalgiaUnlocks: true,
    notificationPreferences: {
      sessionsReady: true,
      prestigeReady: true,
      achievements: achievementsEnabled,
      events: true,
    },
  };
}
