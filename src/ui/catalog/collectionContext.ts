import {
  getCollectionValueCents,
  getMilestones,
  getTotalItemCount,
  type GameState,
} from "../../game/state";

type CatalogCollectionContext = {
  ownedCount: number;
  maxCapacity: number;
  collectionValueCents: number;
};

export function getCatalogCollectionContext(state: GameState): CatalogCollectionContext {
  const ownedCount = getTotalItemCount(state);
  const collectionValueCents = getCollectionValueCents(state);
  const unlockedMilestones = new Set(state.unlockedMilestones);

  let nextThreshold: number | null = null;
  for (const milestone of getMilestones()) {
    if (milestone.requirement.type !== "totalItems") {
      continue;
    }
    if (unlockedMilestones.has(milestone.id)) {
      continue;
    }
    const threshold = milestone.requirement.threshold;
    if (threshold <= ownedCount) {
      continue;
    }
    if (nextThreshold === null || threshold < nextThreshold) {
      nextThreshold = threshold;
    }
  }

  return {
    ownedCount,
    maxCapacity: nextThreshold ?? ownedCount,
    collectionValueCents,
  };
}
