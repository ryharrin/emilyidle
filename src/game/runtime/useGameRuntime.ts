import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { isTestEnvironment } from "./isTestEnvironment";
import { SIM_TICK_MS } from "../sim";
import type { SaveLoadResult, SavePersistResult } from "../persistence";
import type { GameState } from "../state";

const MAX_FRAME_DELTA_MS = 250;
const AUTO_SAVE_INTERVAL_MS = 2_000;
const OFFLINE_MAX_APPLY_MS = 8 * 60 * 60 * 1_000;
const OFFLINE_STEP_CHUNK_MS = 1_000;

const normalizeTimestampMs = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
};

type UseGameRuntimeArgs = {
  initialState: () => GameState;
  step: (state: GameState, dtMs: number, nowMs?: number) => GameState;
  loadSave: () => SaveLoadResult;
  clearSave: () => SavePersistResult;
  persistSave: (state: GameState, lastSimulatedAtMs: number) => SavePersistResult;
  devSettings: {
    enabled: boolean;
    speedMultiplier: number;
  };
  onPersistError?: (message: string) => void;
  onOfflineProgress?: (info: OfflineProgressInfo) => void;
};

type UseGameRuntimeResult = {
  state: GameState;
  setState: Dispatch<SetStateAction<GameState>>;
  lastSimulatedAtMs: number;
  setLastSimulatedAtMs: Dispatch<SetStateAction<number>>;
  persistNow: (reason: string, snapshot?: GameState) => SavePersistResult;
  markSaveDirty: () => void;
  resetSimulationClock: () => void;
};

export type OfflineProgressInfo = {
  elapsedMs: number;
  appliedMs: number;
  gainedCurrencyCents: number;
  gainedEnjoymentCents: number;
};

type OfflineSimulationResult = {
  state: GameState;
  appliedMs: number;
};

export const simulateOfflineProgress = (
  state: GameState,
  elapsedMs: number,
  step: (state: GameState, dtMs: number, nowMs?: number) => GameState,
  lastSimulatedAtMs: number,
): OfflineSimulationResult => {
  const toApplyMs = Math.max(0, Math.min(OFFLINE_MAX_APPLY_MS, elapsedMs));
  if (toApplyMs === 0) {
    return { state, appliedMs: 0 };
  }

  let nextState = state;
  let remainingMs = toApplyMs;
  let currentTimeMs = lastSimulatedAtMs;

  while (remainingMs > 0) {
    const chunk = Math.min(remainingMs, OFFLINE_STEP_CHUNK_MS);
    currentTimeMs += chunk;
    nextState = step(nextState, chunk, currentTimeMs);
    remainingMs -= chunk;
  }

  return { state: nextState, appliedMs: toApplyMs };
};

const resolveStateUpdate = (update: SetStateAction<GameState>, current: GameState): GameState => {
  if (typeof update === "function") {
    return (update as (prevState: GameState) => GameState)(current);
  }

  return update;
};

