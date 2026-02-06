export type HelpSection = {
  id: string;
  title: string;
  body: string[];
  keywords?: string[];
  relatedSectionIds?: string[];
};

export const HELP_SECTION_IDS = {
  currencies: "currencies",
  gates: "gates",
  rates: "rates",
  catalogShop: "catalog-shop",
  catalogFirst: "catalog-first",
  atelierReset: "atelier-reset",
  careerStart: "career-start",
  careerStages: "career-stages",
  careerProgression: "career-progression",
  upgrades: "upgrades",
  interactions: "interactions",
  nostalgiaUnlocks: "nostalgia-unlocks",
  wornWatchBonus: "worn-watch-bonus",
  tierBadges: "tier-badges",
} as const;

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: [
      "Browse the catalog to buy watches, build enjoyment, and unlock new tiers.",
      "Dollars come from your career salary and sessions, not from owning watches.",
      "Prestige loops reset short-term progress to earn long-term bonuses.",
    ],
  },
  {
    id: HELP_SECTION_IDS.currencies,
    title: "Currencies",
    body: [
      "Enjoyment reflects collection momentum and unlocks higher tiers.",
      "Enjoyment is sometimes spent (therapist sessions after the free first session).",
      "Dollars are spent on purchases and upgrades and earned from your career.",
      "Cash bursts can also come from interactions like quartz time-setting.",
      "Memories track sentimental value and power catalog bonuses.",
    ],
  },
  {
    id: HELP_SECTION_IDS.gates,
    title: "Gates",
    body: [
      "Some watches require a minimum enjoyment level to purchase.",
      "Cash is always spent; enjoyment is a requirement you must meet.",
      "Example: Price $120k + Enjoyment 50k means you must have 50k enjoyment and pay $120k.",
      "If you have $90k and 80k enjoyment, you are cash-gated; if $150k and 20k, you are enjoyment-gated.",
      "Enjoyment gates are checked when you buy; the requirement is not consumed.",
    ],
  },
  {
    id: HELP_SECTION_IDS.catalogFirst,
    title: "Catalog-first economy",
    body: [
      "Catalog is the primary purchase surface for watches.",
      "The catalog shop lives in the Catalog tab (and may appear elsewhere as a shortcut).",
      "Collection focuses on owned watches and bonus panels, not a separate shop.",
      "Each catalog card shows owned count, price, and the next gate if locked.",
      "Buying a watch reveals its entry and contributes to catalog discovery bonuses.",
    ],
    keywords: ["catalog-first", "collection guidance", "collection segments", "catalog focus"],
  },
  {
    id: HELP_SECTION_IDS.catalogShop,
    title: "Catalog shopping",
    body: [
      "Catalog is where you actually buy watches and review what you own.",
      "Buying duplicates yields diminishing returns; the next purchase shows the next multiplier.",
      "Cards show whether you are cash-gated or enjoyment-gated before you buy.",
      "If a card says Need $X more, you are short on cash for that purchase.",
      "If a card mentions enjoyment, you need more enjoyment before it unlocks.",
      "Why can't I buy? uses short labels (Funds, Enjoyment, Locked, Undiscovered) plus next-step hints.",
      "Owned counts update immediately after a purchase to confirm the buy.",
    ],
    keywords: ["catalog", "shopping", "buy", "purchase", "shop"],
  },
  {
    id: HELP_SECTION_IDS.tierBadges,
    title: "Tier badges",
    body: [
      "Starter badges flag entry-level quartz pieces that seed the collection.",
      "Mid-tier badges highlight mechanical classics and chronographs that drive the main progression.",
      "Luxury badges mark tourbillons reserved for prestige goals and showcase rewards.",
      "Hover a badge to read the tooltip copy and match catalog cards, Collection summary, and help text.",
    ],
    keywords: [
      "tier",
      "badge",
      "tier badges",
      "starter",
      "mid-tier",
      "luxury",
      "collection segments",
    ],
    relatedSectionIds: [HELP_SECTION_IDS.catalogShop, HELP_SECTION_IDS.catalogFirst],
  },
  {
    id: HELP_SECTION_IDS.careerStart,
    title: "Starting your career",
    body: [
      "Fresh saves start with 0 cash/sec until you enter the PhD program.",
      "Entering the program starts a small stipend and unlocks career progression.",
      "Sessions become your main lever for refreshing salary and earning burst cash.",
    ],
  },
  {
    id: HELP_SECTION_IDS.careerStages,
    title: "Career stages & choices",
    body: [
      "Stages unlock at specific career levels and only the next choice is shown.",
      "Stage choices are permanent, but you can respec to reallocate points later.",
      "Retirement ends sessions, so focus on shopping and prestige loops for progress.",
    ],
  },
  {
    id: HELP_SECTION_IDS.careerProgression,
    title: "Career progression",
    body: [
      "Career level grants points to spend in the progression tree.",
      "Fresh saves start with no salary: enter the PhD program to begin earning a stipend.",
      "Tracks unlock early and shape salary, session payout, and cooldowns.",
      "Salary runs for a limited window and expires after a few minutes if you do nothing.",
      "Sessions are the primary way to refresh the salary window.",
      "Spending career points extends the salary window, and returning later keeps it active.",
      "Sessions grant XP, cost enjoyment after the free first session, and have cooldowns.",
      "Cash/sec reflects salary and active events; sessions are burst payouts and are not averaged in.",
      "Stages unlock at set levels; only the next stage choice is shown until you reach it.",
      "You can respec to refund spent points and reallocate them.",
    ],
  },
  {
    id: HELP_SECTION_IDS.upgrades,
    title: "Upgrades",
    body: [
      "Upgrades live in their own tab, with status visible while shopping.",
      "Upgrades primarily boost enjoyment/sec; cash/sec comes from your career salary and sessions.",
      "Each upgrade shows a before/after preview so you can see the delta.",
      "If a stat line is missing from the preview, that upgrade does not affect it.",
      "Upgrades cost dollars; some may require blueprints or prestige currency.",
    ],
  },
  {
    id: HELP_SECTION_IDS.rates,
    title: "Rates",
    body: [
      "Rates are shown as base + modifiers.",
      "Events can multiply both dollars/sec and enjoyment/sec.",
      "Softcap reduces collection-derived rates above a threshold; career salary is separate.",
    ],
  },
  {
    id: HELP_SECTION_IDS.wornWatchBonus,
    title: "Worn watch bonus",
    body: [
      "You can wear one owned watch at a time. Wearing a watch increases your enjoyment/sec.",
      "The bonus depends on the worn watch bucket:",
      "Starter: x1.02 enjoyment",
      "Classic: x1.05 enjoyment",
      "Chronograph: x1.08 enjoyment",
      "Tourbillon: x1.12 enjoyment",
      "There is no scaling: switching watches updates immediately, and wearing none removes the bonus.",
    ],
  },
  {
    id: HELP_SECTION_IDS.interactions,
    title: "Interactions & mini-games",
    body: [
      "Interactions are gated by watch movement: manual winding, automatic balance, quartz time-setting.",
      "Each mini-game has Miss, Good, and Perfect tiers based on timing or stability.",
      "Winding rewards enjoyment and triggers a short cooldown on that watch.",
      "Quartz time-setting rewards a cash burst; higher tiers pay more.",
      "Automatic balance charges power reserve, boosting enjoyment while charged.",
      "Cooldowns are per watch item; you can only interact when the timer is ready.",
    ],
  },
  {
    id: HELP_SECTION_IDS.atelierReset,
    title: "Atelier reset",
    body: [
      "Atelier resets collection progress to earn Blueprints and unlock permanent upgrades.",
      "Reset gain is based on your total enjoyment at the moment you reset.",
      "The Next blueprint line shows the enjoyment needed to earn +1 blueprint on reset.",
      "A faster second run comes from Atelier upgrades plus Prestige legacy multipliers.",
      "If you are unsure, wait until the gain and next blueprint targets look worthwhile.",
    ],
  },
  {
    id: "prestige",
    title: "Prestige",
    body: [
      "Atelier resets collection progress for Blueprints and permanent upgrades.",
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
      "Clear save lives in Settings; it is local-only and asks for confirmation.",
    ],
  },
];
