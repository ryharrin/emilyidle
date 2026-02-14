import type { GameState, PersistedGameState } from "./state";
import type { WatchPurchaseSnapshot } from "./model/types";
import { createStateFromSave } from "./state";

const SAVE_KEY = "emily-idle:save";
const LEGACY_SAVE_KEY = "watch-idle:save";
const CURRENT_SAVE_VERSION = 4 as const;
type LegacySaveVersion = 1 | 2 | 3;

type SaveV4 = {
  version: typeof CURRENT_SAVE_VERSION;
  savedAt: string;
  lastSimulatedAtMs: number;
  state: GameState;
};

type SaveDecodeSuccess = {
  ok: true;
  save: SaveV4;
  migratedFromVersion?: LegacySaveVersion;
};

export type SaveDecodeResult = SaveDecodeSuccess | { ok: false; error: string };

export type SaveLoadResult =
  | SaveDecodeSuccess
  | { ok: false; empty: true }
  | { ok: false; error: string };

export type SavePersistResult = { ok: true } | { ok: false; error: string };

type SaveParseResult = SaveDecodeResult;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getSafeSavedAtIso(savedAt: string): string {
  const parsedMs = Date.parse(savedAt);
  if (Number.isFinite(parsedMs)) {
    return new Date(parsedMs).toISOString();
  }
  return new Date().toISOString();
}

function normalizeTimestampMs(value: unknown): number {
  if (!isFiniteNumber(value)) {
    return 0;
  }

  return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)));
}

function getSafeLastSimulatedAtMs(lastSimulatedAtMs: unknown, savedAtIso: string): number {
  const normalized = normalizeTimestampMs(lastSimulatedAtMs);
  if (normalized > 0) {
    return normalized;
  }

  return normalizeTimestampMs(Date.parse(savedAtIso));
}

function buildCanonicalSave(
  state: GameState,
  savedAtIso: string,
  lastSimulatedAtMs?: unknown,
): SaveV4 {
  const safeSavedAtIso = getSafeSavedAtIso(savedAtIso);
  return {
    version: CURRENT_SAVE_VERSION,
    savedAt: safeSavedAtIso,
    lastSimulatedAtMs: getSafeLastSimulatedAtMs(lastSimulatedAtMs, safeSavedAtIso),
    state,
  };
}

function shiftFutureTimestampMs(timestampMs: number, elapsedMs: number): number {
  const normalizedTimestamp = normalizeTimestampMs(timestampMs);
  const normalizedElapsedMs = normalizeTimestampMs(elapsedMs);
  if (normalizedTimestamp === 0 || normalizedElapsedMs === 0) {
    return normalizedTimestamp;
  }

  return Math.min(Number.MAX_SAFE_INTEGER, normalizedTimestamp + normalizedElapsedMs);
}

function pauseOfflineTimerProgress(state: GameState, elapsedMs: number): GameState {
  const normalizedElapsedMs = normalizeTimestampMs(elapsedMs);
  if (normalizedElapsedMs <= 0) {
    return state;
  }

  let changed = false;

  const therapistCareer = state.therapistCareer;
  const nextTherapistCareer = {
    ...therapistCareer,
    salaryActiveUntilMs: shiftFutureTimestampMs(
      therapistCareer.salaryActiveUntilMs,
      normalizedElapsedMs,
    ),
    nextAvailableAtMs: shiftFutureTimestampMs(therapistCareer.nextAvailableAtMs, normalizedElapsedMs),
    lastSessionAtMs: shiftFutureTimestampMs(therapistCareer.lastSessionAtMs, normalizedElapsedMs),
  };
  const therapistChanged =
    nextTherapistCareer.salaryActiveUntilMs !== therapistCareer.salaryActiveUntilMs ||
    nextTherapistCareer.nextAvailableAtMs !== therapistCareer.nextAvailableAtMs ||
    nextTherapistCareer.lastSessionAtMs !== therapistCareer.lastSessionAtMs;
  if (therapistChanged) {
    changed = true;
  }

  let interactionChanged = false;
  const nextInteractionTimers: Partial<Record<string, number>> = {};
  for (const [itemId, rawTimestamp] of Object.entries(state.interactionNextAvailableAtMsByItem)) {
    const shifted = shiftFutureTimestampMs(rawTimestamp, normalizedElapsedMs);
    nextInteractionTimers[itemId] = shifted;
    if (shifted !== rawTimestamp) {
      interactionChanged = true;
      changed = true;
    }
  }

  let eventChanged = false;
  const nextEventStates: GameState["eventStates"] = {} as GameState["eventStates"];
  for (const [eventId, eventState] of Object.entries(state.eventStates)) {
    const shiftedActiveUntilMs = shiftFutureTimestampMs(eventState.activeUntilMs, normalizedElapsedMs);
    const shiftedNextAvailableAtMs = shiftFutureTimestampMs(
      eventState.nextAvailableAtMs,
      normalizedElapsedMs,
    );
    nextEventStates[eventId as keyof GameState["eventStates"]] = {
      ...eventState,
      activeUntilMs: shiftedActiveUntilMs,
      nextAvailableAtMs: shiftedNextAvailableAtMs,
    };
    if (
      shiftedActiveUntilMs !== eventState.activeUntilMs ||
      shiftedNextAvailableAtMs !== eventState.nextAvailableAtMs
    ) {
      eventChanged = true;
      changed = true;
    }
  }

  const nextLastPurchase = state.lastPurchase
    ? {
        ...state.lastPurchase,
        purchasedAtMs: shiftFutureTimestampMs(state.lastPurchase.purchasedAtMs, normalizedElapsedMs),
      }
    : null;
  const lastPurchaseChanged = nextLastPurchase?.purchasedAtMs !== state.lastPurchase?.purchasedAtMs;
  if (lastPurchaseChanged) {
    changed = true;
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    therapistCareer: therapistChanged ? nextTherapistCareer : therapistCareer,
    interactionNextAvailableAtMsByItem: interactionChanged
      ? (nextInteractionTimers as GameState["interactionNextAvailableAtMsByItem"])
      : state.interactionNextAvailableAtMsByItem,
    eventStates: eventChanged ? nextEventStates : state.eventStates,
    lastPurchase: lastPurchaseChanged ? nextLastPurchase : state.lastPurchase,
  };
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
    interactionRunsTotal: isFiniteNumber(record.interactionRunsTotal)
      ? Math.max(0, Math.floor(record.interactionRunsTotal))
      : 0,
    interactionPerfectRuns: isFiniteNumber(record.interactionPerfectRuns)
      ? Math.max(0, Math.floor(record.interactionPerfectRuns))
      : 0,
    interactionPerfectStreak: isFiniteNumber(record.interactionPerfectStreak)
      ? Math.max(0, Math.floor(record.interactionPerfectStreak))
      : 0,
    interactionBestPerfectStreak: isFiniteNumber(record.interactionBestPerfectStreak)
      ? Math.max(0, Math.floor(record.interactionBestPerfectStreak))
      : 0,
  };

  return createStateFromSave(persisted);
}

