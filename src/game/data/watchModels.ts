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

// Phase 46 adds new low/mid/lux models so each lane carries narrative metadata and steady pacing:
// - Starter (Omega Aurora Frost + Seashore Drift) keeps enjoyment/cash anchors light while remaining first-wave friendly.
// - Mid-tier (Jaeger-LeCoultre Atmos VSP + Cartier Ballon de Lumière Chrono) mixes automatic and chrono stories with predictable reserve behavior.
// - Luxury (Audemars Piguet Luminous Tourbillon + Rolex Celestial Tourbillon) focuses on high-end pacing, tourbillon drama, and prestige multipliers.
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
