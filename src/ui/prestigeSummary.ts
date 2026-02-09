export type PrestigeTier = "workshop" | "maison" | "nostalgia";

export type PrestigeSummary = {
  tier: PrestigeTier;
  title: string;
  current: string[];
  next: string[];
  delta: string[];
};

export function buildWorkshopPrestigeSummary(gainBlueprints: number): PrestigeSummary {
  return {
    tier: "workshop",
    title: "Reset atelier",
    current: [
      "Current run cash and enjoyment totals",
      "Owned watch counts in your collection",
      "Collection upgrades and purchase progress",
    ],
    next: [
      "Atelier upgrades you've installed",
      "Crafting parts and crafted boosts",
      "Maison legacy (Heritage, Reputation, upgrades, and lines)",
      "Nostalgia points and unlock store purchases",
      "Catalog discoveries and achievements",
    ],
    delta: [
      `+${gainBlueprints} Blueprints`,
      "Cash and enjoyment reset to $0",
      "Collection watch ownership and upgrades reset",
    ],
  };
}

export function buildMaisonPrestigeSummary(
  gainHeritage: number,
  gainReputation: number,
): PrestigeSummary {
  return {
    tier: "maison",
    title: "Prestige atelier",
    current: [
      "Current run Collection + Atelier totals",
      "Current Maison legacy balances",
      "Collection watch ownership and upgrade state",
    ],
    next: [
      "Maison upgrades and active lines",
      "Crafting parts and crafted boosts",
      "Nostalgia points and unlock store purchases",
      "Catalog discoveries and achievements",
    ],
    delta: [
      `+${gainHeritage} Heritage`,
      `+${gainReputation} Reputation`,
      "Collection + Atelier progress resets to baseline",
    ],
  };
}

export function buildNostalgiaPrestigeSummary(gainNostalgia: number): PrestigeSummary {
  return {
    tier: "nostalgia",
    title: "Prestige for Nostalgia",
    current: [
      "Current run Collection, Career, Atelier, and Maison progress",
      "Current Nostalgia point balance",
      "Active event and crafting run state",
    ],
    next: [
      "Owned watches in your collection",
      "Catalog discoveries and tier bonuses",
      "Achievements you've unlocked",
      "Nostalgia unlock store purchases",
    ],
    delta: [
      `+${gainNostalgia} Nostalgia`,
      "Cash and enjoyment reset to $0",
      "Career, Atelier, Maison, event, and crafting progress reset",
    ],
  };
}
