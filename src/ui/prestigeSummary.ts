export type PrestigeTier = "workshop" | "maison" | "nostalgia";

export type PrestigeSummary = {
  tier: PrestigeTier;
  title: string;
  gain: string[];
  keep: string[];
  lose: string[];
};

export function buildWorkshopPrestigeSummary(gainBlueprints: number): PrestigeSummary {
  return {
    tier: "workshop",
    title: "Reset atelier",
    gain: [`+${gainBlueprints} Blueprints`],
    keep: [
      "Atelier upgrades you've installed",
      "Crafting parts and crafted boosts",
      "Maison legacy (Heritage, Reputation, upgrades, and lines)",
      "Nostalgia points and unlock store purchases",
      "Catalog discoveries and achievements",
    ],
    lose: [
      "Vault cash and enjoyment totals",
      "Owned watch counts in your vault",
      "Vault upgrades and purchase progress",
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
    gain: [`+${gainHeritage} Heritage`, `+${gainReputation} Reputation`],
    keep: [
      "Maison upgrades and active lines",
      "Crafting parts and crafted boosts",
      "Nostalgia points and unlock store purchases",
      "Catalog discoveries and achievements",
    ],
    lose: [
      "Vault cash and enjoyment totals",
      "Owned watch counts in your vault",
      "Vault upgrades and Atelier progress (Blueprints and upgrades)",
    ],
  };
}

export function buildNostalgiaPrestigeSummary(gainNostalgia: number): PrestigeSummary {
  return {
    tier: "nostalgia",
    title: "Prestige for Nostalgia",
    gain: [`+${gainNostalgia} Nostalgia`],
    keep: [
      "Owned watches in your collection",
      "Catalog discoveries and tier bonuses",
      "Achievements you've unlocked",
      "Nostalgia unlock store purchases",
    ],
    lose: [
      "Vault cash and enjoyment totals",
      "Career level and cooldown progress",
      "All vault upgrades and automation",
      "Atelier + Maison legacy progress (Blueprints, Heritage, Reputation, lines)",
      "Events, crafting parts, and crafted boosts",
    ],
  };
}
