import type { GameState, PersistedGameState } from "./state";
import type { WatchPurchaseSnapshot } from "./model/types";
import { createStateFromSave } from "./state";

const SAVE_KEY = "emily-idle:save";
const LEGACY_SAVE_KEY = "watch-idle:save";
const CURRENT_SAVE_VERSION = 2 as const;

type SaveV2 = {
  version: typeof CURRENT_SAVE_VERSION;
  savedAt: string;
  lastSimulatedAtMs: number;
  state: GameState;
};

export type SaveDecodeResult = { ok: true; save: SaveV2 } | { ok: false; error: string };

export type SaveLoadResult =
  | { ok: true; save: SaveV2 }
  | { ok: false; empty: true }
  | { ok: false; error: string };

export type SavePersistResult = { ok: true } | { ok: false; error: string };

type SaveParseResult = { ok: true; save: SaveV2 } | { ok: false; error: string };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function sanitizeState(value: unknown): GameState | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const therapistRecord =
    typeof record.therapistCareer === "object" && record.therapistCareer !== null
      ? (record.therapistCareer as Record<string, unknown>)
      : null;

  const currencyCents = record.currencyCents;
  if (!isFiniteNumber(currencyCents)) {
    return null;
  }

  const persisted: PersistedGameState = {
    currencyCents: Math.max(0, currencyCents),
    wornWatchId:
      record.wornWatchId === null
        ? null
        : typeof record.wornWatchId === "string"
          ? record.wornWatchId
          : undefined,
    interactionNextAvailableAtMsByItem:
      typeof record.interactionNextAvailableAtMsByItem === "object" &&
      record.interactionNextAvailableAtMsByItem !== null
        ? (record.interactionNextAvailableAtMsByItem as Record<string, number>)
        : {},
    powerReserveByItem:
      typeof record.powerReserveByItem === "object" && record.powerReserveByItem !== null
        ? (record.powerReserveByItem as Record<string, number>)
        : {},
    items:
      typeof record.items === "object" && record.items !== null
        ? (record.items as Record<string, number>)
        : {},
    watchModels:
      typeof record.watchModels === "object" && record.watchModels !== null
        ? (record.watchModels as Record<string, number>)
        : {},
    upgrades:
      typeof record.upgrades === "object" && record.upgrades !== null
        ? (record.upgrades as Record<string, number>)
        : {},
    unlockedMilestones: Array.isArray(record.unlockedMilestones)
      ? record.unlockedMilestones.filter((entry): entry is string => typeof entry === "string")
      : [],
    workshopBlueprints: isFiniteNumber(record.workshopBlueprints) ? record.workshopBlueprints : 0,
    workshopPrestigeCount: isFiniteNumber(record.workshopPrestigeCount)
      ? record.workshopPrestigeCount
      : 0,
    workshopUpgrades:
      typeof record.workshopUpgrades === "object" && record.workshopUpgrades !== null
        ? (record.workshopUpgrades as Record<string, boolean>)
        : {},
    maisonHeritage: isFiniteNumber(record.maisonHeritage) ? record.maisonHeritage : 0,
    maisonReputation: isFiniteNumber(record.maisonReputation) ? record.maisonReputation : 0,
    maisonUpgrades:
      typeof record.maisonUpgrades === "object" && record.maisonUpgrades !== null
        ? (record.maisonUpgrades as Record<string, boolean>)
        : {},
    maisonLines:
      typeof record.maisonLines === "object" && record.maisonLines !== null
        ? (record.maisonLines as Record<string, boolean>)
        : {},
    achievementUnlocks: Array.isArray(record.achievementUnlocks)
      ? record.achievementUnlocks.filter((entry): entry is string => typeof entry === "string")
      : [],
    eventStates:
      typeof record.eventStates === "object" && record.eventStates !== null
        ? (record.eventStates as Record<
            string,
            { activeUntilMs: number; nextAvailableAtMs: number }
          >)
        : {},
    discoveredCatalogEntries: Array.isArray(record.discoveredCatalogEntries)
      ? record.discoveredCatalogEntries.filter(
          (entry): entry is string => typeof entry === "string",
        )
      : [],
    catalogTierUnlocks: Array.isArray(record.catalogTierUnlocks)
      ? record.catalogTierUnlocks.filter((entry): entry is string => typeof entry === "string")
      : [],
    enjoymentCents: isFiniteNumber(record.enjoymentCents) ? Math.max(0, record.enjoymentCents) : 0,
    nostalgiaPoints: isFiniteNumber(record.nostalgiaPoints)
      ? Math.max(0, Math.floor(record.nostalgiaPoints))
      : 0,
    nostalgiaResets: isFiniteNumber(record.nostalgiaResets)
      ? Math.max(0, Math.floor(record.nostalgiaResets))
      : 0,
    nostalgiaUnlockedItems: Array.isArray(record.nostalgiaUnlockedItems)
      ? record.nostalgiaUnlockedItems.filter((entry): entry is string => typeof entry === "string")
      : undefined,
    nostalgiaEnjoymentEarnedCents: isFiniteNumber(record.nostalgiaEnjoymentEarnedCents)
      ? Math.max(0, Math.floor(record.nostalgiaEnjoymentEarnedCents))
      : 0,
    nostalgiaLastGain: isFiniteNumber(record.nostalgiaLastGain)
      ? Math.max(0, Math.floor(record.nostalgiaLastGain))
      : 0,
    nostalgiaLastPrestigedAtMs: isFiniteNumber(record.nostalgiaLastPrestigedAtMs)
      ? Math.max(0, Math.floor(record.nostalgiaLastPrestigedAtMs))
      : 0,
    therapistCareer: therapistRecord
      ? {
          careerStartId:
            therapistRecord.careerStartId === null
              ? null
              : typeof therapistRecord.careerStartId === "string"
                ? therapistRecord.careerStartId
                : undefined,
          salaryActiveUntilMs: isFiniteNumber(therapistRecord.salaryActiveUntilMs)
            ? Math.max(0, Math.floor(therapistRecord.salaryActiveUntilMs))
            : undefined,
          level: isFiniteNumber(therapistRecord.level)
            ? Math.max(1, Math.floor(therapistRecord.level))
            : undefined,
          xp: isFiniteNumber(therapistRecord.xp)
            ? Math.max(0, Math.floor(therapistRecord.xp))
            : undefined,
          nextAvailableAtMs: isFiniteNumber(therapistRecord.nextAvailableAtMs)
            ? Math.max(0, Math.floor(therapistRecord.nextAvailableAtMs))
            : undefined,
          activeTrackId:
            therapistRecord.activeTrackId === null
              ? null
              : typeof therapistRecord.activeTrackId === "string"
                ? therapistRecord.activeTrackId
                : undefined,
          primaryTrackId:
            therapistRecord.primaryTrackId === null
              ? null
              : typeof therapistRecord.primaryTrackId === "string"
                ? therapistRecord.primaryTrackId
                : undefined,
          modalityId:
            therapistRecord.modalityId === null
              ? null
              : typeof therapistRecord.modalityId === "string"
                ? therapistRecord.modalityId
                : undefined,
          operatingStyleId:
            therapistRecord.operatingStyleId === null
              ? null
              : typeof therapistRecord.operatingStyleId === "string"
                ? therapistRecord.operatingStyleId
                : undefined,
          expansionFocusId:
            therapistRecord.expansionFocusId === null
              ? null
              : typeof therapistRecord.expansionFocusId === "string"
                ? therapistRecord.expansionFocusId
                : undefined,
          pointsAvailable: isFiniteNumber(therapistRecord.pointsAvailable)
            ? Math.max(0, Math.floor(therapistRecord.pointsAvailable))
            : undefined,
          spentNodes:
            typeof therapistRecord.spentNodes === "object" && therapistRecord.spentNodes !== null
              ? (therapistRecord.spentNodes as Record<string, boolean>)
              : undefined,
          freeSessionAvailable:
            typeof therapistRecord.freeSessionAvailable === "boolean"
              ? therapistRecord.freeSessionAvailable
              : undefined,
          sessionPremiumCount: isFiniteNumber(therapistRecord.sessionPremiumCount)
            ? Math.max(0, Math.floor(therapistRecord.sessionPremiumCount))
            : undefined,
          lastSessionAtMs: isFiniteNumber(therapistRecord.lastSessionAtMs)
            ? Math.max(0, Math.floor(therapistRecord.lastSessionAtMs))
            : undefined,
        }
      : undefined,
    craftingParts: isFiniteNumber(record.craftingParts) ? record.craftingParts : 0,
    craftedBoosts:
      typeof record.craftedBoosts === "object" && record.craftedBoosts !== null
        ? (record.craftedBoosts as Record<string, number>)
        : {},
    favoriteWatchIds: Array.isArray(record.favoriteWatchIds)
      ? record.favoriteWatchIds.filter((entry): entry is string => typeof entry === "string")
      : [],
    lastPurchase:
      typeof record.lastPurchase === "object" && record.lastPurchase !== null
        ? (record.lastPurchase as WatchPurchaseSnapshot)
        : null,
  };

  return createStateFromSave(persisted);
}

