import type { SetBonusDefinition } from "../model/types";

export const SET_BONUSES: ReadonlyArray<SetBonusDefinition> = [
  {
    id: "starter-set",
    name: "Starter set",
    description: "Own 5 quartz + 1 automatic for a 5% boost.",
    requirements: { starter: 5, classic: 1 },
    incomeMultiplier: 1.05,
  },
  {
    id: "precision-set",
    name: "Precision set",
    description: "Own 5 automatics + 2 chronographs for 10% boost.",
    requirements: { classic: 5, chronograph: 2 },
    incomeMultiplier: 1.1,
  },
  {
    id: "complication-set",
    name: "Complication set",
    description: "Own 3 chronographs + 1 tourbillon for 15% boost.",
    requirements: { chronograph: 3, tourbillon: 1 },
    incomeMultiplier: 1.15,
  },
  {
    id: "oyster-society",
    name: "Oyster society",
    description: "Build 12 quartz + 4 automatics for 8% boost.",
    requirements: { starter: 12, classic: 4 },
    incomeMultiplier: 1.08,
  },
  {
    id: "crown-chronicle",
    name: "Crown chronicle",
    description: "Hold 4 chronographs + 1 tourbillon for 12% boost.",
    requirements: { chronograph: 4, tourbillon: 1 },
    incomeMultiplier: 1.12,
  },
  {
    id: "seamaster-society",
    name: "Seamaster society",
    description: "Keep 8 automatics + 3 chronographs for 9% boost.",
    requirements: { classic: 8, chronograph: 3 },
    incomeMultiplier: 1.09,
  },
  {
    id: "dress-circle",
    name: "Dress circle",
    description: "Maintain 10 quartz + 2 automatics for 7% boost.",
    requirements: { starter: 10, classic: 2 },
    incomeMultiplier: 1.07,
  },
  {
    id: "diver-crew",
    name: "Diver crew",
    description: "Keep 6 automatics + 2 chronographs for 8% boost.",
    requirements: { classic: 6, chronograph: 2 },
    incomeMultiplier: 1.08,
  },
  {
    id: "collector-quartet",
    name: "Collector quartet",
    description: "Hold 18 quartz + 4 automatics + 2 chronographs + 1 tourbillon for 13% boost.",
    requirements: { starter: 18, classic: 4, chronograph: 2, tourbillon: 1 },
    incomeMultiplier: 1.13,
  },
];