export function encodeSaveString(state: GameState, savedAt: Date = new Date()): string {
  const save = buildCanonicalSave(state, savedAt.toISOString(), savedAt.getTime());

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

  if (version !== 1 && version !== 2 && version !== 3 && version !== CURRENT_SAVE_VERSION) {
    return { ok: false, error: `Unsupported save version: ${String(version)}` };
  }

  const savedAt = record.savedAt;
  if (typeof savedAt !== "string") {
    return { ok: false, error: "Invalid save payload: missing savedAt" };
  }

  const state = sanitizeState(record.state);
  if (!state) {
    return { ok: false, error: "Invalid save payload: invalid state" };
  }

  const migratedFromVersion = version === CURRENT_SAVE_VERSION ? undefined : (version as 1 | 2 | 3);
  const save = buildCanonicalSave(state, savedAt, record.lastSimulatedAtMs);

  return {
    ok: true,
    save,
    migratedFromVersion,
  };
}

export function decodeSaveString(raw: string): SaveDecodeResult {
  return decodeSavePayload(raw);
}

export function loadSaveFromLocalStorage(): SaveLoadResult {
  let raw: string | null;
  let source: "current" | "legacy" | null = null;

  try {
    raw = localStorage.getItem(SAVE_KEY);
    if (raw !== null) {
      source = "current";
    }
  } catch (error) {
    return {
      ok: false,
      error: `Could not read localStorage: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (raw === null) {
    try {
      raw = localStorage.getItem(LEGACY_SAVE_KEY);
      if (raw !== null) {
        source = "legacy";
      }
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

  const nowMs = normalizeTimestampMs(Date.now());
  const elapsedSinceLastSimulationMs = Math.max(0, nowMs - decoded.save.lastSimulatedAtMs);
  const stateWithoutOfflineProgress = pauseOfflineTimerProgress(
    decoded.save.state,
    elapsedSinceLastSimulationMs,
  );
  const hasOfflineTimerAdjustment = stateWithoutOfflineProgress !== decoded.save.state;
  const loadedSave = hasOfflineTimerAdjustment
    ? buildCanonicalSave(stateWithoutOfflineProgress, new Date(nowMs).toISOString(), nowMs)
    : decoded.save;

  if (raw !== null) {
    try {
      const shouldRewrite =
        source === "legacy" ||
        decoded.migratedFromVersion !== undefined ||
        hasOfflineTimerAdjustment;
      const canonicalSave = hasOfflineTimerAdjustment
        ? loadedSave
        : buildCanonicalSave(
            decoded.save.state,
            decoded.save.savedAt,
            decoded.save.lastSimulatedAtMs,
          );
      const canonicalRaw = shouldRewrite ? JSON.stringify(canonicalSave) : raw;
      localStorage.setItem(SAVE_KEY, canonicalRaw);
      localStorage.removeItem(LEGACY_SAVE_KEY);
    } catch (error) {
      return {
        ok: false,
        error: `Could not write localStorage: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  return {
    ...decoded,
    save: loadedSave,
  };
}

export function persistSaveToLocalStorage(
  state: GameState,
  savedAt: Date = new Date(),
): SavePersistResult {
  const encoded = encodeSaveString(state, savedAt);

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
