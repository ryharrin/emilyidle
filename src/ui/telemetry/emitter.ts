import {
  TELEMETRY_BACKEND_KEY,
  type TelemetryBackend,
  type TelemetryEventName,
  type TelemetryEventPayloads,
} from "./events";

declare global {
  interface Window {
    [TELEMETRY_BACKEND_KEY]?: TelemetryBackend;
  }
}

const resolveTelemetryBackend = (): TelemetryBackend | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const candidate = window[TELEMETRY_BACKEND_KEY];
  if (!candidate || typeof candidate.emit !== "function") {
    return null;
  }

  return candidate;
};

/**
 * Emits a typed telemetry event if a backend is registered on `window`.
 *
 * This utility is intentionally fail-safe:
 * - no-op when no backend is present
 * - swallows backend exceptions to avoid UX regressions
 */
export const emitTelemetryEvent = <TEventName extends TelemetryEventName>(
  eventName: TEventName,
  payload: TelemetryEventPayloads[TEventName],
): void => {
  try {
    resolveTelemetryBackend()?.emit(eventName, payload);
  } catch {
    // No-op by design; telemetry must never alter UX behavior.
  }
};