export function encodeSaveString(
  state: GameState,
  lastSimulatedAtMs: number,
  savedAt: Date = new Date(),
): string {
  const save: SaveV2 = {
    version: CURRENT_SAVE_VERSION,
    savedAt: savedAt.toISOString(),
    lastSimulatedAtMs,
    state,
  };

  return JSON.stringify(save);
}

function decodeSavePayload(raw: string): SaveParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, error: "Invalid save payload: expected an object" };
  }

  const record = parsed as Record<string, unknown>;
  const version = record.version;

  if (version !== 1 && version !== CURRENT_SAVE_VERSION) {
    return { ok: false, error: `Unsupported save version: ${String(version)}` };
  }

  const savedAt = record.savedAt;
  if (typeof savedAt !== "string") {
    return { ok: false, error: "Invalid save payload: missing savedAt" };
  }

  const lastSimulatedAtMs = record.lastSimulatedAtMs;
  if (!isFiniteNumber(lastSimulatedAtMs) || lastSimulatedAtMs < 0) {
    return { ok: false, error: "Invalid save payload: invalid lastSimulatedAtMs" };
  }

  if (version === 1) {
    const legacyState = sanitizeState(record.state);
    if (!legacyState) {
      return { ok: false, error: "Invalid save payload: invalid state" };
    }

    return {
      ok: true,
      save: {
        version: CURRENT_SAVE_VERSION,
        savedAt,
        lastSimulatedAtMs,
        state: legacyState,
      },
    };
  }

  const state = sanitizeState(record.state);
  if (!state) {
    return { ok: false, error: "Invalid save payload: invalid state" };
  }

  return {
    ok: true,
    save: {
      version: CURRENT_SAVE_VERSION,
      savedAt,
      lastSimulatedAtMs,
      state,
    },
  };
}

