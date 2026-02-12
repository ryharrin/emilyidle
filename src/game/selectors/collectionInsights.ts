import { CATALOG_ENTRIES, type CatalogBrand } from "../catalog";
import { SET_BONUSES } from "../data/setBonuses";
import { WATCH_ITEMS } from "../data/items";
import { WATCH_MODELS } from "../data/watchModels";
import type { CatalogTierId, GameState, SetBonusId, WatchItemId } from "../model/types";

import { getDuplicateRewardSum } from "./duplicates";

const WORKSHOP_PRESTIGE_THRESHOLD_CENTS = 800_000;
const MAISON_PRESTIGE_THRESHOLD_CENTS = 4_000_000;
const NOSTALGIA_PRESTIGE_THRESHOLD_CENTS = 12_000_000;

const PRESTIGE_EFFECT_SUMMARIES: Record<PrestigeTargetId, string> = {
  workshop: "Prestige the Atelier to earn Blueprints and unlock Workshop bonuses.",
  maison: "Prestige again for Heritage, Reputation, and Maison perks.",
  nostalgia: "Prestige for Nostalgia to gain permanent Nostalgia points.",
};

type SetBonusRequirementEntry = {
  itemId: WatchItemId;
  currentCount: number;
  requiredCount: number;
  met: boolean;
};

export type SetBonusProgressRow = {
  id: SetBonusId;
  name: string;
  requiredCount: number;
  metCount: number;
  remainingCount: number;
  ratio: number;
  requirements: SetBonusRequirementEntry[];
  active: boolean;
  nextNeedLabel: string;
};

type PrestigeTargetId = "workshop" | "maison" | "nostalgia";

export type PrestigePreview = {
  id: PrestigeTargetId;
  label: string;
  current: number;
  threshold: number;
  remaining: number;
  ratio: number;
  effectSummary: string;
};

type DistributionRow<T extends string> = {
  id: T;
  label: string;
  count: number;
  ratio: number;
};

export type CollectionModelValueRow = {
  modelId: string;
  displayName: string;
  brand: CatalogBrand;
  tierId: CatalogTierId;
  ownedCount: number;
  totalValueCents: number;
};

export type CollectionAnalyticsSnapshot = {
  totalOwnedCount: number;
  mostValuableModel: CollectionModelValueRow | null;
  brandDistribution: DistributionRow<CatalogBrand>[];
  eraDistribution: DistributionRow<string>[];
  tierDistribution: DistributionRow<CatalogTierId>[];
};

const watchItemById = new Map(WATCH_ITEMS.map((item) => [item.id, item]));
const watchModelById = new Map(WATCH_MODELS.map((model) => [model.id, model]));
const catalogEntryById = new Map(CATALOG_ENTRIES.map((entry) => [entry.id, entry]));

function clampRatio(current: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, current / total));
}

function formatNextNeedLabel(requirements: SetBonusRequirementEntry[]): string {
  const missing = requirements.filter((entry) => !entry.met);
  if (missing.length === 0) {
    return "Complete";
  }

  const firstMissing = [...missing].sort((a, b) => {
    const delta = b.requiredCount - b.currentCount - (a.requiredCount - a.currentCount);
    if (delta !== 0) {
      return delta;
    }
    return a.itemId.localeCompare(b.itemId);
  })[0];

  const remaining = Math.max(0, firstMissing.requiredCount - firstMissing.currentCount);
  const itemName = watchItemById.get(firstMissing.itemId)?.name ?? firstMissing.itemId;
  return `Need ${remaining} more ${itemName}`;
}

function getEraLabel(rawYear: string): string {
  const parsed = Number.parseInt(rawYear, 10);
  if (!Number.isFinite(parsed)) {
    return "Unknown";
  }

  const decade = Math.floor(parsed / 10) * 10;
  return `${decade}s`;
}

