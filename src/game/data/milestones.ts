import type { MilestoneDefinition } from "../model/types";

export const MILESTONES: ReadonlyArray<MilestoneDefinition> = [
  {
    id: "collector-shelf",
    name: "Collector shelf",
    description: "Showcase five pieces to unlock automatic movements.",
    requirement: { type: "totalItems", threshold: 5 },
    unlocks: { items: ["automatic"], upgrades: ["assembly-jigs"] },
  },
  {
    id: "showcase",
    name: "Collection showcase",
    description: "Reach $25k Memories to unlock manual movements.",
    requirement: { type: "collectionValue", thresholdCents: 25_000 },
    unlocks: { items: ["manual"], upgrades: ["guild-contracts"] },
  },
  {
    id: "atelier",
    name: "Master atelier",
    description: "Collect 50 pieces to unlock tourbillons.",
    requirement: { type: "totalItems", threshold: 50 },
    unlocks: { items: ["tourbillon"] },
  },
  {
    id: "archive-curator",
    name: "Archive curator",
    description: "Discover 12 catalog references to unlock archive guides.",
    requirement: { type: "catalogDiscovery", threshold: 12 },
    unlocks: { upgrades: ["archive-guides"] },
  },
];
