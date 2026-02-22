// Game loop selectors - moved from main index.ts to avoid circular dependencies
import type { GameState, EventId } from "../model/types";
import { EVENTS, getTotalItemCount } from "../model/state";
import { getEnjoymentRateCentsPerSec } from "./enjoyment";

import { getTherapistCashRateCentsPerSec } from "./therapistSalary";
import { getTherapistSessionPolicy, canPerformTherapistSession } from "./therapistSessions";
import {
  getWorkshopPrestigeGain,
  getMaisonPrestigeGain,
  canNostalgiaPrestige,
  getNostalgiaPrestigeGain,
  canMaisonPrestige,
  canWorkshopPrestige,
  isWorkshopRevealReady,
} from "./prestige";
import { getWatchItems, isItemUnlocked, canBuyItem } from "./collection";
import type { RateBreakdownAddendTerm, RateBreakdownMultiplierTerm } from "./economy";

// Re-export getCashRateBreakdown from here to avoid circular dependency issues
export function getCashRateBreakdown(
  state: GameState,
  nowMs: number,
  eventMultiplier = 1,
): {
  careerAddends: RateBreakdownAddendTerm[];
  sessionCadence: {
    supportsSessions: boolean;
    isFreeSession: boolean;
    payoutCents: number;
    cooldownMs: number;
    cooldownRemainingMs: number;
    enjoymentCostCents: number;
    cadenceCentsPerSec: number;
  };
  multiplierTerms: RateBreakdownMultiplierTerm[];
  eventMultiplier: number;
  totalCentsPerSec: number;
} {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const therapistSalaryCentsPerSec = getTherapistCashRateCentsPerSec(state, clampedNowMs);
  const sessionPolicy = getTherapistSessionPolicy(state, clampedNowMs);
  const sessionCadenceCentsPerSec =
    sessionPolicy.supportsSessions && sessionPolicy.cooldownMs > 0
      ? (sessionPolicy.cashPayoutCents * 1_000) / sessionPolicy.cooldownMs
      : 0;

  const careerAddends: RateBreakdownAddendTerm[] = [
    {
      id: "career-salary",
      label: "Career salary (passive)",
      centsPerSec: therapistSalaryCentsPerSec,
    },
  ];
  const multiplierTerms: RateBreakdownMultiplierTerm[] = [
    { id: "event", label: "Event", multiplier: eventMultiplier },
  ];

  return {
    careerAddends,
    sessionCadence: {
      supportsSessions: sessionPolicy.supportsSessions,
      isFreeSession: state.therapistCareer.freeSessionAvailable && sessionPolicy.supportsSessions,
      payoutCents: sessionPolicy.cashPayoutCents,
      cooldownMs: sessionPolicy.cooldownMs,
      cooldownRemainingMs: sessionPolicy.cooldownRemainingMs,
      enjoymentCostCents: sessionPolicy.effectiveEnjoymentCostCents,
      cadenceCentsPerSec: sessionCadenceCentsPerSec,
    },
    multiplierTerms,
    eventMultiplier,
    totalCentsPerSec: getTherapistCashRateCentsPerSec(state, clampedNowMs) * eventMultiplier,
  };
}

export type LoopUrgency = "critical" | "high" | "medium" | "low";

export type LoopActionTarget = {
  tabId:
    | "collection"
    | "career"
    | "upgrades"
    | "workshop"
    | "maison"
    | "nostalgia"
    | "catalog"
    | "stats"
    | "save";
  scrollTargetId?: string;
};

export type LoopActionCard = {
  id: string;
  label: string;
  detail: string;
  actionLabel: string;
  whyNow: string;
  target: LoopActionTarget;
};

export type FirstRunChecklistItem = {
  id: "career-start" | "first-session" | "first-watch" | "atelier-unlocked" | "first-atelier-reset";
  label: string;
  complete: boolean;
};

export type FirstRunChecklist = {
  visible: boolean;
  completedCount: number;
  totalCount: number;
  items: ReadonlyArray<FirstRunChecklistItem>;
};

