export type HelpSection = {
  id: string;
  title: string;
  body: string[];
};

export const HELP_SECTION_IDS = {
  currencies: "currencies",
  gates: "gates",
  rates: "rates",
  nostalgiaUnlocks: "nostalgia-unlocks",
} as const;

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: [
      "Buy watches to grow your vault, then reinvest to unlock new lines.",
      "Every watch adds enjoyment and cash, and both unlock the next steps.",
      "Prestige loops reset short-term progress to earn long-term bonuses.",
    ],
  },
  {
    id: HELP_SECTION_IDS.currencies,
    title: "Currencies",
    body: [
      "Enjoyment reflects your collection's momentum and unlocks new tiers.",
      "Dollars are spent on purchases and scale with careers and events.",
      "Memories track sentimental value and power catalog bonuses.",
    ],
  },
  {
    id: HELP_SECTION_IDS.gates,
    title: "Gates",
    body: [
      "Some watches require a minimum enjoyment level to purchase.",
      "Cash is always spent; enjoyment is a requirement you must meet.",
      "If you're blocked, check whether the gate is enjoyment or dollars.",
    ],
  },
  {
    id: HELP_SECTION_IDS.rates,
    title: "Rates",
    body: [
      "Rates are shown as base + modifiers.",
      "Events can multiply both dollars/sec and enjoyment/sec.",
      "Softcap reduces vault dollars/sec above a threshold; therapist salary is separate.",
    ],
  },
  {
    id: "prestige",
    title: "Prestige",
    body: [
      "Atelier resets vault progress for Blueprints and permanent upgrades.",
      "Maison resets further to earn Heritage and Reputation multipliers.",
      "Nostalgia converts deep progress into a new currency and unlock store.",
    ],
  },
  {
    id: HELP_SECTION_IDS.nostalgiaUnlocks,
    title: "Nostalgia unlocks",
    body: [
      "The unlock store is ordered - unlocks must be purchased in sequence.",
      "If an item says Locked, it usually means earlier unlocks are still missing.",
      "Only the most recent unlock can be refunded.",
    ],
  },
  {
    id: "locks",
    title: "Locks",
    body: [
      "Locked items usually need more enjoyment, dollars, or a milestone.",
      "Progress bars and teaser panels show how close you are to unlocking.",
      "Keep buying and prestiging to reveal new tabs and collections.",
    ],
  },
  {
    id: "saving",
    title: "Saving",
    body: [
      "Progress autosaves frequently and when you leave the page.",
      "Use Export to copy a save string and Import to restore it later.",
      "Keep a backup before major resets or experiments.",
    ],
  },
];
