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
  CatalogEntryId,
  CraftedBoostId,
  EventId,
  EventState,
  GameState,
  MaisonLineId,
  MaisonUpgradeId,
  UpgradeId,
  WatchItemId,
  WorkshopUpgradeId,
} from "../model/types";
import {
  canBuyMaisonLine,
  canBuyMaisonUpgrade,
  canBuyNostalgiaUnlock,
  canBuyWorkshopUpgrade,
  canCraftBoost,
  canPerformTherapistSession,
  canRefundNostalgiaUnlock,
  getCatalogEntries,
  getCatalogEntryIdsForItems,
  getCraftingPartsPerWatch,
  getCraftingRecipes,
  getItemCount,
  getMaisonLines,
  getMaisonPrestigeGain,
  getMaisonReputationGain,
  getMaisonUpgrades,
  getNostalgiaPrestigeGain,
  getNostalgiaUnlockCost,
  getTherapistSessionCashPayoutCents,
  getTherapistSessionCooldownMs,
  getTherapistSessionEnjoymentCostCents,
  getTherapistXpRequiredForNextLevel,
  getUpgradeLevel,
  getUpgradePriceCents,
  getWatchPurchaseGate,
  getWindSessionCashPayoutCents,
  getWindUpIncomeMultiplierForTension,
  getWorkshopUpgrades,
  isItemUnlocked,
  isUpgradeUnlocked,
} from "../selectors";

const THERAPIST_SESSION_XP_GAIN = 10;

export function discoverCatalogEntries(state: GameState, ids: CatalogEntryId[]): GameState {
  if (ids.length === 0) {
    return state;
  }

  const discovered = new Set(state.discoveredCatalogEntries);
  const catalogEntries = getCatalogEntries();
  let changed = false;

  for (const id of ids) {
    if (!discovered.has(id) && catalogEntries.some((entry) => entry.id === id)) {
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

export function dismantleItem(state: GameState, id: WatchItemId, quantity = 1): GameState {
  if (quantity <= 0) {
    return state;
  }

  const owned = getItemCount(state, id);
  if (owned < quantity) {
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
    return state.discoveredCatalogEntries.length >= requirement.threshold;
  }

  return state.workshopPrestigeCount >= requirement.threshold;
}
