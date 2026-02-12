import { formatMoneyFromCents } from "../../../game/format";
import {
  getAffordabilityEtaSecondsForDeficit,
  type WatchModelPurchaseGate,
} from "../../../game/state";
import type { CatalogTierId } from "../../../game/model/types";

export type CatalogSortOption = "default" | "brand" | "year" | "tier";

export type CatalogQuickPreset =
  | "all"
  | "affordable"
  | "unlocking-soon"
  | "best-value"
  | "needs-enjoyment";

export type CatalogMovementSectionDefinition = {
  id: CatalogTierId;
  title: string;
  description: string;
  note: string;
};

export const CATALOG_MOVEMENT_SECTIONS: ReadonlyArray<CatalogMovementSectionDefinition> = [
  {
    id: "quartz",
    title: "Quartz movement",
    description: "Battery-powered watches focused on precision and easy entry progression.",
    note: "Reliable pacing and low friction make this the quickest movement family to scale.",
  },
  {
    id: "automatic",
    title: "Automatic movement",
    description: "Rotor-driven mechanical watches with balanced reward pacing.",
    note: "Automatic references maintain reserve through wear and reward steady ownership.",
  },
  {
    id: "manual",
    title: "Manual movement",
    description: "Hand-wound mechanical watches emphasizing interaction depth and craft.",
    note: "Manual references reward active winding and detail-oriented collecting.",
  },
  {
    id: "tourbillon",
    title: "Tourbillon movement",
    description: "High-complication tourbillons reserved for prestige collection goals.",
    note: "Tourbillon references sit at the top of progression and provide premium bonuses.",
  },
];

export const CATALOG_VIRTUALIZATION_THRESHOLD = 200;
export const CATALOG_VIRTUALIZER_ESTIMATED_CARD_HEIGHT = 420;
export const CATALOG_VIRTUALIZER_OVERSCAN = 6;
export const CATALOG_MOBILE_MEDIA_QUERY = "(max-width: 720px)";

export const CATALOG_SORT_ORDER: readonly CatalogSortOption[] = ["default", "brand", "year", "tier"];

export const CATALOG_SORT_LABELS: Record<CatalogSortOption, string> = {
  default: "Default",
  brand: "Brand",
  year: "Year",
  tier: "Tier",
};

export const CATALOG_QUICK_PRESET_ORDER: readonly CatalogQuickPreset[] = [
  "all",
  "affordable",
  "unlocking-soon",
  "best-value",
  "needs-enjoyment",
];

export const CATALOG_QUICK_PRESET_LABELS: Record<CatalogQuickPreset, string> = {
  all: "All references",
  affordable: "Affordable",
  "unlocking-soon": "Unlocking soon",
  "best-value": "Best value",
  "needs-enjoyment": "Needs enjoyment",
};

export const CATALOG_QUICK_PRESET_HINTS: Record<CatalogQuickPreset, string> = {
  all: "Show every reference that matches your current filters.",
  affordable: "Only show references whose buy CTA is currently enabled.",
  "unlocking-soon": "Show locked references near their unlock threshold.",
  "best-value": "Show top value references by projected output per cash price.",
  "needs-enjoyment": "Show references blocked by enjoyment requirements.",
};

export const CATALOG_UNLOCKING_SOON_MIN_RATIO = 0.7;
export const CATALOG_BEST_VALUE_TOP_SHARE = 0.2;

export function describeGateStatus(gate: WatchModelPurchaseGate): string {
  if (gate.ok) {
    return "Ready to buy";
  }
  const reasons: string[] = [];
  if (gate.cashDeficitCents && gate.cashDeficitCents > 0) {
    reasons.push(`Need ${formatMoneyFromCents(gate.cashDeficitCents)} cash`);
  }
  if (gate.enjoymentDeficitCents && gate.enjoymentDeficitCents > 0) {
    reasons.push(`Need ${formatMoneyFromCents(gate.enjoymentDeficitCents)} enjoyment`);
  }
  return reasons.length > 0 ? reasons.join(" + ") : "Awaiting resources";
}

export function formatEtaLabel(etaSeconds: number | null): string {
  if (etaSeconds === null) {
    return "ETA unavailable";
  }
  if (etaSeconds <= 0) {
    return "Ready now";
  }
  if (etaSeconds < 60) {
    return `${etaSeconds}s`;
  }
  if (etaSeconds < 3_600) {
    return `${Math.ceil(etaSeconds / 60)}m`;
  }
  return `${Math.ceil(etaSeconds / 3_600)}h`;
}

export function getGateEtaLabel(
  gate: WatchModelPurchaseGate,
  cashRateCentsPerSec: number,
  enjoymentRateCentsPerSec: number,
): string | null {
  if (gate.ok) {
    return null;
  }

  if (gate.blocksBy === "enjoyment" && gate.enjoymentDeficitCents !== undefined) {
    const etaSeconds = getAffordabilityEtaSecondsForDeficit(
      gate.enjoymentDeficitCents,
      enjoymentRateCentsPerSec,
    );
    return `Need ${formatMoneyFromCents(gate.enjoymentDeficitCents)} more enjoyment · ETA ${formatEtaLabel(etaSeconds)}`;
  }

  if (gate.blocksBy === "cash" && gate.cashDeficitCents !== undefined) {
    const etaSeconds = getAffordabilityEtaSecondsForDeficit(
      gate.cashDeficitCents,
      cashRateCentsPerSec,
    );
    return `Need ${formatMoneyFromCents(gate.cashDeficitCents)} more cash · ETA ${formatEtaLabel(etaSeconds)}`;
  }

  return null;
}

export function formatMovementLabel(movement?: string): string {
  if (!movement) {
    return "Movement unavailable";
  }
  return `${movement.charAt(0).toUpperCase()}${movement.slice(1)} movement`;
}
