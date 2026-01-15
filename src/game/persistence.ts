import type { GameState } from "./state";

const SAVE_KEY = "watch-idle:save";
const CURRENT_SAVE_VERSION = 1 as const;

type SaveV1 = {
  version: typeof CURRENT_SAVE_VERSION;
  savedAt: string;
  lastSimulatedAtMs: number;
  state: GameState;
};

export type SaveDecodeResult = { ok: true; save: SaveV1 } | { ok: false; error: string };

export type SaveLoadResult =
  | { ok: true; save: SaveV1 }
  | { ok: false; empty: true }
  | { ok: false; error: string };

export type SavePersistResult = { ok: true } | { ok: false; error: string };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function sanitizeState(value: unknown): GameState | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  const currencyCents = record.currencyCents;
  const incomeRateCentsPerSec = record.incomeRateCentsPerSec;
  const itemCount = record.itemCount;

  if (
    !isFiniteNumber(currencyCents) ||
    !isFiniteNumber(incomeRateCentsPerSec) ||
    !isFiniteNumber(itemCount)
  ) {
    return null;
  }

  return {
    currencyCents: Math.max(0, currencyCents),
    incomeRateCentsPerSec: Math.max(0, incomeRateCentsPerSec),
    itemCount: Math.max(0, Math.floor(itemCount)),
  };
}

export function encodeSaveString(
  state: GameState,
  lastSimulatedAtMs: number,
  savedAt: Date = new Date(),
): string {
  const save: SaveV1 = {
    version: CURRENT_SAVE_VERSION,
    savedAt: savedAt.toISOString(),
    lastSimulatedAtMs,
    state,
  };

  return JSON.stringify(save);
}

export function decodeSaveString(raw: string): SaveDecodeResult {
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

  if (record.version !== CURRENT_SAVE_VERSION) {
    return {
      ok: false,
      error: `Unsupported save version: ${String(record.version)}`,
    };
  }

  const savedAt = record.savedAt;
  if (typeof savedAt !== "string") {
    return { ok: false, error: "Invalid save payload: missing savedAt" };
  }

  const lastSimulatedAtMs = record.lastSimulatedAtMs;
  if (!isFiniteNumber(lastSimulatedAtMs) || lastSimulatedAtMs < 0) {
    return { ok: false, error: "Invalid save payload: invalid lastSimulatedAtMs" };
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
    return { ok: false, empty: true };
  }

  const decoded = decodeSaveString(raw);
  if (!decoded.ok) {
    return { ok: false, error: decoded.error };
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
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Could not clear localStorage: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