function buildDistribution<T extends string>(
  counts: Map<T, number>,
  total: number,
): DistributionRow<T>[] {
  return Array.from(counts.entries())
    .map(([id, count]) => ({
      id,
      label: id,
      count,
      ratio: clampRatio(count, total),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.id.localeCompare(b.id);
    });
}

export function getSetBonusProgressRows(state: GameState): SetBonusProgressRow[] {
  return SET_BONUSES.map((bonus) => {
    const requirements = Object.entries(bonus.requirements).map(([itemId, rawRequired]) => {
      const requiredCount = Math.max(0, Math.floor(rawRequired ?? 0));
      const currentCount = Math.max(0, Math.floor(state.items[itemId as WatchItemId] ?? 0));
      return {
        itemId: itemId as WatchItemId,
        currentCount,
        requiredCount,
        met: currentCount >= requiredCount,
      };
    });

    const requiredCount = requirements.reduce((total, entry) => total + entry.requiredCount, 0);
    const metCount = requirements.reduce(
      (total, entry) => total + Math.min(entry.currentCount, entry.requiredCount),
      0,
    );
    const remainingCount = Math.max(0, requiredCount - metCount);
    const active = remainingCount === 0;

    return {
      id: bonus.id,
      name: bonus.name,
      requiredCount,
      metCount,
      remainingCount,
      ratio: clampRatio(metCount, requiredCount),
      requirements,
      active,
      nextNeedLabel: formatNextNeedLabel(requirements),
    };
  });
}

export function getNextPrestigePreview(state: GameState): PrestigePreview | null {
  const workshopUnlocked =
    state.workshopPrestigeCount > 0 ||
    state.workshopBlueprints > 0 ||
    state.maisonHeritage > 0 ||
    state.maisonReputation > 0 ||
    state.nostalgiaPoints > 0 ||
    state.nostalgiaResets > 0;
  const maisonUnlocked =
    state.maisonHeritage > 0 ||
    state.maisonReputation > 0 ||
    state.nostalgiaPoints > 0 ||
    state.nostalgiaResets > 0;

  const target: { id: PrestigeTargetId; label: string; threshold: number } = maisonUnlocked
    ? {
        id: "nostalgia",
        label: "Nostalgia prestige",
        threshold: NOSTALGIA_PRESTIGE_THRESHOLD_CENTS,
      }
    : workshopUnlocked
      ? { id: "maison", label: "Maison prestige", threshold: MAISON_PRESTIGE_THRESHOLD_CENTS }
      : {
          id: "workshop",
          label: "Workshop prestige",
          threshold: WORKSHOP_PRESTIGE_THRESHOLD_CENTS,
        };

  const rawCurrent =
    target.id === "workshop"
      ? Math.max(0, Math.floor(state.enjoymentCents))
      : target.id === "maison"
        ? Math.max(
            0,
            Math.floor(state.enjoymentCents + state.workshopBlueprints * target.threshold),
          )
        : Math.max(0, Math.floor(state.nostalgiaEnjoymentEarnedCents));

  // Preserve the historical fully-prestiged fallback for states that overshoot all enjoyment tiers.
  if (target.id === "workshop" && rawCurrent >= NOSTALGIA_PRESTIGE_THRESHOLD_CENTS) {
    return null;
  }

  const remaining = Math.max(0, target.threshold - rawCurrent);
  return {
    id: target.id,
    label: target.label,
    current: Math.min(rawCurrent, target.threshold),
    threshold: target.threshold,
    remaining,
    ratio: clampRatio(rawCurrent, target.threshold),
    effectSummary: PRESTIGE_EFFECT_SUMMARIES[target.id],
  };
}

export function getCollectionAnalyticsSnapshot(state: GameState): CollectionAnalyticsSnapshot {
  const brandCounts = new Map<CatalogBrand, number>();
  const eraCounts = new Map<string, number>();
  const tierCounts = new Map<CatalogTierId, number>();
  const valuedRows: CollectionModelValueRow[] = [];

  let totalOwnedCount = 0;

  for (const [modelId, rawOwned] of Object.entries(state.watchModels)) {
    const model = watchModelById.get(modelId);
    if (!model) {
      continue;
    }

    const item = watchItemById.get(model.tierId);
    if (!item) {
      continue;
    }

    const ownedCount = Math.max(0, Math.floor(rawOwned));
    if (ownedCount <= 0) {
      continue;
    }

    totalOwnedCount += ownedCount;
    brandCounts.set(model.brand, (brandCounts.get(model.brand) ?? 0) + ownedCount);
    tierCounts.set(model.tierId, (tierCounts.get(model.tierId) ?? 0) + ownedCount);

    const entry = catalogEntryById.get(modelId);
    const era = getEraLabel(entry?.year ?? "Unknown");
    eraCounts.set(era, (eraCounts.get(era) ?? 0) + ownedCount);

    valuedRows.push({
      modelId,
      displayName: model.displayName,
      brand: model.brand,
      tierId: model.tierId,
      ownedCount,
      totalValueCents: Math.round(item.collectionValueCents * getDuplicateRewardSum(ownedCount)),
    });
  }

  const mostValuableModel =
    valuedRows.length === 0
      ? null
      : [...valuedRows].sort((a, b) => {
          if (b.totalValueCents !== a.totalValueCents) {
            return b.totalValueCents - a.totalValueCents;
          }
          if (b.ownedCount !== a.ownedCount) {
            return b.ownedCount - a.ownedCount;
          }
          return a.modelId.localeCompare(b.modelId);
        })[0];

  return {
    totalOwnedCount,
    mostValuableModel,
    brandDistribution: buildDistribution(brandCounts, totalOwnedCount),
    eraDistribution: buildDistribution(eraCounts, totalOwnedCount),
    tierDistribution: buildDistribution(tierCounts, totalOwnedCount),
  };
}