export const useGameRuntime = ({
  initialState,
  step,
  loadSave,
  clearSave,
  persistSave,
  devSettings,
  onPersistError,
  onOfflineProgress,
}: UseGameRuntimeArgs): UseGameRuntimeResult => {
  const [state, setStateBase] = useState<GameState>(() => initialState());
  const [lastSimulatedAtMs, setLastSimulatedAtMsBase] = useState(() =>
    normalizeTimestampMs(Date.now()),
  );
  const saveDirtyRef = useRef(false);
  const lastSavedAtMsRef = useRef(0);
  const lastFrameAtMsRef = useRef<number | null>(null);
  const accumulatorMsRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const lastSimulatedAtMsRef = useRef(lastSimulatedAtMs);

  const setState = useCallback((update: SetStateAction<GameState>) => {
    if (typeof update !== "function") {
      stateRef.current = update;
      setStateBase(update);
      return;
    }

    setStateBase((current) => {
      const nextState = resolveStateUpdate(update, current);
      stateRef.current = nextState;
      return nextState;
    });
  }, []);

  const setLastSimulatedAtMs: Dispatch<SetStateAction<number>> = useCallback((update) => {
    setLastSimulatedAtMsBase((current) => {
      const resolved =
        typeof update === "function" ? (update as (prevState: number) => number)(current) : update;
      const normalized = normalizeTimestampMs(resolved);
      lastSimulatedAtMsRef.current = normalized;
      return normalized;
    });
  }, []);

  const markSaveDirty = useCallback(() => {
    saveDirtyRef.current = true;
  }, []);

  const resetSimulationClock = useCallback(() => {
    lastFrameAtMsRef.current = null;
    accumulatorMsRef.current = 0;
  }, []);

  const persistNow = useCallback(
    (reason: string, snapshot: GameState = stateRef.current) => {
      const nowMs = normalizeTimestampMs(Date.now());
      const simulatedAtMs = Math.max(lastSimulatedAtMsRef.current, nowMs);
      lastSimulatedAtMsRef.current = simulatedAtMs;

      const result = persistSave(snapshot, simulatedAtMs);

      if (!result.ok) {
        console.warn(`Autosave failed (${reason}). ${result.error}`);
        onPersistError?.(`Save failed: ${result.error}`);
        return result;
      }

      lastSavedAtMsRef.current = nowMs;
      saveDirtyRef.current = false;
      setLastSimulatedAtMsBase(simulatedAtMs);
      return result;
    },
    [onPersistError, persistSave],
  );

  const applyCatchUpToNow = useCallback(
    (reason: string, options?: { reportProgress?: boolean }) => {
      const nowMs = normalizeTimestampMs(Date.now());
      const elapsedMs = Math.max(0, nowMs - lastSimulatedAtMsRef.current);
      if (elapsedMs <= 0) {
        return { elapsedMs: 0, appliedMs: 0 };
      }

      const currentState = stateRef.current;
      const offlineResult = simulateOfflineProgress(
        currentState,
        elapsedMs,
        step,
        lastSimulatedAtMsRef.current,
      );

      if (offlineResult.appliedMs > 0) {
        saveDirtyRef.current = true;
        setState(offlineResult.state);

        if (options?.reportProgress && onOfflineProgress) {
          onOfflineProgress({
            elapsedMs,
            appliedMs: offlineResult.appliedMs,
            gainedCurrencyCents: offlineResult.state.currencyCents - currentState.currencyCents,
            gainedEnjoymentCents: offlineResult.state.enjoymentCents - currentState.enjoymentCents,
          });
        }
      }

      // Cap handling intentionally advances the simulation clock to "now" after applying.
      lastSimulatedAtMsRef.current = nowMs;
      setLastSimulatedAtMsBase(nowMs);
      resetSimulationClock();

      if (offlineResult.appliedMs > 0) {
        console.info(
          `Applied ${offlineResult.appliedMs}ms catch-up (${reason}, elapsed ${elapsedMs}ms).`,
        );
      }

      return { elapsedMs, appliedMs: offlineResult.appliedMs };
    },
    [onOfflineProgress, resetSimulationClock, setState, step],
  );

  useEffect(() => {
    const loadResult = loadSave();
    if (loadResult.ok) {
      const nowMs = normalizeTimestampMs(Date.now());
      const savedLastSimulatedAtMs = normalizeTimestampMs(loadResult.save.lastSimulatedAtMs);
      const elapsedMs = Math.max(0, nowMs - savedLastSimulatedAtMs);
      const offlineResult = simulateOfflineProgress(
        loadResult.save.state,
        elapsedMs,
        step,
        savedLastSimulatedAtMs,
      );

      const loadedState = offlineResult.appliedMs > 0 ? offlineResult.state : loadResult.save.state;
      setState(loadedState);
      lastSimulatedAtMsRef.current = nowMs;
      setLastSimulatedAtMsBase(nowMs);
      resetSimulationClock();

      if (offlineResult.appliedMs > 0) {
        saveDirtyRef.current = true;
        persistNow("offline-apply", loadedState);
        console.info(
          `Loaded save v${loadResult.save.version} from ${loadResult.save.savedAt} (last simulated at ${new Date(
            savedLastSimulatedAtMs,
          ).toISOString()}); applied ${offlineResult.appliedMs}ms of offline progress (elapsed ${elapsedMs}ms).`,
        );

        if (onOfflineProgress) {
          const gainedCurrencyCents =
            offlineResult.state.currencyCents - loadResult.save.state.currencyCents;
          const gainedEnjoymentCents =
            offlineResult.state.enjoymentCents - loadResult.save.state.enjoymentCents;
          onOfflineProgress({
            elapsedMs,
            appliedMs: offlineResult.appliedMs,
            gainedCurrencyCents,
            gainedEnjoymentCents,
          });
        }

        return;
      }

      console.info(
        `Loaded save v${loadResult.save.version} from ${loadResult.save.savedAt} (last simulated at ${new Date(
          savedLastSimulatedAtMs,
        ).toISOString()})`,
      );
      return;
    }

    if ("empty" in loadResult) {
      const nowMs = normalizeTimestampMs(Date.now());
      lastSimulatedAtMsRef.current = nowMs;
      setLastSimulatedAtMsBase(nowMs);
      console.info("No save found; starting new game.");
      return;
    }

    console.warn(`Save was invalid; resetting state. ${loadResult.error}`);
    const clearResult = clearSave();
    if (!clearResult.ok) {
      console.warn(`Failed to clear invalid save. ${clearResult.error}`);
    }
  }, [clearSave, loadSave, onOfflineProgress, persistNow, resetSimulationClock, setState, step]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const { appliedMs } = applyCatchUpToNow("visibilitychange:hidden");
        if (saveDirtyRef.current || appliedMs > 0) {
          persistNow("visibilitychange:hidden");
        }
        return;
      }

      if (document.visibilityState === "visible") {
        applyCatchUpToNow("visibilitychange:visible");
      }
    };

    const onPageHide = () => {
      const { appliedMs } = applyCatchUpToNow("pagehide");
      if (saveDirtyRef.current || appliedMs > 0) {
        persistNow("pagehide");
      }
    };

    const onOnline = () => {
      applyCatchUpToNow("online");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("online", onOnline);
    };
  }, [applyCatchUpToNow, persistNow]);

  useEffect(() => {
    if (isTestEnvironment()) {
      return;
    }

    const frame = (frameTimeMs: number) => {
      let stepped = false;

      if (lastFrameAtMsRef.current !== null) {
        const rawElapsedMs = frameTimeMs - lastFrameAtMsRef.current;
        const elapsedMs = Math.max(0, Math.min(rawElapsedMs, MAX_FRAME_DELTA_MS));

        accumulatorMsRef.current += elapsedMs;
      }

      lastFrameAtMsRef.current = frameTimeMs;

      if (devSettings.enabled && devSettings.speedMultiplier !== 1) {
        if (devSettings.speedMultiplier > 1) {
          accumulatorMsRef.current += SIM_TICK_MS * (devSettings.speedMultiplier - 1);
        }
      }

      if (accumulatorMsRef.current >= SIM_TICK_MS) {
        let nextState = stateRef.current;
        while (accumulatorMsRef.current >= SIM_TICK_MS) {
          stepped = true;
          accumulatorMsRef.current -= SIM_TICK_MS;

          const nextSimulatedAtMs = lastSimulatedAtMsRef.current + SIM_TICK_MS;
          lastSimulatedAtMsRef.current = nextSimulatedAtMs;
          nextState = step(nextState, SIM_TICK_MS, nextSimulatedAtMs);
        }

        setState(nextState);
      }

      if (stepped) {
        saveDirtyRef.current = true;
      }

      if (saveDirtyRef.current && Date.now() - lastSavedAtMsRef.current >= AUTO_SAVE_INTERVAL_MS) {
        persistNow("interval");
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [devSettings.enabled, devSettings.speedMultiplier, persistNow, setState, step]);

  return {
    state,
    setState,
    lastSimulatedAtMs,
    setLastSimulatedAtMs,
    persistNow,
    markSaveDirty,
    resetSimulationClock,
  };
};