export function decodeSaveString(raw: string): SaveDecodeResult {
  return decodeSavePayload(raw);
}

export function loadSaveFromLocalStorage(): SaveLoadResult {
  let raw: string | null;

  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch (error) {
    return {
      ok: false,
      error: `Could not read localStorage: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (raw === null) {
    try {
      raw = localStorage.getItem(LEGACY_SAVE_KEY);
    } catch (error) {
      return {
        ok: false,
        error: `Could not read localStorage: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  if (raw === null) {
    return { ok: false, empty: true };
  }

  const decoded = decodeSavePayload(raw);
  if (!decoded.ok) {
    return { ok: false, error: decoded.error };
  }

  if (raw !== null) {
    try {
      localStorage.setItem(SAVE_KEY, raw);
      localStorage.removeItem(LEGACY_SAVE_KEY);
    } catch (error) {
      return {
        ok: false,
        error: `Could not write localStorage: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  return { ok: true, save: decoded.save };
}

export function persistSaveToLocalStorage(
  state: GameState,
  lastSimulatedAtMs: number,
  savedAt: Date = new Date(),
): SavePersistResult {
  const encoded = encodeSaveString(state, lastSimulatedAtMs, savedAt);

  try {
    localStorage.setItem(SAVE_KEY, encoded);
    localStorage.removeItem(LEGACY_SAVE_KEY);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Could not write localStorage: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function clearLocalStorageSave(): SavePersistResult {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_SAVE_KEY);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Could not clear localStorage: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
