import type { WatchItemDefinition, WatchItemId } from "../model/types";

export const WATCH_ITEMS: ReadonlyArray<WatchItemDefinition> = [
  {
    id: "starter",
    name: "Starter Quartz",
    description: "Reliable entry pieces to seed the vault.",
    basePriceCents: 125,
    priceGrowth: 1.145,
    incomeCentsPerSec: 6,
    enjoymentCentsPerSec: 2,
    collectionValueCents: 140,
  },
  {
    id: "classic",
    name: "Classic Automatic",
    description: "Self-winding classics with steady demand.",
    basePriceCents: 1_800,
    priceGrowth: 1.17,
    incomeCentsPerSec: 36,
    enjoymentCentsPerSec: 12,
    collectionValueCents: 2_400,
    unlockMilestoneId: "collector-shelf",
  },
  {
    id: "chronograph",
    name: "Chronograph",
    description: "Complications that attract serious collectors.",
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
    description: "Prestige pieces for the vault centerpiece.",
    basePriceCents: 150_000,
    priceGrowth: 1.195,
    incomeCentsPerSec: 980,
    enjoymentCentsPerSec: 240,
    collectionValueCents: 210_000,
    unlockMilestoneId: "atelier",
  },
];

export const NOSTALGIA_UNLOCK_ORDER: WatchItemId[] = ["classic", "chronograph", "tourbillon"];

export const NOSTALGIA_UNLOCK_COSTS: Record<WatchItemId, number> = {
  starter: 0,
  classic: 1,
  chronograph: 3,
  tourbillon: 6,
};

export const WATCH_ENJOYMENT_REQUIREMENTS_CENTS: Record<WatchItemId, number> = {
  starter: 0,
  classic: 2_000,
  chronograph: 15_000,
  tourbillon: 60_000,
};
