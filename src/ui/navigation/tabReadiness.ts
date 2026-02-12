import type { GameState } from "../../game/model/types";

import type { TabId } from "./tabMeta";
import { TAB_DEFINITIONS } from "./tabMeta";
import {
  canBuyUpgrade,
  canMaisonPrestige,
  canNostalgiaPrestige,
  canPerformTherapistSession,
  canWorkshopPrestige,
  getCatalogEntries,
  getUpgrades,
  getWatchItems,
  getWatchModelOwnedCount,
  getWatchModelPurchaseGate,
  getWatchModelTierId,
  isInteractionAvailable,
  isItemUnlocked,
  isUpgradeUnlocked,
} from "../../game/state";

export type TabReadiness = {
  label: string;
};

export type TabReadinessMap = Record<TabId, TabReadiness | null>;

export function getTabReadiness(state: GameState, nowMs: number): TabReadinessMap {
  const base: TabReadinessMap = TAB_DEFINITIONS.reduce((acc, tab) => {
    acc[tab.id] = null;
    return acc;
  }, {} as TabReadinessMap);

  const watchItems = getWatchItems();
  const hasInteractionReady = watchItems.some((item) => {
    const owned = state.items[item.id] ?? 0;
    if (owned <= 0) {
      return false;
    }
    return isInteractionAvailable(state, item.id, nowMs);
  });

  if (hasInteractionReady) {
    base.collection = { label: "Interactive watch ready" };
  }

  if (canPerformTherapistSession(state, nowMs)) {
    base.career = { label: "Session ready" };
  }

  const discoveredIds = new Set(state.discoveredCatalogEntries);
  const canBuyNewWatch = getCatalogEntries().some((entry) => {
    if (!discoveredIds.has(entry.id)) {
      return false;
    }

    if (getWatchModelOwnedCount(state, entry.id) > 0) {
      return false;
    }

    const tierId = getWatchModelTierId(entry.id);
    if (!isItemUnlocked(state, tierId)) {
      return false;
    }

    return getWatchModelPurchaseGate(state, entry.id).ok;
  });
  if (canBuyNewWatch) {
    base.catalog = { label: "New watch affordable" };
  }

  const upgrades = getUpgrades();
  const hasCollectionUpgradeReady = upgrades.some((upgrade) => {
    return isUpgradeUnlocked(state, upgrade.id) && canBuyUpgrade(state, upgrade.id);
  });
  if (hasCollectionUpgradeReady) {
    base.upgrades = { label: "Upgrade ready" };
  }

  if (canWorkshopPrestige(state)) {
    base.workshop = { label: "Workshop prestige ready" };
  }

  if (canMaisonPrestige(state)) {
    base.maison = { label: "Maison prestige ready" };
  }

  if (canNostalgiaPrestige(state)) {
    base.nostalgia = { label: "Nostalgia prestige ready" };
  }

  return base;
}
