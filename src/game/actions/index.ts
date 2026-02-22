import { CAREER_NODES } from "../data/career";
import { NOSTALGIA_UNLOCK_ORDER } from "../data/items";
import {
  ACHIEVEMENTS,
  EVENTS,
  applyMilestoneUnlocks,
  createEventStates,
  createItemCounts,
  createMaisonLineStates,
  createMaisonUpgradeStates,
  createUpgradeLevels,
  createWorkshopUpgradeStates,
  getCollectionValueCents,
  getTotalItemCount,
  updateCatalogTierUnlocks,
} from "../model/state";
import type {
  AchievementDefinition,
  CareerStageId,
  CraftedBoostId,
  EventId,
  EventState,
  GameState,
  MaisonLineId,
  MaisonUpgradeId,
  UpgradeId,
  WatchItemId,
  WatchPurchaseSnapshot,
  WorkshopUpgradeId,
} from "../model/types";
import { enterPhdProgram as enterPhdProgramAction } from "./therapistCareer";
import {
  canBuyMaisonLine,
  canBuyMaisonUpgrade,
  canBuyNostalgiaUnlock,
  canBuyWorkshopUpgrade,
  canCraftBoost,
  canPerformTherapistSession,
  canRefundNostalgiaUnlock,
  getCraftingPartsPerWatch,
  getCraftingRecipes,
  getItemCount,
  getMaisonLines,
  getMaisonPrestigeGain,
  getMaisonReputationGain,
  getMaisonUpgrades,
  getNostalgiaPrestigeGain,
  getNostalgiaUnlockCost,
  getTherapistSessionPolicy,
  getTherapistSalaryActiveWindowMs,
  getTherapistXpRequiredForNextLevel,
  getUpgradeLevel,
  getUpgradePriceCents,
  getWatchModelPurchaseGate,
  getWatchModelTierId,
  getWatchPurchaseGate,
  getWindSessionCashPayoutCents,
  getWindUpIncomeMultiplierForTension,
  getWorkshopUpgrades,
  isItemUnlocked,
  isUpgradeUnlocked,
} from "../selectors";

export {
  chooseCareerExpansionFocus,
  chooseCareerModality,
  chooseCareerOperatingStyle,
  enterPhdProgram,
  respecCareerNodes,
  selectPrimaryCareerTrack,
  spendCareerNode,
} from "./therapistCareer";

const THERAPIST_SESSION_XP_GAIN = 10;
export const WATCH_MODEL_PURCHASE_UNDO_WINDOW_MS = 10_000;

export function setWornWatchId(state: GameState, modelId: string | null): GameState {
  const wornWatchId =
    typeof modelId === "string" && (state.watchModels[modelId] ?? 0) > 0 ? modelId : null;

  if (state.wornWatchId === wornWatchId) {
    return state;
  }

  return {
    ...state,
    wornWatchId,
  };
}