export type EconomyForecastPoint = {
  id: "plus-1m" | "plus-5m" | "plus-10m";
  label: "+1m" | "+5m" | "+10m";
  horizonMs: number;
  projectedCashDeltaCents: number;
  projectedEnjoymentDeltaCents: number;
  averageEventMultiplier: number;
};

export type EconomyForecastStrip = {
  points: ReadonlyArray<EconomyForecastPoint>;
  reason: string;
};

export type PrimaryLoopAction = {
  urgency: LoopUrgency;
  urgencyReason: string;
  primary: LoopActionCard;
  secondary: LoopActionCard;
  checklist: FirstRunChecklist;
  forecast: EconomyForecastStrip;
};

export type GuideLane = "now" | "next" | "later";

export type GuideLaneAction = LoopActionCard & { lane: GuideLane };

export type GuideLanes = {
  urgency: LoopUrgency;
  urgencyReason: string;
  primary: GuideLaneAction;
  now: GuideLaneAction;
  next: GuideLaneAction;
  later: GuideLaneAction;
  checklist: FirstRunChecklist;
  forecast: EconomyForecastStrip;
};

export type EventCalendarEntry = {
  id: EventId;
  name: string;
  description: string;
  status: "active" | "upcoming" | "ready";
  countdownMs: number;
  countdownLabel: string;
  bonusMultiplier: number;
  bonusLabel: string;
  bonusExplanation: string;
};

export type EventCalendarModel = {
  active: EventCalendarEntry[];
  upcoming: EventCalendarEntry[];
  ready: EventCalendarEntry[];
};

