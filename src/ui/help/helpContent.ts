export type HelpSection = {
  id: string;
  title: string;
  body: string[];
};

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
    id: "currencies",
    title: "Currencies",
    body: [
      "Enjoyment reflects your collection's momentum and unlocks new tiers.",
      "Dollars are spent on purchases and scale with careers and events.",
      "Memories track sentimental value and power catalog bonuses.",
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
