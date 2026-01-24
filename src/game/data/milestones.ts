import type { MilestoneDefinition } from "../model/types";

export const MILESTONES: ReadonlyArray<MilestoneDefinition> = [
  {
    id: "collector-shelf",
    name: "Collector shelf",
    description: "Showcase five pieces to unlock classic automatics.",
    requirement: { type: "totalItems", threshold: 5 },
    unlocks: { items: ["classic"], upgrades: ["assembly-jigs"] },
  },
  {
    id: "showcase",
    name: "Vault showcase",
    description: "Reach $25k Memories to unlock chronographs.",
    requirement: { type: "collectionValue", thresholdCents: 25_000 },
    unlocks: { items: ["chronograph"], upgrades: ["guild-contracts"] },
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