export function dismantleItem(state: GameState, id: WatchItemId, quantity = 1): GameState {
  if (quantity <= 0) {
    return state;
  }

  const owned = getItemCount(state, id);
  if (owned < quantity || owned - quantity < 1) {
    return state;
  }

  const partsPerWatch = getCraftingPartsPerWatch();
  const partsGain = (partsPerWatch[id] ?? 0) * quantity;
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

export function craftBoost(state: GameState, id: CraftedBoostId): GameState {
  if (!canCraftBoost(state, id)) {
    return state;
  }

  const recipe = getCraftingRecipes().find((entry) => entry.id === id);
  if (!recipe) {
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
      totalSessions: 0,
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
    watchModels: {},
    upgrades: createUpgradeLevels(),
    workshopBlueprints: state.workshopBlueprints + Math.max(0, Math.floor(earnedPrestigeCurrency)),
    workshopPrestigeCount: state.workshopPrestigeCount + 1,
    workshopUpgrades: { ...state.workshopUpgrades },
    craftingParts: state.craftingParts,
    craftedBoosts: { ...state.craftedBoosts },
  };

  return applyMilestoneUnlocks(applyAchievementUnlocks(nextState));
}

export function prestigeMaison(state: GameState): GameState {
  const heritageGain = getMaisonPrestigeGain(state);
  const reputationGain = getMaisonReputationGain(state);
  const nextState: GameState = {
    ...state,
    currencyCents: 0,
    enjoymentCents: 0,
    items: createItemCounts(),
    watchModels: {},
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

export function buyMaisonLine(state: GameState, id: MaisonLineId): GameState {
  const line = getMaisonLines().find((entry) => entry.id === id);
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

export function performTherapistSession(state: GameState, nowMs: number): GameState {
  if (state.therapistCareer.careerStartId === null) {
    return state;
  }
  if (!canPerformTherapistSession(state, nowMs)) {
    return state;
  }

  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;

  const career = state.therapistCareer;
  const policy = getTherapistSessionPolicy(state, clampedNowMs);
  if (!policy.supportsSessions) {
    return state;
  }
  const isFreeSession = career.freeSessionAvailable;
  const cost = isFreeSession ? 0 : policy.effectiveEnjoymentCostCents;
  const payout = policy.cashPayoutCents;

  let nextLevel = career.level;
  let nextXp = career.xp + THERAPIST_SESSION_XP_GAIN;

  while (nextXp >= getTherapistXpRequiredForNextLevel(nextLevel)) {
    nextXp -= getTherapistXpRequiredForNextLevel(nextLevel);
    nextLevel += 1;
  }

  const salaryWindowMs = getTherapistSalaryActiveWindowMs(state);
  const salaryActiveUntilMs = Math.max(career.salaryActiveUntilMs, clampedNowMs + salaryWindowMs);
  const nextPremiumCount = Math.min(3, Math.max(0, policy.premiumCount + 1));

  return {
    ...state,
    currencyCents: state.currencyCents + payout,
    enjoymentCents: state.enjoymentCents - cost,
    therapistCareer: {
      ...career,
      level: nextLevel,
      xp: nextXp,
      nextAvailableAtMs: clampedNowMs + policy.cooldownMs,
      freeSessionAvailable: isFreeSession ? false : career.freeSessionAvailable,
      salaryActiveUntilMs,
      sessionPremiumCount: nextPremiumCount,
      lastSessionAtMs: clampedNowMs,
      totalSessions: career.totalSessions + 1,
    },
  };
}

export function startCareerWithKickoffSession(state: GameState, nowMs: number): GameState {
  const started = enterPhdProgramAction(state, nowMs);
  if (started === state) {
    return state;
  }

  if (!started.therapistCareer.freeSessionAvailable) {
    return started;
  }

  return performTherapistSession(started, nowMs);
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

  const withTierUnlocks = updateCatalogTierUnlocks(nextState);
  return applyAchievementUnlocks(applyMilestoneUnlocks(withTierUnlocks));
}

export function buyWatchModel(state: GameState, modelId: string): GameState {
  const tierId = getWatchModelTierId(modelId);
  if (!isItemUnlocked(state, tierId)) {
    return state;
  }

  const gate = getWatchModelPurchaseGate(state, modelId);
  if (!gate.ok) {
    return state;
  }

  const owned = state.watchModels[modelId] ?? 0;
  const nextState: GameState = {
    ...state,
    currencyCents: state.currencyCents - gate.cashPriceCents,
    items: {
      ...state.items,
      [tierId]: getItemCount(state, tierId) + 1,
    },
    watchModels: {
      ...state.watchModels,
      [modelId]: owned + 1,
    },
  };

  const withTierUnlocks = updateCatalogTierUnlocks(nextState);
  return applyAchievementUnlocks(applyMilestoneUnlocks(withTierUnlocks));
}

export function buyWatchModelWithUndo(state: GameState, modelId: string, nowMs: number): GameState {
  const gate = getWatchModelPurchaseGate(state, modelId);
  if (!gate.ok) {
    return state;
  }

  const nextState = buyWatchModel(state, modelId);
  if (nextState === state) {
    return state;
  }

  const tierId = getWatchModelTierId(modelId);
  const snapshot: WatchPurchaseSnapshot = {
    modelId,
    tierId,
    costCents: gate.cashPriceCents,
    quantity: 1,
    purchasedAtMs: Math.max(0, Math.floor(nowMs)),
  };

  return {
    ...nextState,
    lastPurchase: snapshot,
  };
}

export function toggleWatchFavorite(state: GameState, modelId: string): GameState {
  const current = state.favoriteWatchIds ?? [];
  const isFavorite = current.includes(modelId);
  const nextFavorites = isFavorite
    ? current.filter((entry) => entry !== modelId)
    : [...current, modelId];
  if (nextFavorites.length === current.length && isFavorite) {
    return state;
  }

  return {
    ...state,
    favoriteWatchIds: nextFavorites,
  };
}

export function undoLastPurchase(state: GameState, nowMs: number): GameState {
  const last = state.lastPurchase;
  if (!last) {
    return state;
  }

  if (nowMs - last.purchasedAtMs > WATCH_MODEL_PURCHASE_UNDO_WINDOW_MS) {
    return state;
  }

  if (last.quantity <= 0 || last.costCents <= 0) {
    return state;
  }

  const tierOwned = state.items[last.tierId] ?? 0;
  const modelOwned = state.watchModels[last.modelId] ?? 0;
  if (tierOwned < last.quantity || modelOwned < last.quantity) {
    return state;
  }

  return {
    ...state,
    currencyCents: state.currencyCents + last.costCents,
    items: {
      ...state.items,
      [last.tierId]: Math.max(0, tierOwned - last.quantity),
    },
    watchModels: {
      ...state.watchModels,
      [last.modelId]: Math.max(0, modelOwned - last.quantity),
    },
    lastPurchase: null,
  };
}

export function dismantleWatchModel(state: GameState, modelId: string, quantity = 1): GameState {
  if (quantity <= 0) {
    return state;
  }

  const tierId = getWatchModelTierId(modelId);
  const owned = state.watchModels[modelId] ?? 0;
  if (owned < quantity || owned - quantity < 1) {
    return state;
  }

  const tierOwned = getItemCount(state, tierId);
  if (tierOwned < quantity || tierOwned - quantity < 1) {
    return state;
  }

  const partsPerWatch = getCraftingPartsPerWatch();
  const partsGain = (partsPerWatch[tierId] ?? 0) * quantity;
  if (partsGain <= 0) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    items: {
      ...state.items,
      [tierId]: tierOwned - quantity,
    },
    watchModels: {
      ...state.watchModels,
      [modelId]: owned - quantity,
    },
    craftingParts: state.craftingParts + partsGain,
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

  const withTierUnlocks = updateCatalogTierUnlocks(nextState);
  return applyAchievementUnlocks(applyMilestoneUnlocks(withTierUnlocks));
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

export function buyWorkshopUpgrade(state: GameState, id: WorkshopUpgradeId): GameState {
  const upgrade = getWorkshopUpgrades().find((entry) => entry.id === id);
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

export function buyMaisonUpgrade(state: GameState, id: MaisonUpgradeId): GameState {
  const upgrade = getMaisonUpgrades().find((entry) => entry.id === id);
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

function isAchievementMet(state: GameState, achievement: AchievementDefinition): boolean {
  const requirement = achievement.requirement;

  if (requirement.type === "totalItems") {
    return getTotalItemCount(state) >= requirement.threshold;
  }

  if (requirement.type === "collectionValue") {
    return getCollectionValueCents(state) >= requirement.thresholdCents;
  }

  if (requirement.type === "catalogDiscovery") {
    const ownedModelCount = Object.values(state.watchModels).filter(
      (count) => typeof count === "number" && count > 0,
    ).length;
    return ownedModelCount >= requirement.threshold;
  }

  if (requirement.type === "careerLevel") {
    return state.therapistCareer.level >= requirement.threshold;
  }

  if (requirement.type === "interactionPerfects") {
    return state.interactionPerfectRuns >= requirement.threshold;
  }

  if (requirement.type === "perfectStreak") {
    return state.interactionBestPerfectStreak >= requirement.threshold;
  }

  if (requirement.type === "nostalgiaResets") {
    return state.nostalgiaResets >= requirement.threshold;
  }

  if (requirement.type === "workshopPrestigeCount") {
    return state.workshopPrestigeCount >= requirement.threshold;
  }

  // Career achievements - Story 3.1
  if (requirement.type === "careerSessions") {
    return state.therapistCareer.totalSessions >= requirement.threshold;
  }

  if (requirement.type === "careerStageReached") {
    const stageUnlockLevels: Record<CareerStageId, number> = {
      "grad-student": 1,
      "licensed-associate": 3,
      "specialist-certification": 6,
      "practice-builder": 10,
      "private-practice-owner": 15,
      retirement: 20,
    };
    return state.therapistCareer.level >= stageUnlockLevels[requirement.stageId];
  }

  if (requirement.type === "careerSpecializationUnlocked") {
    const career = state.therapistCareer;
    const specializationCount =
      (career.modalityId ? 1 : 0) +
      (career.operatingStyleId ? 1 : 0) +
      (career.expansionFocusId ? 1 : 0);
    return specializationCount >= requirement.count;
  }

  if (requirement.type === "careerTrackCompleted") {
    const trackNodes = CAREER_NODES.filter((node) => node.trackId === requirement.trackId);
    const career = state.therapistCareer;
    return trackNodes.length > 0 && trackNodes.every((node) => career.spentNodes[node.id]);
  }

  return false;
}

export * from "./interactions";