function formatEventCountdownLabel(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.ceil(safeMs / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.ceil(totalSeconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const totalHours = Math.ceil(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours}h`;
  }

  const totalDays = Math.ceil(totalHours / 24);
  return `${totalDays}d`;
}

function isEventActive(state: GameState, eventId: EventId, nowMs: number): boolean {
  const entry = state.eventStates[eventId];
  if (!entry) {
    return false;
  }
  return nowMs < entry.activeUntilMs;
}

import { getEventIncomeMultiplier } from "./economy";

function getAverageActiveEventMultiplier(
  state: GameState,
  nowMs: number,
  horizonMs: number,
): number {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const clampedHorizonMs = Number.isFinite(horizonMs) ? Math.max(0, Math.floor(horizonMs)) : 0;

  if (clampedHorizonMs <= 0) {
    return getEventIncomeMultiplier(state, clampedNowMs);
  }

  const horizonEndMs = clampedNowMs + clampedHorizonMs;
  const activeEvents = EVENTS.map((event) => {
    const eventState = state.eventStates[event.id] ?? { activeUntilMs: 0, nextAvailableAtMs: 0 };
    const effectiveMultiplier = eventState.incomeMultiplier ?? event.incomeMultiplier;

    return {
      activeUntilMs: Math.max(0, Math.floor(eventState.activeUntilMs)),
      multiplier: Math.max(1, effectiveMultiplier),
    };
  }).filter((event) => event.activeUntilMs > clampedNowMs);

  if (activeEvents.length === 0) {
    return 1;
  }

  const boundaries = new Set<number>([clampedNowMs, horizonEndMs]);
  for (const event of activeEvents) {
    if (event.activeUntilMs > clampedNowMs && event.activeUntilMs < horizonEndMs) {
      boundaries.add(event.activeUntilMs);
    }
  }

  const sorted = Array.from(boundaries).sort((a, b) => a - b);
  if (sorted.length <= 1) {
    return 1;
  }

  let weightedMultiplierMs = 0;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const segmentStartMs = sorted[index];
    const segmentEndMs = sorted[index + 1];
    const segmentDurationMs = Math.max(0, segmentEndMs - segmentStartMs);
    if (segmentDurationMs <= 0) {
      continue;
    }

    const segmentMultiplier = activeEvents.reduce((multiplier, event) => {
      if (event.activeUntilMs > segmentStartMs) {
        return multiplier * event.multiplier;
      }
      return multiplier;
    }, 1);
    weightedMultiplierMs += segmentMultiplier * segmentDurationMs;
  }

  return weightedMultiplierMs > 0 ? weightedMultiplierMs / clampedHorizonMs : 1;
}

export function getEventCalendar(state: GameState, nowMs: number): EventCalendarModel {
  const model: EventCalendarModel = {
    active: [],
    upcoming: [],
    ready: [],
  };

  for (const event of EVENTS) {
    const eventState = state.eventStates[event.id] ?? { activeUntilMs: 0, nextAvailableAtMs: 0 };
    const effectiveMultiplier = eventState.incomeMultiplier ?? event.incomeMultiplier;

    if (nowMs < eventState.activeUntilMs) {
      const countdownMs = Math.max(0, eventState.activeUntilMs - nowMs);
      model.active.push({
        id: event.id,
        name: event.name,
        description: event.description,
        status: "active",
        countdownMs,
        countdownLabel: formatEventCountdownLabel(countdownMs),
        bonusMultiplier: effectiveMultiplier,
        bonusLabel: `Income x${effectiveMultiplier.toFixed(2)}`,
        bonusExplanation: "Event is live now. Earnings include the active event multiplier.",
      });
      continue;
    }

    if (nowMs < eventState.nextAvailableAtMs) {
      const countdownMs = Math.max(0, eventState.nextAvailableAtMs - nowMs);
      model.upcoming.push({
        id: event.id,
        name: event.name,
        description: event.description,
        status: "upcoming",
        countdownMs,
        countdownLabel: formatEventCountdownLabel(countdownMs),
        bonusMultiplier: effectiveMultiplier,
        bonusLabel: `Income x${effectiveMultiplier.toFixed(2)}`,
        bonusExplanation: "Event returns after cooldown. Countdown shows time until it reopens.",
      });
      continue;
    }

    model.ready.push({
      id: event.id,
      name: event.name,
      description: event.description,
      status: "ready",
      countdownMs: 0,
      countdownLabel: "Ready",
      bonusMultiplier: effectiveMultiplier,
      bonusLabel: `Income x${effectiveMultiplier.toFixed(2)}`,
      bonusExplanation: "Event can trigger immediately once its activation condition is met.",
    });
  }

  const sortByCountdown = (a: EventCalendarEntry, b: EventCalendarEntry) =>
    a.countdownMs - b.countdownMs;
  model.active.sort(sortByCountdown);
  model.upcoming.sort(sortByCountdown);
  model.ready.sort((a, b) => a.name.localeCompare(b.name));

  return model;
}

export function getFirstRunChecklist(state: GameState): FirstRunChecklist {
  const items: FirstRunChecklistItem[] = [
    {
      id: "career-start",
      label: "Start the therapist career",
      complete: state.therapistCareer.careerStartId !== null,
    },
    {
      id: "first-session",
      label: "Complete your first therapist session",
      complete: state.therapistCareer.lastSessionAtMs > 0 || state.therapistCareer.level > 0,
    },
    {
      id: "first-watch",
      label: "Buy your first watch model",
      complete: getTotalItemCount(state) > 0,
    },
    {
      id: "atelier-unlocked",
      label: "Reach Atelier reveal threshold",
      complete: isWorkshopRevealReady(state) || state.unlockedMilestones.includes("atelier"),
    },
    {
      id: "first-atelier-reset",
      label: "Complete one Atelier prestige reset",
      complete: state.workshopPrestigeCount > 0,
    },
  ];
  const completedCount = items.reduce((count, item) => count + (item.complete ? 1 : 0), 0);
  const firstLoopComplete = state.workshopPrestigeCount > 0 || state.nostalgiaResets > 0;

  return {
    visible: !firstLoopComplete && completedCount < items.length,
    completedCount,
    totalCount: items.length,
    items,
  };
}

export function getEconomyForecastStrip(state: GameState, nowMs: number): EconomyForecastStrip {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const baseCashRateCentsPerSec = getTherapistCashRateCentsPerSec(state, clampedNowMs);
  const baseEnjoymentRateCentsPerSec = getEnjoymentRateCentsPerSec(state);
  const pointsConfig: ReadonlyArray<{
    id: EconomyForecastPoint["id"];
    label: EconomyForecastPoint["label"];
    horizonMs: number;
  }> = [
    { id: "plus-1m", label: "+1m", horizonMs: 60_000 },
    { id: "plus-5m", label: "+5m", horizonMs: 5 * 60_000 },
    { id: "plus-10m", label: "+10m", horizonMs: 10 * 60_000 },
  ];

  const points: EconomyForecastPoint[] = pointsConfig.map((config) => {
    const averageEventMultiplier = getAverageActiveEventMultiplier(
      state,
      clampedNowMs,
      config.horizonMs,
    );
    const projectedCashDeltaCents = Math.max(
      0,
      Math.floor((baseCashRateCentsPerSec * averageEventMultiplier * config.horizonMs) / 1000),
    );
    const projectedEnjoymentDeltaCents = Math.max(
      0,
      Math.floor((baseEnjoymentRateCentsPerSec * averageEventMultiplier * config.horizonMs) / 1000),
    );

    return {
      id: config.id,
      label: config.label,
      horizonMs: config.horizonMs,
      projectedCashDeltaCents,
      projectedEnjoymentDeltaCents,
      averageEventMultiplier,
    };
  });

  const activeEventCount = EVENTS.reduce(
    (count, event) => count + (isEventActive(state, event.id, clampedNowMs) ? 1 : 0),
    0,
  );

  return {
    points,
    reason:
      activeEventCount > 0
        ? "Includes active event bonuses and their expiry windows."
        : "Uses current baseline rates with no active event bonus.",
  };
}

function withGuideLane(action: LoopActionCard, lane: GuideLane): GuideLaneAction {
  return {
    ...action,
    lane,
  };
}

function hasAffordableUnlockedWatch(state: GameState): boolean {
  const items = getWatchItems();
  return items.some((item) => isItemUnlocked(state, item.id) && canBuyItem(state, item.id, 1));
}

export function getPrimaryLoopAction(state: GameState, nowMs: number): PrimaryLoopAction {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const checklist = getFirstRunChecklist(state);
  const forecast = getEconomyForecastStrip(state, clampedNowMs);
  const careerStarted = state.therapistCareer.careerStartId !== null;
  const sessionReady = canPerformTherapistSession(state, clampedNowMs);
  const nostalgiaGain = getNostalgiaPrestigeGain(state);
  const maisonGain = getMaisonPrestigeGain(state);
  const atelierGain = getWorkshopPrestigeGain(state);
  const activeEventCount = EVENTS.reduce(
    (count, event) => count + (isEventActive(state, event.id, clampedNowMs) ? 1 : 0),
    0,
  );

  if (!careerStarted) {
    return {
      urgency: "critical",
      urgencyReason: "Career is the opening gate for salary, sessions, and long-loop progression.",
      primary: {
        id: "start-career",
        label: "Start your therapist career",
        detail: "Enter the PhD path to unlock salary cadence, sessions, and progression tracks.",
        actionLabel: "Open Career",
        whyNow: "Without career start, your main cash loop stays blocked.",
        target: { tabId: "career" },
      },
      secondary: {
        id: "review-save-settings",
        label: "Review core settings",
        detail: "Set theme, notifications, and tab visibility before your first run.",
        actionLabel: "Open Settings",
        whyNow: "Establishing controls early prevents accidental friction during onboarding.",
        target: { tabId: "save", scrollTargetId: "settings-visibility" },
      },
      checklist,
      forecast,
    };
  }

  if (canNostalgiaPrestige(state)) {
    return {
      urgency: "critical",
      urgencyReason: "Nostalgia is ready and converts this run into permanent account power.",
      primary: {
        id: "claim-nostalgia",
        label: "Claim Nostalgia prestige",
        detail: "Reset at peak and bank permanent points for future runs.",
        actionLabel: "Open Nostalgia",
        whyNow: `You can claim +${nostalgiaGain.toLocaleString()} Nostalgia right now.`,
        target: { tabId: "nostalgia", scrollTargetId: "nostalgia-preview" },
      },
      secondary: {
        id: "review-reset-preferences",
        label: "Audit reset preferences",
        detail: "Confirm unlock prompts and visibility settings before reset.",
        actionLabel: "Open Settings",
        whyNow: "A quick check prevents accidental unlock flow mistakes post-reset.",
        target: { tabId: "save", scrollTargetId: "settings-visibility" },
      },
      checklist,
      forecast,
    };
  }

  if (canMaisonPrestige(state)) {
    return {
      urgency: "high",
      urgencyReason: "Maison prestige is available and can lock in legacy multipliers this run.",
      primary: {
        id: "prepare-maison-prestige",
        label: "Prepare Maison prestige",
        detail: "Review the reset to claim Heritage and Reputation.",
        actionLabel: "Open Maison",
        whyNow: `Current reset yields +${maisonGain.toLocaleString()} Heritage.`,
        target: { tabId: "maison", scrollTargetId: "maison-reset" },
      },
      secondary: {
        id: "finalize-prestige-buys",
        label: "Finalize pre-reset purchases",
        detail: "Spend remaining cash on compounding purchases before resetting.",
        actionLabel: "Open Collection",
        whyNow: "Last-minute buys can improve your restart velocity.",
        target: { tabId: "collection", scrollTargetId: "collection-overview" },
      },
      checklist,
      forecast,
    };
  }

  if (canWorkshopPrestige(state)) {
    return {
      urgency: "high",
      urgencyReason:
        "Atelier prestige is ready, enabling blueprint progression and compounding boosts.",
      primary: {
        id: "prepare-atelier-prestige",
        label: "Prepare Atelier prestige",
        detail: "Reset when ready to convert enjoyment into blueprints.",
        actionLabel: "Open Workshop",
        whyNow: `This reset currently yields +${atelierGain.toLocaleString()} blueprints.`,
        target: { tabId: "workshop", scrollTargetId: "workshop-reset" },
      },
      secondary: {
        id: "tighten-upgrade-path",
        label: "Tighten your upgrade path",
        detail: "Spend cash on value upgrades to improve your next loop start.",
        actionLabel: "Open Upgrades",
        whyNow: "Spending before reset can increase immediate post-reset output.",
        target: { tabId: "upgrades", scrollTargetId: "collection-upgrades" },
      },
      checklist,
      forecast,
    };
  }

  if (sessionReady) {
    return {
      urgency: "high",
      urgencyReason: "A session is currently actionable and directly boosts salary progression.",
      primary: {
        id: "run-career-session",
        label: "Run your next therapist session",
        detail: "Sessions generate cash and accelerate career milestones.",
        actionLabel: "Go to Career",
        whyNow: "Session availability is a high-leverage career progression window.",
        target: { tabId: "career" },
      },
      secondary: {
        id: "convert-cash-into-collection",
        label: "Convert cash into collection growth",
        detail: "Buy catalog watches to scale enjoyment and unlocks.",
        actionLabel: "Open Catalog",
        whyNow: "New purchases raise baseline rates for every subsequent tick.",
        target: { tabId: "catalog", scrollTargetId: "catalog-shop" },
      },
      checklist,
      forecast,
    };
  }

  return {
    urgency: activeEventCount > 0 ? "high" : "medium",
    urgencyReason:
      activeEventCount > 0
        ? "An active event bonus is running; prioritize actions that capitalize on current rates."
        : "No immediate gate is blocking progression, so prioritize steady compounding.",
    primary: {
      id: "expand-collection",
      label: "Expand your collection",
      detail: "Buy affordable watches to push enjoyment and memory growth.",
      actionLabel: "Open Catalog",
      whyNow:
        activeEventCount > 0
          ? "Active event bonuses amplify each purchase's short-term return."
          : "Baseline compounding is strongest when you keep ownership growing.",
      target: { tabId: "catalog", scrollTargetId: "catalog-shop" },
    },
    secondary: {
      id: "check-milestone-progress",
      label: "Check milestone progress",
      detail: "Review upcoming unlocks and plan your next purchases.",
      actionLabel: "Open Collection",
      whyNow: "Tracking milestones helps prioritize which watches to unlock next.",
      target: { tabId: "collection", scrollTargetId: "collection-overview" },
    },
    checklist,
    forecast,
  };
}

export function getGuideLanes(state: GameState, nowMs: number): GuideLanes {
  const clampedNowMs = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const loopAction = getPrimaryLoopAction(state, clampedNowMs);
  const now = withGuideLane(loopAction.primary, "now");
  const careerStarted = state.therapistCareer.careerStartId !== null;
  const sessionReady = canPerformTherapistSession(state, clampedNowMs);
  const prestigeReady =
    canNostalgiaPrestige(state) || canMaisonPrestige(state) || canWorkshopPrestige(state);
  const affordableWatchReady = hasAffordableUnlockedWatch(state);

  let next: LoopActionCard = loopAction.secondary;
  let later: LoopActionCard = {
    id: "plan-next-milestone",
    label: "Plan your next milestone",
    detail: "Check upcoming unlocks and set your next collection goal.",
    actionLabel: "Open Collection",
    whyNow: "Planning ahead helps you prioritize which watches to save for.",
    target: { tabId: "collection", scrollTargetId: "collection-overview" },
  };

  if (!careerStarted) {
    next = {
      id: "build-first-watch-buffer",
      label: "Build toward your first collection purchase",
      detail: "Use baseline income to afford your first watch and start enjoyment growth.",
      actionLabel: "Open Catalog",
      whyNow: "Your first purchase unlocks stronger compounding loops.",
      target: { tabId: "catalog", scrollTargetId: "catalog-shop" },
    };
    later = loopAction.secondary;
  } else if (prestigeReady) {
    next = loopAction.secondary;
    later = affordableWatchReady
      ? {
          id: "position-post-reset-ramp",
          label: "Plan your post-reset ramp",
          detail: "Queue high-impact watch purchases to accelerate the next loop.",
          actionLabel: "Open Catalog",
          whyNow: "A reset is strongest when your restart route is already planned.",
          target: { tabId: "catalog", scrollTargetId: "catalog-shop" },
        }
      : later;
  } else if (sessionReady) {
    next = loopAction.secondary;
    later = {
      id: "queue-upgrade-follow-up",
      label: "Queue your upgrade follow-up",
      detail: "After session cash lands, route it into high-value upgrades.",
      actionLabel: "Open Upgrades",
      whyNow: "Converting session cash quickly keeps momentum high.",
      target: { tabId: "upgrades", scrollTargetId: "collection-upgrades" },
    };
  } else if (affordableWatchReady) {
    next = {
      id: "buy-affordable-watch",
      label: "Buy your next affordable watch",
      detail: "Incremental ownership growth improves baseline enjoyment and income.",
      actionLabel: "Open Catalog",
      whyNow: "Affordable purchases are the most reliable compounding move right now.",
      target: { tabId: "catalog", scrollTargetId: "catalog-shop" },
    };
    later = loopAction.secondary;
  } else {
    next = {
      id: "stabilize-income-cycle",
      label: "Stabilize your income cycle",
      detail: "Wait for cooldowns or rates, then re-enter with the highest-value action.",
      actionLabel: "Open Career",
      whyNow: "No immediate spend is available, so prepare the next actionable window.",
      target: { tabId: "career" },
    };
    later = loopAction.secondary;
  }

  if (next.id === now.id) {
    next = later;
  }
  if (later.id === now.id || later.id === next.id) {
    later = {
      id: "review-collection-progress",
      label: "Review collection progress",
      detail: "Check your watch collection and plan your next acquisition.",
      actionLabel: "Open Collection",
      whyNow: "Collection review helps you track ownership and plan growth.",
      target: { tabId: "collection", scrollTargetId: "collection-overview" },
    };
  }

  return {
    urgency: loopAction.urgency,
    urgencyReason: loopAction.urgencyReason,
    primary: now,
    now,
    next: withGuideLane(next, "next"),
    later: withGuideLane(later, "later"),
    checklist: loopAction.checklist,
    forecast: loopAction.forecast,
  };
}
