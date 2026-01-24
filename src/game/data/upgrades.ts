import type { UpgradeDefinition } from "../model/types";

export const UPGRADES: ReadonlyArray<UpgradeDefinition> = [
  {
    id: "polishing-tools",
    name: "Polishing tools",
    description: "Refined finishing yields more revenue per piece.",
    basePriceCents: 500,
    priceGrowth: 1.6,
    incomeMultiplierPerLevel: 0.05,
  },
  {
    id: "assembly-jigs",
    name: "Assembly jigs",
    description: "Speed up production with repeatable fixtures.",
    basePriceCents: 5_000,
    priceGrowth: 1.7,
    incomeMultiplierPerLevel: 0.08,
    unlockMilestoneId: "collector-shelf",
  },
  {
    id: "guild-contracts",
    name: "Guild contracts",
    description: "Exclusive partnerships compound prestige earnings.",
    basePriceCents: 50_000,
    priceGrowth: 1.8,
    incomeMultiplierPerLevel: 0.12,
    unlockMilestoneId: "showcase",
  },
  {
    id: "archive-guides",
    name: "Archive guides",
    description: "Cataloged references deepen vault earnings.",
    basePriceCents: 85_000,
    priceGrowth: 1.85,
    incomeMultiplierPerLevel: 0.1,
    unlockMilestoneId: "archive-curator",
  },
];
