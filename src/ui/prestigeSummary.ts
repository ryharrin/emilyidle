export type PrestigeTier = "workshop" | "nostalgia";

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
    title: "Reset workshop",
    gain: [`+${gainBlueprints} Blueprints`],
    keep: [
      "Workshop upgrades you've installed",
      "Crafting parts and crafted boosts",
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
      "Workshop legacy progress (Blueprints and upgrades)",
      "Events, crafting parts, and crafted boosts",
    ],
  };
}
