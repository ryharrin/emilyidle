import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useGameRuntime } from "./useGameRuntime";
import { isTestEnvironment } from "./isTestEnvironment";
import {
  loadSaveFromLocalStorage,
  clearLocalStorageSave,
  persistSaveToLocalStorage,
  getSaveClearEpoch,
  bumpSaveClearEpoch,
  encodeSaveString,
  decodeSaveString,
  type SavePersistResult,
} from "../persistence";
import { createInitialState } from "../model/state";
import { step } from "../sim";
import type { GameState } from "../model/types";

type DevSettings = {
  enabled: boolean;
  speedMultiplier: number;
};

type UseAppRuntimeResult = {
  nowMs: number;
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  persistNow: (reason: string, nextState?: GameState) => void;
  markSaveDirty: () => void;
  resetSimulationClock: (newNowMs?: number) => void;
  devSettings: DevSettings;
  setDevSettings: React.Dispatch<React.SetStateAction<DevSettings>>;
  saveStatus: string;
  setSaveStatus: (status: string) => void;
  sessionSaveClearEpoch: number;
  importText: string;
  setImportText: (text: string) => void;
  handlePersistError: (message: string) => void;
  persistSaveWithSessionEpochGuard: (
    nextState: GameState,
    lastSimulatedAtMs?: number,
  ) => SavePersistResult;
};

export function useAppRuntime(): UseAppRuntimeResult {
  const [saveStatus, setSaveStatus] = useState("");
  const [importText, setImportText] = useState("");
  const [devSettings, setDevSettings] = useState<DevSettings>(() => ({
    enabled: false,
    speedMultiplier: 1,
  }));
  const [sessionSaveClearEpoch] = useState(() => getSaveClearEpoch());

  const handlePersistError = useCallback((message: string) => {
    setSaveStatus(message);
  }, []);

  const persistSaveWithSessionEpochGuard = useCallback(
    (nextState: GameState, lastSimulatedAtMs?: number): SavePersistResult => {
      const currentEpoch = getSaveClearEpoch();
      if (currentEpoch !== sessionSaveClearEpoch) {
        return {
          ok: false,
          error: "Save blocked in a stale tab after clear save; reload this tab and try again.",
        };
      }

      return persistSaveToLocalStorage(nextState, new Date(), lastSimulatedAtMs);
    },
    [sessionSaveClearEpoch],
  );

  const { nowMs, state, setState, persistNow, markSaveDirty, resetSimulationClock } =
    useGameRuntime({
      initialState: createInitialState,
      step,
      loadSave: loadSaveFromLocalStorage,
      clearSave: clearLocalStorageSave,
      persistSave: persistSaveWithSessionEpochGuard,
      devSettings,
      onPersistError: handlePersistError,
    });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const enabled = params.has("dev");
    setDevSettings((current) => ({
      ...current,
      enabled,
    }));
  }, []);

  return {
    nowMs,
    state,
    setState,
    persistNow,
    markSaveDirty,
    resetSimulationClock,
    devSettings,
    setDevSettings,
    saveStatus,
    setSaveStatus,
    sessionSaveClearEpoch,
    importText,
    setImportText,
    handlePersistError,
    persistSaveWithSessionEpochGuard,
  };
}
