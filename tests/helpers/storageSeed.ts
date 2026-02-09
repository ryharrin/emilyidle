import type { Page } from "@playwright/test";

type SaveSeed<TState> = {
  state: TState;
  version?: number;
  savedAtIso?: string;
  lastSimulatedAtMs?: number;
};

type StorageSeedOptions<TState> = {
  save?: SaveSeed<TState>;
  settings?: Record<string, unknown>;
  navigation?: Record<string, unknown>;
  clearLocalStorage?: boolean;
  clearSessionStorage?: boolean;
  oncePerSessionKey?: string;
  disableAnimationFrame?: boolean;
};

type AddInitScriptArgs = {
  save: {
    version: number;
    savedAtIso: string;
    lastSimulatedAtMs: number;
    state: unknown;
  } | null;
  settings: Record<string, unknown> | null;
  navigation: Record<string, unknown> | null;
  clearLocalStorage: boolean;
  clearSessionStorage: boolean;
  oncePerSessionKey: string | null;
  disableAnimationFrame: boolean;
};

export async function seedStorage<TState>(
  page: Page,
  options: StorageSeedOptions<TState>,
): Promise<void> {
  const args: AddInitScriptArgs = {
    save: options.save
      ? {
          version: options.save.version ?? 2,
          savedAtIso: options.save.savedAtIso ?? new Date(0).toISOString(),
          lastSimulatedAtMs: options.save.lastSimulatedAtMs ?? Date.now(),
          state: options.save.state,
        }
      : null,
    settings: options.settings ?? null,
    navigation: options.navigation ?? null,
    clearLocalStorage: options.clearLocalStorage ?? false,
    clearSessionStorage: options.clearSessionStorage ?? false,
    oncePerSessionKey: options.oncePerSessionKey ?? null,
    disableAnimationFrame: options.disableAnimationFrame ?? false,
  };

  await page.addInitScript((seedArgs: AddInitScriptArgs) => {
    if (seedArgs.oncePerSessionKey) {
      if (window.sessionStorage.getItem(seedArgs.oncePerSessionKey) === "1") {
        return;
      }
      window.sessionStorage.setItem(seedArgs.oncePerSessionKey, "1");
    }

    if (seedArgs.disableAnimationFrame) {
      window.requestAnimationFrame = (() => 0) as unknown as typeof window.requestAnimationFrame;
      window.cancelAnimationFrame = (() => {}) as unknown as typeof window.cancelAnimationFrame;
    }

    if (seedArgs.clearSessionStorage) {
      window.sessionStorage.clear();
    }
    if (seedArgs.clearLocalStorage) {
      window.localStorage.clear();
    }

    if (seedArgs.save) {
      window.localStorage.setItem(
        "emily-idle:save",
        JSON.stringify({
          version: seedArgs.save.version,
          savedAt: seedArgs.save.savedAtIso,
          lastSimulatedAtMs: seedArgs.save.lastSimulatedAtMs,
          state: seedArgs.save.state,
        }),
      );
    }
    if (seedArgs.settings) {
      window.localStorage.setItem("emily-idle:settings", JSON.stringify(seedArgs.settings));
    }
    if (seedArgs.navigation) {
      window.localStorage.setItem("emily-idle:navigation", JSON.stringify(seedArgs.navigation));
    }
  }, args);
}
