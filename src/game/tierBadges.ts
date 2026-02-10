import type { CatalogTierId } from "./model/types";

export type TierBadgeCategory = CatalogTierId;

export type TierBadgeDefinition = {
  readonly category: TierBadgeCategory;
  readonly label: string;
  readonly description: string;
  readonly backgroundVar: string;
  readonly textVar: string;
};

const TIER_BADGE_DEFINITIONS: Record<TierBadgeCategory, TierBadgeDefinition> = {
  quartz: {
    category: "quartz",
    label: "Quartz",
    description: "Battery-driven watches focused on reliability and precision.",
    backgroundVar: "--tier-starter",
    textVar: "--tier-badge-text-light",
  },
  automatic: {
    category: "automatic",
    label: "Automatic",
    description: "Self-winding mechanical watches powered by rotor motion.",
    backgroundVar: "--tier-mid",
    textVar: "--tier-badge-text-light",
  },
  manual: {
    category: "manual",
    label: "Manual",
    description: "Hand-wound mechanical watches with direct winding interaction.",
    backgroundVar: "--tier-mid",
    textVar: "--tier-badge-text-light",
  },
  tourbillon: {
    category: "tourbillon",
    label: "Tourbillon",
    description: "High-complication movement class with prestige-focused pacing.",
    backgroundVar: "--tier-lux",
    textVar: "--tier-badge-text-light",
  },
};

const TIER_CATEGORY_BY_CATALOG_TIER: Record<CatalogTierId, TierBadgeCategory> = {
  quartz: "quartz",
  automatic: "automatic",
  manual: "manual",
  tourbillon: "tourbillon",
};

export function getTierBadgeByCategory(category: TierBadgeCategory): TierBadgeDefinition {
  return TIER_BADGE_DEFINITIONS[category];
}

export function getTierBadgeByCatalogTier(tierId: CatalogTierId): TierBadgeDefinition {
  const category = TIER_CATEGORY_BY_CATALOG_TIER[tierId] ?? "quartz";
  return TIER_BADGE_DEFINITIONS[category];
}

export function getTierCategoryFromCatalogTier(tierId: CatalogTierId): TierBadgeCategory {
  return TIER_CATEGORY_BY_CATALOG_TIER[tierId] ?? "quartz";
}
