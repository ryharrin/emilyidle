import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { isTestEnvironment } from "./isTestEnvironment";
import { SIM_TICK_MS } from "../sim";
import type { SaveLoadResult, SavePersistResult } from "../persistence";
import type { GameState } from "../state";

const MAX_FRAME_DELTA_MS = 250;
const AUTO_SAVE_INTERVAL_MS = 2_000;

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
  persistSave: (state: GameState) => SavePersistResult;
  devSettings: {
    enabled: boolean;
    speedMultiplier: number;
  };
  onPersistError?: (message: string) => void;
};

type UseGameRuntimeResult = {
  state: GameState;
  setState: Dispatch<SetStateAction<GameState>>;
  persistNow: (reason: string, snapshot?: GameState) => SavePersistResult;
  markSaveDirty: () => void;
  resetSimulationClock: () => void;
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
}: UseGameRuntimeArgs): UseGameRuntimeResult => {
  const [state, setStateBase] = useState<GameState>(() => initialState());
  const saveDirtyRef = useRef(false);
  const lastSavedAtMsRef = useRef(0);
  const lastFrameAtMsRef = useRef<number | null>(null);
  const accumulatorMsRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef(state);

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

  const markSaveDirty = useCallback(() => {
    saveDirtyRef.current = true;
  }, []);

  const resetSimulationClock = useCallback(() => {
    lastFrameAtMsRef.current = null;
    accumulatorMsRef.current = 0;
  }, []);

  const persistNow = useCallback(
    (reason: string, snapshot: GameState = stateRef.current) => {
      const result = persistSave(snapshot);

      if (!result.ok) {
        console.warn(`Autosave failed (${reason}). ${result.error}`);
        onPersistError?.(`Save failed: ${result.error}`);
        return result;
      }

      lastSavedAtMsRef.current = normalizeTimestampMs(Date.now());
      saveDirtyRef.current = false;
      return result;
    },
    [onPersistError, persistSave],
  );

  useEffect(() => {
    const loadResult = loadSave();
    if (loadResult.ok) {
      setState(loadResult.save.state);
      resetSimulationClock();
      console.info(`Loaded save v${loadResult.save.version} from ${loadResult.save.savedAt}`);
      return;
    }

    if ("empty" in loadResult) {
      console.info("No save found; starting new game.");
      return;
    }

    console.warn(`Save was invalid; resetting state. ${loadResult.error}`);
    const clearResult = clearSave();
    if (!clearResult.ok) {
      console.warn(`Failed to clear invalid save. ${clearResult.error}`);
    }
  }, [clearSave, loadSave, resetSimulationClock, setState]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (saveDirtyRef.current) {
          persistNow("visibilitychange:hidden");
        }
        return;
      }
    };

    const onPageHide = () => {
      if (saveDirtyRef.current) {
        persistNow("pagehide");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [persistNow]);

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

          nextState = step(nextState, SIM_TICK_MS);
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
    persistNow,
    markSaveDirty,
    resetSimulationClock,
  };
};
