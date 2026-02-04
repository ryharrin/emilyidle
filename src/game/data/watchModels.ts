import {
  CATALOG_ENTRIES,
  getCatalogEntryTags,
  type CatalogBrand,
  type CatalogEntry,
} from "../catalog";
import type { CatalogTierId } from "../model/types";
import { getTierBadgeByCatalogTier, type TierBadgeDefinition } from "../tierBadges";

export type WatchModelDefinition = {
  id: string;
  brand: CatalogBrand;
  model: string;
  tierId: CatalogTierId;
  referenceNumber: number;
  displayName: string;
  catalogEntryIds: ReadonlyArray<string>;
  tierBadge: TierBadgeDefinition;
};

const CATALOG_TIER_IDS: ReadonlyArray<CatalogTierId> = [
  "starter",
  "classic",
  "chronograph",
  "tourbillon",
];

function isCatalogTierId(value: string): value is CatalogTierId {
  return (CATALOG_TIER_IDS as ReadonlyArray<string>).includes(value);
}

function getTierIdForCatalogEntry(entry: CatalogEntry): CatalogTierId {
  const tierTag = getCatalogEntryTags(entry).find(isCatalogTierId);
  return tierTag ?? "starter";
}

export const WATCH_MODELS: ReadonlyArray<WatchModelDefinition> = (() => {
  const brandCounters = new Map<CatalogBrand, number>();

  return CATALOG_ENTRIES.map((entry) => {
    const nextReferenceNumber = (brandCounters.get(entry.brand) ?? 0) + 1;
    brandCounters.set(entry.brand, nextReferenceNumber);

    const tierId = getTierIdForCatalogEntry(entry);
    const displayName = `${entry.brand} ${entry.model} #${nextReferenceNumber}`;

    return {
      id: entry.id,
      brand: entry.brand,
      model: entry.model,
      tierId,
      referenceNumber: nextReferenceNumber,
      displayName,
      catalogEntryIds: [entry.id],
      tierBadge: getTierBadgeByCatalogTier(tierId),
    };
  });
})();

export function getWatchModels(): ReadonlyArray<WatchModelDefinition> {
  return WATCH_MODELS;
}
