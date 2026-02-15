import type { GameState } from "../../game/model/types";

import type { TabId } from "./tabMeta";
import { TAB_DEFINITIONS } from "./tabMeta";
import {
  canBuyUpgrade,
  canMaisonPrestige,
  hasCatalogReadyUnownedModel,
  canNostalgiaPrestige,
  canPerformTherapistSession,
  canWorkshopPrestige,
  getUpgrades,
  getWatchItems,
  isInteractionAvailable,
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

  if (hasCatalogReadyUnownedModel(state)) {
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
