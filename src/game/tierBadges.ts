import type { CatalogTierId } from "./model/types";

export type TierBadgeCategory = "starter" | "mid" | "lux";

export type TierBadgeDefinition = {
  readonly category: TierBadgeCategory;
  readonly label: string;
  readonly description: string;
  readonly backgroundVar: string;
  readonly textVar: string;
};

const TIER_BADGE_DEFINITIONS: Record<TierBadgeCategory, TierBadgeDefinition> = {
  starter: {
    category: "starter",
    label: "Starter",
    description: "Accessible quartz pieces that seed the collection.",
    backgroundVar: "--tier-starter",
    textVar: "--tier-badge-text-light",
  },
  mid: {
    category: "mid",
    label: "Mid-tier",
    description: "Mechanical classics and chronographs with strong collector appeal.",
    backgroundVar: "--tier-mid",
    textVar: "--tier-badge-text-light",
  },
  lux: {
    category: "lux",
    label: "Luxury",
    description: "Tourbillons reserved for the most opulent showcases.",
    backgroundVar: "--tier-lux",
    textVar: "--tier-badge-text-light",
  },
};

const TIER_CATEGORY_BY_CATALOG_TIER: Record<CatalogTierId, TierBadgeCategory> = {
  starter: "starter",
  classic: "mid",
  chronograph: "mid",
  tourbillon: "lux",
};

export function getTierBadgeByCategory(category: TierBadgeCategory): TierBadgeDefinition {
  return TIER_BADGE_DEFINITIONS[category];
}

export function getTierBadgeByCatalogTier(tierId: CatalogTierId): TierBadgeDefinition {
  const category = TIER_CATEGORY_BY_CATALOG_TIER[tierId] ?? "starter";
  return TIER_BADGE_DEFINITIONS[category];
}

export function getTierCategoryFromCatalogTier(tierId: CatalogTierId): TierBadgeCategory {
  return TIER_CATEGORY_BY_CATALOG_TIER[tierId] ?? "starter";
}
