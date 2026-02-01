import type {
  CareerExpansionFocusId,
  CareerModalityId,
  CareerOperatingStyleId,
  CareerTrackId,
} from "../model/types";

export type CareerStageId =
  | "grad-student"
  | "licensed-associate"
  | "specialist-certification"
  | "practice-builder"
  | "private-practice-owner"
  | "retirement";

export type CareerStageDefinition = {
  id: CareerStageId;
  label: string;
  description: string;
  unlockLevel: number;
};

export type CareerChoiceEffect = {
  salaryMultiplier: number;
  sessionCashPayoutMultiplier: number;
  sessionCooldownMultiplier: number;
  sessionEnjoymentCostMultiplier: number;
};

export type CareerStageChoiceDefinition<ChoiceId extends string> = {
  id: ChoiceId;
  label: string;
  description: string;
  effects: CareerChoiceEffect;
};

export const CAREER_STAGES: ReadonlyArray<CareerStageDefinition> = [
  {
    id: "grad-student",
    label: "Grad student",
    description: "Build foundations and raise your career level.",
    unlockLevel: 1,
  },
  {
    id: "licensed-associate",
    label: "Licensed associate",
    description: "Choose a track and lock in your core money loop.",
    unlockLevel: 3,
  },
  {
    id: "specialist-certification",
    label: "Specialist certification",
    description: "Pick a modality and refine your cadence.",
    unlockLevel: 6,
  },
  {
    id: "practice-builder",
    label: "Practice builder",
    description: "Choose your operating style and scale your work.",
    unlockLevel: 10,
  },
  {
    id: "private-practice-owner",
    label: "Practice owner",
    description: "Pick an expansion focus for lasting income leverage.",
    unlockLevel: 15,
  },
  {
    id: "retirement",
    label: "Retirement",
    description: "Steady, moderate income with fewer obligations.",
    unlockLevel: 20,
  },
];

export const CAREER_TRACK_EFFECTS: ReadonlyArray<CareerStageChoiceDefinition<CareerTrackId>> = [
  {
    id: "private-practice",
    label: "Private practice",
    description: "Sessions for bursts of cash; lighter base salary.",
    effects: {
      salaryMultiplier: 0.95,
      sessionCashPayoutMultiplier: 1,
      sessionCooldownMultiplier: 1,
      sessionEnjoymentCostMultiplier: 1,
    },
  },
  {
    id: "va-hospital",
    label: "VA hospital",
    description: "Steady salary work anchored in coordinated care.",
    effects: {
      salaryMultiplier: 1.1,
      sessionCashPayoutMultiplier: 1,
      sessionCooldownMultiplier: 1,
      sessionEnjoymentCostMultiplier: 1,
    },
  },
  {
    id: "research-teaching",
    label: "Research & teaching",
    description: "Consistent salary with long-term compounding rhythm.",
    effects: {
      salaryMultiplier: 1.05,
      sessionCashPayoutMultiplier: 1,
      sessionCooldownMultiplier: 1,
      sessionEnjoymentCostMultiplier: 1,
    },
  },
];

export const CAREER_MODALITIES: ReadonlyArray<CareerStageChoiceDefinition<CareerModalityId>> = [
  {
    id: "cbt",
    label: "CBT",
    description: "Tighter structure. Slightly faster session cadence.",
    effects: {
      salaryMultiplier: 1.04,
      sessionCashPayoutMultiplier: 1,
      sessionCooldownMultiplier: 0.95,
      sessionEnjoymentCostMultiplier: 1,
    },
  },
  {
    id: "psychodynamic",
    label: "Psychodynamic",
    description: "Deeper pacing. Higher value per session.",
    effects: {
      salaryMultiplier: 1.03,
      sessionCashPayoutMultiplier: 1.1,
      sessionCooldownMultiplier: 1.1,
      sessionEnjoymentCostMultiplier: 1.05,
    },
  },
  {
    id: "act",
    label: "ACT",
    description: "Flexible flow. Cheaper sessions, slightly lower payout.",
    effects: {
      salaryMultiplier: 1.02,
      sessionCashPayoutMultiplier: 0.95,
      sessionCooldownMultiplier: 1,
      sessionEnjoymentCostMultiplier: 0.9,
    },
  },
];

export const CAREER_OPERATING_STYLES: ReadonlyArray<
  CareerStageChoiceDefinition<CareerOperatingStyleId>
> = [
  {
    id: "boutique",
    label: "Boutique",
    description: "Fewer sessions, higher per-session value.",
    effects: {
      salaryMultiplier: 1.06,
      sessionCashPayoutMultiplier: 1.15,
      sessionCooldownMultiplier: 1.15,
      sessionEnjoymentCostMultiplier: 1.1,
    },
  },
  {
    id: "high-volume",
    label: "High volume",
    description: "More sessions, faster cadence.",
    effects: {
      salaryMultiplier: 1.08,
      sessionCashPayoutMultiplier: 0.9,
      sessionCooldownMultiplier: 0.8,
      sessionEnjoymentCostMultiplier: 1.15,
    },
  },
  {
    id: "group-practice",
    label: "Group practice",
    description: "Balanced cadence with steady uplift.",
    effects: {
      salaryMultiplier: 1.07,
      sessionCashPayoutMultiplier: 1,
      sessionCooldownMultiplier: 0.9,
      sessionEnjoymentCostMultiplier: 1,
    },
  },
];

export const CAREER_EXPANSION_FOCUSES: ReadonlyArray<
  CareerStageChoiceDefinition<CareerExpansionFocusId>
> = [
  {
    id: "referrals",
    label: "Referrals",
    description: "Reliable pipeline. Smoother, slightly better payouts.",
    effects: {
      salaryMultiplier: 1.1,
      sessionCashPayoutMultiplier: 1.08,
      sessionCooldownMultiplier: 0.95,
      sessionEnjoymentCostMultiplier: 1,
    },
  },
  {
    id: "media",
    label: "Media",
    description: "Big reach. Higher upside with higher session cost.",
    effects: {
      salaryMultiplier: 1.12,
      sessionCashPayoutMultiplier: 1.18,
      sessionCooldownMultiplier: 1.05,
      sessionEnjoymentCostMultiplier: 1.15,
    },
  },
  {
    id: "supervision",
    label: "Supervision",
    description: "Mentor others. Higher salary, less session focus.",
    effects: {
      salaryMultiplier: 1.14,
      sessionCashPayoutMultiplier: 0.88,
      sessionCooldownMultiplier: 1,
      sessionEnjoymentCostMultiplier: 0.95,
    },
  },
];
