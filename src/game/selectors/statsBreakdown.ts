import type { RateBreakdownMultiplierTerm } from "./index";

export type StatsModifierGroup = {
  id: string;
  label: string;
  multiplier: number;
  contributionCentsPerSec: number;
  terms: RateBreakdownMultiplierTerm[];
};

type ModifierGroupDefinition = {
  id: string;
  label: string;
  matcher: (term: RateBreakdownMultiplierTerm) => boolean;
};

const MODIFIER_GROUP_DEFINITIONS: ModifierGroupDefinition[] = [
  {
    id: "progression",
    label: "Progression modifiers",
    matcher: (term) => term.id !== "event",
  },
  {
    id: "system",
    label: "System modifiers",
    matcher: (term) => term.id === "event",
  },
];

export function getStatModifierGroups(
  baseCentsPerSec: number,
  multiplierTerms: RateBreakdownMultiplierTerm[],
): StatsModifierGroup[] {
  const groups: StatsModifierGroup[] = [];
  let remainingTerms = [...multiplierTerms];
  let runningTotal = baseCentsPerSec;

  for (const definition of MODIFIER_GROUP_DEFINITIONS) {
    const groupTerms = remainingTerms.filter(definition.matcher);
    remainingTerms = remainingTerms.filter((term) => !groupTerms.includes(term));
    if (groupTerms.length === 0) {
      continue;
    }

    const multiplier = groupTerms.reduce((acc, term) => acc * term.multiplier, 1);
    const nextTotal = runningTotal * multiplier;
    const contribution = nextTotal - runningTotal;

    groups.push({
      id: definition.id,
      label: definition.label,
      multiplier,
      contributionCentsPerSec: contribution,
      terms: groupTerms,
    });

    runningTotal = nextTotal;
  }

  if (remainingTerms.length > 0) {
    const multiplier = remainingTerms.reduce((acc, term) => acc * term.multiplier, 1);
    const nextTotal = runningTotal * multiplier;
    const contribution = nextTotal - runningTotal;

    groups.push({
      id: "other",
      label: "Other modifiers",
      multiplier,
      contributionCentsPerSec: contribution,
      terms: remainingTerms,
    });
  }

  return groups;
}
