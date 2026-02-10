import type { SetBonusDefinition } from "../model/types";

export const SET_BONUSES: ReadonlyArray<SetBonusDefinition> = [
  {
    id: "quartz-set",
    name: "Starter set",
    description: "Own 5 quartz + 1 automatic for a 5% boost.",
    requirements: { quartz: 5, automatic: 1 },
    incomeMultiplier: 1.05,
  },
  {
    id: "precision-set",
    name: "Precision set",
    description: "Own 5 automatics + 2 manuals for 10% boost.",
    requirements: { automatic: 5, manual: 2 },
    incomeMultiplier: 1.1,
  },
  {
    id: "complication-set",
    name: "Complication set",
    description: "Own 3 manuals + 1 tourbillon for 15% boost.",
    requirements: { manual: 3, tourbillon: 1 },
    incomeMultiplier: 1.15,
  },
  {
    id: "oyster-society",
    name: "Oyster society",
    description: "Build 12 quartz + 4 automatics for 8% boost.",
    requirements: { quartz: 12, automatic: 4 },
    incomeMultiplier: 1.08,
  },
  {
    id: "crown-chronicle",
    name: "Crown chronicle",
    description: "Hold 4 manuals + 1 tourbillon for 12% boost.",
    requirements: { manual: 4, tourbillon: 1 },
    incomeMultiplier: 1.12,
  },
  {
    id: "seamaster-society",
    name: "Seamaster society",
    description: "Keep 8 automatics + 3 manuals for 9% boost.",
    requirements: { automatic: 8, manual: 3 },
    incomeMultiplier: 1.09,
  },
  {
    id: "dress-circle",
    name: "Dress circle",
    description: "Maintain 10 quartz + 2 automatics for 7% boost.",
    requirements: { quartz: 10, automatic: 2 },
    incomeMultiplier: 1.07,
  },
  {
    id: "diver-crew",
    name: "Diver crew",
    description: "Keep 6 automatics + 2 manuals for 8% boost.",
    requirements: { automatic: 6, manual: 2 },
    incomeMultiplier: 1.08,
  },
  {
    id: "collector-quartet",
    name: "Collector quartet",
    description: "Hold 18 quartz + 4 automatics + 2 manuals + 1 tourbillon for 13% boost.",
    requirements: { quartz: 18, automatic: 4, manual: 2, tourbillon: 1 },
    incomeMultiplier: 1.13,
  },
];
