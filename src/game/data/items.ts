import type { WatchItemDefinition, WatchItemId } from "../model/types";

export const WATCH_ITEMS: ReadonlyArray<WatchItemDefinition> = [
  {
    id: "quartz",
    name: "Quartz",
    description: "Battery-powered references that seed your collection.",
    movement: "quartz",
    basePriceCents: 125,
    priceGrowth: 1.145,
    incomeCentsPerSec: 6,
    enjoymentCentsPerSec: 2,
    collectionValueCents: 140,
  },
  {
    id: "automatic",
    name: "Automatic",
    description: "Self-winding mechanical references with steady demand.",
    movement: "automatic",
    basePriceCents: 1_800,
    priceGrowth: 1.17,
    incomeCentsPerSec: 36,
    enjoymentCentsPerSec: 12,
    collectionValueCents: 2_400,
    unlockMilestoneId: "collector-shelf",
  },
  {
    id: "manual",
    name: "Manual",
    description: "Hand-wound mechanical references for dedicated collectors.",
    movement: "manual",
    basePriceCents: 12_500,
    priceGrowth: 1.18,
    incomeCentsPerSec: 185,
    enjoymentCentsPerSec: 60,
    collectionValueCents: 18_000,
    unlockMilestoneId: "showcase",
  },
  {
    id: "tourbillon",
    name: "Tourbillon",
    description: "Prestige pieces for the collection centerpiece.",
    movement: "tourbillon",
    basePriceCents: 150_000,
    priceGrowth: 1.195,
    incomeCentsPerSec: 980,
    enjoymentCentsPerSec: 240,
    collectionValueCents: 210_000,
    unlockMilestoneId: "atelier",
  },
];

export const NOSTALGIA_UNLOCK_ORDER: WatchItemId[] = ["automatic", "manual", "tourbillon"];

export const NOSTALGIA_UNLOCK_COSTS: Record<WatchItemId, number> = {
  quartz: 0,
  automatic: 1,
  manual: 3,
  tourbillon: 6,
};

export const WATCH_ENJOYMENT_REQUIREMENTS_CENTS: Record<WatchItemId, number> = {
  quartz: 0,
  automatic: 1_000,
  manual: 8_000,
  tourbillon: 40_000,
};

export function getWatchBucket(id: string): WatchItemId | null {
  if (id === "quartz" || id === "automatic" || id === "manual" || id === "tourbillon") {
    return id;
  }

  return null;
}
